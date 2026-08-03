/**
 * Hero — one physical idea: a hand wearing the ring, with the eight contact
 * points mapped onto the fingers, and a short controlled demonstration of a
 * single command: the ring squeezes, the thumb travels to the index tip, the
 * point highlights, the command label appears, one haptic pulse expands, and
 * the scene settles. ~2.6 s, plays once, with a visible replay button.
 * Reduced-motion users see the settled final state immediately.
 * Statistics are plain text in the initial HTML — no count-up.
 */
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { RotateCcw } from 'lucide-react';
import { PRODUCT } from '../../lib/gestures';

const rise = (delay: number) => ({
  initial: { y: 18 },
  animate: { y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Contact points in the 300×400 hand-outline coordinate space. */
const POINTS: { x: number; y: number; kind: 'fixed' | 'shortcut' | 'emergency' }[] = [
  { x: 108, y: 112, kind: 'fixed' },     // index tip — confirm (demo target)
  { x: 108, y: 224, kind: 'fixed' },     // index base — dismiss/back
  { x: 150, y: 96, kind: 'fixed' },      // middle tip — undo
  { x: 150, y: 220, kind: 'fixed' },     // middle base — next
  { x: 192, y: 112, kind: 'fixed' },     // ring tip — read/repeat
  { x: 192, y: 224, kind: 'fixed' },     // ring base — previous
  { x: 228, y: 232, kind: 'shortcut' },  // pinky base — shortcut 1
  { x: 228, y: 140, kind: 'emergency' }, // pinky tip — shortcut 2 + emergency hold
];

const TARGET = POINTS[0]; // index tip — Confirm

function HeroDemo() {
  const prefersReduced = useReducedMotion();
  const [runId, setRunId] = useState(0);

  // Timing map for one run (seconds).
  const T = { squeeze: 0.5, thumb: 1.1, press: 1.8, pulse: 2.0, label: 2.15 };

  return (
    <figure className="max-w-md mx-auto lg:mx-0">
      <svg
        viewBox="0 0 300 400"
        role="img"
        aria-label={`Demonstration drawing: an open hand wearing the Tactiq ring on the index finger, with ${PRODUCT.contactPoints} contact points marked on the tips and bases of the four fingers. The ring squeezes, the thumb taps the index-finger tip, and the Confirm command runs with one haptic pulse.`}
        className="w-full h-auto text-foreground"
      >
        {/* Hand outline */}
        <g fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2">
          <rect x="112" y="325" width="96" height="72" rx="26" />
          <rect x="80" y="198" width="162" height="148" rx="46" />
          <rect x="92" y="100" width="33" height="148" rx="16.5" />
          <rect x="134" y="80" width="33" height="168" rx="16.5" />
          <rect x="176" y="100" width="33" height="148" rx="16.5" />
          <rect x="214" y="130" width="31" height="120" rx="15.5" />
          <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
        </g>

        {/* Contact points (static map) */}
        {POINTS.map((p, i) => (
          <g key={i} className="point-pop" style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
            {p.kind === 'emergency' && (
              <circle cx={p.x} cy={p.y} r="14" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeDasharray="3 3" />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r="8"
              fill={p.kind === 'fixed' ? 'currentColor' : 'var(--color-primary)'}
              fillOpacity={p.kind === 'fixed' ? 0.85 : 1}
            />
          </g>
        ))}

        {prefersReduced ? (
          /* Reduced motion: the settled final state, immediately. */
          <g>
            <g stroke="var(--color-primary)" strokeWidth="5" fill="none">
              <line x1="90" y1="196" x2="127" y2="196" />
              <line x1="90" y1="206" x2="127" y2="206" />
            </g>
            <circle cx={TARGET.x} cy={TARGET.y} r="13" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" />
            <g fontFamily="var(--font-mono)" fontSize="12">
              <rect x={TARGET.x - 78} y={TARGET.y - 44} width="72" height="24" rx="4" fill="var(--color-primary)" />
              <text x={TARGET.x - 42} y={TARGET.y - 28} textAnchor="middle" fill="var(--color-primary-foreground)">
                Confirm
              </text>
              <line x1={TARGET.x - 20} y1={TARGET.y - 24} x2={TARGET.x - 6} y2={TARGET.y - 10} stroke="var(--color-primary)" strokeWidth="1.5" />
            </g>
          </g>
        ) : (
          /* The demonstration — keyed so Replay remounts and re-runs it. */
          <g key={runId}>
            {/* The ring: squeezes once (scaleY) to show activation. */}
            <motion.g
              stroke="var(--color-primary)"
              strokeWidth="5"
              fill="none"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              animate={{ scaleY: [1, 0.62, 1] }}
              transition={{ delay: T.squeeze, duration: 0.45, times: [0, 0.5, 1], ease: 'easeInOut' }}
            >
              <line x1="90" y1="196" x2="127" y2="196" />
              <line x1="90" y1="206" x2="127" y2="206" />
            </motion.g>

            {/* Thumb indicator: travels from the thumb to the index tip. */}
            <motion.circle
              r="9"
              fill="currentColor"
              fillOpacity="0.55"
              initial={{ cx: 88, cy: 260, opacity: 0 }}
              animate={{ cx: [88, TARGET.x], cy: [260, TARGET.y], opacity: [0, 1, 1] }}
              transition={{ delay: T.thumb, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />

            {/* Point press: highlight ring tightens on. */}
            <motion.circle
              cx={TARGET.x}
              cy={TARGET.y}
              r="13"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              initial={{ opacity: 0, scale: 1.4 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{ delay: T.press, duration: 0.2 }}
            />

            {/* One haptic pulse, expanding once. */}
            <motion.circle
              cx={TARGET.x}
              cy={TARGET.y}
              r="10"
              fill="none"
              stroke="var(--color-primary)"
              strokeWidth="2"
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 2.6 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              transition={{ delay: T.pulse, duration: 0.55, ease: 'easeOut' }}
            />

            {/* Command label settles in. */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: T.label, duration: 0.25 }}
              fontFamily="var(--font-mono)"
              fontSize="12"
            >
              <rect x={TARGET.x - 78} y={TARGET.y - 44} width="72" height="24" rx="4" fill="var(--color-primary)" />
              <text x={TARGET.x - 42} y={TARGET.y - 28} textAnchor="middle" fill="var(--color-primary-foreground)">
                Confirm
              </text>
              <line x1={TARGET.x - 20} y1={TARGET.y - 24} x2={TARGET.x - 6} y2={TARGET.y - 10} stroke="var(--color-primary)" strokeWidth="1.5" />
            </motion.g>
          </g>
        )}
      </svg>

      <figcaption className="mt-3 text-sm text-muted-foreground text-center lg:text-left">
        Concept illustration of one command: squeeze the ring, tap the index tip, and Confirm
        runs with a single haptic pulse. Not a finished production device.
      </figcaption>

      {!prefersReduced && (
        <div className="mt-3 text-center lg:text-left">
          <button
            onClick={() => setRunId((id) => id + 1)}
            className="inline-flex items-center gap-2 h-11 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
          >
            <RotateCcw className="w-4 h-4" aria-hidden />
            Replay demonstration
          </button>
        </div>
      )}
    </figure>
  );
}

export default function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
        <div>
          <motion.p {...rise(0)} className="font-mono-label text-muted-foreground mb-5">
            Student research prototype · Sydney, Australia · currently in prototype development
            and bench-testing preparation
          </motion.p>

          <motion.h1 {...rise(0.08)} className="text-4xl sm:text-5xl lg:text-[3.4rem] mb-6">
            Control your phone with the hand you already know.
          </motion.h1>

          <motion.p {...rise(0.16)} className="text-lg text-muted-foreground max-w-[38rem] mb-8">
            Tactiq is a smart-ring concept that gives blind and low-vision people a quiet,
            one-handed way to control their phone. Squeeze the ring, tap a point on your
            fingers and VoiceOver or TalkBack carries out the command.
          </motion.p>

          <motion.div {...rise(0.24)} className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              See how it works
            </a>
            <a
              href="#follow"
              className="inline-flex items-center justify-center px-6 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors"
            >
              Follow the research
            </a>
          </motion.div>

          <motion.dl {...rise(0.32)} className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { value: String(PRODUCT.commands), label: 'commands' },
              { value: String(PRODUCT.contactPoints), label: 'contact points' },
              { value: '1', label: 'hand needed' },
            ].map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold text-primary-strong tabular-nums">{s.value}</span>
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <HeroDemo />
      </div>
    </section>
  );
}
