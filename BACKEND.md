# Tactiq Backend

The site is a Vite + React SPA. Its backend is **Supabase** (hosted Postgres +
Auth). Everything is wired so the app runs with a local fallback until you
connect a real project — then the same code talks to the database.

## Architecture

```
 React UI ──► src/lib/api.ts ──► src/lib/supabase.ts ──► Supabase (Postgres + Auth)
                  │                       │
                  │ (when keys are        └─ Row-Level Security enforces access
                  │  missing)
                  └─► localStorage fallback (dev only)
```

| File | Role |
| --- | --- |
| `src/lib/supabase.ts` | Creates the client from env vars; exposes `isSupabaseConfigured`. |
| `src/lib/api.ts` | The only module the UI calls: `joinWaitlist`, `signUp`/`signIn`/`signOut`, `getCurrentUser`, `onAuthChange`, `saveGestureConfig`/`listGestureConfigs`/`deleteGestureConfig`, `listWaitlist`, `getDeviceTelemetry`, `createOrder`/`listOrders`/`getLatestOrder`, `isAdmin`/`listAllOrders`, plus the admin console: `listAllUsers`/`getAdminStats`/`setUserBanned`/`setUserAdmin`/`updateOrderStatus`/`deleteOrder`/`deleteWaitlistEntry`/`exportUserData`/`eraseUserData`. |
| `src/lib/database.types.ts` | TypeScript types mirroring the SQL schema. |
| `src/lib/gestures.ts` | Shared gesture model: key map, colours, the command library, and the default layout. Used by both the hand demo and the customiser. |
| `supabase/migrations/0001_init.sql` | Tables + Row-Level-Security policies. |
| `supabase/migrations/0002_orders_and_admin.sql` | Adds `orders`, the `profiles.is_admin` flag, the `is_admin()` helper, and admin RLS policies. |
| `supabase/migrations/0003_admin_console.sql` | Adds soft-ban columns (`is_banned`/`banned_reason`/`banned_at`) and admin RLS to manage profiles, waitlist, orders, gesture configs. |

## Data model

- **`waitlist`** — public landing-page sign-ups. Anyone can *insert*; nobody can
  *read* it through the public API (read it in the dashboard). Emails are unique.
- **`profiles`** — one row per authenticated user, auto-created on signup via a
  trigger. Each user can only see/edit their own row.
- **`gesture_configs`** — saved 9-grid / shortcut layouts (`layout` is JSON).
  Each user has full CRUD over only their own rows.
- **`orders`** — pre-launch reservations (`plan`, `status`, `amount_cents`,
  `currency`). Each user can read/insert/update only their own rows; admins can
  read every row. **No payment is taken** — this records the reservation only.
- **`profiles.is_admin`** — per-account admin flag (added in `0002`). Admins can
  read the whole `waitlist` and all `orders` via RLS.
- **`profiles.is_banned` / `banned_reason` / `banned_at`** — soft-ban columns
  (added in `0003`). A ban makes the app *refuse service* (sign-in is rejected and
  the UI is gated); it does **not** disable the underlying Supabase Auth login —
  that needs the `service_role` Admin API on a server. `banned_at` is kept in sync
  by a trigger. `0003` also grants admins RLS to read/manage every `profiles`,
  `gesture_configs`, and `orders` row and to prune `waitlist` entries, which backs
  the admin console's user-management and privacy (export/erase) tooling.

## One-time setup (~5 minutes)

1. **Create a project** at <https://supabase.com> (free tier is fine). I can't do
   this step for you — it needs your account.
2. **Run the schema:** Dashboard → **SQL Editor** → New query → paste the entire
   contents of `supabase/migrations/0001_init.sql` → **Run**. Then repeat with
   `supabase/migrations/0002_orders_and_admin.sql` (orders + admin role) and
   `supabase/migrations/0003_admin_console.sql` (soft-ban columns + admin
   management/privacy RLS). Run them in order.
3. **Grab your keys:** Dashboard → **Project Settings → API**. Copy:
   - *Project URL*
   - *anon / public* key (safe for the browser — RLS is the real guard. Do **not**
     use the `service_role` key in the app.)
4. **Configure the app:**
   ```bash
   cp .env.example .env
   # then edit .env and paste your URL + anon key
   ```
5. **Restart** the dev server (`npm run dev`). On boot the console will no longer
   print the "Supabase is not configured" notice.

### (Optional) Email confirmation

By default Supabase emails a confirmation link on signup. For quick local testing
you can turn this off: Dashboard → **Authentication → Providers → Email** →
disable "Confirm email".

## Verifying it works

- **Waitlist:** submit the form on the site, then check Dashboard → **Table
  Editor → waitlist**. Re-submitting the same email is treated as success
  (duplicate-safe).
- **Auth / configs:** call the helpers in `src/lib/api.ts` from the UI once the
  account screens are built (see Next steps).

## App routes & auth UI (built)

The app now uses `react-router`. `src/app/App.tsx` is the router shell
(`BrowserRouter` + `AuthProvider`); the marketing site lives in
`src/app/LandingPage.tsx`.

| Route | Page | Notes |
| --- | --- | --- |
| `/` | `LandingPage` | Marketing site. Nav shows **Log in** or **Account** by auth state. |
| `/login` | `LoginPage` | Email + password; honours `?next=` redirect. |
| `/signup` | `SignUpPage` | Shows a "sign up, then buy" banner when `?intent=buy`. |
| `/forgot-password` | `ForgotPasswordPage` | Sends a reset link (direct link in dev mode). |
| `/reset-password` | `ResetPasswordPage` | Sets a new password. |
| `/account` | `AccountPage` | **Protected.** Device dashboard (telemetry), profile, security, your latest order, saved layouts, admin entry (admins only). |
| `/customize` | `CustomizePage` | **Protected.** Remap editable slots from the command library; save/load/delete named layouts. |
| `/admin` | `AdminPage` | **Protected + admin-gated.** Non-admins see an "admins only" screen. Admins get a tabbed console — Overview (stats), Users (ban/unban, grant/revoke admin, export, erase), Waitlist (table + CSV export + delete), Orders (status change + delete). |
| `/checkout` | `CheckoutPage` | Logged-out shoppers are bounced to `/signup?intent=buy`. "Reserve now" calls `createOrder` (no payment). |

