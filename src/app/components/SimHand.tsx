/**
 * The interactive eight-point hand used by the simulator and training pages.
 * (The marketing hand map on /project is a separate, content-focused
 * component — this one is built for live input.)
 *
 * Interaction contract:
 *  - Mouse/touch: 44×44px minimum targets; pressing fires pressStart/pressEnd
 *    so the caller can distinguish brief taps from the 5-second emergency hold.
 *  - Keyboard: Tab reaches the group, arrow keys move between points (roving
 *    tabindex); holding Enter/Space is a hold.
 *  - Screen readers: every point is a real <button> with a complete name;
 *    a synthetic click (no press timing) counts as one complete brief tap.
 *
 * Geometry comes from src/lib/gestures.ts (the x/y percentages), so the map
 * can never drift from the canonical command model.
 */
import { useRef, useState, type CSSProperties } from 'react';
import { cn } from '../../lib/utils';
import {
  gesturePoints,
  kindOf,
  KIND_LABEL,
  type ContactId,
  type GesturePoint,
  type PointKind,
} from '../../lib/gestures';

const KIND_DOT: Record<PointKind, string> = {
  fixed: 'bg-foreground text-background',
  shortcut: 'bg-primary text-primary-foreground',
  emergency:
    'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary ring-offset-background',
};

/* The showcase's dark surface needs literal colours: the Tailwind theme is
 * inlined at build time, so cascading variable overrides can't re-skin the
 * utility classes above. */
const KIND_DOT_DARK: Record<PointKind, CSSProperties> = {
  fixed: { background: '#ece9fb', color: '#0b0a14' },
  shortcut: { background: 'var(--t-violet, #7c6cff)', color: '#ffffff' },
  emergency: {
    background: 'var(--t-violet, #7c6cff)',
    color: '#ffffff',
    boxShadow: '0 0 0 2px #0b0a14, 0 0 0 4px var(--t-violet, #7c6cff)',
  },
};

export interface SimHandProps {
  /** "select" highlights a persistent selection; "press" fires momentary presses. */
  mode?: 'select' | 'press';
  selectedId?: ContactId | null;
  onSelect?: (id: ContactId) => void;
  /** Press-mode callbacks (pointer or keyboard). */
  onPressStart?: (id: ContactId) => void;
  onPressEnd?: (id: ContactId) => void;
  /** Point flashed from outside (e.g. a recognised gesture). */
  flashId?: ContactId | null;
  /** Dim every point except these (training focus). */
  emphasizeIds?: ContactId[] | null;
  /** Mirror for left-hand wearers. */
  mirrored?: boolean;
  /** Literal dark-surface colours (for the showcase's night palette). */
  dark?: boolean;
  className?: string;
  /** Accessible name for the whole group. */
  label?: string;
}

