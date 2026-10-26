// Icons - lucide outline icons as inline SVG strings, plus the GitHub mark (lucide dropped brand icons)
import * as lucide from "lucide-static";

const GITHUB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

const ICONS = {
  "arrow-down": lucide.ArrowDown,
  "arrow-left": lucide.ArrowLeft,
  "arrow-right": lucide.ArrowRight,
  "arrow-up-right": lucide.ArrowUpRight,
  award: lucide.Award,
  bot: lucide.Bot,
  boxes: lucide.Boxes,
  chart: lucide.ChartColumn,
  check: lucide.Check,
  clipboard: lucide.ClipboardList,
  clock: lucide.Clock,
  code: lucide.Code,
  copy: lucide.Copy,
  database: lucide.Database,
  dashboard: lucide.LayoutDashboard,
  exchange: lucide.ArrowLeftRight,
  file: lucide.FileText,
  fit: lucide.Scan,
  github: GITHUB,
  graduation: lucide.GraduationCap,
  image: lucide.Image,
  layers: lucide.Layers,
  lightbulb: lucide.Lightbulb,
  list: lucide.ListChecks,
  mail: lucide.Mail,
  map: lucide.MapPin,
  maximize: lucide.Maximize2,
  menu: lucide.Menu,
  monitor: lucide.Monitor,
  network: lucide.Network,
  play: lucide.Play,
  route: lucide.Route,
  branch: lucide.GitBranch,
  shield: lucide.ShieldCheck,
  smartphone: lucide.Smartphone,
  sparkles: lucide.Sparkles,
  table: lucide.Table,
  target: lucide.Target,
  users: lucide.Users,
  workflow: lucide.Workflow,
  x: lucide.X,
  "zoom-in": lucide.ZoomIn,
  "zoom-out": lucide.ZoomOut,
} as const;

export type IconName = keyof typeof ICONS;

/**
 * SVG markup of an icon, sized by CSS (1em by default) and hidden from screen readers.
 */
export function iconSvg(name: IconName, className = "icon"): string {
  const svg = ICONS[name];
  // Only the outer <svg> tag loses its size; inner <rect width=...> must keep theirs.
  const end = svg.indexOf(">");
  const openTag = svg
    .slice(0, end)
    .replace(/\s(width|height|class)="[^"]*"/g, "")
    .replace("<svg", `<svg class="${className}" aria-hidden="true" focusable="false"`);
  return openTag + svg.slice(end);
}
