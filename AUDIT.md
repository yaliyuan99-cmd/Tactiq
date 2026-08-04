# Tactiq website audit — 4 Aug 2026

Audited against the deployed site (commit `1c68ee6` live; `ba0224c` queued on
Netlify) plus full codebase inspection. Verified directly: route probes, axe
runs on `/`, `/project` and dashboard-era pages (0 violations each), 320px
overflow checks, live JS bundle fingerprinting, RLS migration review, legal-page
content review. NOT verified (needs manual testing): screen readers (VoiceOver/
NVDA/TalkBack), forced-colour mode, live Supabase policy state, Netlify
dashboard settings, end-to-end sign-up with email verification.

## Scores

| Area | /10 | Why |
| --- | --- | --- |
| Product clarity | 8 | /project passes the 15-second test; cinematic front door adds one hop but "Learn more" resolves it |
| Visual design | 8 | Distinctive tactile system (stone/graphite/orange, Lora/Hanken); showcase page is a second identity by design |
| Credibility | 6 | Public pages are exemplary post-PLAN.md; privacy, terms and /checkout actively contradict them |
| Accessibility | 7 | 0 axe violations on all checked pages, real keyboard hand-map; zero screen-reader testing done; showcase lacks a skip link |
| Mobile usability | 8 | No overflow at 320px on checked pages; dashboard at 320px unverified |
| Research honesty | 7 | Claims ledger + evidence labels are best-in-class; legal pages undermine them |
| Navigation | 7 | aria-current header with clean IA; showcase has its own minimal nav; deploy lag serves stale nav |
| Account experience | 6 | Honest no-device dashboard exists; sign-up E2E unverified, "continue to checkout" remnant, no account deletion |
| Technical consistency | 7 | Single product-config file is real; dead fitness code, orphaned checkout, stray terminology |

## P0 — fix immediately

### P0-1 Privacy policy describes a product that does not exist
- Route: `/privacy` (`src/app/legal/PrivacyPage.tsx`)
- Evidence: "Tactiq is a wearable device…", "data that flows between your ring, your phone", "sensor readings from your ring", "app version, crash reports", "personalise your gestures, themes", "encrypted representation of your password".
- Why: directly contradicts "no ring has been built yet"; misstates data collection; the single worst credibility hole for judges.
- Change: rewrite with two sections — data currently collected (name, email, profile, saved demo layouts, update preferences) vs data that MAY be collected in future (device identifiers, command events, calibration), explicitly labelled future. Name Supabase as auth/data provider, Netlify as host; say passwords are hashed and managed by the provider, never stored by Tactiq; state deletion/export via hello@tactiq.app; note Australian context and that no analytics cookies run (verify). Add "flagged for professional legal review".
- Accept: no sentence implies existing hardware, app, sensor collection or sync; current vs future clearly split. Effort: M. Affects: credibility.

### P0-2 Terms of service sell products that cannot be bought
- Route: `/terms` (`src/app/legal/TermsPage.tsx` §4 and licence clause)
- Evidence: "Prices for devices and any subscription features are shown at checkout. Taxes and shipping may apply…", "licence to use the app and device".
- Change: delete purchases/subscriptions; cover website use, accounts, saved demo layouts, acceptable use, IP, prototype disclaimers, termination, student-project-appropriate liability, governing law "New South Wales, Australia" (verify). Flag for legal review.
- Accept: no commerce language anywhere in terms. Effort: S–M. Affects: credibility.

### P0-3 /checkout still exists and sign-up still routes to it
- Routes: `/checkout`, `src/app/auth/SignUpPage.tsx` ("Sign up & continue to checkout", `intent=buy` flow)
- Why: a reachable "reservation/order" surface contradicts "no reservations or pre-orders"; PLAN.md regime forbids it.
- Change: remove the route (redirect `/checkout` → `/project#follow`), delete PLANS/buy-intent copy in SignUpPage, drop the orders card path from any account UI, remove `Purchases` remnants in api usage where user-visible.
- Accept: no URL on the site produces an order/reservation UI; sign-up always lands on `/dashboard`. Effort: M. Affects: credibility, conversion.

