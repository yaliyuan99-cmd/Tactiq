# Tactiq site — deploy & maintain

Static, zero-JavaScript, accessibility-first rebuild of tactiq0.netlify.app.
Files: `index.html` · `research.html` · `404.html` · `favicon.svg` · `og.png` · `robots.txt` · `sitemap.xml`.

## Deploy (2 minutes)

1. Log in to Netlify → open the **tactiq0** site → **Deploys** tab.
2. Drag this whole folder onto the "drag and drop your site output folder here" area.
3. Done. This fully replaces the previous React/Figma build (which served a blank page without JavaScript). Netlify serves `404.html` automatically for bad URLs.

Check after deploy: view-source shows real HTML; a shared link now previews with the og image; https://tactiq0.netlify.app/research.html loads.

## Small edits you'll want to make

- **Contact:** when you're ready to be contactable, add one line to both footers, e.g.
  `<p>Contact: <a href="mailto:YOUR-ADDRESS">YOUR-ADDRESS</a></p>` (use a project address, not your personal one).
- **Papers:** when the papers are shareable, create a `papers/` folder, drop the PDFs in, and change "Full papers are available on request." on research.html to links.
- **After the bench experiment:** update the Status paragraph on research.html — and if a criterion failed, say so. The honesty is the brand.
- If the domain ever changes, search-and-replace `tactiq0.netlify.app` in both pages + sitemap.

## Design decisions (worth knowing, worth citing)

- **Typeface: Atkinson Hyperlegible** — designed by the Braille Institute for low-vision legibility. The site practises what the project preaches.
- **Amber accent (#E8A33D)** — the colour of tactile paving: the colour of the tactile world. The mark (two dots, a dash) is the tap grammar itself: tap-tap-hold.
- All text ≥ 7:1 contrast (AAA); zero JS; works fully with screen readers, keyboard, magnification, and reduced-motion settings; every diagram has a text equivalent.
- "Tactiq (working title)" is stated in the footer on purpose — see the strategy report on the name.

## The improvement backlog

The full, prioritized to-do list for this site (infrastructure, content, accessibility hardening, later features, with acceptance criteria and gates) is in **WEBSITE-ROADMAP.md** in this folder. Hand it to Claude Code with the prompt below and ask it to start at Phase 0.

## If you want to keep iterating in Claude Code

Paste this as your first prompt:

> This folder is a static, zero-JS, accessibility-first site for Tactiq, a student research project (smart ring for eyes-free phone control for blind users). Read README-DEPLOY.md, index.html and research.html first. Hard rules you must never break: no JavaScript dependency for content; WCAG 2.2 AA minimum with ≥7:1 body-text contrast; Atkinson Hyperlegible stays the typeface; every image/SVG gets a real text alternative; all performance figures stay labelled as pre-registered targets, not results; never add the terms in the "banned copy" list (two rings, 60+ gestures, keyboard-rivalling speed, "no failure points", faster-than-voice claims); keep the working-title footer note. Task: set this up as a git repo with Netlify deploys, then work through WEBSITE-ROADMAP.md starting at Phase 0, one item at a time, meeting each item's acceptance criteria before moving on.



## Layout of this folder (updated 27 Jul 2026)

- `site/` — the live website (deploy THIS folder: in Netlify drag-and-drop `site/`, or with a linked repo `netlify.toml` already points at it, no build command).
- `_old-spa-backup/` — the previous React/Vite app, moved aside untouched (including node_modules and supabase experiments). Delete it whenever you are confident; git history also has it if it was committed.
- `netlify.toml` — tells Netlify to publish `site/` with no build step.
- `WEBSITE-ROADMAP.md` — the full improvement backlog for Claude Code.
