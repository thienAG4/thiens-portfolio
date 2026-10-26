// Diagram markup - one zoomable frame for Mermaid sources and images, used by Diagram.astro
// and by the remark plugin for ```mermaid blocks in case studies. scripts/diagrams.ts brings it to life.
import { iconSvg } from "./icons";

export interface DiagramInput {
  /** Mermaid source; drawn in the browser. */
  mermaid?: string;
  /** Image path (BPMN or ERD exported from a modelling tool). */
  image?: string;
  title?: string;
  caption?: string;
  /** Viewport height in px; the expanded view always fills the screen. */
  height?: number;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const button = (action: string, label: string, icon: Parameters<typeof iconSvg>[0]) =>
  `<button type="button" class="diagram-btn" data-action="${action}" aria-label="${label}" title="${label}">${iconSvg(icon)}</button>`;

export function diagramMarkup({ mermaid, image, title, caption, height = 380 }: DiagramInput): string {
  if (!mermaid && !image) throw new Error("diagramMarkup needs a mermaid source or an image");
  const label = title ?? "Diagram";
  const content = mermaid
    ? `<pre class="diagram-source" hidden>${escapeHtml(mermaid.trim())}</pre><p class="diagram-loading">Drawing diagram...</p>`
    : `<img src="${escapeHtml(image!)}" alt="${escapeHtml(label)}" loading="lazy" decoding="async" draggable="false" />`;

  return `<figure class="diagram" data-diagram data-kind="${mermaid ? "mermaid" : "image"}" style="--diagram-h:${height}px">
  <div class="diagram-bar">
    <span class="diagram-title">${iconSvg(mermaid ? "workflow" : "image")}${escapeHtml(label)}</span>
    <div class="diagram-tools" role="toolbar" aria-label="Zoom controls for ${escapeHtml(label)}">
      ${button("zoom-out", "Zoom out", "zoom-out")}
      <span class="diagram-zoom" aria-live="polite">100%</span>
      ${button("zoom-in", "Zoom in", "zoom-in")}
      ${button("fit", "Fit to frame", "fit")}
      ${button("expand", "Open full screen", "maximize")}
      ${button("close", "Close full screen", "x").replace("<button", "<button hidden")}
    </div>
  </div>
  <div class="diagram-viewport" tabindex="0" aria-label="${escapeHtml(label)}. Drag to move, Ctrl and scroll or pinch to zoom.">
    <div class="diagram-stage">${content}</div>
    <p class="diagram-hint">Drag to move · Ctrl + scroll or pinch to zoom</p>
  </div>
  ${caption ? `<figcaption class="diagram-caption">${escapeHtml(caption)}</figcaption>` : ""}
</figure>`;
}
