/**
 * The hand as the interface — accessible eight-point command map.
 *
 * Interaction contract:
 *  - Mouse: hover previews, click selects; the selected state persists.
 *  - Touch: points are 44×44px minimum; tapping updates the panel below.
 *  - Keyboard: Tab reaches the group, Left/Right/Up/Down arrows move between
 *    points (roving tabindex), Enter/Space selects.
 *  - Screen readers: every point is a real <button> with a complete name;
 *    selection changes are announced through a polite live region, and the
 *    whole map has a semantic-list alternative ("View all commands as a list").
 *
 * Data comes from src/lib/gestures.ts — the same source the account
 * customiser uses, so the two can never drift apart.
 */
import { useRef, useState } from 'react';
import { List, Hand as HandIcon } from 'lucide-react';
import { gesturePoints, type GesturePoint } from '../../lib/gestures';

/** Visual kind per point — fixed / shortcut / emergency are distinguished. */
function kindOf(p: GesturePoint): 'fixed' | 'shortcut' | 'emergency' {
  if (p.id === 'pinky-tip') return 'emergency';
  return p.editable ? 'shortcut' : 'fixed';
}

const KIND_STYLE: Record<string, { dot: string; label: string }> = {
  fixed: { dot: 'bg-foreground text-background', label: 'Fixed command' },
  shortcut: { dot: 'bg-primary text-primary-foreground', label: 'Personal shortcut' },
  emergency: {
    dot: 'bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary ring-offset-background',
    label: 'Shortcut + emergency hold',
  },
};

function CommandList() {
  const fixed = gesturePoints.filter((p) => kindOf(p) === 'fixed');
  const personal = gesturePoints.filter((p) => kindOf(p) !== 'fixed');
  return (
    <div className="grid sm:grid-cols-2 gap-8">
      <div>
        <h4 className="mb-3">Seven fixed commands</h4>
        <ol className="space-y-2 list-decimal list-inside">
          {fixed.map((p) => (
            <li key={p.id} className="text-[0.95rem]">
              <span className="font-medium">{p.gestures?.[0]?.split(': ')[1] ?? p.label}</span>
              <span className="text-muted-foreground"> — {p.finger.toLowerCase()} {p.position.toLowerCase()}</span>
            </li>
          ))}
          <li className="text-[0.95rem]">
            <span className="font-medium">Emergency</span>
            <span className="text-muted-foreground">
              {' '}
              — pinky tip, sustained five-second hold. Never a tap count, so it cannot fire by accident.
            </span>
          </li>
        </ol>
      </div>
      <div>
        <h4 className="mb-3">Two personal shortcuts</h4>
        <ol className="space-y-2 list-decimal list-inside">
          {personal.map((p) => (
            <li key={p.id} className="text-[0.95rem]">
              <span className="font-medium">{p.id === 'pinky-tip' ? 'Shortcut 2' : 'Shortcut 1'}</span>
              <span className="text-muted-foreground">
                {' '}
                — {p.finger.toLowerCase()} {p.position.toLowerCase()}, a brief tap runs a command you choose:
                speak the time, call a favourite, share your location…
              </span>
            </li>
          ))}
        </ol>
        <p className="text-sm text-muted-foreground mt-4">
          The seven fixed commands never move — reliable use depends on muscle memory.
          Only the two shortcut points can be remapped.
        </p>
      </div>
    </div>
  );
}

