// Content collections - schemas for roles, profile and projects (decisions D2, D3).
// A wrong field or type stops the build; lib/content.ts also checks ids across collections.
import { defineCollection } from "astro:content";
import { file, glob } from "astro/loaders";
import { z } from "astro/zod";

const link = z.object({ label: z.string(), href: z.url() });

const metric = z.object({
  /** Shared key so the hero can add up numbers across projects (fr, uc, bpmn...). */
  key: z.string(),
  value: z.number().int().nonnegative(),
  label: z.string(),
});

const artifact = z.object({
  label: z.string(),
  href: z.url(),
  kind: z.enum(["spec", "bpmn", "usecase", "erd", "dfd", "sequence", "state", "trace", "adr", "api", "report", "design", "doc"]),
});

const workflow = z.object({
  title: z.string(),
  caption: z.string().optional(),
  mermaid: z.string(),
});

/** A bold keyword and a few words after it. Length limits keep the cards scannable. */
const highlight = z.object({ label: z.string().max(24), text: z.string().max(64) });

/** How a project is told. `default` is complete; an angle overrides any of it for one role. */
const story = z.object({
  category: z.string(),
  tagline: z.string().max(80),
  problem: z.string().max(130),
  role: z.string().max(60),
  highlights: z.array(highlight).max(4).default([]),
  workflow: workflow.optional(),
  metrics: z.array(metric).default([]),
  artifacts: z.array(artifact).default([]),
});

const demoRole = z.object({
  id: z.string(),
  label: z.string(),
  path: z.string().startsWith("/"),
  device: z.enum(["desktop", "phone"]),
  blurb: z.string(),
  poster: z.string(),
});

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    period: z.string(),
    context: z.string(),
    team: z.number().int().positive().optional(),
    status: z.enum(["live", "completed", "in-progress"]),
    stack: z.array(z.string()),
    cover: z.string().optional(),
    /** Screenshots for the "Screens" tab of a project card; each opens in the zoom viewer. */
    screens: z.array(z.object({ src: z.string(), title: z.string() })).max(6).default([]),
    links: z.array(link).default([]),
    /** Live app embedded in an iframe, one tab per demo role (needs /demo/:role in the app). */
    liveDemo: z
      .object({
        base: z.url(),
        warmup: z.url(),
        note: z.string(),
        roles: z.array(demoRole).min(1),
      })
      .optional(),
    default: story,
    angles: z.record(z.string(), story.partial()).default({}),
  }),
});

const roles = defineCollection({
  loader: file("src/content/roles.yaml"),
  schema: z.object({
    path: z.string().startsWith("/"),
    title: z.string(),
    seoDescription: z.string(),
    availability: z.string(),
    headline: z.tuple([z.string(), z.string()]),
    intro: z.string().max(110),
    summary: z.string().max(170),
    pillars: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string().max(60) })).length(3),
    process: z.array(z.object({ icon: z.string(), title: z.string(), text: z.string().max(32) })).min(3).max(6),
    orbit: z.array(z.string()).min(4).max(10),
    spotlight: z.string(),
    featured: z.array(z.string()).min(1),
    stats: z.array(z.object({ key: z.string(), label: z.string() })).default([]),
    skillGroups: z.array(z.string()),
    cv: z.string().optional(),
  }),
});

const profile = defineCollection({
  loader: file("src/content/profile.yaml"),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    initials: z.string().max(3),
    location: z.string(),
    timezone: z.string(),
    email: z.email(),
    github: z.url(),
    linkedin: z.url().optional(),
    facts: z.array(z.object({ icon: z.string(), label: z.string(), value: z.string() })),
    skills: z.array(
      z.object({
        id: z.string(),
        title: z.string(),
        icon: z.string(),
        items: z.array(z.string()).min(1),
      }),
    ),
    journey: z.array(
      z.object({
        period: z.string(),
        title: z.string(),
        place: z.string(),
        icon: z.string(),
        detail: z.string().max(110),
      }),
    ),
  }),
});

export const collections = { projects, roles, profile };
