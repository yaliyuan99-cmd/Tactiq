# Maintenance log

Inspect → diagnose → prioritise → improve → verify cycles, running every
2 hours. Newest first. Keep entries short.

A cycle that finds nothing and changes nothing is a successful cycle — record
it briefly rather than manufacturing work.

---

## 2026-08-11 — cycle 12

**Inspected:** git state, 105 tests, tsc, lint, build + prerender; the
**contrast audit of the authenticated dashboard** that cycle 11 left undone —
all nine routes, then re-run at a real 1280 px viewport once the desktop
sidebar actually laid out; 375 px overflow; console.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P2** | **Nine pieces of readable text below AA, one root cause: `--muted-foreground` dimmed with an opacity modifier.** The token is only 6.31:1 to begin with, so any `/NN` spends the margin. The simulator's five pipeline stage labels at 60% were **2.66:1** — and at rest (`stage = -1`) *every* one of them is in that state, so that is how the page looks before you touch it. The sidebar's three group headings at 80% were **3.99:1**, and the ⌘K hint at 70% was **3.26:1** | Fixed |
| — | The other eight dashboard routes' page content | 0 failures |
| — | The `→` separators between pipeline stages, at 1.83:1 | **Not a violation** — already `aria-hidden`, and decoration is exempt from 1.4.3. Nudged 40%→60% for balance once the labels brightened; recorded as a visual change, not a compliance one |
| — | My first dashboard sweep reported **0 failures everywhere** | **Incomplete, not wrong** — the sidebar is `lg:`-only and the pane reports `innerWidth: 0`, so those elements had zero-size rects and the audit skipped them. Found by grepping for the pattern instead, then confirmed by forcing layout with a screenshot |

**Changed:** dropped the opacity modifier in all three places. The active
pipeline state is untouched and still obvious — it differs in hue, not just
strength (burnt orange `#8c3009` at 7.52:1 vs warm grey `#5f594e` at 6.31:1).
Plus `mutedTextContrast.test.ts`, a source-level rule against dimming the muted
token on non-`aria-hidden` text, since a runtime sweep demonstrably could not
see two of these three.

**Verified:** 108/108 tests · **mutation-tested twice** — restoring either
dimmed class fails by name, all 108 pass restored · the audit self-tests both
directions (a low-contrast probe is caught, a high-contrast control is not)
before any result is trusted · tsc 0 errors · eslint 0 errors · build + 16
prerendered routes · in-browser at a real 1280 px viewport with the sidebar
laid out: all nine elements now measure **6.31:1**, and all nine dashboard
routes re-audit to **0 failures** · 375 px: no overflow, 0 failures · 0 console
errors.

**Deployed to Netlify** — user-visible.

**A mistake worth recording:** the first edit put a JSX comment inside
`{group.label && ( … )}`, which is an expression slot, not a child list — it
broke the parse and the build emitted **0 prerendered routes**. tsc and eslint
both caught it before anything shipped. Moved the comment outside the
conditional.

**Remaining concerns**
- The simulator pipeline could not be driven in the pane (its squeeze needs
  timers the hidden tab throttles), so the *active* colour was verified from
  the class and token values rather than by watching it advance. The edit only
  touches the inactive branch.
- `--muted-foreground` at 6.31:1 leaves little headroom by design; anything
  layered on it needs checking. The new test enforces that for opacity only.
- Component/routing behaviour still untested at runtime (needs jsdom).
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — deferred seven cycles, and now the only thing left on the list.

---

## 2026-08-11 — cycle 11

**Inspected:** git state, 95 tests, tsc, lint, build + prerender; a first-ever
**colour-contrast audit** of every text node on `/`, `/project` and the eight
public section/legal pages, run against the **production build** as well as the
dev server; all three skip links; the `--primary` pairing in both themes.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P2** | **All three skip links fell below WCAG AA (1.4.3).** They are 16px normal weight, so they need 4.5:1. The showcase link was white on `--t-violet` = **3.69:1**; the site-header and dashboard links were white on `--primary`, which is **4.03:1 in the dark theme** (light theme is fine at 6.50). The skip link exists only for keyboard users and is only ever seen while focused, so weak colours there are invisible to everyone except the people it was built for | Fixed |
| — | Every other text node on `/`, `/project` and the 8 section/legal pages | **0 contrast failures** |
| — | Primary buttons in the dark theme, given white-on-`#d3591d` is 4.03:1 | **Not a defect** — the audit found none failing, because that text is large or bold enough to need only 3:1 |
| — | "7 contrast failures on `/project`" | **Phantom (my own tool)** — my first audit couldn't parse `oklch()`, so it walked past a dark `bg-slate-700` keycap up to a near-white card and reported white-on-white at 1.04:1. Rewrote it to resolve any CSS colour through a canvas |
| — | "All three skip links stay invisible when focused" | **Phantom (pane)** — `document.hasFocus()` is `false` and `visibilityState` is `hidden`, so `:focus` matches nothing in the preview pane. Proved it with a plain control input, not by assumption |

