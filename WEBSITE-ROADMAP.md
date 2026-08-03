# Tactiq website — roadmap for Claude Code

This is the full improvement backlog for the site, in execution order. Work top-down; every item lists its acceptance criteria. Read `README-DEPLOY.md` first for context and the guardrails.

## Guardrails (apply to every task, never break)

1. **Zero-JS for content.** JavaScript may only ever be progressive enhancement; every page must be fully usable with JS disabled.
2. **Contrast:** body text ≥ 7:1 (AAA), large text and UI ≥ 3:1. Verify with a contrast checker on any new colour pair.
3. **Typeface stays Atkinson Hyperlegible** (Next, with Hyperlegible + system fallbacks).
4. **Every image/SVG gets a real text alternative** (or `aria-hidden` with an adjacent text equivalent, like the hand map's table).
5. **Copy rules:** performance figures stay labelled as pre-registered targets until tests pass; keep the working-title footer; never reintroduce banned copy (two rings · 3×3 grid · 60+ gestures · "rivals a keyboard" · tap-count delete/clear-field · "$1,500–$7,000" braille range · "no failure points" · "faster than any voice command or screen reader" · "safety device"/medical claims).
6. **No trackers, no cookie banners, no third-party scripts.** Privacy is part of the brand.
7. **Recruitment gate:** no contact form, email address, or "sign up to participate" flow goes live until the school review board has approved the study in writing (see participate.html status note). Product waitlists: not before 2029.

**Definition of done for every task:** Lighthouse accessibility = 100 and axe-core = 0 critical issues on all pages; full keyboard-only pass (visible focus everywhere); no horizontal scroll at 320–390 px; W3C HTML validation clean; pages readable with CSS disabled.

---

## Phase 0 — infrastructure (do first, ~1 session)

- [ ] **0.1 Git repo + Netlify CI.** `git init`, sensible `.gitignore`, push to GitHub, connect the repo to the existing Netlify site (publish directory = repo root, no build command). Acceptance: a commit auto-deploys; drag-and-drop no longer needed.
- [ ] **0.2 Self-host the fonts.** Download Atkinson Hyperlegible Next + Atkinson Hyperlegible woff2 files into `/fonts`, replace the Google Fonts `<link>` with `@font-face` (font-display: swap), preload the two main weights. Acceptance: zero third-party requests site-wide; text renders identically.
- [ ] **0.3 Single stylesheet.** Extract the duplicated `<style>` blocks into one `/styles.css` (link with it in `<head>`); keep page-specific rules in a small per-page block only if truly needed. Acceptance: visual diff = none (screenshot before/after at 390 and 1360 px); one source of truth for tokens.
- [ ] **0.4 Netlify `_headers`.** Add security headers: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a CSP allowing only self (+ fonts if 0.2 not done yet), long-cache for /fonts, og.png, favicon.svg. Acceptance: securityheaders.com grade A without breaking anything.
- [ ] **0.5 CI quality gate.** GitHub Action running: html-validate (or vnu), axe-core via playwright on all pages, a link checker, and a Lighthouse budget (a11y = 100, perf ≥ 95). Acceptance: red build on any regression.

## Phase 1 — content (as things become true; some items are event-triggered)

- [ ] **1.1 Contact line.** Create a dedicated project email address (not a personal one) → add one contact line to all footers and to participate.html's "For organisations" section. *Trigger: address exists.*
- [ ] **1.2 Publish the participant documents.** When the school review board approves the study: fill the placeholders in the ethics pack, export accessible PDFs AND plain-HTML versions, host under `/participate/`, link from participate.html, and flip its status note to "recruitment open — here's how". *Trigger: written IRB approval. Not one day earlier.*
- [ ] **1.3 Papers page.** When the AUSSEF paper is submitted (Nov 2026): `/papers.html` with HTML abstracts + tagged, accessible PDFs; update the two "available on request" lines. *Trigger: teacher confirms papers are shareable.*
- [ ] **1.4 Bench-results update.** After the bench experiment (Oct–Nov 2026): update research.html's status note and the criteria table with a Result column — pass or fail, reported plainly. Failed criteria stay visible with what changed as a result. *This page is the brand; honesty is the feature.*
- [ ] **1.5 Lab notes.** A `/notes.html` changelog: dated 2–4 sentence entries (bench started, AUSSEF submitted, ISEF result, first interviews complete — aggregate only, never participant details). Reverse-chronological, one page, no pagination until 30+ entries.
- [ ] **1.6 Audio version of the homepage.** Founder-recorded MP3 (or high-quality TTS clearly labelled as such) of index.html's content, linked at the top of the page; the page itself is the transcript. On-brand and genuinely used by the audience.
- [ ] **1.7 FAQ page.** Short, honest: Is it available? (no — research stage). Does it replace VoiceOver/TalkBack? (never). Is it a medical device? (no, and it makes no medical claims). What will it cost? (target: earbuds-class; a target, not a promise). Why "working title"? (naming, honestly told).

## Phase 2 — accessibility hardening (ongoing, schedule one pass per school term)

- [ ] **2.1 Real screen-reader passes.** Scripted manual tests: VoiceOver+Safari (macOS/iOS) and NVDA+Firefox (Windows): landmarks, heading skim, table navigation (both tables), skip link, focus order, SVG alternatives. Log findings as issues; fix all.
- [ ] **2.2 Forced-colors / high-contrast mode.** Audit under Windows High Contrast (`forced-colors: active`): ensure focus rings, table rules, and the tap-mark survive; add `forced-color-adjust` handling where needed.
- [ ] **2.3 `prefers-contrast: more` variant.** Bump borders to 2px and muted text to full-ink when requested.
- [ ] **2.4 Dark scheme.** `prefers-color-scheme: dark` variant that keeps AAA contrast (ink surfaces, bone text, amber accents; verify every pair numerically). Do not add a manual toggle (that needs JS/storage) — honour the OS setting only.
- [ ] **2.5 Reflow stress test.** 400% zoom and 320 px width: no loss of content or function, no horizontal scroll (tables may scroll within their labelled regions). Add to CI if scriptable.
- [ ] **2.6 Print stylesheet.** Clean print of research.html (judges will print it): black-on-white, URLs shown after links, no dark bands.

## Phase 3 — later features (each has a gate; do not pull forward)

- [ ] **3.1 Interest register.** Accessible Netlify Form (proper labels, error text, honeypot not captcha, double opt-in email). *Gate: study open (research register) or 2029+ (product waitlist — see strategy report).*
- [ ] **3.2 Privacy-first analytics.** Only if a real decision needs the data; cookieless (Netlify Analytics or Plausible), plus a one-line privacy note. Never Google Analytics; never a cookie banner.
- [ ] **3.3 Interactive hand map.** Keyboard- and screen-reader-operable SVG demo of the nine commands (arrow keys move between points, announcements via aria-live), as progressive enhancement above the existing static figure + table. *Gate: Phase 2 complete; enhancement must degrade to the current figure with JS off.*
- [ ] **3.4 Per-page og images.** Generate research/participate variants of og.png (same PIL script pattern, different subtitle).
- [ ] **3.5 Rename migration (2028, at incorporation).** When the company name changes: new domain, 301 redirects from tactiq0.netlify.app, canonical/og/sitemap sweep, footer note update, brand-token swap in styles.css. Keep this checklist until then.

## Maintenance calendar

- **After every content change:** run the CI gate locally (or push and watch it).
- **Monthly:** link check; confirm the status notes on research.html and participate.html are still true.
- **Nov 2026:** items 1.3, 1.4. **On IRB approval:** item 1.2. **May 2027:** ISEF result → 1.5 entry.
