// Constellation - drifting points joined by thin lines behind the hero. Near the cursor the points
// drift away and draw a line to it, so the background answers the mouse. Paused when off screen.

const LINK_DISTANCE = 120;
const CURSOR_RADIUS = 170;
const COLORS = ["134, 152, 248", "166, 180, 251", "94, 234, 212"];

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  color: string;
}

function initConstellation(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;
  const host = canvas.parentElement!;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cursor = { x: -9999, y: -9999, active: false };
  let points: Point[] = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let visible = true;

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = host.clientWidth;
    height = host.clientHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    // About one point per 13 000 px², fewer on phones.
    const count = Math.max(28, Math.min(120, Math.round((width * height) / 13000)));
    points = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 1.6 + 0.9,
      alpha: Math.random() * 0.45 + 0.35,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    }));
  };

  const line = (a: { x: number; y: number }, b: { x: number; y: number }, alpha: number, width = 0.8) => {
    ctx.strokeStyle = `rgba(134, 152, 248, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < points.length; i++) {
      const p = points[i]!;
      if (!reducedMotion) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      }

      let glow = 0;
      if (cursor.active) {
        const dx = cursor.x - p.x;
        const dy = cursor.y - p.y;
        const distance = Math.hypot(dx, dy);
        if (distance < CURSOR_RADIUS && distance > 0) {
          glow = 1 - distance / CURSOR_RADIUS;
          // Ease away from the cursor and reach out to it with a line.
          p.x -= (dx / distance) * glow * 1.4;
          p.y -= (dy / distance) * glow * 1.4;
          line(p, cursor, glow * 0.55, 1);
        }
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r + glow * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${Math.min(1, p.alpha + glow * 0.5)})`;
      ctx.fill();

      for (let j = i + 1; j < points.length; j++) {
        const q = points[j]!;
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance < LINK_DISTANCE) line(p, q, (1 - distance / LINK_DISTANCE) * 0.2);
      }
    }
  };

  const loop = () => {
    draw();
    frame = visible && !reducedMotion ? requestAnimationFrame(loop) : 0;
  };

  const start = () => {
    if (!frame) frame = requestAnimationFrame(loop);
  };

  resize();
  draw();
  start();

  new ResizeObserver(() => {
    resize();
    draw();
  }).observe(host);

  new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting) && document.visibilityState === "visible";
    if (visible) start();
  }).observe(host);

  document.addEventListener("visibilitychange", () => {
    visible = document.visibilityState === "visible";
    if (visible) start();
  });

  window.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = host.getBoundingClientRect();
      cursor.x = event.clientX - rect.left;
      cursor.y = event.clientY - rect.top;
      cursor.active = cursor.y > -40 && cursor.y < rect.height + 40;
      if (reducedMotion) draw();
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => (cursor.active = false));
}

document.querySelectorAll<HTMLCanvasElement>("[data-constellation]").forEach(initConstellation);