The contrast numbers survive that second phantom: the showcase link's colours
come from an inline `style`, and the others were computed from the token values
directly, neither of which depends on `:focus` matching.

**Changed:** the showcase link uses the **already-existing** `--t-violet-deep`
(6.93:1) instead of `--t-violet`; the other two use `focus:bg-foreground
focus:text-background` — the pattern already used elsewhere in the app — which
clears AA in **both** themes (15.1 / 14.4) rather than passing in one and
failing in the other. No brand token was touched. Plus
`skipLinkContrast.test.ts` (10 tests).

**Verified:** 105/105 tests · **mutation-tested twice** — reverting either skip
link to its old pairing fails by name, all 105 pass restored · the contrast
formula is itself pinned against black-on-white 21:1 and reproduces the 3.69
and 4.03 measured in the browser · tsc 0 errors · eslint 0 errors · build + 16
prerendered routes · **compiled CSS checked** for `focus\:bg-foreground:focus`
and `focus\:text-background:focus`, so the swap did not silently vanish · on the
**production build** the showcase link now renders white on `rgb(83,74,183)` =
**6.93:1**, and a full re-audit of `/` returns **0 failures**.

**Deployed to Netlify** — user-visible.

**Remaining concerns**
- **The focused appearance was never observed.** The pane has no window focus,
  so `:focus` styles cannot render there; the fix rests on computed colour
  pairs and the compiled CSS, not on a screenshot of a focused skip link.
- The new test pins which pairing each link *uses*, not the hex the CSS
  defines: `?raw` on a `.css` file returns an empty string here (Tailwind's
  plugin consumes it, by plain import and by `import.meta.glob` alike), so the
  token values are mirrored as constants. Editing a token alone would slip past.
- Component/routing behaviour still untested at runtime (needs jsdom).
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — deferred six cycles now. Also worth doing once: a contrast audit of
the authenticated dashboard pages, which this cycle did not reach.

---

## 2026-08-11 — cycle 10

**Inspected:** git state, 74 tests, tsc, lint, build + prerender; every form in
the app (login, sign-up, forgot/reset password, follow-the-project, account
settings) submitted for real and traced frame by frame for where focus goes;
signed-out `/dashboard/device` redirect and the return trip after sign-in;
`/login` at 375 px; console throughout.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P1** | **Every form in the app threw focus away on submit.** The submit button carries `disabled={pending}`, and a focused element that becomes disabled has its focus dropped to `<body>`. Traced on login: focus on BUTTON before the click, **BODY 50 ms later**, and it never came back. The error *was* announced (`role="alert"` is a live region), but a keyboard user was left at the top of the document, tabbing all the way back to retry — on the sign-in error path, the most-travelled failure in the app | Fixed |
| **P1** | Same defect on `FollowForm`'s **input fields**, which my `type="submit"` scan had missed. Submitting with Enter from inside the email field disabled that field mid-flight: measured `emailDisabled: true` with focus already at BODY | Fixed |
| — | Bad credentials at `/login` correctly rejected and still signed out; the guard did not break real sign-in | Correct, no action |
| — | Signed-out `/dashboard/device` → `/login?next=…` → returns after sign-in | Correct, no action |
| — | FollowForm's success state replaces the fields, so focus lands on body | **Not a defect** — the element is gone, and the panel is `role="status"`, so it is announced |
| — | Login appeared to succeed with a junk password | **Phantom** — a session from cycle 9 was still in localStorage, so `/login` took its already-signed-in redirect. Re-tested signed out |

`aria-disabled` conveys the same state without touching focusability. It also
leaves the button clickable, so each handler now refuses a second in-flight
submit itself — on the follow form that guard is what stops one person filing
two waitlist entries.

