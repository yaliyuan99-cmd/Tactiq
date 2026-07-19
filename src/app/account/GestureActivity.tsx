import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, Radio, Zap } from 'lucide-react';
import { COMMANDS_BY_ID } from '../../lib/gestures';

interface Props {
  seedKey: string;
}

// Curated (physical gesture → command id) pairs the rings recognise, weighted
// so common actions (media, volume) show up more than rare ones (SOS).
const GESTURE_EVENTS: { gesture: string; command: string; weight: number }[] = [
  { gesture: 'Double-tap thumb', command: 'media-playpause', weight: 6 },
  { gesture: 'Swipe index up', command: 'volume-up', weight: 5 },
  { gesture: 'Swipe index down', command: 'volume-down', weight: 4 },
  { gesture: 'Flick right', command: 'media-next', weight: 4 },
  { gesture: 'Flick left', command: 'media-prev', weight: 3 },
  { gesture: 'Two-finger tap', command: 'answer-call', weight: 3 },
  { gesture: 'Make a fist', command: 'end-call', weight: 2 },
  { gesture: 'Pinch & hold', command: 'open-assistant', weight: 3 },
  { gesture: 'Draw a circle', command: 'open-camera', weight: 2 },
  { gesture: 'Tap pinky', command: 'announce-time', weight: 3 },
  { gesture: 'Long-press palm', command: 'screen-reader', weight: 2 },
  { gesture: 'Swipe thumb across', command: 'switch-lang', weight: 2 },
  { gesture: 'Cup ear', command: 'read-last-message', weight: 3 },
  { gesture: 'Hold & speak', command: 'reply-voice', weight: 2 },
];

const TOTAL_WEIGHT = GESTURE_EVENTS.reduce((a, e) => a + e.weight, 0);

// Per-category accent so each event reads at a glance without a legend.
const CATEGORY_TONE: Record<string, string> = {
  Media: 'text-primary',
  Phone: 'text-chart-2',
  Messages: 'text-chart-2',
  Apps: 'text-chart-1',
  Safety: 'text-destructive',
  Accessibility: 'text-primary',
  Typing: 'text-muted-foreground',
  Keypad: 'text-muted-foreground',
};

interface LiveEvent {
  id: number;
  gesture: string;
  command: string;
  at: number;
}

/** Deterministic 0..1 from a string — stable "gestures today" base per user. */
function seed01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function pickEvent(): { gesture: string; command: string } {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const e of GESTURE_EVENTS) {
    r -= e.weight;
    if (r <= 0) return { gesture: e.gesture, command: e.command };
  }
  return GESTURE_EVENTS[0];
}

function relTime(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 3) return 'just now';
  if (s < 60) return `${s}s ago`;
  return `${Math.round(s / 60)}m ago`;
}

export default function GestureActivity({ seedKey }: Props) {
  const prefersReduced = useReducedMotion();

  // Stable per-user starting count so the figure looks lived-in, then it climbs
  // live as gestures stream in.
  const base = useMemo(() => 180 + Math.floor(seed01(seedKey) * 260), [seedKey]);
  const [today, setToday] = useState(base);
  const [events, setEvents] = useState<LiveEvent[]>(() => {
    // Prime the feed with three recent-looking events so it never ships empty
    // (headless renders freeze the stream interval).
    const now = Date.now();
    return Array.from({ length: 3 }, (_, i) => {
      const e = pickEvent();
      return { id: -1 - i, gesture: e.gesture, command: e.command, at: now - (i + 1) * 6000 };
    });
  });
  const [now, setNow] = useState(() => Date.now());
  const idRef = useRef(0);

  // Stream a new recognised gesture every couple of seconds.
  useEffect(() => {
    let timer: number;
    const schedule = () => {
      timer = window.setTimeout(
        () => {
          const e = pickEvent();
          const ev: LiveEvent = { id: idRef.current++, gesture: e.gesture, command: e.command, at: Date.now() };
          setEvents((prev) => [ev, ...prev].slice(0, 6));
          setToday((t) => t + 1);
          schedule();
        },
        2000 + Math.random() * 2400,
      );
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  // Re-tick relative timestamps once a second.
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="bg-card border border-border rounded-2xl p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">Gesture activity</h2>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-chart-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-chart-2 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-chart-2" />
          </span>
          <Radio className="w-3.5 h-3.5" /> Live
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-5">
        <motion.span
          key={today}
          initial={prefersReduced ? false : { scale: 1.25, color: 'var(--color-primary)' }}
          animate={{ scale: 1, color: 'var(--color-foreground)' }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="inline-block font-semibold text-foreground tabular-nums"
        >
          {today.toLocaleString()}
        </motion.span>{' '}
        gestures recognised today · ~12&thinsp;ms average latency
      </p>

      <ul className="space-y-1">
        <AnimatePresence initial={false}>
          {events.map((ev) => {
            const cmd = COMMANDS_BY_ID[ev.command];
            if (!cmd) return null;
            const Icon = cmd.icon;
            const tone = CATEGORY_TONE[cmd.category] ?? 'text-primary';
            return (
              <motion.li
                key={ev.id}
                layout
                initial={prefersReduced ? false : { opacity: 0, y: -14, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0, height: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-3 py-2.5">
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-secondary ${tone}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm">
                      <span className="text-muted-foreground">{ev.gesture}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
                      <span className="font-medium">{cmd.label}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cmd.category} · {relTime(ev.at, now)}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>

      <p className="mt-4 text-xs text-muted-foreground">
        Recognised on-device — raw motion never leaves your rings. Live stream is simulated for this
        preview; your companion app shows real recognitions here once your rings ship.
      </p>
    </section>
  );
}
