/**
 * Try it — an interactive demonstration of the Tactiq interaction.
 *
 * The point of this section is not the sensing physics. It is to let a visitor
 * feel the shape of using the thing: you squeeze the ring, a short window
 * opens, you tap a point on your fingers, and your phone does something while
 * a screen reader tells you what happened.
 *
 * Three product ideas it has to get across, in order:
 *   1. It is gated. Tap without squeezing first and nothing happens — that is
 *      the answer to "what stops it firing in my pocket".
 *   2. The commands are where your fingers already are.
 *   3. The phone stays the phone. Tactiq drives the screen reader; it does not
 *      replace it.
 *
 * Honesty: this simulates the designed interaction. No ring exists, so the
 * phone panel is a mock and the announcements are what VoiceOver or TalkBack
 * would be asked to say — not a recording of it happening.
 *
 * Without JavaScript the whole thing still explains itself: the fallback below
 * is a plain walkthrough plus the full command table, always in the DOM.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Hand, Vibrate, Volume2 } from 'lucide-react';
import { gesturePoints, shortcutNameFor } from '../../lib/gestures';
import { shouldAnimate } from '../../lib/a11yPrefs';

// ---------------------------------------------------------------------------
// The phone the demo drives: a short message list, the most ordinary
// screen-reader task there is.
// ---------------------------------------------------------------------------

interface Message {
  from: string;
  preview: string;
  body: string;
  unread: boolean;
}

const INBOX: Message[] = [
  { from: 'Sam', preview: 'Running about ten minutes late', body: 'Running about ten minutes late — order without me if you want.', unread: true },
  { from: 'Mum', preview: 'Call me when you get a chance', body: 'Call me when you get a chance. Nothing urgent.', unread: true },
  { from: 'Priya', preview: 'Sent the notes through', body: 'Sent the notes through. Let me know if the second page is unclear.', unread: false },
  { from: 'Dentist', preview: 'Appointment confirmed for Thursday', body: 'Appointment confirmed for Thursday at 4:15pm.', unread: false },
];

/** The window a squeeze opens, in seconds. Shown as a bar, not a number. */
const WINDOW_SECONDS = 3;

type View = 'list' | 'message';

interface DemoState {
  view: View;
  index: number;
  playing: boolean;
}

const INITIAL: DemoState = { view: 'list', index: 0, playing: false };

