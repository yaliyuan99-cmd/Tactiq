/**
 * Hero — one physical idea: a hand wearing the ring, with the eight contact
 * points mapped onto the fingers. The illustration is a technical line
 * drawing (not a glossy product render) and is explicitly captioned as a
 * concept. Statistics are plain text in the initial HTML — no count-up.
 *
 * Motion: transform-only entrance stagger (content is always visible — it
 * only slides into place) and a CSS pop-in on the contact points that rests
 * at full size whenever animation is unavailable or reduced.
 */
import { motion } from 'motion/react';

const rise = (delay: number) => ({
  initial: { y: 18 },
  animate: { y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

/** Contact points in the 300×400 hand-outline coordinate space. */
const POINTS: { x: number; y: number; kind: 'fixed' | 'shortcut' | 'emergency' }[] = [
  { x: 108, y: 112, kind: 'fixed' },     // index tip — confirm
  { x: 108, y: 224, kind: 'fixed' },     // index base — dismiss/back
  { x: 150, y: 96, kind: 'fixed' },      // middle tip — undo
  { x: 150, y: 220, kind: 'fixed' },     // middle base — next
  { x: 192, y: 112, kind: 'fixed' },     // ring tip — read/repeat
  { x: 192, y: 224, kind: 'fixed' },     // ring base — previous
  { x: 228, y: 232, kind: 'shortcut' },  // pinky base — shortcut 1
  { x: 228, y: 140, kind: 'emergency' }, // pinky tip — shortcut 2 + emergency hold
];

function HandFigure() {
  return (
    <figure className="max-w-md mx-auto lg:mx-0">
      <svg
        viewBox="0 0 300 400"
        role="img"
        aria-label="Line drawing of an open hand wearing the Tactiq ring on the index finger. Eight contact points are marked on the tips and bases of the four fingers: six fixed commands, one personal shortcut on the pinky base, and the pinky tip, which combines a second shortcut with the emergency hold."
        className="w-full h-auto text-foreground"
      >
        {/* Hand outline — same geometry as the interactive map further down */}
        <g fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2">
          <rect x="112" y="325" width="96" height="72" rx="26" />
          <rect x="80" y="198" width="162" height="148" rx="46" />
          <rect x="92" y="100" width="33" height="148" rx="16.5" />
          <rect x="134" y="80" width="33" height="168" rx="16.5" />
          <rect x="176" y="100" width="33" height="148" rx="16.5" />
          <rect x="214" y="130" width="31" height="120" rx="15.5" />
          <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
        </g>
        {/* The ring, worn on the index finger's proximal segment */}
        <g stroke="var(--color-primary)" strokeWidth="5" fill="none">
          <line x1="90" y1="196" x2="127" y2="196" />
          <line x1="90" y1="206" x2="127" y2="206" />
        </g>
        {/* Contact points */}
        {POINTS.map((p, i) => (
          <g key={i} className="point-pop" style={{ animationDelay: `${0.5 + i * 0.08}s` }}>
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
      </svg>
      <figcaption className="mt-3 text-sm text-muted-foreground text-center lg:text-left">
        Concept illustration — the eight contact points a thumb can reach.
        Solid dots are fixed commands; <span className="text-primary-strong font-medium">orange</span> dots
        are the two personal shortcuts, and the dashed circle marks the five-second emergency hold.
        Not a finished production device.
      </figcaption>
    </figure>
  );
}

export default function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">
        <div>
          <motion.p {...rise(0)} className="font-mono-label text-muted-foreground mb-5">
            Student research prototype · Sydney, Australia · Bench testing planned for August–October 2026
          </motion.p>

          <motion.h1 {...rise(0.08)} className="text-4xl sm:text-5xl lg:text-[3.4rem] mb-6">
            Control your phone with the hand you already know.
          </motion.h1>

          <motion.p {...rise(0.16)} className="text-lg text-muted-foreground max-w-[38rem] mb-8">
            Tactiq is a smart ring that gives blind and low-vision people a quiet, one-handed
            way to control their phone. Tap a point on your fingers, and VoiceOver or TalkBack
            carries out the command.
          </motion.p>

          <motion.div {...rise(0.24)} className="flex flex-col sm:flex-row gap-3 mb-10">
            <a
              href="#follow"
              className="inline-flex items-center justify-center px-6 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              Follow the research
            </a>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center px-6 h-12 border border-border rounded-md font-medium hover:bg-secondary transition-colors"
            >
              See how it works
            </a>
          </motion.div>

          <motion.dl {...rise(0.32)} className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { value: '9', label: 'commands' },
              { value: '8', label: 'contact points' },
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

        <HandFigure />
      </div>
    </section>
  );
}
