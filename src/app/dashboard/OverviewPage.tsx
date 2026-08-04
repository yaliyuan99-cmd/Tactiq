/**
 * Dashboard overview — honest by default. A new account sees the truthful
 * no-device state: there is no ring to pair yet, and nothing here pretends
 * otherwise. Cards link to the things that actually work today.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Settings2, Bluetooth, History, Megaphone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { listGestureConfigs, isAdmin as checkIsAdmin } from '../../lib/api';
import type { GestureConfigRow } from '../../lib/database.types';
import { PRODUCT } from '../../lib/gestures';

export default function OverviewPage() {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<GestureConfigRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    document.title = 'Dashboard · Tactiq';
    let mounted = true;
    listGestureConfigs()
      .then((rows) => mounted && setConfigs(rows))
      .catch(() => {})
      .finally(() => mounted && setLoaded(true));
    checkIsAdmin()
      .then((a) => mounted && setAdmin(a))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const firstName = (user?.fullName || user?.email || 'there').split(' ')[0];
  const active = configs.find((c) => c.is_active);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-1">Hi, {firstName}</h1>
      <p className="text-muted-foreground mb-8">
        Your account is ready. Tactiq is still a research prototype, so there is no ring to
        pair yet — but you can explore the command layout, save a configuration for later,
        and follow prototype testing.
      </p>

      <div className="space-y-4">
        {/* Device state — the honest one */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <Bluetooth className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg mb-1">No ring paired</h2>
              <p className="text-[0.95rem] text-muted-foreground mb-3">
                Physical rings do not exist outside the bench yet. The device page explains
                what pairing will look like, using clearly labelled interface previews.
              </p>
              <Link to="/dashboard/device" className="text-[0.95rem] text-primary-strong underline underline-offset-4 hover:no-underline">
                About pairing and the prototype
              </Link>
            </div>
          </div>
        </section>

        {/* Command layout */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <Settings2 className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg mb-1">Command layout</h2>
              {!loaded ? (
                <p className="text-[0.95rem] text-muted-foreground mb-3">Loading your layouts…</p>
              ) : active ? (
                <p className="text-[0.95rem] text-muted-foreground mb-3">
                  Active layout: <span className="text-foreground font-medium">{active.name}</span> —{' '}
                  {PRODUCT.fixedCommands} fixed commands plus your two personal shortcuts.
                </p>
              ) : configs.length > 0 ? (
                <p className="text-[0.95rem] text-muted-foreground mb-3">
                  You have {configs.length} saved layout{configs.length === 1 ? '' : 's'}; none is set active yet.
                </p>
              ) : (
                <p className="text-[0.95rem] text-muted-foreground mb-3">
                  No saved layout yet. The {PRODUCT.fixedCommands} fixed commands never move;
                  choose what your two personal shortcuts should do.
                </p>
              )}
              <Link to="/dashboard/commands" className="text-[0.95rem] text-primary-strong underline underline-offset-4 hover:no-underline">
                Open the command layout editor
              </Link>
            </div>
          </div>
        </section>

        {/* Command history */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <History className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg mb-1">Command history</h2>
              <p className="text-[0.95rem] text-muted-foreground mb-3">
                Once a ring exists, recognised commands appear here. For now the page shows
                clearly labelled sample data so you can see how it will read.
              </p>
              <Link to="/dashboard/history" className="text-[0.95rem] text-primary-strong underline underline-offset-4 hover:no-underline">
                View sample command history
              </Link>
            </div>
          </div>
        </section>

        {/* Research participation */}
        <section className="border border-border rounded-lg p-5">
          <div className="flex items-start gap-4">
            <Megaphone className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
            <div className="flex-1 min-w-0">
              <h2 className="text-lg mb-1">Project status</h2>
              <p className="text-[0.95rem] text-muted-foreground mb-3">
                We are currently building the bench prototype. Bench testing runs
                August–October 2026, with the AUSSEF submission due 11 November 2026.
              </p>
              <Link to="/status" className="text-[0.95rem] text-primary-strong underline underline-offset-4 hover:no-underline">
                See the full project timeline
              </Link>
            </div>
          </div>
        </section>

        {admin && (
          <section className="border border-border rounded-lg p-5">
            <div className="flex items-start gap-4">
              <ShieldCheck className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" aria-hidden />
              <div className="flex-1 min-w-0">
                <h2 className="text-lg mb-1">Administration</h2>
                <p className="text-[0.95rem] text-muted-foreground mb-3">
                  Project-follower list and research sign-ups.
                </p>
                <Link to="/admin" className="text-[0.95rem] text-primary-strong underline underline-offset-4 hover:no-underline">
                  Open the admin tools
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