export default function HandMap() {
  const [selectedId, setSelectedId] = useState<string>(gesturePoints[0].id);
  const [showList, setShowList] = useState(false);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const selected = gesturePoints.find((p) => p.id === selectedId) ?? gesturePoints[0];
  const selectedIndex = gesturePoints.findIndex((p) => p.id === selectedId);

  const moveFocus = (from: number, delta: number) => {
    const next = (from + delta + gesturePoints.length) % gesturePoints.length;
    buttonsRef.current[next]?.focus();
  };

  return (
    <section
      id="command-map"
      aria-labelledby="handmap-heading"
      className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
          <h2 id="handmap-heading" className="text-3xl sm:text-4xl">
            The hand is the interface
          </h2>
          <button
            onClick={() => setShowList((v) => !v)}
            aria-pressed={showList}
            className="inline-flex items-center gap-2 h-11 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
          >
            {showList ? <HandIcon className="w-4 h-4" aria-hidden /> : <List className="w-4 h-4" aria-hidden />}
            {showList ? 'View the hand map' : 'View all commands as a list'}
          </button>
        </div>
        <p className="text-muted-foreground max-w-[42rem] mb-10">
          Every command lives on skin you can feel without looking. Seven fixed commands,
          two personal shortcuts, and one emergency hold — separated by position and, for
          the emergency, by duration.
        </p>

        {showList ? (
          <CommandList />
        ) : (
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Interactive map */}
            <div
              role="group"
              aria-label="Command map: eight contact points on the hand. Use arrow keys to move between points."
              className="relative max-w-md"
            >
              <svg viewBox="0 0 300 400" aria-hidden className="w-full h-auto text-foreground">
                <g fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2">
                  <rect x="112" y="325" width="96" height="72" rx="26" />
                  <rect x="80" y="198" width="162" height="148" rx="46" />
                  <rect x="92" y="100" width="33" height="148" rx="16.5" />
                  <rect x="134" y="80" width="33" height="168" rx="16.5" />
                  <rect x="176" y="100" width="33" height="148" rx="16.5" />
                  <rect x="214" y="130" width="31" height="120" rx="15.5" />
                  <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
                </g>
                <g stroke="var(--color-primary)" strokeWidth="5" fill="none" strokeOpacity="0.9">
                  <line x1="90" y1="196" x2="127" y2="196" />
                  <line x1="90" y1="206" x2="127" y2="206" />
                </g>
              </svg>

              {gesturePoints.map((point, i) => {
                const kind = kindOf(point);
                const isSelected = selectedId === point.id;
                return (
                  <button
                    key={point.id}
                    ref={(el) => {
                      buttonsRef.current[i] = el;
                    }}
                    tabIndex={i === selectedIndex ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-label={`${point.finger} ${point.position.toLowerCase()}: ${point.description.split('—')[0].trim()}. ${KIND_STYLE[kind].label}.`}
                    onClick={() => setSelectedId(point.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        moveFocus(i, 1);
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        moveFocus(i, -1);
                      }
                    }}
                    style={{ position: 'absolute', left: point.x, top: point.y }}
                    className={`w-11 h-11 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center text-[0.65rem] font-semibold transition-transform ${
                      KIND_STYLE[kind].dot
                    } ${isSelected ? 'scale-110 outline outline-2 outline-offset-4 outline-primary-strong' : 'hover:scale-105'}`}
                  >
                    {point.label}
                  </button>
                );
              })}
            </div>

            {/* Explanation panel — updates with selection, persists, announced politely */}
            <div aria-live="polite" className="md:sticky md:top-24">
              <p className="font-mono-label text-muted-foreground mb-2">
                {selected.finger} · {selected.position.toLowerCase()} · {KIND_STYLE[kindOf(selected)].label}
              </p>
              <h3 className="text-2xl mb-3 font-serif-display font-semibold">
                {selected.description.split('—')[0].trim()}
              </h3>
              <p className="text-muted-foreground mb-5">{selected.description}</p>
              {selected.gestures && (
                <ul className="space-y-1.5">
                  {selected.gestures.map((g) => (
                    <li key={g} className="text-[0.95rem] flex gap-2">
                      <span aria-hidden className="text-primary-strong">—</span>
                      {g}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Legend — colour is never the only carrier: shapes + text labels */}
        {!showList && (
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted-foreground">
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
        )}
      </div>
    </section>
  );
}
