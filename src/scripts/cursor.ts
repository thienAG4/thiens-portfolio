// Cursor light - the page grid brightens in a circle around the mouse (backdrop-grid-hot in
// global.css reads --cx and --cy). Mouse only; touch screens keep the plain grid.

const root = document.documentElement;
let frame = 0;
let x = -9999;
let y = -9999;

if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  window.addEventListener(
    "pointermove",
    (event) => {
      x = event.clientX;
      y = event.clientY;
      frame ||= requestAnimationFrame(() => {
        root.style.setProperty("--cx", `${x}px`);
        root.style.setProperty("--cy", `${y}px`);
        frame = 0;
      });
    },
    { passive: true },
  );
  document.addEventListener("pointerleave", () => {
    root.style.setProperty("--cx", "-9999px");
    root.style.setProperty("--cy", "-9999px");
  });
}
