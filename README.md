# Tactiq — website

Tactiq is a student research project from Sydney, Australia: a smart ring being
designed to give blind and low-vision people quiet, one-handed phone control
alongside VoiceOver and TalkBack. One ring, nine commands on eight contact
points a thumb can always feel. All ring performance figures are
pre-registered targets or simulation results, not achieved results.

Live site: **https://tactiq0.netlify.app** · Ring hardware & bench code:
[Tactiq-product](https://github.com/yaliyuan99-cmd/Tactiq-product)

## What's in this repository

| Path | What it is |
| --- | --- |
| `site/` | **The deployable static site** — zero-JavaScript, accessibility-first (Atkinson Hyperlegible, AAA contrast). This is what `netlify.toml` publishes. See `README-DEPLOY.md`. |
| `src/` | The full React + Vite app: cinematic homepage, research-journal page (`/project`), interactive command map, accounts, prerendering. An alternative, richer version of the site. |
| `README-DEPLOY.md` | How to deploy and maintain the static site (2-minute drag-and-drop). |
| `WEBSITE-ROADMAP.md` | The improvement backlog for the static site, with guardrails and acceptance criteria. |
| `tactiq-site/` (local only, untracked) | A ready-to-drag build snapshot of the React app for Netlify drop deploys. |

## Site versions (branches)

| Branch | Contents |
| --- | --- |
| `main` | Current work: the static `site/` + the React app with the tactile research-journal redesign merged. |
| `tactile-redesign` | The research-journal redesign of the React app (merged into main). |
| `caplet-honest-content` | Earlier honest-content version with the Caplet-inspired cream/blue design. |

The project's content rule across all current versions: no invented
testimonials, no fake waitlist numbers, no firm retail prices, and every
unverified performance figure labelled as a target, simulation or plan.

## Running the React app

```bash
npm install
npm run dev        # dev server on http://localhost:5173
npm run build      # typecheck + client build + SSG prerender into dist/
npm run typecheck
npm run lint
```

The build prerenders every public route to real HTML (see `prerender.mjs`), so
served pages contain their content before JavaScript runs.

## Deploying

The quick path is the static site: follow `README-DEPLOY.md` (drag `site/`
onto the Netlify tactiq0 Deploys page). To deploy the React app instead, run
`npm run build` and drag `dist/` (or the refreshed `tactiq-site/` snapshot).

## Project timeline

Design + simulation complete · prototype construction now · bench experiment
Aug–Oct 2026 · AUSSEF submission 11 Nov 2026 · possible ISEF 2027 pathway.
