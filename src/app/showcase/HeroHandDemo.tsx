/**
 * The hero's teaching instrument: a clickable hand wearing the ring, wired
 * to a small abstract phone. Tap a contact point and the whole idea plays
 * out — point lights up, `INDEX TIP → CONFIRM` appears, the phone's
 * screen-reader focus reacts, a haptic glyph pulses.
 *
 * Until the visitor touches it, it quietly demonstrates one Confirm tap on
 * a loop (never under reduced motion). First interaction stops the loop.
 *
 * Accessibility: SimHand supplies real buttons (44px targets, roving
 * tabindex, full names); the response line is a polite live region. The
 * showcase's dark palette is applied by overriding the shared design-token
 * variables on the wrapper — same component, different skin.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { SimHand } from '../components/SimHand';
import {
  CONTACTS_BY_ID,
  DEFAULT_LAYOUT,
  effectiveCommandFor,
  type ContactId,
} from '../../lib/gestures';

const SCREEN_ITEMS = ['Messages', 'Podcasts', 'Camera', 'Settings'];

interface DemoState {
  focus: number;
  activated: number | null;
  contact: ContactId | null;
  command: string;
  spoken: string;
}

const INITIAL: DemoState = {
  focus: 1,
  activated: null,
  contact: null,
  command: '',
  spoken: 'VoiceOver: Podcasts, 2 of 4.',
};

export default function HeroHandDemo() {
  const [state, setState] = useState<DemoState>(INITIAL);
  const [flashId, setFlashId] = useState<ContactId | null>(null);
  const [pulse, setPulse] = useState(0);
  const interacted = useRef(false);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };

  const runTap = useCallback((id: ContactId) => {
    const { name } = effectiveCommandFor(DEFAULT_LAYOUT, id, false);
    setFlashId(id);
    timers.current.push(window.setTimeout(() => setFlashId(null), 700));
    setPulse((p) => p + 1);

    setState((prev) => {
      let { focus, activated } = prev;
      let spoken = '';
      switch (id) {
        case 'middle-base': {
          focus = Math.min(SCREEN_ITEMS.length - 1, focus + 1);
          activated = null;
          spoken = `VoiceOver: ${SCREEN_ITEMS[focus]}, ${focus + 1} of ${SCREEN_ITEMS.length}.`;
          break;
        }
        case 'ring-base': {
          focus = Math.max(0, focus - 1);
          activated = null;
          spoken = `VoiceOver: ${SCREEN_ITEMS[focus]}, ${focus + 1} of ${SCREEN_ITEMS.length}.`;
          break;
        }
        case 'index-tip': {
          activated = focus;
          spoken = `VoiceOver: ${SCREEN_ITEMS[focus]} — opened.`;
          break;
        }
        case 'index-base': {
          activated = null;
          spoken = 'VoiceOver: Back.';
          break;
        }
        case 'ring-tip': {
          spoken = `VoiceOver: ${SCREEN_ITEMS[focus]}, ${focus + 1} of ${SCREEN_ITEMS.length}.`;
          break;
        }
        case 'middle-tip': {
          activated = null;
          spoken = 'VoiceOver: Action undone.';
          break;
        }
        default: {
          spoken = `VoiceOver: ${effectiveCommandFor(DEFAULT_LAYOUT, id).response}`;
        }
      }
      return { focus, activated, contact: id, command: name, spoken };
    });
  }, []);

  const onPress = useCallback(
    (id: ContactId) => {
      interacted.current = true;
      runTap(id);
    },
    [runTap],
  );

  // Idle loop: one quiet Confirm demonstration every ~7 s until first touch.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const tick = (first: boolean) => {
      const t = window.setTimeout(() => {
        if (cancelled || interacted.current) return;
        runTap('index-tip');
        tick(false);
      }, first ? 1600 : 7000);
      timers.current.push(t);
    };
    tick(true);
    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [runTap]);

  const contactLabel = state.contact
    ? `${CONTACTS_BY_ID[state.contact].finger} ${CONTACTS_BY_ID[state.contact].position}`.toUpperCase()
    : null;

  const tokenOverrides = useMemo(
    () =>
      ({
        '--color-foreground': '#ece9fb',
        '--color-background': '#0b0a14',
        '--color-primary': 'var(--t-violet)',
        '--primary': 'var(--t-violet)',
        '--color-primary-foreground': '#ffffff',
        '--color-secondary': 'rgba(240,238,252,0.08)',
        '--color-muted-foreground': 'rgba(236,233,251,0.6)',
        '--color-border': 'rgba(240,238,252,0.18)',
        '--primary-strong': 'var(--t-violet)',
      }) as CSSProperties,
    [],
  );

  return (
    <div style={tokenOverrides} className="w-full max-w-[380px] mx-auto lg:mx-0">
      <SimHand
        mode="press"
        dark
        onPressStart={() => {}}
        onPressEnd={onPress}
        flashId={flashId}
        label="Try Tactiq: activate any contact point to run its command on the demonstration phone below."
      />

      {/* finger → command readout */}
      <div className="mt-2 flex min-h-8 items-center justify-center gap-3 lg:justify-start" aria-hidden>
        {contactLabel ? (
          <>
            <span className="font-mono text-[0.7rem] tracking-[0.18em] text-[rgba(236,233,251,0.6)]">
              {contactLabel}
            </span>
            <span className="text-[rgba(236,233,251,0.35)]">→</span>
            <span className="font-mono text-[0.7rem] tracking-[0.18em] font-semibold" style={{ color: 'var(--t-violet)' }}>
              {state.command.toUpperCase()}
            </span>
            <span key={pulse} className="sim-flash inline-block h-2 w-2 rounded-full" style={{ background: 'var(--t-violet)' }} />
          </>
        ) : (
          <span className="font-mono text-[0.7rem] tracking-[0.18em] text-[rgba(236,233,251,0.45)]">
            TAP A POINT ON THE HAND
          </span>
        )}
      </div>

      {/* The phone, abstract: a screen-reader focus box that actually moves. */}
      <div
        className="mt-3 rounded-xl border border-[rgba(240,238,252,0.16)] bg-[rgba(11,10,20,0.55)] p-3 backdrop-blur-sm"
        role="group"
        aria-label="Demonstration phone screen"
      >
        <ul className="space-y-1">
          {SCREEN_ITEMS.map((item, i) => (
            <li
              key={item}
              aria-current={state.focus === i ? 'true' : undefined}
              className="flex items-center justify-between rounded-md px-3 py-1.5 text-sm transition-colors duration-200"
              style={{
                border:
                  state.focus === i
                    ? '1.5px solid var(--t-violet)'
                    : '1.5px solid transparent',
                background:
                  state.activated === i ? 'rgba(124,108,255,0.22)' : 'transparent',
                color:
                  state.focus === i ? '#ece9fb' : 'rgba(236,233,251,0.55)',
              }}
            >
              {item}
              {state.activated === i && (
                <span className="font-mono text-[0.65rem]" style={{ color: 'var(--t-violet)' }}>
                  OPEN
                </span>
              )}
            </li>
          ))}
        </ul>
        <p aria-live="polite" className="mt-2.5 px-1 font-mono text-[0.7rem] leading-relaxed text-[rgba(236,233,251,0.6)]">
          {state.spoken}
        </p>
      </div>
    </div>
  );
}
