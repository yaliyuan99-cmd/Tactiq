/**
 * Concept v1 — the original sixty-gesture keyboard hand, fully interactive
 * again, restored as a working archive inside "How the design evolved".
 *
 * This is deliberately self-contained: the fifteen-point layout below is the
 * superseded design, so it does NOT live in src/lib/gestures.ts (which drives
 * the current eight-point map and the account customiser). Nothing here is a
 * current product claim — the surrounding section frames it as history.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Pointer } from 'lucide-react';

type V1Type = 'modifier' | 'fixed' | 'letter' | 'custom' | 'return' | 'space';

interface V1Point {
  id: string;
  finger: string;
  position: string;
  x: string;
  y: string;
  type: V1Type;
  label: string;
  description: string;
  gestures: string[];
}

const POINTS: V1Point[] = [
  { id: 'thumb-top', finger: 'Thumb', position: 'Top', x: '14%', y: '53%', type: 'modifier', label: 'Shift/Caps', description: 'Modifier (thumb) — hold for capitalisation or shift input.', gestures: ['Tap: Shift', 'Hold: Caps Lock'] },
  { id: 'thumb-mid', finger: 'Thumb', position: 'Mid', x: '23%', y: '63%', type: 'modifier', label: 'Switch Lang', description: 'Switch language or input mode.', gestures: ['Tap: Switch language', 'Hold: Input mode'] },
  { id: 'space-bar', finger: 'Palm', position: 'Below fingers', x: '54%', y: '63%', type: 'space', label: 'Space', description: 'Spacebar — a long bar resting across the palm beneath the fingers, just like a keyboard.', gestures: ['Tap: Space', 'Hold: repeat space'] },
  { id: 'index-top', finger: 'Index', position: 'Top', x: '36%', y: '34%', type: 'letter', label: '.?!', description: '9-grid keypad key 1 — punctuation. Multi-tap to cycle, like a phone dialpad.', gestures: ['Tap 1×: .', 'Tap 2×: ,', 'Tap 3×: ?', 'Tap 4×: !'] },
  { id: 'middle-top', finger: 'Middle', position: 'Top', x: '50%', y: '30%', type: 'letter', label: 'ABC', description: '9-grid keypad key 2 — multi-tap to cycle A → B → C.', gestures: ['Tap 1×: A', 'Tap 2×: B', 'Tap 3×: C'] },
  { id: 'ring-top', finger: 'Ring', position: 'Top', x: '64%', y: '34%', type: 'letter', label: 'DEF', description: '9-grid keypad key 3 — multi-tap to cycle D → E → F.', gestures: ['Tap 1×: D', 'Tap 2×: E', 'Tap 3×: F'] },
  { id: 'index-mid', finger: 'Index', position: 'Mid', x: '36%', y: '42%', type: 'letter', label: 'GHI', description: '9-grid keypad key 4 — multi-tap to cycle G → H → I.', gestures: ['Tap 1×: G', 'Tap 2×: H', 'Tap 3×: I'] },
  { id: 'middle-mid', finger: 'Middle', position: 'Mid', x: '50%', y: '40%', type: 'letter', label: 'JKL', description: '9-grid keypad key 5 — multi-tap to cycle J → K → L.', gestures: ['Tap 1×: J', 'Tap 2×: K', 'Tap 3×: L'] },
  { id: 'ring-mid', finger: 'Ring', position: 'Mid', x: '64%', y: '42%', type: 'letter', label: 'MNO', description: '9-grid keypad key 6 — multi-tap to cycle M → N → O.', gestures: ['Tap 1×: M', 'Tap 2×: N', 'Tap 3×: O'] },
  { id: 'index-bottom', finger: 'Index', position: 'Bottom', x: '36%', y: '51%', type: 'letter', label: 'PQRS', description: '9-grid keypad key 7 — multi-tap to cycle P → Q → R → S.', gestures: ['Tap 1×: P', 'Tap 2×: Q', 'Tap 3×: R', 'Tap 4×: S'] },
  { id: 'middle-bottom', finger: 'Middle', position: 'Bottom', x: '50%', y: '50%', type: 'letter', label: 'TUV', description: '9-grid keypad key 8 — multi-tap to cycle T → U → V.', gestures: ['Tap 1×: T', 'Tap 2×: U', 'Tap 3×: V'] },
  { id: 'ring-bottom', finger: 'Ring', position: 'Bottom', x: '64%', y: '51%', type: 'letter', label: 'WXYZ', description: '9-grid keypad key 9 — multi-tap to cycle W → X → Y → Z.', gestures: ['Tap 1×: W', 'Tap 2×: X', 'Tap 3×: Y', 'Tap 4×: Z'] },
  { id: 'pinky-top', finger: 'Pinky', position: 'Top', x: '76%', y: '40%', type: 'fixed', label: 'Delete', description: 'Fixed delete cluster — tap variations.', gestures: ['Tap 1×: Delete char', 'Tap 2×: Delete word', 'Tap 3×: Clear field'] },
  { id: 'pinky-mid', finger: 'Pinky', position: 'Mid', x: '76%', y: '47%', type: 'custom', label: 'Custom', description: 'Customisable shortcut slot.', gestures: ['Tap 1×: Custom', 'Tap 2×: Custom', 'Tap 3×: Custom'] },
  { id: 'pinky-bottom', finger: 'Pinky', position: 'Bottom', x: '76%', y: '54%', type: 'custom', label: 'Custom', description: 'Customisable shortcut slot.', gestures: ['Tap 1×: Custom', 'Tap 2×: Custom', 'Tap 3×: Custom'] },
  { id: 'palm-return', finger: 'Palm', position: 'Side', x: '70%', y: '74%', type: 'return', label: 'Return', description: 'Palm (pinky-side tap) — sends Return/Enter.', gestures: ['Side tap: Return/Enter'] },
];

/* Shades chosen for ≥4.5:1 label contrast: dark text on the yellow keypad
   dots, white text on darkened blue/green/purple/red/slate. */