### P0-4 Netlify deploy pipeline lags hours behind pushes
- Evidence: two pushes on 3 Aug went live only overnight; `ba0224c` (pushed 4 Aug am) still not live while `1c68ee6` serves.
- Change: open Netlify → Deploys; confirm builds run per-push and auto-publish is on; check build minutes quota; consider enabling deploy notifications. If builds queue on the free tier, accept latency but document it.
- Accept: a push is live within ~10 minutes, or the cause is documented. Effort: S (dashboard access required — cannot be done from this machine). Affects: everything downstream.

### P0-5 Command arithmetic is ambiguous across pages
- Routes: `/project` hero ("9 commands / 8 contact points"), HandMap legend ("Fixed command (7) · Personal shortcut (2) · Emergency"), FAQ, dashboard pages.
- Evidence: copy alternates between "nine commands" and "seven fixed + two shortcuts + an emergency hold", which reads as ten actions.
- Canonical (per PLAN.md line 94, "Nine commands on eight points"): eight physical contact points; nine commands = seven fixed + two personal shortcuts; Emergency is a sustained-hold activation variation on one shared point, not an extra point and not a tenth command; emergency behaviour is design intent, not an implemented calling/messaging feature.
- Change: add one canonical sentence to `PRODUCT` in `src/lib/gestures.ts` and reuse it verbatim in hero, HandMap intro, FAQ and dashboard; sweep for stray "nine fixed commands" phrasing.
- Accept: grep finds one consistent formulation; no page calls all nine "fixed". Effort: S. Affects: credibility, clarity.

## P1 — fix next

- **P1-1 Showcase page copy violations** (`/` after `ba0224c`): "NEXT-GEN WEARABLE CONTROL" badge is on the project's own banned list; "Get early access" implies availability. Change to "Student research prototype" and "Follow the project". Accept: banned-phrase grep clean. S. Credibility.
- **P1-2 Showcase lacks skip link + shared header**: verified `skipLink: false` on `/`. Add the SkipLink and a route into the main site nav. Accept: skip link focusable first on `/`. S. Accessibility.
- **P1-3 Auth E2E verification**: Supabase IS configured in the live bundle (verified), but nobody has proven: sign-up → email verification → `/dashboard` redirect → password reset → sign-out → expired-session message. Run the full pass on production; fix what breaks. Accept: documented pass. M. Account.
- **P1-4 Unique titles for auth pages**: login/signup/forgot/reset share the site-wide title. Set `document.title` per page. Accept: unique titles everywhere. S. SEO/a11y.
- **P1-5 Admin allowlist in public bundle**: `VITE_ADMIN_EMAILS` bakes admin emails into shipped JS (client gate only; RLS policies in `0003_admin_console.sql` are the real gate). Remove the env allowlist path in production; rely on `profiles.is_admin` + RLS; verify policies are applied on the live project. Accept: no admin emails in bundle; non-admin API reads of waitlist fail server-side. M. Security.
- **P1-6 Hero demonstration incomplete vs spec**: `/project` hero has staggered entrance + point pop-ins, but not the squeeze→thumb-path→highlight→label→single-pulse choreography with a "Replay demonstration" button. Build it (2–3s, no loop, reduced-motion = final frame). M. Clarity.
- **P1-7 Dashboard 320px + keyboard pass**: dashboard pages were never run through the 320px/keyboard/axe battery. Run and fix. Accept: no overflow, all controls reachable, axe clean. M. Accessibility.
- **P1-8 Account page gaps**: verify `AccountSettingsPage` includes password change, involvement question with "why we ask", export-my-data (JSON) and account deletion (or honest "email us to delete"). Add what's missing. M. Account.
- **P1-9 Old terminology stragglers**: sweep for "gesture layouts", "keys", "wearable device" outside the archive (`grep -ri "gesture layout\|your keyboard"`). S. Consistency.
- **P1-10 `/showcase` and section-route canonicals**: after `ba0224c`, `/showcase` 301s to `/` (good). Section pages duplicate `/project` sections — add `<link rel="canonical">` pointing dupes at `/project` (or accept duplication consciously). S. SEO.

