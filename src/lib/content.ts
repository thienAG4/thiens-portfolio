// Content - builds the view of one role: its featured projects told from its angle, plus the
// numbers the hero adds up. Stops the build when ids in the YAML files do not line up (decision D3).
import { getCollection, getEntry, type CollectionEntry } from "astro:content";
import type { IconName } from "./icons";
import { iconSvg } from "./icons";

export type Project = CollectionEntry<"projects">;
export type Role = CollectionEntry<"roles">;
export type Profile = CollectionEntry<"profile">["data"];
type Story = Project["data"]["default"];

export interface ProjectView {
  id: string;
  data: Project["data"];
  story: Story;
  hasCaseStudy: boolean;
}

export interface Stat {
  key: string;
  label: string;
  value: number;
}

/** The default story with the role's angle laid over it, field by field. */
export function storyFor(project: Project, roleId: string): Story {
  const angle = project.data.angles[roleId] ?? {};
  const merged = { ...project.data.default };
  for (const [key, value] of Object.entries(angle)) {
    if (value !== undefined) Object.assign(merged, { [key]: value });
  }
  return merged;
}

export async function getProfile(): Promise<Profile> {
  const entry = await getEntry("profile", "thien");
  if (!entry) throw new Error('profile.yaml needs an entry with the id "thien"');
  for (const icon of [...entry.data.facts, ...entry.data.skills, ...entry.data.journey].map((item) => item.icon)) {
    assertIcon(icon, "profile.yaml");
  }
  return entry.data;
}

export async function getRoles(): Promise<Role[]> {
  return getCollection("roles");
}

export async function getRoleView(roleId: string) {
  const role = await getEntry("roles", roleId);
  if (!role) throw new Error(`roles.yaml has no role "${roleId}"`);
  for (const item of [...role.data.pillars, ...role.data.process]) assertIcon(item.icon, `roles.yaml (${roleId})`);

  const all = await getCollection("projects");
  const byId = new Map(all.map((project) => [project.id, project]));
  const missing = [...role.data.featured, role.data.spotlight].filter((id) => !byId.has(id));
  if (missing.length > 0) {
    throw new Error(`Role "${roleId}" lists unknown projects: ${missing.join(", ")}. Known: ${[...byId.keys()].join(", ")}`);
  }
  if (!role.data.featured.includes(role.data.spotlight)) {
    throw new Error(`Role "${roleId}": spotlight "${role.data.spotlight}" must also be in featured`);
  }

  const projects: ProjectView[] = role.data.featured.map((id) => toView(byId.get(id)!, roleId));
  const spotlight = projects.find((project) => project.id === role.data.spotlight)!;
  if (!spotlight.data.liveDemo) {
    throw new Error(`Role "${roleId}": spotlight "${spotlight.id}" has no liveDemo block`);
  }

  const profile = await getProfile();
  const skillIds = new Set(profile.skills.map((group) => group.id));
  const unknownSkills = role.data.skillGroups.filter((id) => !skillIds.has(id));
  if (unknownSkills.length > 0) throw new Error(`Role "${roleId}" lists unknown skill groups: ${unknownSkills.join(", ")}`);
  const skills = role.data.skillGroups.map((id) => profile.skills.find((group) => group.id === id)!);

  return { role, profile, projects, spotlight, others: projects.filter((p) => p !== spotlight), skills, stats: statsFor(role, projects) };
}

/** Every project with a case study body, for /projects/[id]. */
export async function getCaseStudies(): Promise<Project[]> {
  const all = await getCollection("projects");
  return all.filter((project) => Boolean(project.body?.trim()));
}

export function toView(project: Project, roleId: string): ProjectView {
  return { id: project.id, data: project.data, story: storyFor(project, roleId), hasCaseStudy: Boolean(project.body?.trim()) };
}

// "live" counts live products; any other key adds up the matching metric of each project.
function statsFor(role: Role, projects: ProjectView[]): Stat[] {
  return role.data.stats.map(({ key, label }) => {
    const value =
      key === "live"
        ? projects.filter((project) => project.data.status === "live").length
        : projects.reduce((sum, project) => sum + (project.story.metrics.find((m) => m.key === key)?.value ?? 0), 0);
    return { key, label, value };
  });
}

function assertIcon(name: string, source: string): asserts name is IconName {
  try {
    iconSvg(name as IconName);
  } catch {
    throw new Error(`${source}: unknown icon "${name}"`);
  }
}

/** Icon for each kind of BA artifact chip. */
export const ARTIFACT_ICONS: Record<Story["artifacts"][number]["kind"], IconName> = {
  spec: "file",
  bpmn: "workflow",
  usecase: "users",
  erd: "database",
  dfd: "network",
  sequence: "exchange",
  state: "branch",
  trace: "table",
  adr: "list",
  api: "code",
  report: "chart",
  design: "layers",
  doc: "file",
};