export default function TryIt() {
  const [awake, setAwake] = useState(false);
  const [windowLeft, setWindowLeft] = useState(0);
  const [state, setState] = useState<DemoState>(INITIAL);
  const [history, setHistory] = useState<DemoState[]>([]);
  const [announcement, setAnnouncement] = useState(
    'Inbox. Four messages, two unread. Squeeze the ring to begin.',
  );
  const [haptic, setHaptic] = useState<string | null>(null);
  const [rejected, setRejected] = useState(false);
  const [holdId, setHoldId] = useState<string | null>(null);
  const holdTimer = useRef<number | null>(null);
  const holdStart = useRef<number>(0);

  const current = INBOX[state.index];

  // The command window closes on its own. This is the gate: it is why a
  // pocket-brush cannot fire a command.
  useEffect(() => {
    if (!awake) return;
    setWindowLeft(WINDOW_SECONDS);
    const started = Date.now();
    const id = window.setInterval(() => {
      const left = WINDOW_SECONDS - (Date.now() - started) / 1000;
      if (left <= 0) {
        setAwake(false);
        setWindowLeft(0);
        setAnnouncement((a) => `${a} Command window closed.`);
      } else {
        setWindowLeft(left);
      }
    }, 50);
    return () => window.clearInterval(id);
  }, [awake]);

  const pulse = useCallback((pattern: string) => {
    setHaptic(pattern);
    window.setTimeout(() => setHaptic(null), shouldAnimate() ? 700 : 1400);
  }, []);

  const squeeze = () => {
    setAwake(true);
    setRejected(false);
    pulse('One soft pulse — the window is open');
    setAnnouncement('Ready. Tap a contact point.');
  };

  const run = (pointId: string) => {
    // Gate first. Tapping while asleep is the interesting failure to show.
    if (!awake) {
      setRejected(true);
      window.setTimeout(() => setRejected(false), 1800);
      setAnnouncement('Nothing happened — the ring is idle. Squeeze it first.');
      return;
    }

    const point = gesturePoints.find((p) => p.id === pointId);
    if (!point) return;

    setHistory((h) => [...h, state]);
    setAwake(false);
    setWindowLeft(0);
    pulse(point.haptic.split(';')[0]);

    switch (pointId) {
      case 'index-tip': // Confirm
        if (state.view === 'list') {
          setState((s) => ({ ...s, view: 'message' }));
          setAnnouncement(`Opened. ${current.from}: ${current.body}`);
        } else {
          setAnnouncement(`Already open. ${current.from}: ${current.body}`);
        }
        break;
      case 'index-base': // Dismiss / Back
        if (state.view === 'message') {
          setState((s) => ({ ...s, view: 'list' }));
          setAnnouncement(`Back to inbox. ${INBOX[state.index].from}, ${state.index + 1} of ${INBOX.length}.`);
        } else {
          setAnnouncement('Inbox. Nothing to go back to.');
        }
        break;
      case 'middle-tip': { // Undo
        const previous = history[history.length - 1];
        if (previous) {
          setState(previous);
          setHistory((h) => h.slice(0, -1));
          setAnnouncement(`Undone. Back to ${previous.view === 'list' ? 'inbox' : 'the message'}.`);
        } else {
          setAnnouncement('Nothing to undo.');
        }
        break;
      }
      case 'middle-base': { // Next
        const next = Math.min(state.index + 1, INBOX.length - 1);
        setState((s) => ({ ...s, index: next, view: 'list' }));
        setAnnouncement(
          next === state.index
            ? 'End of list.'
            : `${INBOX[next].from}. ${INBOX[next].preview}. ${next + 1} of ${INBOX.length}.`,
        );
        break;
      }
      case 'ring-base': { // Previous
        const prev = Math.max(state.index - 1, 0);
        setState((s) => ({ ...s, index: prev, view: 'list' }));
        setAnnouncement(
          prev === state.index
            ? 'Start of list.'
            : `${INBOX[prev].from}. ${INBOX[prev].preview}. ${prev + 1} of ${INBOX.length}.`,
        );
        break;
      }
      case 'ring-tip': // Read / Repeat
        setAnnouncement(
          state.view === 'message'
            ? `${current.from}: ${current.body}`
            : `${current.from}. ${current.preview}. ${state.index + 1} of ${INBOX.length}.`,
        );
        break;
      case 'pinky-tip': // Shortcut 1
        setAnnouncement('Shortcut: the time is 4:22 pm.');
        break;
      case 'pinky-base': // Shortcut 2
        setState((s) => ({ ...s, playing: !s.playing }));
        setAnnouncement(state.playing ? 'Paused.' : 'Playing.');
        break;
    }
  };

  // Emergency: a sustained hold, never a tap count. Pointer and keyboard both.
  const startHold = (pointId: string) => {
    if (pointId !== 'pinky-tip') return;
    holdStart.current = Date.now();
    holdTimer.current = window.setInterval(() => {
      const held = (Date.now() - holdStart.current) / 1000;
      setHoldId(held > 0.4 ? `${Math.min(held, 5).toFixed(1)}` : null);
      if (held >= 5) {
        endHold();
        setAwake(false);
        pulse('Continuous strong pulse');
        setAnnouncement('Emergency activated. This is a demonstration — nothing has been contacted.');
      }
    }, 50);
  };

  const endHold = () => {
    if (holdTimer.current) window.clearInterval(holdTimer.current);
    holdTimer.current = null;
    setHoldId(null);
  };

  useEffect(() => () => endHold(), []);

  const reset = () => {
    setState(INITIAL);
    setHistory([]);
    setAwake(false);
    setAnnouncement('Inbox. Four messages, two unread. Squeeze the ring to begin.');
  };

  return (
    <section
      id="try-it"
      aria-labelledby="tryit-heading"
      className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <h2 id="tryit-heading" className="text-3xl sm:text-4xl mb-3">
          Try the interaction
        </h2>
        <p className="text-muted-foreground max-w-[46rem] mb-3">
          Squeeze the ring, then tap a point on the hand. The phone responds and the
          screen reader says what happened — the same loop, whether or not you are
          looking at the screen.
        </p>
        <p className="text-sm text-muted-foreground max-w-[46rem] mb-10">
          A working simulation of the interaction, driven by the same command configuration
          the rest of the site uses. The phone is a mock.
        </p>

        {/* ---- The demo. Interactive only with JS; the walkthrough below is not. ---- */}
        <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-8 lg:gap-12 items-start">
          {/* Hand + ring */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <button
                onClick={squeeze}
                className={`inline-flex items-center gap-2 h-12 px-5 rounded-md font-medium transition-colors ${
                  awake
                    ? 'bg-secondary text-foreground border border-border'
                    : 'bg-primary text-primary-foreground hover:opacity-90'
                }`}
              >
                <Hand className="w-4 h-4" aria-hidden />
                {awake ? 'Window open' : 'Squeeze the ring'}
              </button>
              <button
                onClick={reset}
                className="h-12 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
              >
                Start over
              </button>
            </div>

            {/* The command window, as a bar rather than a number. */}
            <div className="mb-5">
              <div
                className="h-1.5 rounded-full bg-secondary overflow-hidden"
                role="img"
                aria-label={
                  awake
                    ? 'Command window open. It closes on its own in about three seconds.'
                    : 'Ring idle. No command will be accepted until you squeeze.'
                }
              >
                <div
                  className="h-full bg-primary"
                  style={{
                    width: `${(windowLeft / WINDOW_SECONDS) * 100}%`,
                    transition: 'width 50ms linear',
                  }}
                />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {awake
                  ? 'Window open — tap a point.'
                  : 'Ring idle. It accepts nothing until you squeeze it.'}
              </p>
            </div>

            <div
              className={`relative max-w-md rounded-lg transition-shadow ${
                rejected ? 'outline outline-2 outline-offset-4 outline-destructive' : ''
              }`}
            >
              <svg viewBox="0 0 300 400" aria-hidden className="w-full h-auto text-foreground">
                <g fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2">
                  <rect x="112" y="325" width="96" height="72" rx="26" />
                  <rect x="80" y="198" width="162" height="148" rx="46" />
                  <rect x="92" y="100" width="33" height="148" rx="16.5" />
                  <rect x="134" y="80" width="33" height="168" rx="16.5" />
                  <rect x="176" y="100" width="33" height="148" rx="16.5" />
                  <rect x="214" y="130" width="31" height="120" rx="15.5" />
                  <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
                </g>
                {/* The ring itself, brightened while the window is open */}
                <g
                  stroke="var(--color-primary)"
                  strokeWidth={awake ? 7 : 5}
                  fill="none"
                  strokeOpacity={awake ? 1 : 0.55}
                >
                  <line x1="90" y1="196" x2="127" y2="196" />
                  <line x1="90" y1="206" x2="127" y2="206" />
                </g>
              </svg>

              {gesturePoints.map((point) => {
                const isShortcut = point.editable;
                return (
                  <button
                    key={point.id}
                    onClick={() => run(point.id)}
                    onPointerDown={() => startHold(point.id)}
                    onPointerUp={endHold}
                    onPointerLeave={endHold}
                    aria-label={`${point.finger} ${point.position.toLowerCase()} — ${
                      isShortcut ? shortcutNameFor(point.id) : point.description.split('—')[0].trim()
                    }${awake ? '' : '. Ring is idle; squeeze first.'}`}
                    style={{ position: 'absolute', left: point.x, top: point.y }}
                    className={`w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[0.62rem] font-semibold transition-all ${
                      isShortcut
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-foreground text-background'
                    } ${awake ? 'opacity-100 hover:scale-110' : 'opacity-45'}`}
                  >
                    {point.label}
                  </button>
                );
              })}
            </div>

            {holdId && (
              <p className="mt-3 text-sm font-mono-label text-destructive">
                Holding {holdId}s of 5 — emergency
              </p>
            )}

            <p className="mt-4 text-sm text-muted-foreground max-w-[34rem]">
              Emergency is a five-second hold on the pinky tip, never a tap count. Press and
              hold that point to feel why it cannot fire by accident.
            </p>
          </div>

          {/* Phone */}
          <div>
            <div className="mx-auto max-w-[19rem] rounded-[2rem] border-[6px] border-foreground/85 bg-card overflow-hidden shadow-lg">
              <div className="h-6 bg-foreground/85" aria-hidden />
              <div className="p-4 min-h-[22rem]">
                {state.view === 'list' ? (
                  <>
                    <h3 className="text-lg mb-3">Inbox</h3>
                    <ul className="space-y-1">
                      {INBOX.map((m, i) => (
                        <li
                          key={m.from}
                          className={`px-3 py-2.5 rounded-md ${
                            i === state.index
                              ? 'bg-primary text-primary-foreground outline outline-2 outline-offset-2 outline-primary-strong'
                              : ''
                          }`}
                        >
                          <p className="font-medium text-[0.95rem] flex items-center gap-2">
                            {m.unread && (
                              <span
                                aria-hidden
                                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                  i === state.index ? 'bg-primary-foreground' : 'bg-primary'
                                }`}
                              />
                            )}
                            {m.from}
                          </p>
                          <p
                            className={`text-sm truncate ${
                              i === state.index ? 'opacity-85' : 'text-muted-foreground'
                            }`}
                          >
                            {m.preview}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <p className="font-mono-label text-muted-foreground mb-2">Message</p>
                    <h3 className="text-lg mb-3">{current.from}</h3>
                    <p className="text-[0.95rem]">{current.body}</p>
                  </>
                )}
                {state.playing && (
                  <p className="mt-4 pt-3 border-t border-border text-sm text-muted-foreground">
                    ♪ Playing
                  </p>
                )}
              </div>
            </div>

            {/* What the screen reader says — the actual product. */}
            <div className="mt-6 border border-border rounded-lg p-4">
              <p className="font-mono-label text-muted-foreground mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4" aria-hidden />
                Screen reader says
              </p>
              <p aria-live="polite" className="text-[0.95rem] min-h-[3rem]">
                “{announcement}”
              </p>
            </div>

            <div className="mt-3 border border-border rounded-lg p-4">
              <p className="font-mono-label text-muted-foreground mb-2 flex items-center gap-2">
                <Vibrate className="w-4 h-4" aria-hidden />
                Haptic
              </p>
              <p className="text-[0.95rem] min-h-[1.5rem] text-muted-foreground">
                {haptic ?? 'Idle'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Design intent — no haptic hardware has been built, so no pattern here has
                ever been felt.
              </p>
            </div>
          </div>
        </div>

        {/* ---- Always in the DOM: the same walkthrough, no JavaScript needed. ---- */}
        <details className="mt-12 border-t border-border pt-6 group">
          <summary className="cursor-pointer list-none font-medium hover:text-primary-strong [&::-webkit-details-marker]:hidden inline-flex items-center gap-2">
            Read the walkthrough instead
            <span aria-hidden className="text-muted-foreground text-xl leading-none group-open:hidden">+</span>
            <span aria-hidden className="text-muted-foreground text-xl leading-none hidden group-open:inline">−</span>
          </summary>
          <div className="pt-5 max-w-[65ch] space-y-3 text-muted-foreground">
            <p>
              <strong className="text-foreground">One.</strong> The ring sits idle. In the
              design it accepts nothing at all until you squeeze the band — which is what
              stops a command firing while the hand is in a pocket or holding a cane.
            </p>
            <p>
              <strong className="text-foreground">Two.</strong> A squeeze opens a short
              command window, about three seconds, and a single soft pulse confirms it
              opened. If you do nothing, it closes again on its own.
            </p>
            <p>
              <strong className="text-foreground">Three.</strong> Inside that window, one
              tap of the thumb against a point on the fingers runs one command. Confirm sits
              on the index tip, Back directly below it on the same finger, Next and Previous
              on the middle and ring fingers, Read on the ring tip, and the two personal
              shortcuts on the pinky.
            </p>
            <p>
              <strong className="text-foreground">Four.</strong> The phone carries out the
              command through VoiceOver or TalkBack — the screen reader you already use,
              configured the way you already have it — and a haptic pattern tells your hand
              which command was heard, so you do not have to wait for speech to know it
              worked.
            </p>
            <p>
              <strong className="text-foreground">Emergency</strong> is the one exception: a
              sustained five-second hold on the pinky tip, never a tap count, so it cannot
              be produced by accident.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