const COLORS: Record<V1Type, { bg: string; border: string; text: string }> = {
  modifier: { bg: 'bg-blue-700', border: 'border-blue-500', text: 'text-white' },
  fixed: { bg: 'bg-green-700', border: 'border-green-500', text: 'text-white' },
  letter: { bg: 'bg-yellow-500', border: 'border-yellow-600', text: 'text-yellow-950' },
  custom: { bg: 'bg-purple-700', border: 'border-purple-500', text: 'text-white' },
  return: { bg: 'bg-red-700', border: 'border-red-500', text: 'text-white' },
  space: { bg: 'bg-slate-700', border: 'border-slate-500', text: 'text-white' },
};

const LEGEND: { type: V1Type; label: string }[] = [
  { type: 'modifier', label: 'Modifier (thumb)' },
  { type: 'letter', label: 'Letters — 9-grid keypad' },
  { type: 'fixed', label: 'Delete (pinky)' },
  { type: 'custom', label: 'Custom shortcut (pinky)' },
  { type: 'return', label: 'Palm — return' },
];

export default function ConceptV1Demo() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  const activeId = selected || hovered;
  const active = POINTS.find((p) => p.id === activeId);

  return (
    <div>
      {/* Legend */}
      <ul className="mb-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
        {LEGEND.map((item) => (
          <li key={item.type} className="flex items-center gap-2">
            <span aria-hidden className={`w-3 h-3 rounded-full ${COLORS[item.type].bg}`} />
            {item.label}
          </li>
        ))}
      </ul>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        {/* Hand */}
        <div className="relative aspect-[3/4] max-w-md bg-card rounded-lg overflow-hidden">
          <svg
            viewBox="0 0 300 400"
            preserveAspectRatio="xMidYMid meet"
            className="absolute inset-0 w-full h-full text-foreground"
            aria-hidden
          >
            <g fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2.5">
              <rect x="112" y="325" width="96" height="72" rx="26" />
              <rect x="80" y="198" width="162" height="148" rx="46" />
              <rect x="92" y="100" width="33" height="148" rx="16.5" />
              <rect x="134" y="80" width="33" height="168" rx="16.5" />
              <rect x="176" y="100" width="33" height="148" rx="16.5" />
              <rect x="214" y="130" width="31" height="120" rx="15.5" />
              <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
            </g>
          </svg>

          <div className="absolute inset-0">
            {POINTS.map((point) => {
              const colors = COLORS[point.type];
              const isActive = activeId === point.id;
              const isBar = point.type === 'space';
              return (
                <div
                  key={point.id}
                  style={
                    isBar
                      ? { position: 'absolute', left: '34%', right: '21%', top: point.y }
                      : { position: 'absolute', left: point.x, top: point.y }
                  }
                  className={isBar ? '-translate-y-1/2' : '-translate-x-1/2 -translate-y-1/2'}
                >
                  <motion.button
                    aria-pressed={selected === point.id}
                    aria-label={`${point.label} key — ${point.finger}, ${point.position}. Concept v1, superseded.`}
                    onMouseEnter={() => setHovered(point.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(point.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(selected === point.id ? null : point.id)}
                    whileHover={{ scale: isBar ? 1.04 : 1.15 }}
                    whileTap={{ scale: isBar ? 0.97 : 0.85 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                    className={
                      isBar
                        ? `relative w-full h-9 ${colors.bg} rounded-lg border-2 ${colors.border} flex items-center justify-center ${colors.text} font-semibold text-xs tracking-[0.3em] uppercase`
                        : `relative w-12 h-12 ${colors.bg} rounded-full border-2 ${colors.border} flex items-center justify-center ${colors.text} font-semibold text-[0.65rem]`
                    }
                  >
                    {isActive && !isBar && (
                      <motion.span
                        aria-hidden
                        animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className={`absolute inset-0 ${colors.bg} rounded-full`}
                      />
                    )}
                    <span className="relative">{point.label}</span>
                  </motion.button>
                </div>
              );
            })}
          </div>

          <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs text-muted-foreground bg-background/85 px-3 py-1.5 rounded-full whitespace-nowrap">
            Click or hover on any dot to explore v1
          </p>
        </div>

        {/* Info panel */}
        <div className="md:sticky md:top-24">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                exit={{ y: 0 }}
                transition={{ duration: 0.25 }}
                className={`bg-card border-2 ${COLORS[active.type].border} rounded-lg p-6`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className={`w-10 h-10 shrink-0 ${COLORS[active.type].bg} rounded-full flex items-center justify-center ${COLORS[active.type].text} text-[0.6rem] font-semibold`}
                  >
                    {active.label}
                  </span>
                  <div>
                    <h3 className="text-base">{active.finger}</h3>
                    <p className="text-sm text-muted-foreground">{active.position} knuckle</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">{active.description}</p>
                <ul className="space-y-1.5">
                  {active.gestures.map((g) => (
                    <li key={g} className="text-[0.95rem] flex gap-2">
                      <span aria-hidden className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${COLORS[active.type].bg}`} />
                      {g}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ y: 10 }}
                animate={{ y: 0 }}
                exit={{ y: 0 }}
                transition={{ duration: 0.25 }}
                className="bg-card rounded-lg p-8 text-center"
              >
                <span className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                  <Pointer className="w-6 h-6" aria-hidden />
                </span>
                <h3 className="text-base mb-2">Type with the 9-grid keypad</h3>
                <p className="text-muted-foreground text-[0.95rem] max-w-[38ch] mx-auto">
                  The index, middle and ring fingers formed a phone-dialpad alphabet;
                  the thumb and pinky handled modifiers and shortcuts.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* v1 stats */}
          <dl className="mt-6 grid grid-cols-3 gap-4">
            {[
              { value: '9', label: '9-grid keys' },
              { value: '26', label: 'Letters' },
              { value: '1–4', label: 'Taps per key' },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-lg p-4 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold text-primary-strong tabular-nums">{s.value}</span>
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
