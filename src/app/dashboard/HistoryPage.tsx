/**
 * Activity — "what has my ring been doing?"
 *
 * Every entry is a real recorded interaction from this user's simulator,
 * training, and mock-ring sessions in this browser (see services/telemetry).
 * Nothing is invented; an unused account sees an honest empty state, and the
 * data-source line says exactly what the numbers are.
 *
 * The digital-twin rule runs through the page: the hand heatmap IS the
 * usage chart and doubles as a filter; every timeline event can flash its
 * origin on the hand; sessions replay on the hand step by step.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Search, Trash2, Play, Grip } from 'lucide-react';
import HandHeatmap, { type HeatByContact } from '../components/HandHeatmap';
import SessionReplay from '../components/SessionReplay';
import { HandIllustration } from '../components/SimHand';
import {
  listEvents,
  listSessions,
  subscribeTelemetry,
  clearEvents,
  type ActivityEvent,
} from '../../services/telemetry';
import { CONTACTS_BY_ID, type ContactId } from '../../lib/gestures';
import { loadA11yPrefs } from '../../lib/a11yPrefs';
import { cn, formatTime } from '../../lib/utils';

type Range = 'today' | '7d' | '30d' | 'all';
type Kind = 'all' | 'fixed' | 'shortcut' | 'emergency';

const RANGES: { id: Range; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7 days' },
  { id: '30d', label: '30 days' },
  { id: 'all', label: 'All' },
];

const KINDS: { id: Kind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'fixed', label: 'Fixed' },
  { id: 'shortcut', label: 'Shortcuts' },
  { id: 'emergency', label: 'Emergency' },
];

const KIND_DOT: Record<string, string> = {
  fixed: 'bg-foreground',
  shortcut: 'bg-primary',
  emergency: 'bg-destructive',
};

function startOfRange(range: Range): number {
  const now = new Date();
  if (range === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (range === '7d') return now.getTime() - 7 * 86400000;
  if (range === '30d') return now.getTime() - 30 * 86400000;
  return 0;
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (d.getTime() >= startToday) return 'Today';
  if (d.getTime() >= startToday - 86400000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
}

function pointName(id: ContactId): string {
  const p = CONTACTS_BY_ID[id];
  return p ? `${p.finger} ${p.position.toLowerCase()}` : id;
}

/** Segmented pill control — compact, keyboard friendly, no giant dropdowns. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex rounded-md border border-border p-0.5 bg-secondary/50">
      {options.map((option) => (
        <button
          key={option.id}
          aria-pressed={value === option.id}
          onClick={() => onChange(option.id)}
          className={cn(
            'h-10 px-3.5 rounded-[5px] text-sm font-medium transition-colors active:scale-[0.98]',
            value === option.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function HistoryPage() {
  const events = useSyncExternalStore(subscribeTelemetry, listEvents);
  const prefs = useMemo(() => loadA11yPrefs(), []);

  const [range, setRange] = useState<Range>('all');
  const [kind, setKind] = useState<Kind>('all');
  const [contact, setContact] = useState<ContactId | null>(null);
  const [query, setQuery] = useState('');
  const [flashId, setFlashId] = useState<ContactId | null>(null);
  const [replayId, setReplayId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const heatmapRef = useRef<HTMLDivElement | null>(null);
  /** Events present at mount don't animate in; only live arrivals do. */
  const seenIds = useRef<Set<string> | null>(null);
  if (seenIds.current === null) seenIds.current = new Set(events.map((e) => e.id));

  useEffect(() => {
    document.title = 'Activity · Tactiq';
  }, []);

  const rangeEvents = useMemo(() => {
    const from = startOfRange(range);
    return events.filter((e) => new Date(e.at).getTime() >= from);
  }, [events, range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rangeEvents.filter((e) => {
      if (kind !== 'all' && e.kind !== kind) return false;
      if (contact && e.contactId !== contact) return false;
      if (q && !`${e.command} ${pointName(e.contactId)}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rangeEvents, kind, contact, query]);

  const heat: HeatByContact = useMemo(() => {
    const counts = new Map<ContactId, { count: number; command: string }>();
    for (const e of rangeEvents) {
      if (e.result === 'ignored') continue;
      const entry = counts.get(e.contactId);
      if (entry) entry.count += 1;
      else counts.set(e.contactId, { count: 1, command: e.command });
    }
    const total = [...counts.values()].reduce((a, b) => a + b.count, 0);
    const out: HeatByContact = {};
    counts.forEach((v, k) => {
      out[k] = { count: v.count, share: total ? v.count / total : 0, command: v.command };
    });
    return out;
  }, [rangeEvents]);

  const summary = useMemo(() => {
    const startToday = startOfRange('today');
    const today = events.filter((e) => new Date(e.at).getTime() >= startToday);
    const counts = new Map<string, number>();
    for (const e of rangeEvents) {
      if (e.result === 'ignored' || e.command === '—') continue;
      counts.set(e.command, (counts.get(e.command) ?? 0) + 1);
    }
    const most = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    return {
      today: today.length,
      most: most?.[0] ?? null,
      sessions: listSessions(rangeEvents).length,
      shortcuts: rangeEvents.filter((e) => e.kind === 'shortcut' && e.result !== 'ignored').length,
    };
  }, [events, rangeEvents]);

  const insights = useMemo(() => {
    if (rangeEvents.length < 5) return [];
    const list: string[] = [];
    if (summary.most) list.push(`${summary.most} is your most-used command in this period.`);
    const hours = new Map<number, number>();
    rangeEvents.forEach((e) => {
      const h = new Date(e.at).getHours();
      hours.set(h, (hours.get(h) ?? 0) + 1);
    });
    const busiest = [...hours.entries()].sort((a, b) => b[1] - a[1])[0];
    if (busiest) {
      const to = (busiest[0] + 1) % 24;
      list.push(`Most of your activity happened between ${busiest[0]}:00 and ${to}:00.`);
    }
    const misread = rangeEvents.filter((e) => e.result === 'misread').length;
    const taps = rangeEvents.filter((e) => e.result !== 'ignored').length;
    if (misread > 0 && taps > 0) {
      list.push(
        `${misread} of ${taps} taps were misread by the simulated classifier — within-finger confusion is the known failure mode the research targets.`,
      );
    }
    if (summary.shortcuts > 0) list.push(`You fired a personal shortcut ${summary.shortcuts} ${summary.shortcuts === 1 ? 'time' : 'times'}.`);
    return list.slice(0, 3);
  }, [rangeEvents, summary]);

  const sessions = useMemo(() => listSessions(rangeEvents).slice(0, 5), [rangeEvents]);
  const replaySession = sessions.find((s) => s.id === replayId) ?? null;

  const dayGroups = useMemo(() => {
    const groups: { label: string; events: ActivityEvent[] }[] = [];
    for (const event of filtered) {
      const label = dayLabel(event.at);
      const last = groups[groups.length - 1];
      if (last && last.label === label) last.events.push(event);
      else groups.push({ label, events: [event] });
    }
    return groups;
  }, [filtered]);

  const showOnHand = (id: ContactId) => {
    setFlashId(id);
    heatmapRef.current?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'center',
    });
    window.setTimeout(() => setFlashId(null), 900);
  };

  /* ---------------------------------------------------------------- empty */
  if (events.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl mb-1">Activity</h1>
        <p className="text-muted-foreground mb-10 max-w-[62ch]">
          See how your Tactiq interactions become phone commands.
        </p>
        <div className="text-center py-8">
          <div className="max-w-44 mx-auto opacity-50" aria-hidden>
            <HandIllustration />
          </div>
          <h2 className="text-2xl mt-6">No commands yet</h2>
          <p className="text-muted-foreground mt-2 max-w-[46ch] mx-auto">
            Your interactions will appear here as a timeline once you start using the
            simulator — every squeeze, tap, and command, connected back to the hand.
          </p>
          <Link
            to="/dashboard/simulator"
            className="inline-flex items-center gap-2 mt-6 px-5 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <Grip className="w-4 h-4" aria-hidden />
            Try the command simulator
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-1">
        <h1 className="text-3xl">Activity</h1>
        <label className="relative block w-full sm:w-64">
          <span className="sr-only">Search command history</span>
          <Search
            aria-hidden
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="Search command history…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-11 pl-9 pr-3 rounded-md border border-input bg-input-background text-[0.95rem] focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </label>
      </div>
      <p className="text-muted-foreground mb-2 max-w-[62ch]">
        See how your Tactiq interactions become phone commands.
      </p>
      <p className="font-mono-label text-status-simulation mb-8">
        Recorded from your simulator and training sessions in this browser — simulated
        interactions, not hardware measurements.
      </p>

      {/* Filters — compact segmented controls, no giant dropdowns. */}
      <div className="flex flex-wrap items-center gap-3 mb-8 overflow-x-auto">
        <Segmented label="Time range" options={RANGES} value={range} onChange={setRange} />
        <Segmented label="Command type" options={KINDS} value={kind} onChange={setKind} />
        {contact && (
          <button
            onClick={() => setContact(null)}
            className="h-10 px-3.5 rounded-md border border-primary bg-primary/10 text-sm font-medium text-primary-strong hover:bg-primary/15 transition-colors"
          >
            {pointName(contact)} ×
          </button>
        )}
      </div>

      {/* Summary — one cohesive strip, not four floating cards. */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 border border-border rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-border mb-10">
        {[
          { label: 'Commands today', value: String(summary.today) },
          { label: 'Most used', value: summary.most ?? '—' },
          { label: 'Sessions', value: String(summary.sessions) },
          { label: 'Shortcut uses', value: String(summary.shortcuts) },
        ].map((item) => (
          <div key={item.label} className="px-4 py-3.5 min-w-0">
            <dt className="font-mono-label text-muted-foreground">{item.label}</dt>
            <dd className="mt-0.5 text-lg font-semibold truncate" title={item.value}>
              {item.value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Hand heatmap — the usage chart IS the hand. */}
      <section aria-labelledby="heat-h" className="mb-12">
        <h2 id="heat-h" className="text-xl mb-1">
          Your most-used controls
        </h2>
        <p className="text-sm text-muted-foreground mb-5 max-w-[52ch]">
          Contact points grow with use. Select one to filter the timeline to that point.
        </p>
        <div className="grid sm:grid-cols-[minmax(0,300px)_1fr] gap-8 items-center">
          <div ref={heatmapRef}>
            <HandHeatmap
              heat={heat}
              selectedId={contact}
              onSelect={setContact}
              flashId={flashId}
              mirrored={prefs.handPreference === 'left'}
            />
          </div>
          <ol className="space-y-1.5 text-[0.95rem]">
            {Object.entries(heat)
              .sort((a, b) => (b[1]?.count ?? 0) - (a[1]?.count ?? 0))
              .slice(0, 5)
              .map(([id, entry]) => (
                <li key={id} className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-1.5">
                  <span>
                    <span className="text-muted-foreground">{pointName(id as ContactId)}</span>{' '}
                    <span className="font-medium">{entry!.command}</span>
                  </span>
                  <span className="font-mono-label text-muted-foreground shrink-0">
                    {entry!.count} · {Math.round(entry!.share * 100)}%
                  </span>
                </li>
              ))}
            {Object.keys(heat).length === 0 && (
              <li className="text-muted-foreground text-sm">No taps in this period.</li>
            )}
          </ol>
        </div>
      </section>

      {/* Sessions + replay */}
      {sessions.length > 0 && (
        <section aria-labelledby="replay-h" className="mb-12">
          <h2 id="replay-h" className="text-xl mb-4">
            Replay a session
          </h2>
          {replaySession ? (
            <SessionReplay
              session={replaySession}
              mirrored={prefs.handPreference === 'left'}
              onClose={() => setReplayId(null)}
            />
          ) : (
            <ul className="flex flex-wrap gap-2">
              {sessions.map((session) => (
                <li key={session.id}>
                  <button
                    onClick={() => setReplayId(session.id)}
                    className="inline-flex items-center gap-2 h-11 px-4 rounded-md border border-border hover:bg-secondary transition-colors text-sm active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5" aria-hidden />
                    {formatTime(session.startedAt)} · {session.events.length}{' '}
                    {session.events.length === 1 ? 'command' : 'commands'}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* Timeline */}
      <section aria-labelledby="timeline-h" className="mb-12">
        <div className="flex items-baseline justify-between gap-3 mb-4">
          <h2 id="timeline-h" className="text-xl">
            Timeline
          </h2>
          {confirmClear ? (
            <span className="flex items-center gap-2 text-sm">
              Delete all recorded activity?
              <button
                onClick={() => {
                  clearEvents();
                  setConfirmClear(false);
                }}
                className="h-9 px-3 rounded-md bg-destructive text-white font-medium hover:opacity-90"
              >
                Delete
              </button>
              <button onClick={() => setConfirmClear(false)} className="h-9 px-3 rounded-md border border-border hover:bg-secondary">
                Keep
              </button>
            </span>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden />
              Clear history
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground py-6">
            Nothing matches these filters. Widen the range or clear the search.
          </p>
        ) : (
          dayGroups.map((group) => (
            <div key={group.label} className="mb-8">
              <h3 className="font-mono-label text-muted-foreground uppercase mb-3">{group.label}</h3>
              <ol className="relative ml-1.5 border-l border-border pl-6 space-y-0">
                {group.events.map((event) => {
                  const isNew = !seenIds.current!.has(event.id);
                  if (isNew) seenIds.current!.add(event.id);
                  return (
                    <motion.li
                      key={event.id}
                      initial={isNew ? { opacity: 0, y: -8 } : false}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="relative py-2.5 group"
                    >
                      <span
                        aria-hidden
                        className={cn(
                          'absolute -left-[30.5px] top-[1.15rem] w-2.5 h-2.5 rounded-full ring-4 ring-background',
                          event.result === 'misread'
                            ? 'bg-status-target'
                            : event.result === 'ignored'
                              ? 'bg-muted-foreground/40'
                              : KIND_DOT[event.kind],
                        )}
                      />
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                        <span className="font-mono-label text-muted-foreground w-16 shrink-0">
                          {formatTime(event.at).slice(0, 5)}
                        </span>
                        <span className="font-medium">{event.command}</span>
                        <span className="text-sm text-muted-foreground">{pointName(event.contactId)}</span>
                        {event.result === 'misread' && (
                          <span className="font-mono-label text-status-target">misread</span>
                        )}
                        {event.result === 'ignored' && (
                          <span className="font-mono-label text-muted-foreground">gated — ring was idle</span>
                        )}
                        {event.result === 'emergency' && (
                          <span className="font-mono-label text-destructive">5 s hold</span>
                        )}
                        {event.confidence !== null && event.result !== 'ignored' && (
                          <span className="font-mono-label text-muted-foreground">
                            {Math.round(event.confidence * 100)}%
                          </span>
                        )}
                        <button
                          onClick={() => showOnHand(event.contactId)}
                          className="font-mono-label text-primary-strong opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity underline-offset-4 hover:underline"
                        >
                          Show on hand
                        </button>
                      </div>
                    </motion.li>
                  );
                })}
              </ol>
            </div>
          ))
        )}
      </section>

      {/* Insights — only what the data genuinely supports. */}
      {insights.length > 0 && (
        <section aria-labelledby="insights-h" className="border-t border-border pt-6">
          <h2 id="insights-h" className="text-xl mb-3">
            From this period
          </h2>
          <ul className="space-y-1.5 text-[0.95rem] text-muted-foreground max-w-[62ch]">
            {insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