**Changed:** seven submit buttons across six files move from `disabled` to
`aria-disabled` (+ matching Tailwind `aria-disabled:` variants), each handler
gains an in-flight guard, and FollowForm's two text inputs use `readOnly`
(a `<select>` has none, and changing it mid-flight is harmless — the value was
read when the submit began). Plus `submitButtons.test.ts` (21 tests).

**Verified:** 95/95 tests · **mutation-tested twice** — reverting a button to
`disabled` and deleting a guard each fail by name, all 95 pass restored · tsc 0
errors · eslint 0 errors · build + 16 prerendered routes · **compiled CSS
checked** for `aria-disabled:opacity-60/70` and `cursor-not-allowed`, so the
pending styling survived the variant swap · in-browser, frame-sampled: the
login trace that read BODY at +50 ms now reads BUTTON at every sample; on the
follow form the email field holds focus with `readOnly: true` and
`aria-disabled: "true"` where it previously showed `disabled: true` + BODY ·
auth round trip intact · `/login` at 375 px, no overflow · 0 console errors ·
**the local waitlist entries these probes created were removed** (Supabase is
not configured, so nothing reached production).

**Deployed to Netlify** — user-visible.

**Remaining concerns**
- The guard is static: it proves the attribute contract, not that focus is
  actually retained. The frame-sampled browser trace is the only proof of that.
- The pending window is ~0 ms locally except on the follow form (which has a
  deliberate 500 ms delay); that delay is what made the state observable at all.
- Component/routing behaviour still untested at runtime (needs jsdom).
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — deferred five cycles now, each time to a real user-facing defect.

---

## 2026-08-11 — cycle 9

**Inspected:** git state, 63 tests, tsc, lint, build + prerender; every dialog
in the codebase (command palette, simulator emergency overlay, admin
confirmations) for role, accessible name, Escape and focus management; the
admin suspend/erase flows by keyboard; console on a fresh load.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P1** | **The admin confirmation dialogs were not dialogs.** Suspend-account and erase-user-data rendered on a bare `fixed inset-0` overlay: no `role`, no `aria-modal`, no accessible name, no Escape, and no focus handling. Measured in the browser: opening Suspend left focus on the trigger *behind* the overlay, and 6 Tabs reached another row's Suspend button in the table underneath — while the overlay blocked the mouse | Fixed |
| — | Command palette and the simulator's emergency overlay | Already correct — `role`, `aria-modal`, name, Escape, focus |
| — | Escape appeared not to close the fixed dialog either | **Phantom (tool)** — a capture-phase key logger recorded *nothing*: the preview pane swallows Escape. Tab reached the page normally. Re-tested by dispatching the event the app's own `window` listener receives |
| — | `ReferenceError: useRef is not defined` in the console | **Phantom (stale HMR)** — from the window between adding the hook and adding its import. tsc caught it at the time; a fresh load with an error counter attached reports 0 |

Two of the three dialogs were already right, which is precisely why the third
went unnoticed — it looked like a dialog and behaved like a div. It also
happened to be the one wrapping the two destructive actions, where being able
to back out matters most.

**Changed:** `AdminPage`'s `Modal` gains `role="dialog"`, `aria-modal="true"`
and a required `label` prop (so a nameless dialog is now a type error, not an
oversight), Escape-to-close, a Tab/Shift+Tab trap, focus moved in on open and
handed back to the trigger on close. Follows `CommandPalette`'s existing
pattern rather than inventing a second one. Plus `dialogSemantics.test.ts`
(11 tests) covering every `role="dialog"` in the tree.

**Verified:** 74/74 tests · **mutation-tested twice** — stripping the dialog
ARIA and removing the Escape handler each fail by name, all 74 pass restored ·
tsc 0 errors · eslint 0 errors · build + 16 prerendered routes · in-browser on
a fresh load with an error counter: both dialogs report
`role=dialog / aria-modal=true / aria-label`, focus lands inside on open,
**8 Tabs and 3 Shift+Tabs stay inside**, Escape closes, focus returns to the
exact trigger button, 0 console errors · **no account was suspended or erased**
— both local users still `banned: false` and present.

**Deployed to Netlify** — user-visible.

**Remaining concerns**
- The dialog guard is static: it proves the markup contract, not the runtime
  trap. The trap itself is only covered by the browser check above.
