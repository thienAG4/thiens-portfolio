// remark-mermaid - turns diagram code blocks in Markdown into zoomable diagram frames.
//   ```mermaid title="Order lifecycle" height=520      -> Mermaid source drawn in the browser
//   ```diagram src="/images/x.webp" title="BPMN 4"     -> exported image (BPMN, ERD); the body is the caption
import type { Code, Html, Root } from "mdast";
import { visit } from "unist-util-visit";
import { diagramMarkup } from "./diagram-markup";

const attr = (meta: string, name: string) => new RegExp(`${name}="([^"]+)"`).exec(meta)?.[1];

export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node: Code, index, parent) => {
      if ((node.lang !== "mermaid" && node.lang !== "diagram") || !parent || index === undefined) return;
      const meta = node.meta ?? "";
      const title = attr(meta, "title");
      const height = Number(/height=(\d+)/.exec(meta)?.[1]) || 460;

      let value: string;
      if (node.lang === "mermaid") {
        value = diagramMarkup({ mermaid: node.value, title, height });
      } else {
        const image = attr(meta, "src");
        if (!image) throw new Error(`A diagram block needs src="..." (title: ${title ?? "none"})`);
        value = diagramMarkup({ image, title, height, caption: node.value.trim() || undefined });
      }
      const html: Html = { type: "html", value };
      parent.children.splice(index, 1, html);
    });
  };
}
