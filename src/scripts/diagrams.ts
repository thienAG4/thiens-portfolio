// Diagrams - draws Mermaid sources when they come near the screen, wires zoom controls and the
// full-screen dialog for every [data-diagram] frame (markup from lib/diagram-markup.ts)
import { PanZoom } from "./panzoom";

type MermaidApi = typeof import("mermaid").default;

let mermaidReady: Promise<MermaidApi> | null = null;
let renderCount = 0;
// Mermaid renders through a shared hidden element, so diagrams are drawn one at a time.
let renderQueue: Promise<unknown> = Promise.resolve();

// Loaded on first use so the 1 MB library never slows down the first paint.
function loadMermaid(): Promise<MermaidApi> {
  mermaidReady ??= import("mermaid").then(({ default: mermaid }) => {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: "Inter Variable, ui-sans-serif, system-ui, sans-serif",
      themeVariables: {
        darkMode: true,
        background: "transparent",
        fontSize: "15px",
        primaryColor: "#1b2d33",
        primaryTextColor: "#eef2f4",
        primaryBorderColor: "#6881f5",
        secondaryColor: "#20323a",
        tertiaryColor: "#14252a",
        lineColor: "#8698f8",
        textColor: "#c8d1d6",
        mainBkg: "#1b2d33",
        nodeBorder: "#6881f5",
        clusterBkg: "#14252a",
        clusterBorder: "#34404c",
        edgeLabelBackground: "#14252a",
        actorBkg: "#1b2d33",
        actorBorder: "#6881f5",
        actorTextColor: "#eef2f4",
        actorLineColor: "#4b5b66",
        signalColor: "#a6b4fb",
        signalTextColor: "#eef2f4",
        labelBoxBkgColor: "#20323a",
        labelBoxBorderColor: "#6881f5",
        labelTextColor: "#eef2f4",
        loopTextColor: "#c8d1d6",
        noteBkgColor: "#2b3a45",
        noteTextColor: "#eef2f4",
        noteBorderColor: "#5eead4",
        activationBkgColor: "#2b3a45",
        sequenceNumberColor: "#091315",
        altBackground: "#162a30",
        stateLabelColor: "#eef2f4",
        transitionColor: "#8698f8",
        transitionLabelColor: "#c8d1d6",
        stateBkg: "#1b2d33",
        compositeBackground: "#14252a",
      },
      flowchart: { curve: "basis", htmlLabels: true, padding: 14, nodeSpacing: 36, rankSpacing: 46 },
      sequence: { mirrorActors: false, actorMargin: 60, messageMargin: 34 },
      state: { padding: 10 },
    });
    return mermaid;
  });
  return mermaidReady;
}

async function drawMermaid(figure: HTMLElement) {
  const source = figure.querySelector<HTMLPreElement>(".diagram-source");
  const stage = figure.querySelector<HTMLElement>(".diagram-stage")!;
  if (!source) return;
  try {
    const mermaid = await loadMermaid();
    const job = renderQueue.then(() => mermaid.render(`mmd-${++renderCount}`, source.textContent ?? ""));
    renderQueue = job.catch(() => undefined);
    const { svg } = await job;
    stage.innerHTML = svg;
    const element = stage.querySelector("svg")!;
    // Mermaid sizes the SVG to its container; give it its natural size so zoom maths stay simple.
    const box = element.viewBox.baseVal;
    element.removeAttribute("style");
    element.setAttribute("width", String(Math.ceil(box.width)));
    element.setAttribute("height", String(Math.ceil(box.height)));
  } catch (error) {
    console.error("[drawMermaid]", error);
    stage.innerHTML = `<p class="diagram-loading">This diagram could not be drawn.</p>`;
  }
}

function imageReady(figure: HTMLElement): Promise<void> {
  const image = figure.querySelector("img");
  if (!image || image.complete) return Promise.resolve();
  image.loading = "eager";
  return new Promise((resolve) => {
    image.addEventListener("load", () => resolve(), { once: true });
    image.addEventListener("error", () => resolve(), { once: true });
  });
}

function bindTools(figure: HTMLElement, panZoom: PanZoom, onExpand?: () => void, onClose?: () => void) {
  figure.querySelector(".diagram-tools")?.addEventListener("click", (event) => {
    const action = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]")?.dataset.action;
    if (action === "zoom-in") panZoom.zoomBy(1.3);
    if (action === "zoom-out") panZoom.zoomBy(1 / 1.3);
    if (action === "fit") panZoom.fit();
    if (action === "expand") onExpand?.();
    if (action === "close") onClose?.();
  });
}

function openFullScreen(figure: HTMLElement) {
  const dialog = document.querySelector<HTMLDialogElement>("#diagram-dialog");
  if (!dialog) return;
  const copy = figure.cloneNode(true) as HTMLElement;
  copy.style.removeProperty("--diagram-h");
  copy.querySelector(".diagram-hint")!.textContent = "Drag to move · scroll or pinch to zoom · Esc to close";
  copy.querySelector<HTMLButtonElement>('[data-action="expand"]')!.hidden = true;
  copy.querySelector<HTMLButtonElement>('[data-action="close"]')!.hidden = false;
  dialog.replaceChildren(copy);
  dialog.showModal();

  const stage = copy.querySelector<HTMLElement>(".diagram-stage")!;
  stage.style.transform = "";
  const panZoom = new PanZoom(copy.querySelector(".diagram-viewport")!, stage, copy.querySelector(".diagram-zoom"), {
    wheelZoom: true,
    preferFit: figure.dataset.kind === "image",
  });
  requestAnimationFrame(() => panZoom.reset());
  bindTools(copy, panZoom, undefined, () => dialog.close());
  copy.querySelector<HTMLElement>(".diagram-viewport")!.focus();
}

async function setUp(figure: HTMLElement) {
  if (figure.dataset.kind === "mermaid") await drawMermaid(figure);
  else await imageReady(figure);
  const panZoom = new PanZoom(figure.querySelector(".diagram-viewport")!, figure.querySelector(".diagram-stage")!, figure.querySelector(".diagram-zoom"), {
    preferFit: figure.dataset.kind === "image",
  });
  panZoom.reset();
  bindTools(figure, panZoom, () => openFullScreen(figure));
}

function init() {
  const figures = document.querySelectorAll<HTMLElement>("[data-diagram]");
  if (figures.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        void setUp(entry.target as HTMLElement);
      }
    },
    { rootMargin: "600px 0px" },
  );
  figures.forEach((figure) => observer.observe(figure));

  const dialog = document.querySelector<HTMLDialogElement>("#diagram-dialog");
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener("close", () => dialog.replaceChildren());
}

init();