- `Modal`'s key handler re-subscribes on every render because `onClose` is an
  inline arrow at both call sites. Harmless, and not worth churning the call
  sites for.
- Component/routing behaviour still untested at runtime (needs jsdom).
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — deferred four cycles now, each time to a real user-facing defect.

---

## 2026-08-11 — cycle 8

**Inspected:** git state, 31 tests, tsc, lint, build + prerender; `/`, `/project`,
`/login`, `/admin`; the admin authorisation gate as a non-admin account;
signed-out `/admin` redirect; `/admin` at 375 px; whether the 1 MB model-viewer
chunk loads eagerly; a title sweep of the whole route table.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P2** | **`/project` never set its own title.** It is prerendered, so a direct hit was fine — but the homepage's own CTAs reach it through the router, where the tab kept saying "Tactiq — silent, eyes-free phone control for blind users" while the page read "Control your phone with the hand you already know." The most-travelled path on the public site | Fixed |
| **P2** | **`/admin` never set a title either**, in all three states: direct hit (homepage title), in-app link (previous page's title), and the denial screen — which said "Admins only" in the page and the homepage title in the tab | Fixed |
| — | Admin gate: a signed-in non-admin gets "Admins only" and no user data reaches the DOM. Production checks `profiles.is_admin`; the local fallback is `import.meta.env.DEV`-only | Correct, no action |
| — | Signed-out `/admin` → `/login?next=%2Fadmin` | Correct, no action |
| — | `/admin` at 375 px despite its wide tables | No overflow |
| — | Non-admin saw the full admin console | **Phantom** — that account is `users[0]`, and the DEV fallback deliberately bootstraps the first local account as owner. A second account correctly gets denied |
| — | Build warns about a >500 kB chunk (model-viewer, 1047 kB / 291 kB gz) | **Not a defect** — dynamically imported in `ProductViewer`; confirmed absent from `/project`'s resource list. It only loads when a visitor opts into the 3D view |

Two routes have now shipped without titles, found one page at a time — the 404
in cycle 6, these in cycle 8. Rather than fix the third by hand later, this
cycle adds the general guard: a test that walks the route table in `App.tsx`,
resolves every `element={<X />}` to its source, and requires each to set a
title or delegate to a layout that does. It found `/project` on its own — I
went in looking only at `/admin`.

**Changed:** `LandingPage` exports `PROJECT_TITLE` and sets it on mount, pinned
to the `/project` entry in `prerender.mjs`. `AdminPage` sets `ADMIN_TITLE`, and
`ADMIN_DENIED_TITLE` once the authorisation check comes back — the denied state
earns its own title because that is when knowing where you are matters most.
Plus `routeTitles.test.ts` (32 tests). `ProtectedRoute` and `DashboardLayout`
are exempt as pure wrappers.

**Verified:** 63/63 tests · **mutation-tested three ways** — removing
`LandingPage`'s title, removing `AdminPage`'s, and drifting the prerender's
`/project` title each fail the matching test by name, and all 63 pass restored ·
tsc 0 errors · eslint 0 errors · build + 16 prerendered routes · in-browser:
`/` → `/project` now sets "The research project · Tactiq" **and returns to the
homepage title on the way back**; `/dashboard` → `/admin` sets "Admin console ·
Tactiq"; a non-admin hitting `/admin` gets "Admins only · Tactiq" with no data
leak · 7-route public sweep with an error counter attached: unique title,
single `h1`, 0 errors.

**Deployed to Netlify** — user-visible.

**Remaining concerns**
- The guard is static: it proves a title is *set*, not that it is *correct* for
  the state. Only `/project` and `/404` are pinned to the prerender.
- Component/routing behaviour still untested at runtime (needs jsdom).
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — deferred three cycles running now, each time to a real user-facing
defect. Worth doing if the next inspection turns up nothing bigger.

---

## 2026-08-11 — cycle 7

**Inspected:** git state, 21 tests, tsc, lint, build + prerender; `/`, `/project`,
`/login`; signed-out `/dashboard/*` redirect and the return trip after sign-in;
all 8 dashboard routes at 375 px for overflow, titles, `h1`, accessible names;
the reduced-motion story end-to-end (CSS rules, JS call sites, motion/react).

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P1** | **The site's own reduced-motion setting only half worked.** `/dashboard/accessibility` offers "Remove non-essential animation on this site, *in addition to my system setting*". CSS honoured it via `.force-reduced-motion`, but every JS-driven motion path read `matchMedia` alone and so ignored it: the homepage autoplay video, the marquee parallax, the simulator's staged pipeline, Activity's smooth scroll, and all of motion/react via `MotionConfig reducedMotion="user"` | Fixed |
| — | Auth: signed-out `/dashboard/history` → `/login?next=%2Fdashboard%2Fhistory` → signing in returns to the right page | Correct, no action |
| — | Open-redirect probe on `?next=`: `//example.com` and `https://example.com` both stay on-origin (react-router resolves them as paths) | Not a defect |
| — | All 8 dashboard routes at 375 px: no overflow, unique title, single `h1` | Correct, no action |
| — | Checkboxes on `/dashboard/accessibility` looked unlabelled to a naive query | **Phantom** — implicitly labelled by wrapping `<label>` (`labels.length === 1`) |
| — | Homepage hero video paused in the preview pane | **Phantom** — pane autoplay policy; it pauses identically with the setting off |

The label says "in addition to", which is a promise: the setting has to work on
its own for someone whose OS preference is off. Half-working was the worst
shape for it — transitions froze while video, parallax and motion/react carried
on, so the user believes they turned it off and it hasn't. On a site built for
disabled users, a broken accessibility control is a broken user flow, not
polish.

**Changed:** one source of truth in `a11yPrefs.ts` — `prefersReducedMotion()`
(OS query **or** site setting) and `subscribeReducedMotion()`, with
`applyA11yPrefs()` now emitting a change event. `useReducedMotion` hook
(`useSyncExternalStore`) for declarative sites, plus a `ReducedMotionProvider`
that feeds `MotionConfig` `"always"`/`"user"`. Swapped the 4 `matchMedia` reads
and the 3 uses of motion/react's own `useReducedMotion` — that one is media-query
only, which was the same bug one layer down. 10 new tests.

**Verified:** 31/31 tests · **mutation-tested** — dropping the site-setting half
of `prefersReducedMotion()` fails exactly the two tests that describe the
defect, restoring it passes all 31 · tsc 0 errors · eslint 0 errors · build +
16 prerendered routes · in-browser, with the OS preference **off**: Activity's
"Show on hand" used `behavior: "smooth"` before and `"auto"` after · **control
check** — with the setting off it is still `"smooth"`, so motion is not
disabled for people who never asked · **live toggle without reload** — flipping
the setting the way the accessibility page flips it stopped the marquee
parallax mid-scroll and cleared its transform, proving the subscription reaches
React · 5-route dashboard sweep with an error counter attached: 0 errors.

**Deployed to Netlify** — user-visible.

**Worth recording:** the console showed
`ReferenceError: ReducedMotionProvider is not defined` from DashboardLayout —
stale HMR from the moment between swapping the JSX and adding the import. Not
assumed away: re-checked with a fresh load and an attached error counter across
five routes (0 errors), and it could not survive a build that typechecks.

**Remaining concerns**
- Component/routing behaviour still untested at runtime (needs jsdom +
  Testing Library); the new tests cover the logic, not the rendering.
- `prerender-entry.tsx` keeps `MotionConfig reducedMotion="user"` directly.
  Correct as-is — the prerender has no window and the client re-renders via
  `createRoot` rather than hydrating, so no mismatch is possible.
- Netlify GitHub auto-deploy still broken; manual CLI deploy remains the path.

**Next likely focus:** the `AuthContext` / `useAuth` split (the last lint
warning) — still to be re-audited against whatever the next inspection finds,
not assumed.

---

## 2026-08-11 — cycle 6

**Inspected:** git state, 21 tests, tsc, lint, build + prerender; all seven
authenticated dashboard routes plus the catch-all, each checked for render,
`h1`, `document.title` and error boundary; prerendered vs client-rendered 404.

**Found**

| Pri | Finding | Action |
|---|---|---|
| **P1** | **404 page never set `document.title`.** A direct hit on a bad URL is fine (prerendered `404.html` carries the title), but an in-app link to a dead route left the *previous* page's title — the tab said "Account · Tactiq" while the page said "Page not found". It was the only page in the app with no title effect | Fixed |
| — | All 7 dashboard routes render with correct `h1` and title, no error boundary, no blank states | Correct, no action |
| — | `react-refresh` lint warning on AuthContext (last cycle's planned focus) | **Deliberately skipped** — a real accessibility defect outranks a dev-experience warning |

Screen readers announce the document title on navigation, so a stale title
tells a blind user they are somewhere they are not — WCAG 2.4.2 (Level A), and
the cost lands on exactly the users Tactiq exists for. That is why this was
treated as P1 rather than polish.

**Changed:** `NotFoundPage.tsx` sets the title on mount from an exported
`NOT_FOUND_TITLE`, kept identical to the `/404` entry in `prerender.mjs`; plus
a 4-test suite pinning that the two declarations agree.

**Verified:** 21/21 tests · **mutation-tested** — changing the prerender title
alone fails the match test, restoring it passes · tsc 0 errors · eslint 0
errors · build + 16 prerendered routes · prerendered `404.html` title unchanged
· in-browser: SPA-navigating from `/dashboard/account` to a dead route now
flips the title to "Page not found · Tactiq" alongside the matching `h1`.

**Deployed to Netlify** — first user-visible change since the cadence began.

**A mistake worth recording:** the first version of the test used `node:fs`,
which broke `tsc` and therefore the whole build (`npm run build` runs `tsc`
first). The tsconfig is browser-scoped *on purpose* so node globals cannot
leak into browser code. Rewrote the test to read both files through Vite's
`?raw` imports, which the existing `vite/client` types already cover — no new
dependency, isolation intact. Caught by the verification step, not by luck.

**Remaining concerns**
- Component/routing behaviour still untested at runtime; this cycle's test is
  source-level, which pins the invariant but not the mount behaviour.
- The `react-refresh` warning on AuthContext remains.

**Next likely focus:** the AuthContext / `useAuth` split, now that no
user-facing defect is outstanding.

---

## 2026-08-11 — cycle 5

**Inspected:** git state, 17 tests, tsc, lint, build + prerender; live `/`,
`/project`, `/dashboard/simulator`; console; 375px mobile including the
resize/rotation path; keyboard operation of the interactive hand; focus and
reduced-motion CSS coverage.

**Found**

| Pri | Finding | Action |
|---|---|---|
| P2 | Dead CSS shipping to users — `.velorah-scope` (13 selectors) and `.jack-scope` (5), orphaned by **my own cycle-2 component deletion**, plus three unused `.animate-fade-rise*` helpers | Removed; showcase.css 308 → 200 lines |
| P2 | `components.tsx` header still described the file as "shared by the Jack '3D Creator' portfolio sections… scoped by `.jack-scope`" — wrong on both counts | Rewritten |
| — | Mobile overflow on `/dashboard/simulator` reported in cycle 4 (`sw 390 > cw 375`) | **Not a defect.** Cycle 4 measured immediately after a viewport resize, before reflow — the offenders were stale desktop-width boxes. A fresh 375px load gives `sw === cw === 375`, and so does the resize path once settled. Nothing changed |
| — | Hero `opacity: 0` after the CSS edit | **Not a regression.** The preview tab was hidden, so the `fade-rise` animation held its `from` state (`playState: running`, frames not advancing). A screenshot forced visibility and the hero rendered correctly |
| — | Keyboard on the hand: roving tabindex (exactly one tabbable), arrows move focus both ways, Enter arms the gate and fires a command (`Ring base → Previous recognised 91%`) | Correct, no action |
| — | Touch targets at 375px: bottom nav 5/5 ≥44px, hand points 8/8 ≥44px | Correct, no action |
| — | `:focus-visible` present globally (theme.css:213) and reduced-motion covers `.t-rise*` | Correct, no action |

**Changed:** 2 files, +8 / −115. CSS-only deletion of unreachable rules; no
component behaviour touched.

**Verified:** 17/17 tests · tsc 0 errors · eslint 0 errors · build + 16
prerendered routes · **`@keyframes fade-rise` deliberately preserved** — it is
defined in the deleted Velorah block but still drives the live `.t-rise`
entrance, so a wholesale line-range delete would have broken the homepage
hero; checked before cutting · `/` and `/project` screenshotted after the
change, both render correctly with the violet/stone identities intact.

**Not deployed.** Removes ~2 KB of unreachable CSS with no visual change;
rides along with the next feature deploy.

**Remaining concerns**
- Four "findings" across cycles 1–5 turned out to be preview-pane artifacts
  (stale HMR, collapsed viewport, throttled timers, pre-reflow resize). Any
  timing- or layout-sensitive reading from the browser pane needs a second
  measurement before it is believed.
- Component/routing tests still absent; pure logic only.

**Next likely focus:** the `react-refresh` lint warning on AuthContext — split
the `useAuth` hook into its own module so the file exports only components,
clearing the last warning and making Fast Refresh reliable in dev.

---

## 2026-08-11 — cycle 3

**Inspected:** git state, tsc, lint, build + prerender; live `/`, signed-out
`/dashboard/history`, `/login`, `/signup`; login form edge cases (empty submit,
malformed email, wrong credentials); **and — for the first time — the
authenticated dashboard end-to-end**, which had been an open gap since cycle 1.

`.env` is absent locally, so dev runs on the DEV-only localStorage auth
fallback. That made it safe to create a local test account and exercise the
real flows without any possibility of touching production Supabase.

**Found**

| Pri | Finding | Action |
|---|---|---|
| P2 | No test infrastructure — the contract asks for a regression test after every bug fix, and none could be written | Added Vitest + 17 tests |
| — | Simulator taps logged as `dropped` instead of `recognised` | **Not a defect.** The preview pane was backgrounded (`document.hidden`), so a requested 90 ms sleep actually took 475 ms and exceeded the 600 ms tap threshold. A genuinely brief tap (5 ms) gives `Next recognised 98%`. `TAP_MAX_MS` left alone |
| — | Auth: empty submit blocked, malformed email blocked, bad credentials → "Invalid email or password." with the button re-enabled and `role="alert"` | Correct, and it does not leak whether an account exists. No action |
| — | `next` round trip survives **signup** as well as login — signed-out `/dashboard/history` landed back on `/dashboard/history` after account creation | Verified, no action |
| — | History empty state, telemetry→timeline wiring, summary counts, heatmap ARIA labels, session replay | All correct. No action |
| — | Build warning: `model-viewer` chunk > 500 kB | Unchanged, still benign (opt-in + dynamic import) |

**Changed:** Vitest (dev dependency) with `npm test` / `npm run test:watch`,
and three suites — `announce` (4), `gestures` (8), `telemetry` (5).
`withVariation` moved from `LiveRegions.tsx` into `lib/announce.ts`, where it
belongs (announcement semantics, not rendering) and can be tested without
React. No production behaviour changed.

**Verified:** 17/17 tests pass · **mutation-tested** — reintroducing the
zero-width bug fails exactly 2 tests, restoring it makes them pass, so the
suite genuinely catches the cycle-1 regression · tsc 0 errors · eslint 0
errors · build + 16 prerendered routes OK · test files absent from `dist` ·
live regions verified in-browser: repeating one command changes the region
text (so it re-announces) while the spoken text stays identical · console
clean.

**Not deployed.** Dev tooling and a no-op refactor; rides along with the next
feature deploy.

**Remaining concerns**
- Tests cover pure logic only. Components, routing and the auth guard have no
  cover — that needs jsdom + Testing Library, a heavier call deferred until
  there is a component bug worth pinning.
- A local-only test account (`qa-local@example.test`) now exists in the preview
  browser's localStorage. Dev-only, never sent anywhere.

**Next likely focus:** a route-level guard test (signed-out `/dashboard/*`
preserves `next`) — the highest-value untested behaviour, and the one most
likely to break silently.

---

## 2026-08-11 — cycle 2

**Inspected:** git state, tsc, lint, production build + prerender, bundle
sizes, dependency graph, dead-code scan; live `/`, `/project`, `/login`,
signed-out `/dashboard/history`; console on every route; 375px mobile and
desktop widths; heading order on `/project`.

**Found**

| Pri | Finding | Action |
|---|---|---|
| P2 | ~870 lines of orphaned components — `RingScene.tsx` (243), `JackPortfolio.tsx` (522), `VelorahHero.tsx` (105), `figma/ImageWithFallback.tsx` (27). None imported anywhere | Deleted |
| P2 | `@react-three/fiber` + `@types/three` installed solely for the dead `RingScene` — 22 packages of nothing | Removed |
| P2 | `src/app/ring3d/` held only the 2D part list after `RingScene` went — a directory name that lies to the next reader | `ringParts.ts` moved to `src/app/components/` |
| P2 | `RingPage.tsx` header comment still described "interactive 3D ring… lazy-loaded… without WebGL" — untrue since the 2D swap | Rewritten |
| — | `hOverflow: true` on `/project` | **Not a defect.** The browser pane had collapsed (`clientWidth: 0`), so every element "overflowed" a zero-width viewport. Re-measured at a real 375px and 1280px: `scrollWidth === clientWidth`, no overflow |
| — | Vite HMR "Failed to reload" errors after the file move | **Not a defect.** Logged while the old import path was briefly unresolvable mid-edit. A fresh tab shows a clean console |
| — | Build warning: chunk > 500 kB (`model-viewer`, 1.0 MB) | Unchanged and still benign — opt-in button + dynamic `import()` |
| — | Auth boundary, console, heading order (1× h1, no skips), mobile | Verified clean, no action |

**Changed:** 10 files, +12 / −1202. No user-visible behaviour touched.

**Verified:** tsc 0 errors · eslint 0 errors (1 pre-existing informational
warning) · build + all 16 prerendered routes OK · `/project` assembly
re-exercised in the browser after the import move — slider drives the drawing,
list↔drawing selection sync works, live readout correct, no error boundary ·
fresh-tab console clean · `node_modules` 188 → 166 packages.

**Not deployed.** Dead-code and dependency hygiene with zero user-visible
change; rides along with the next feature deploy.

**Note for future cycles:** `three` stays a direct dependency on purpose — it
is `@google/model-viewer`'s *peer* dependency, so the app is correct to declare
it even though nothing in `src/` imports it. Do not "clean it up".

**Remaining concerns**
- Still no automated test infrastructure, so this cleanup has no regression net
  beyond tsc.
- `/dashboard/*` still unverified end-to-end (needs an account; signing up
  would write to the real Supabase).

**Next likely focus:** minimal Vitest setup covering pure logic
(`withVariation`, telemetry session grouping, `effectiveCommandFor`).

---

## 2026-08-10 — cycle 1

**Inspected:** repo state (clean, `main`), typecheck, lint, production build +
prerender, bundle sizes, `.gitignore` / committed-secret check, homepage and
`/project` render, browser console.

**Found**

| Pri | Finding | Action |
|---|---|---|
| P2 | `npm run lint` failing with 3 errors — the repo's own quality gate was unusable | Fixed |
| — | ESLint linting `dist-ssr` (generated prerender bundle); `ignores` listed only `dist` | Fixed |
| — | `LiveRegions.tsx` held literal U+200B characters → `no-irregular-whitespace` | Fixed |
| — | Console `HeroHandDemo is not defined` on `/` | Not a defect — stale dev-server module graph after the hero revert. Source, `dist`, and the live site are all clean; cleared by restarting Vite |
| — | Build warning: chunk > 500 kB (`model-viewer`, 1.0 MB) | Benign — behind an opt-in button and a dynamic `import()`; never loaded unless requested |
| — | No secrets tracked (`.env.example` only); no `service_role` key in client code | No action |
| — | Auth boundary: signed-out `/dashboard/*` → `/login?next=…` and returns after sign-in | Verified working, no action |

**Changed:** `eslint.config.js` (ignore `dist-ssr`), `src/app/components/LiveRegions.tsx`
(named `​` constant + documented `withVariation` helper; behaviour identical).

**Verified:** tsc 0 errors · eslint 0 errors (1 pre-existing informational
`react-refresh` warning on the AuthContext provider+hook export) · production
build and prerender OK · alternation logic re-checked (every repeated
announcement still produces a state change) · U+200B confirmed present in the
built `DashboardLayout` chunk · homepage and `/project` render with no error
boundary.

**Not deployed.** Tooling + no-op refactor with zero user-visible effect; it
rides along with the next feature deploy rather than spending a production
release on it.

**Remaining concerns**
- No automated test infrastructure (no Vitest/Playwright). Regression tests
  can't be added for fixes yet.
- The dashboard flows could not be exercised end-to-end this cycle: doing so
  needs an account, and signing up against a configured Supabase would write
  real data.

**Next likely focus:** add a minimal Vitest setup (no browser runner) so pure
logic — `withVariation`, telemetry session grouping, `effectiveCommandFor` —
gets regression cover, then backfill a test for the protected-route redirect.
