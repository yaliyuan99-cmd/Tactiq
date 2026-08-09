/**
 * Home — device state first, marketing copy never. A time-of-day greeting,
 * the honest device HUD, the ring as the room's centrepiece, your latest
 * recorded activity, and the two personal shortcuts at a glance.
 */
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Grip, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useDeviceSnapshot } from '../../services/device/useDevice';
import { listEvents, subscribeTelemetry } from '../../services/telemetry';
import { listGestureConfigs, isAdmin as checkIsAdmin } from '../../lib/api';
import type { GestureConfigRow } from '../../lib/database.types';
import { loadA11yPrefs } from '../../lib/a11yPrefs';
import {
  CONTACTS_BY_ID,
  DEFAULT_LAYOUT,
  PRODUCT,
  commandLabelFor,
  editableGesturePoints,
  shortcutNameFor,
} from '../../lib/gestures';
import { cn, formatTime } from '../../lib/utils';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'Up late';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function OverviewPage() {
  const { user } = useAuth();
  const device = useDeviceSnapshot();
  const events = useSyncExternalStore(subscribeTelemetry, listEvents);
  const [configs, setConfigs] = useState<GestureConfigRow[]>([]);
  const [admin, setAdmin] = useState(false);
  const prefs = useMemo(() => loadA11yPrefs(), []);

  useEffect(() => {
    document.title = 'Dashboard · Tactiq';
    let mounted = true;
    listGestureConfigs()
      .then((rows) => mounted && setConfigs(rows))
      .catch(() => {});
    checkIsAdmin()
      .then((a) => mounted && setAdmin(a))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const firstName = (user?.fullName || user?.email || 'there').split(' ')[0];
  const active = configs.find((c) => c.is_active);
  const layout = active ? { ...DEFAULT_LAYOUT, ...active.layout } : DEFAULT_LAYOUT;
  const connected = device.state === 'connected';
  const lastEvent = events[0] ?? null;
  const recent = events.slice(0, 3);

  return (
    <div className="max-w-4xl">
      <p className="font-mono-label text-muted-foreground mb-1">Your Tactiq</p>
      <h1 className="text-3xl mb-8">
        {greeting()}, {firstName}
      </h1>

      {/* Device HUD — one cohesive surface, not four cards. */}
      <div className="flex flex-wrap items-center border border-border rounded-lg divide-x divide-border text-sm overflow-x-auto mb-10">
        <span className="px-4 py-2.5 inline-flex items-center gap-2 whitespace-nowrap">
          <span
            aria-hidden
            className={cn(
              'w-2 h-2 rounded-full',
              connected ? 'bg-status-confirmed' : 'border-[1.5px] border-muted-foreground',
            )}
          />
          {connected
            ? 'Connected — simulated ring'
            : device.paired.length > 0
              ? 'Ring offline'
              : 'No ring paired yet'}
        </span>
        {connected && device.battery !== null && (
          <span className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">Battery {device.battery}%</span>
        )}
        <span className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">{PRODUCT.commands} commands</span>
        <span className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
          {prefs.handPreference === 'left' ? 'Left' : 'Right'} hand
        </span>
        {lastEvent && (
          <span className="px-4 py-2.5 text-muted-foreground whitespace-nowrap">
            Last interaction {formatTime(lastEvent.at).slice(0, 5)}
          </span>
        )}
        <span className="px-4 py-2.5 text-muted-foreground whitespace-nowrap font-mono-label">
          Prototype / simulation
        </span>
      </div>

      {/* The ring is the room's centrepiece. */}
      <section aria-labelledby="ring-h" className="grid sm:grid-cols-[minmax(0,220px)_1fr] gap-8 items-center mb-12">
        <Link to="/dashboard/ring" aria-hidden tabIndex={-1} className="block">
          <img
            src="/models/ring-poster.svg"
            alt=""
            className="w-full max-w-[220px] mx-auto transition-transform duration-300 hover:scale-[1.03]"
          />
        </Link>
        <div>
          <h2 id="ring-h" className="text-2xl mb-2">
            Everything happening on your hand
          </h2>
          <p className="text-muted-foreground max-w-[52ch] mb-5">
            Rotate the ring, pull it apart component by component, watch the sensors work,
            then try the commands — the dashboard is a digital twin of the hardware concept.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/dashboard/ring"
              className="inline-flex items-center gap-2 px-5 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
            >
              Open the ring
              <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link
              to="/dashboard/simulator"
              className="inline-flex items-center gap-2 px-5 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors active:scale-[0.98]"
            >
              <Grip className="w-4 h-4" aria-hidden />
              Simulator
            </Link>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
        {/* Latest activity */}
        <section aria-labelledby="recent-h">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 id="recent-h" className="text-lg font-semibold">
              Latest activity
            </h2>
            <Link to="/dashboard/history" className="text-sm text-primary-strong underline underline-offset-4 hover:no-underline">
              Full history
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-[0.95rem] text-muted-foreground">
              Nothing recorded yet — commands you fire in the simulator will land here.
            </p>
          ) : (
            <ol className="divide-y divide-border border-y border-border">
              {recent.map((event) => (
                <li key={event.id} className="py-2.5 flex items-baseline justify-between gap-3 text-[0.95rem]">
                  <span className="min-w-0 truncate">
                    <span className="font-medium">{event.command}</span>{' '}
                    <span className="text-muted-foreground">
                      — {CONTACTS_BY_ID[event.contactId].finger.toLowerCase()}{' '}
                      {CONTACTS_BY_ID[event.contactId].position.toLowerCase()}
                    </span>
                  </span>
                  <span className="font-mono-label text-muted-foreground shrink-0">
                    {formatTime(event.at).slice(0, 5)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>

        {/* Shortcuts at a glance */}
        <section aria-labelledby="short-h">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h2 id="short-h" className="text-lg font-semibold">
              Your shortcuts
            </h2>
            <Link to="/dashboard/commands" className="text-sm text-primary-strong underline underline-offset-4 hover:no-underline">
              Change
            </Link>
          </div>
          <ol className="divide-y divide-border border-y border-border">
            {editableGesturePoints.map((point) => (
              <li key={point.id} className="py-2.5 flex items-baseline justify-between gap-3 text-[0.95rem]">
                <span className="text-muted-foreground">
                  {shortcutNameFor(point.id)} · {point.finger.toLowerCase()} {point.position.toLowerCase()}
                </span>
                <span className="font-medium truncate">{commandLabelFor(layout, point.id)}</span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground mt-3 max-w-[44ch]">
            {active
              ? `Active layout: ${active.name}. The ${PRODUCT.fixedCommands} fixed commands never move.`
              : 'Factory defaults — save a layout to make them yours.'}
          </p>
        </section>
      </div>

      {admin && (
        <p className="mt-10 text-sm">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-primary-strong underline underline-offset-4 hover:no-underline">
            <ShieldCheck className="w-4 h-4" aria-hidden />
            Admin tools
          </Link>
        </p>
      )}
    </div>
  );
}
