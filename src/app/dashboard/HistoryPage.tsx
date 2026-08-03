/**
 * Command history — sample data, and it says so. No fake live ticker, no
 * streaks, no scores: a plain reverse-chronological list of the kind of
 * events a real ring will produce, filterable by contact point.
 */
import { useEffect, useMemo, useState } from 'react';
import { History } from 'lucide-react';
import { gesturePoints, commandLabelFor, DEFAULT_LAYOUT } from '../../lib/gestures';

interface SampleEvent {
  point: string;
  command: string;
  minutesAgo: number;
  ok: boolean;
}

/** Deterministic sample history built from the real command configuration. */
const SAMPLE: SampleEvent[] = [
  { point: 'index-tip', command: 'Confirm', minutesAgo: 4, ok: true },
  { point: 'middle-base', command: 'Next', minutesAgo: 9, ok: true },
  { point: 'middle-base', command: 'Next', minutesAgo: 9, ok: true },
  { point: 'ring-tip', command: 'Read / Repeat', minutesAgo: 12, ok: true },
  { point: 'index-base', command: 'Dismiss / Back', minutesAgo: 21, ok: true },
  { point: 'pinky-base', command: `Shortcut 1 — ${commandLabelFor(DEFAULT_LAYOUT, 'pinky-base')}`, minutesAgo: 34, ok: true },
  { point: 'middle-tip', command: 'Undo', minutesAgo: 35, ok: true },
  { point: 'ring-base', command: 'Previous', minutesAgo: 58, ok: true },
  { point: 'index-tip', command: 'Confirm', minutesAgo: 61, ok: false },
  { point: 'pinky-tip', command: `Shortcut 2 — ${commandLabelFor(DEFAULT_LAYOUT, 'pinky-tip')}`, minutesAgo: 75, ok: true },
];

function pointName(id: string): string {
  const p = gesturePoints.find((g) => g.id === id);
  return p ? `${p.finger} ${p.position.toLowerCase()}` : id;
}

function rel(mins: number): string {
  if (mins < 60) return `${mins} min ago`;
  return `${Math.round(mins / 60)} h ago`;
}

export default function HistoryPage() {
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    document.title = 'Command history · Tactiq';
  }, []);

  const events = useMemo(
    () => (filter === 'all' ? SAMPLE : SAMPLE.filter((e) => e.point === filter)),
    [filter],
  );

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl mb-1">Command history</h1>
      <p className="text-muted-foreground mb-4 max-w-[60ch]">
        Recognised commands will appear here once a ring exists to recognise them.
      </p>
      <p className="font-mono-label text-status-target mb-8">
        Sample data — every entry below is an example, not a recorded event.
      </p>

      <div className="mb-6">
        <label htmlFor="hist-filter" className="block font-medium mb-1.5 text-[0.95rem]">
          Filter by contact point
        </label>
        <select
          id="hist-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="h-11 px-3 rounded-md border border-input bg-input-background max-w-xs w-full"
        >
          <option value="all">All contact points</option>
          {gesturePoints.map((p) => (
            <option key={p.id} value={p.id}>
              {p.finger} {p.position.toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      {events.length === 0 ? (
        <div className="border border-border rounded-lg p-8 text-center">
          <History className="w-6 h-6 text-muted-foreground mx-auto mb-3" aria-hidden />
          <p className="text-muted-foreground">No sample events for this contact point.</p>
        </div>
      ) : (
        <ol className="divide-y divide-border border-y border-border">
          {events.map((e, i) => (
            <li key={i} className="py-3.5 flex items-baseline justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.95rem]">
                  <span className="text-muted-foreground">{pointName(e.point)}</span>
                  <span aria-hidden className="text-muted-foreground/60"> → </span>
                  <span className="font-medium">{e.command}</span>
                  {!e.ok && (
                    <span className="ml-2 font-mono-label text-destructive">rejected — below confidence threshold</span>
                  )}
                </p>
              </div>
              <span className="font-mono-label text-muted-foreground shrink-0">{rel(e.minutesAgo)}</span>
            </li>
          ))}
        </ol>
      )}

      <p className="text-sm text-muted-foreground mt-6 max-w-[60ch]">
        There are deliberately no goals, streaks or scores here — command use is not a
        performance to optimise.
      </p>
    </div>
  );
}
