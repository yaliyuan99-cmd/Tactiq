/**
 * How the design evolved — the sixty-gesture keypad hand (concept v1) drawn
 * beside the current eight-point map (v2). v1 is real project history: a
 * phone-keypad alphabet across nine knuckles, thumb modifiers, a palm space
 * bar. The capacity analysis is why it was cut, and showing it makes the
 * "why nine commands" argument physical.
 */
import Reveal from './Reveal';
import EvidenceStatus from './EvidenceStatus';

/** v1 — fifteen contact points in the 300×400 hand space (archival layout). */
const V1_POINTS: { x: number; y: number; label: string; tone: string }[] = [
  { x: 42, y: 212, label: 'Shf', tone: 'var(--color-foreground)' },
  { x: 69, y: 252, label: 'Lng', tone: 'var(--color-foreground)' },
  { x: 108, y: 136, label: '.?!', tone: 'var(--color-status-simulation)' },
  { x: 150, y: 120, label: 'ABC', tone: 'var(--color-status-simulation)' },
  { x: 192, y: 136, label: 'DEF', tone: 'var(--color-status-simulation)' },
  { x: 108, y: 168, label: 'GHI', tone: 'var(--color-status-simulation)' },
  { x: 150, y: 160, label: 'JKL', tone: 'var(--color-status-simulation)' },
  { x: 192, y: 168, label: 'MNO', tone: 'var(--color-status-simulation)' },
  { x: 108, y: 204, label: 'PQR', tone: 'var(--color-status-simulation)' },
  { x: 150, y: 200, label: 'TUV', tone: 'var(--color-status-simulation)' },
  { x: 192, y: 204, label: 'WXY', tone: 'var(--color-status-simulation)' },
  { x: 228, y: 160, label: 'Del', tone: 'var(--color-destructive)' },
  { x: 228, y: 190, label: 'C1', tone: 'var(--color-primary)' },
  { x: 228, y: 218, label: 'C2', tone: 'var(--color-primary)' },
  { x: 210, y: 296, label: 'Ret', tone: 'var(--color-foreground)' },
];

/** v2 — the current eight points (same layout the hero uses). */
const V2_POINTS: { x: number; y: number; kind: 'fixed' | 'shortcut' | 'emergency' }[] = [
  { x: 108, y: 112, kind: 'fixed' },
  { x: 108, y: 224, kind: 'fixed' },
  { x: 150, y: 96, kind: 'fixed' },
  { x: 150, y: 220, kind: 'fixed' },
  { x: 192, y: 112, kind: 'fixed' },
  { x: 192, y: 224, kind: 'fixed' },
  { x: 228, y: 232, kind: 'shortcut' },
  { x: 228, y: 140, kind: 'emergency' },
];

function HandOutline() {
  return (
    <g fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="2">
      <rect x="112" y="325" width="96" height="72" rx="26" />
      <rect x="80" y="198" width="162" height="148" rx="46" />
      <rect x="92" y="100" width="33" height="148" rx="16.5" />
      <rect x="134" y="80" width="33" height="168" rx="16.5" />
      <rect x="176" y="100" width="33" height="148" rx="16.5" />
      <rect x="214" y="130" width="31" height="120" rx="15.5" />
      <rect x="80" y="193" width="31" height="104" rx="15.5" transform="rotate(-35 95 290)" />
    </g>
  );
}

export default function DesignEvolution() {
  return (
    <section
      id="evolution"
      aria-labelledby="evolution-heading"
      className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <Reveal>
          <h2 id="evolution-heading" className="text-3xl sm:text-4xl mb-3">
            How the design evolved
          </h2>
          <p className="text-muted-foreground max-w-[42rem] mb-12">
            The first concept could type. The current one can be trusted. Both hands below are
            real stages of this project.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Concept v1 */}
          <Reveal>
            <figure>
              <svg
                viewBox="0 0 300 400"
                role="img"
                aria-label="Concept v1: a hand mapped with fifteen contact points — a nine-key phone-keypad alphabet across the index, middle and ring knuckles, shift and language modifiers on the thumb, a delete cluster and two custom slots on the pinky, and a return tap on the palm."
                className="w-full max-w-sm h-auto text-foreground"
              >
                <HandOutline />
                {/* Palm space bar */}
                <rect x="102" y="244" width="135" height="16" rx="8" fill="currentColor" opacity="0.25" />
                <text x="169" y="256" textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.8" fontFamily="var(--font-mono)">
                  SPACE
                </text>
                {V1_POINTS.map((p, i) => (
                  <g key={i} className="point-pop" style={{ animationDelay: `${i * 0.05}s` }}>
                    <circle cx={p.x} cy={p.y} r="12" fill={p.tone} opacity="0.85" />
                    <text
                      x={p.x}
                      y={p.y + 2.5}
                      textAnchor="middle"
                      fontSize="7"
                      fill="var(--color-background)"
                      fontFamily="var(--font-mono)"
                      fontWeight="600"
                    >
                      {p.label}
                    </text>
                  </g>
                ))}
              </svg>
              <figcaption className="mt-3 text-sm text-muted-foreground max-w-[46ch]">
                <span className="font-mono-label text-foreground block mb-1">
                  Concept v1 · 2025 · superseded
                </span>
                Sixty-plus gestures on fifteen points: a full phone-keypad alphabet, thumb
                modifiers, a palm space bar. It typed English — and demanded pinpoint thumb
                accuracy on targets barely 8&nbsp;mm apart.
              </figcaption>
            </figure>
          </Reveal>

          {/* Current design */}
          <Reveal delay={0.12}>
            <figure>
              <svg
                viewBox="0 0 300 400"
                role="img"
                aria-label="Current design: the same hand with eight well-spaced contact points on the tips and bases of the four fingers, wearing the ring on the index finger."
                className="w-full max-w-sm h-auto text-foreground"
              >
                <HandOutline />
                <g stroke="var(--color-primary)" strokeWidth="5" fill="none">
                  <line x1="90" y1="196" x2="127" y2="196" />
                  <line x1="90" y1="206" x2="127" y2="206" />
                </g>
                {V2_POINTS.map((p, i) => (
                  <g key={i} className="point-pop" style={{ animationDelay: `${0.3 + i * 0.07}s` }}>
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
              <figcaption className="mt-3 text-sm text-muted-foreground max-w-[46ch]">
                <span className="font-mono-label text-foreground block mb-1">
                  Current design · 9 commands on 8 points
                </span>
                The capacity analysis found the knee: pushing past eight points adds almost no
                usable information while the worst command's accuracy collapses from 87% to
                roughly 50%. Typing moved out; trust moved in.
              </figcaption>
            </figure>
          </Reveal>
        </div>

        <p className="mt-10">
          <EvidenceStatus kind="simulation">Capacity analysis — Tactiq paper 1</EvidenceStatus>
        </p>
      </div>
    </section>
  );
}
