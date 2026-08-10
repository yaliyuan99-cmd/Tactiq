# Maintenance log

Inspect → diagnose → prioritise → improve → verify cycles, running every
2 hours. Newest first. Keep entries short.

A cycle that finds nothing and changes nothing is a successful cycle — record
it briefly rather than manufacturing work.

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
