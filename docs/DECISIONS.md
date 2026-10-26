# Decisions

Decision log for the portfolio, filled in during the grill-me interview (one question at a time) and while building. Later decisions may override earlier ones; when that happens the old entry is marked *Superseded*.

| ID | Decision | Why | Date |
|----|----------|-----|------|
| D1 | The portfolio targets **several roles**, not only BA. BA is the current best fit, but the site must also work for other applications (dev, data, AI...). | The owner applies to several positions and wants to stay open to other roles. | 2026-10-26 |
| D2 | **Layout and structure come first; content is swappable.** Content changes per job application, so it must be editable without touching layout code. | Content is tailored per job; structure and UI are the stable part. | 2026-10-26 |
| D3 | **One path per role over a shared project pool.** `content/roles.yaml` lists each role (`/` = BA) and its `featured` projects in display order (single source of truth). Each project has a `default` story plus optional per-role `angles`. A build-time schema check fails on unknown ids. **Only the BA role is built now**; other roles are added later as data. | Same projects must be told differently per role; owner delegated the data design and wants BA first. | 2026-10-26 |
| D4 | **A BA project block must show BA evidence at a glance:** the key business workflow as a diagram (Mermaid), BA artifact keywords (SRS, BPMN, use case, user story...), and counts (functional requirements, use cases...). | Recruiters for BA roles look for process thinking and documentation, not just code. | 2026-10-26 |
| D5 | **Diagrams sit in a framed viewer with zoom**: buttons, drag, pinch, Ctrl + wheel, double-click, keyboard, and a full-screen view. Mermaid diagrams open at a readable scale anchored at the start of the flow; screenshots and BPMN images open fitted. | Owner asked for flows that can be zoomed in and out to read in detail. | 2026-10-26 |
| D6 | **Featured project runs live in the page.** H4T Xpress gained a `/demo/:role` deep link (thienAG4/h4t-xpress#3) that signs in as a demo account; the portfolio embeds it in an iframe with one tab per role and wakes the free API server when the section comes near. | Reference portfolio embeds its app; a recruiter should try the product without a login form. | 2026-10-26 |
| D7 | **Visual direction:** dark slate palette from the Behance reference (#101E21, #34404C, accent #6881F5), film grain overlay, frosted glass cards, soft glow; motion from the reference portfolio (word-by-word headline, scroll reveals, count-up numbers, orbiting chips). Respects reduced motion. | Owner asked for a dark, slightly grainy, blurred and translucent look combined with the reference site's motion. | 2026-10-26 |
| D8 | **Stack:** Astro 7 static site, Tailwind 4, Mermaid 12 loaded on demand, content collections for the data checks. Hosting on Vercel. English content. | Static pages load fast for recruiters; content collections give the schema checks D3 asks for; Vercel already hosts H4T. | 2026-10-26 |
| D9 | **Honesty rules for content:** every number is counted from the project's own documents, every artifact chip links to a real file, unknown details are left out rather than guessed, and team projects credit the team. The H4T spec is labelled "SRS-style" because its title is Product Specification. | A BA interview will check the claims. | 2026-10-26 |
| D10 | **Case study pages only for projects with real BA documents** (H4T Xpress, GreenDrop). The other projects show the card only. | A thin case study hurts more than no case study. | 2026-10-26 |
| D11 | **Less text, more visuals** (feedback after the first release). Hero keeps only headline, one line and two buttons; the process and totals move to About. Project cards use a one-line problem, a role chip, 3-4 keyword bullets, big numbers and a Screens tab. Schema length limits enforce it. | The first version read as a wall of text and the opening felt crowded. | 2026-10-26 |
| D12 | **Background reacts to the mouse**: a constellation of points behind the hero (points drift away from the cursor and link to it) and a page grid that lights up around the cursor. Paused off screen; mouse only; reduced motion respected. | Owner asked for the hover effect of the reference portfolio. | 2026-10-26 |

## Open items for the owner

- Add a CV PDF (`cv` field in `roles.yaml`) and a LinkedIn URL (`linkedin` in `profile.yaml`) if wanted.
- Check the wording of the role on OPC Multi-Agent and ATELIER AI.
- Other role pages (`/dev`, `/data`, `/ai`) when applying for those roles.