**Device dashboard:** `src/app/account/DeviceDashboard.tsx` shows battery health,
device location (a privacy-friendly stylised map — no external tiles), heart rate
with a live sparkline, Bluetooth signal, storage, and activity. The data comes
from `getDeviceTelemetry(seedKey)` in `api.ts`, which **simulates** a believable,
gently-fluctuating snapshot seeded per user. There is no physical hardware; when
real rings ship this function is the single place to swap in live BLE data.

**Keyboard customiser:** `src/app/customize/CustomizePage.tsx` lets a user remap
the editable slots (thumb, pinky, palm) to any command in `COMMAND_LIBRARY`
(`src/lib/gestures.ts`), name the result, mark one active, and save it. Layouts
persist through `saveGestureConfig` → the `gesture_configs` table (or localStorage
in dev). The 9-grid letter keys and spacebar are intentionally fixed. The hand
demo and the account page both link here, and saved layouts are editable via
`/customize?id=<id>`.

**Admin console:** `/admin` is gated on `isAdmin()` — non-admins get an
"admins only" screen and the entry card is hidden on the account page. In a
configured Supabase project, admin status comes from `profiles.is_admin`, and the
admin RLS policies from `0002`/`0003` let admins read and manage every row through
the anon key (RLS does the gating). In local-fallback mode, the admin is whoever
is listed in `VITE_ADMIN_EMAILS`, or — if that's blank — the first account created
on the machine; data is read from `localStorage`.

The console is tabbed (`src/app/admin/AdminPage.tsx`):

- **Overview** — `getAdminStats()`: user/admin/banned counts, waitlist size, order
  count and total reserved value.
- **Users** — `listAllUsers()` lists every account with order/layout counts.
  Admins can **ban/unban** (`setUserBanned`), **grant/revoke admin**
  (`setUserAdmin`), **export** a user's data (`exportUserData` → JSON download),
  and **erase** a user's data (`eraseUserData`). Self-protection guards prevent
  banning/erasing your own account or revoking the last remaining admin.
- **Waitlist** — read the full table, export CSV, delete entries
  (`deleteWaitlistEntry`) for spam cleanup / right-to-be-forgotten.
- **Orders** — list every reservation (`listAllOrders`), change `status`
  (`updateOrderStatus`, e.g. `reserved`→`shipped`), or delete (`deleteOrder`).

**Ban semantics (important):** a ban is a **soft, application-level** ban. The app
refuses service — `signIn` rejects a banned account with the stored reason and the
UI is gated — but the underlying Supabase Auth login is **not** disabled. A hard
auth ban (or account deletion) requires the `service_role` Admin API
(`auth.admin.updateUserById` / `deleteUser`) and must run on a **server**, never in
this frontend. Likewise `eraseUserData` clears app rows (orders, layouts, profile)
but cannot remove the `auth.users` record from the browser.

**Granting admin (Supabase):** after signing up, run once in the SQL Editor:

```sql
update public.profiles set is_admin = true
where id = (select id from auth.users where email = 'you@example.com');
```

**Auth helpers** live in `src/app/auth/`: `AuthContext.tsx` (the `AuthProvider` +
`useAuth()` hook) and `AuthLayout.tsx` (shared form shell). `ProtectedRoute.tsx`
guards authenticated-only routes.

**Buy flow:** the pricing / "Reserve your pair" buttons call `handleBuy()` in
`LandingPage`. If signed in → `/checkout`; if not → `/signup?intent=buy&next=…`
so the user signs up first and is returned to checkout. "Reserve now" calls
`createOrder()`, which **persists** an `orders` row (status `reserved`) — but
takes **no payment**. The account page then shows the latest order, and admins
see all orders in `/admin`.

**Local dev without Supabase:** `src/lib/api.ts` now includes a localStorage auth
fallback (`tactiq_auth_users` / `tactiq_auth_session`), so sign-up, sign-in,
password reset, and the account page all work before you connect a real project.
This is dev-only — passwords are stored unhashed. Once Supabase keys are in
`.env`, the same calls hit real Auth + RLS instead.

## Next steps (not built yet)

- **Real device telemetry** — `getDeviceTelemetry` is simulated. When firmware
  exists, replace its body with live Bluetooth/companion-app data (same shape).
- **Real payments** — orders persist but no payment is taken. To accept real
  pre-orders, add a payment provider (e.g. Stripe Checkout) and move `status`
  from `reserved` → `paid` from a server-side webhook (never trust the client).
- **Hard auth bans / account deletion** — the console's ban and erase are
  app-level only (see "Ban semantics" above). For a real auth ban or full account
  deletion, add a server endpoint that calls the `service_role` Admin API
  (`auth.admin.updateUserById` / `deleteUser`) — never expose that key in the app.
- **Admin tooling** — the console covers user management, order status changes,
  CSV/JSON export, and privacy erase. A production version might add filtering,
  search, and pagination for large datasets.

## Security notes

- `.env` is git-ignored — never commit real keys.
- The anon key is meant to be public; security comes from the RLS policies in the
  migration, not from hiding the key.
- The `service_role` key bypasses RLS — keep it server-side only; it is never used
  in this frontend.