## P2 — polish later

- robots.txt + sitemap.xml (404 today; the static `site/` folder has them — port to `public/`). S.
- og:image (1200×630) — none exists; `twitter:card` correctly `summary` until one is made. S.
- Delete dead code: `src/app/account/{AccountPage,DeviceDashboard,GestureActivity}.tsx` (contains heart-rate/steps code — unreferenced, verified) and unused `GestureType` members. S.
- Consolidate design history at `/archive`: evolution section currently renders on both `/project` and `/prototype`. Make `/archive` the full interactive v1 home; keep a short preview on `/project`. M.
- Self-host fonts or add `preconnect`+`font-display: swap` audit; Google-CSS import is render-coupled. S–M.
- Empty-state for FollowForm offline failure retry; button press-down micro-interaction (1–2px) per spec. S.
- Storybook-less component inventory doc for the friend's sessions. S.

## Do not build yet

- Real pairing UI beyond the current honest Web-Bluetooth attempt (device found/ syncing/update-required states need firmware truth).
- Battery, firmware, calibration panels with real values.
- Command-history ingestion, latency display, live announcements.
- Prototype-testing recruitment forms collecting disability details (needs ethics process + privacy rework first).
- Any emergency-action integration (calls/messages/location).

## Top 10 in order

1. P0-1 privacy rewrite → 2. P0-2 terms rewrite → 3. P0-3 checkout removal →
4. P0-5 command canonical sentence → 5. P0-4 Netlify pipeline check (user) →
6. P1-1/P1-2 showcase copy + skip link → 7. P1-3 auth E2E → 8. P1-5 admin
gating → 9. P1-7 dashboard a11y battery → 10. P1-6 hero demonstration.

## Two-week plan

- Days 1–2: P0-1, P0-2, P0-3, P0-5 (ship together; one deploy). DoD: banned-claims grep clean including legal pages.
- Day 3: P0-4 + P1-3 with the user (dashboard + real email loop). DoD: documented E2E pass.
- Days 4–5: P1-1, P1-2, P1-4, P1-9, P1-10. DoD: axe + titles + copy sweep clean.
- Days 6–8: P1-5 (verify RLS live, remove allowlist), P1-8. DoD: non-admin cannot read waitlist via API; account page complete.
- Days 9–10: P1-6 hero demo + P1-7 dashboard battery. DoD: replay button, reduced-motion static, dashboard 320px clean.
- Days 11–14: P2 batch (SEO files, dead code, archive consolidation) + manual screen-reader testing checklist below.

## Before competition submission
P0 all; P1-1..P1-5; screen-reader smoke test (VoiceOver+Safari at minimum) with notes; accessibility statement updated to reflect what was ACTUALLY tested.

## Before involving blind or low-vision participants
All of the above, plus: NVDA + TalkBack passes; command map + list alternative verified with each; recruitment/consent process reviewed by AUSSEF mentor; privacy policy updated for participant data; spoken-confirmation settings honest.

## Before real hardware integration
Device page truth states wired to firmware capabilities; command-history schema; calibration flow; settings sync labels flipped from "not yet available" only when sync exists.

## Questions requiring your answer (do not let sessions guess)
1. Is Emergency inside the nine commands (recommended: yes — hold-variant of a shared point) — confirm PLAN.md line 94 as final.
2. What exactly may each personal shortcut trigger on a real phone (Shortcuts app? BLE HID? accessibility API)? Current library is aspirational.
3. What does an account provide today, in one sentence, for the signup page?
4. Are Netlify build minutes/queue the deploy bottleneck? (Dashboard check.)
5. Which Supabase project is live, and are migrations 0001–0003 applied to it?
6. Has ANY screen-reader testing been done? (Statement currently says planned — keep it honest.)
7. Which prototype components are physically purchased vs planned? (Prototype page says "under $60 in parts" as confirmed — verify against reality.)
8. Does hello@tactiq.app exist and receive mail?
9. Do you intend to collect command-history data at all? If not, remove the future-collection clause from the rewritten privacy policy.
