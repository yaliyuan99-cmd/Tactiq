# Maintenance log

Inspect → diagnose → prioritise → improve → verify cycles, running every
2 hours. Newest first. Keep entries short.

A cycle that finds nothing and changes nothing is a successful cycle — record
it briefly rather than manufacturing work.

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
