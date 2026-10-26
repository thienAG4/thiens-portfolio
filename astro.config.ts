// Astro config - static site, Tailwind through Vite, Mermaid and image diagram blocks become zoomable frames
import { unified } from "@astrojs/markdown-remark";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { remarkMermaid } from "./src/lib/remark-mermaid";

export default defineConfig({
  site: "https://thiens-portfolio.vercel.app",
  output: "static",
  markdown: {
    // remark-mermaid swaps the diagram blocks out before Shiki sees them.
    processor: unified({ remarkPlugins: [remarkMermaid] }),
    syntaxHighlight: { type: "shiki", excludeLangs: ["mermaid", "diagram", "math"] },
    shikiConfig: { theme: "github-dark-dimmed" },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