export function SimHand({
  mode = 'select',
  selectedId = null,
  onSelect,
  onPressStart,
  onPressEnd,
  flashId = null,
  emphasizeIds = null,
  mirrored = false,
  dark = false,
  className,
  label = 'Command map: eight contact points on the hand. Use arrow keys to move between points.',
}: SimHandProps) {
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const keyHeld = useRef(false);
  /** Timestamp of the last pointer/keyboard press we handled, per point —
   * lets us recognise SYNTHETIC clicks (screen-reader activations carry no
   * pointer timing) and treat them as a complete tap. */
  const lastHandledPress = useRef<Map<string, number>>(new Map());

  const selectedIndex = Math.max(
    0,
    gesturePoints.findIndex((p) => p.id === selectedId),
  );
  const rovingIndex = mode === 'select' && selectedId ? selectedIndex : focusIndex;

  const moveFocus = (from: number, delta: number) => {
    const next = (from + delta + gesturePoints.length) % gesturePoints.length;
    setFocusIndex(next);
    buttonsRef.current[next]?.focus();
  };

  return (
    <div
      role="group"
      aria-label={label}
      className={cn('relative w-full max-w-md select-none', className)}
    >
      <HandIllustration mirrored={mirrored} dark={dark} />

      {gesturePoints.map((point: GesturePoint, i) => {
        const kind = kindOf(point);
        const isSelected = mode === 'select' && selectedId === point.id;
        const isFlashed = flashId === point.id;
        const dimmed = emphasizeIds ? !emphasizeIds.includes(point.id) : false;
        const left = mirrored ? `calc(100% - ${point.x})` : point.x;
        return (
          <button
            key={point.id}
            ref={(el) => {
              buttonsRef.current[i] = el;
            }}
            type="button"
            tabIndex={i === rovingIndex ? 0 : -1}
            aria-pressed={mode === 'select' ? isSelected : undefined}
            aria-label={`${point.finger} ${point.position.toLowerCase()}: ${
              point.description.split('—')[0].trim()
            }. ${KIND_LABEL[kind]}.`}
            onClick={() => {
              setFocusIndex(i);
              if (mode === 'select') {
                onSelect?.(point.id);
              } else {
                // Assistive-tech activation: a click with no recent real
                // press behind it counts as one complete brief tap.
                const last = lastHandledPress.current.get(point.id) ?? 0;
                if (Date.now() - last > 400) {
                  onPressStart?.(point.id);
                  onPressEnd?.(point.id);
                }
              }
            }}
            onPointerDown={() => {
              if (mode === 'press') onPressStart?.(point.id);
            }}
            onPointerUp={() => {
              if (mode === 'press') {
                lastHandledPress.current.set(point.id, Date.now());
                onPressEnd?.(point.id);
              }
            }}
            onPointerLeave={(e) => {
              if (mode === 'press' && e.buttons > 0) onPressEnd?.(point.id);
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                moveFocus(i, 1);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                moveFocus(i, -1);
              } else if (
                mode === 'press' &&
                (e.key === 'Enter' || e.key === ' ') &&
                !keyHeld.current
              ) {
                e.preventDefault();
                keyHeld.current = true;
                onPressStart?.(point.id);
              }
            }}
            onKeyUp={(e) => {
              if (mode === 'press' && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                keyHeld.current = false;
                lastHandledPress.current.set(point.id, Date.now());
                onPressEnd?.(point.id);
              }
            }}
            style={{
              position: 'absolute',
              left,
              top: point.y,
              ...(dark ? KIND_DOT_DARK[kind] : undefined),
              ...(dark && isSelected ? { outlineColor: '#ece9fb' } : undefined),
            }}
            className={cn(
              'w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[0.62rem] font-semibold leading-none transition-transform',
              !dark && KIND_DOT[kind],
              isSelected && 'scale-110 outline-2 outline-offset-4',
              isSelected && !dark && 'outline-primary-strong',
              !isSelected && 'hover:scale-105 active:scale-95',
              isFlashed && 'sim-flash scale-110',
              dimmed && 'opacity-35',
            )}
          >
            {point.label}
          </button>
        );
      })}
    </div>
  );
}

/** The stylised palm-up hand, ring worn on the index finger. */
export function HandIllustration({
  mirrored = false,
  dark = false,
}: {
  mirrored?: boolean;
  dark?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 320 380"
      aria-hidden
      className={dark ? 'w-full h-auto' : 'w-full h-auto text-foreground'}
      style={{
        ...(mirrored ? { transform: 'scaleX(-1)' } : undefined),
        ...(dark ? { color: 'rgba(236,233,251,0.85)' } : undefined),
      }}
    >
      <g fill="none" stroke="currentColor" strokeOpacity="0.38" strokeWidth="2">
        {/* wrist */}
        <rect x="118" y="316" width="92" height="58" rx="24" />
        {/* palm */}
        <rect x="76" y="196" width="186" height="138" rx="42" />
        {/* index / middle / ring / pinky fingers */}
        <rect x="78" y="58" width="36" height="152" rx="18" />
        <rect x="133" y="36" width="38" height="176" rx="19" />
        <rect x="187" y="52" width="36" height="160" rx="18" />
        <rect x="239" y="88" width="31" height="128" rx="15.5" />
        {/* thumb, angled from the palm's left edge */}
        <rect
          x="34"
          y="196"
          width="33"
          height="112"
          rx="16.5"
          transform="rotate(-36 50 250)"
        />
      </g>
      {/* the Tactiq ring — worn at the index finger's proximal segment */}
      <g stroke="var(--color-primary)" strokeWidth="5" fill="none" strokeOpacity="0.9">
        <line x1="77" y1="186" x2="115" y2="186" />
        <line x1="77" y1="196" x2="115" y2="196" />
      </g>
    </svg>
  );
}

/** Legend — colour is never the only carrier: shape + text everywhere. */
export function HandLegend({ className }: { className?: string }) {
  return (
    <ul
      className={cn(
        'flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground',
        className,
      )}
    >
      <li className="flex items-center gap-2">
        <span aria-hidden className="w-3.5 h-3.5 rounded-full bg-foreground inline-block" />
        Fixed command (7) — never moves
      </li>
      <li className="flex items-center gap-2">
        <span aria-hidden className="w-3.5 h-3.5 rounded-full bg-primary inline-block" />
        Personal shortcut (2) — yours to map
      </li>
      <li className="flex items-center gap-2">
        <span
          aria-hidden
          className="w-3.5 h-3.5 rounded-full bg-primary inline-block ring-2 ring-primary ring-offset-2 ring-offset-background"
        />
        Emergency — five-second hold on the pinky tip
      </li>
    </ul>
  );
}
