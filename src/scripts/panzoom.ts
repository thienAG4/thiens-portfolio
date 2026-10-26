// PanZoom - drag, pinch, Ctrl + wheel, double-click and keyboard zoom for one diagram viewport

const MAX_SCALE = 6;
const PADDING = 18;
// Below this scale 15 px diagram text gets hard to read.
const READABLE_SCALE = 0.62;

export class PanZoom {
  private scale = 1;
  private x = 0;
  private y = 0;
  private fitScale = 1;
  private touched = false;
  private pointers = new Map<number, { x: number; y: number }>();
  private pinch: { distance: number; scale: number } | null = null;
  private nudgeTimer = 0;

  constructor(
    private viewport: HTMLElement,
    private stage: HTMLElement,
    private label: HTMLElement | null,
    private options: { wheelZoom?: boolean; preferFit?: boolean } = {},
  ) {
    viewport.addEventListener("pointerdown", this.onPointerDown);
    viewport.addEventListener("pointermove", this.onPointerMove);
    viewport.addEventListener("pointerup", this.onPointerUp);
    viewport.addEventListener("pointercancel", this.onPointerUp);
    viewport.addEventListener("wheel", this.onWheel, { passive: false });
    viewport.addEventListener("dblclick", this.onDoubleClick);
    viewport.addEventListener("keydown", this.onKey);
    new ResizeObserver(() => {
      if (!this.touched) this.reset();
    }).observe(viewport);
  }

  /**
   * Starting view. Fits the whole diagram when the text stays readable (or for screenshots);
   * otherwise zooms to a readable scale anchored at the start of the flow (left for wide
   * diagrams, top for tall ones).
   */
  reset() {
    this.measure();
    const { width, height } = this.contentSize();
    if (!width || !height) return;
    if (this.options.preferFit || this.fitScale >= READABLE_SCALE) return this.fit();
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;
    this.scale = READABLE_SCALE;
    const wide = width / height > vw / vh;
    this.x = wide ? PADDING : Math.max(PADDING, (vw - width * this.scale) / 2);
    this.y = wide ? Math.max(PADDING, (vh - height * this.scale) / 2) : PADDING;
    this.touched = false;
    this.apply();
  }

  /** Scale the whole diagram to fit the viewport and centre it. */
  fit() {
    this.measure();
    const { width, height } = this.contentSize();
    if (!width || !height) return;
    this.scale = this.fitScale;
    this.x = (this.viewport.clientWidth - width * this.scale) / 2;
    this.y = (this.viewport.clientHeight - height * this.scale) / 2;
    this.touched = false;
    this.apply();
  }

  private measure() {
    const { width, height } = this.contentSize();
    if (!width || !height) return;
    const vw = this.viewport.clientWidth;
    const vh = this.viewport.clientHeight;
    this.fitScale = Math.min((vw - PADDING * 2) / width, (vh - PADDING * 2) / height, 1.5);
  }

  zoomBy(factor: number, cx = this.viewport.clientWidth / 2, cy = this.viewport.clientHeight / 2) {
    const next = Math.min(MAX_SCALE, Math.max(Math.min(this.fitScale, READABLE_SCALE) * 0.5, this.scale * factor));
    const ratio = next / this.scale;
    this.x = cx - (cx - this.x) * ratio;
    this.y = cy - (cy - this.y) * ratio;
    this.scale = next;
    this.touched = true;
    this.apply();
  }

  private contentSize() {
    const element = this.stage.firstElementChild as HTMLElement | SVGSVGElement | null;
    if (!element) return { width: 0, height: 0 };
    return { width: element.clientWidth || element.getBoundingClientRect().width / this.scale, height: element.clientHeight || element.getBoundingClientRect().height / this.scale };
  }

  private apply() {
    this.stage.style.transform = `translate(${this.x}px, ${this.y}px) scale(${this.scale})`;
    if (this.label) this.label.textContent = `${Math.round(this.scale * 100)}%`;
    this.viewport.classList.toggle("is-zoomed", this.scale > this.fitScale * 1.01);
  }

  private local(event: { clientX: number; clientY: number }) {
    const rect = this.viewport.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0 && event.pointerType === "mouse") return;
    this.viewport.setPointerCapture(event.pointerId);
    this.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = { distance: Math.hypot(a!.x - b!.x, a!.y - b!.y), scale: this.scale };
    }
    this.viewport.classList.add("is-dragging");
  };

  private onPointerMove = (event: PointerEvent) => {
    const previous = this.pointers.get(event.pointerId);
    if (!previous) return;
    const current = { x: event.clientX, y: event.clientY };
    this.pointers.set(event.pointerId, current);

    if (this.pointers.size === 2 && this.pinch) {
      const [a, b] = [...this.pointers.values()];
      const distance = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const mid = this.local({ clientX: (a!.x + b!.x) / 2, clientY: (a!.y + b!.y) / 2 });
      this.zoomBy((this.pinch.scale * (distance / this.pinch.distance)) / this.scale, mid.x, mid.y);
      return;
    }
    this.x += current.x - previous.x;
    this.y += current.y - previous.y;
    this.touched = true;
    this.apply();
  };

  private onPointerUp = (event: PointerEvent) => {
    this.pointers.delete(event.pointerId);
    if (this.pointers.size < 2) this.pinch = null;
    if (this.pointers.size === 0) this.viewport.classList.remove("is-dragging");
  };

  // Plain wheel keeps scrolling the page; Ctrl/⌘ + wheel (and trackpad pinch) zooms.
  private onWheel = (event: WheelEvent) => {
    if (!this.options.wheelZoom && !event.ctrlKey && !event.metaKey) {
      this.nudge();
      return;
    }
    event.preventDefault();
    const point = this.local(event);
    this.zoomBy(Math.exp(-event.deltaY * (event.ctrlKey ? 0.01 : 0.0015)), point.x, point.y);
  };

  private onDoubleClick = (event: MouseEvent) => {
    const point = this.local(event);
    this.zoomBy(1.6, point.x, point.y);
  };

  private onKey = (event: KeyboardEvent) => {
    const step = 60;
    const actions: Record<string, () => void> = {
      "+": () => this.zoomBy(1.25),
      "=": () => this.zoomBy(1.25),
      "-": () => this.zoomBy(0.8),
      "0": () => this.fit(),
      ArrowLeft: () => this.panBy(step, 0),
      ArrowRight: () => this.panBy(-step, 0),
      ArrowUp: () => this.panBy(0, step),
      ArrowDown: () => this.panBy(0, -step),
    };
    const action = actions[event.key];
    if (!action) return;
    event.preventDefault();
    action();
  };

  private panBy(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    this.touched = true;
    this.apply();
  }

  private nudge() {
    let hint = this.viewport.querySelector<HTMLElement>(".diagram-nudge");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "diagram-nudge";
      hint.textContent = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "Use ⌘ + scroll to zoom" : "Use Ctrl + scroll to zoom";
      this.viewport.append(hint);
    }
    hint.classList.add("is-shown");
    window.clearTimeout(this.nudgeTimer);
    this.nudgeTimer = window.setTimeout(() => hint!.classList.remove("is-shown"), 1100);
  }
}
