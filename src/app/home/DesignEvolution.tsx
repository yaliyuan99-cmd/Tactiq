/**
 * How the design evolved — the sixty-gesture keyboard hand (concept v1),
 * restored as a fully interactive archive, followed by the current
 * eight-point map (v2) and the capacity-analysis reason for the change.
 * Both are real stages of this project; the framing keeps them honest.
 */
import Reveal from './Reveal';
import EvidenceStatus from './EvidenceStatus';
import ConceptV1Demo from './ConceptV1Demo';

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
          <p className="text-muted-foreground max-w-[42rem] mb-2">
            The first concept could type. The current one can be trusted. Both are real stages
            of this project — and the first one still works, so try it.
          </p>
          <p className="font-mono-label text-muted-foreground mb-10">
            Concept v1 · 2025 · superseded — interactive archive
          </p>
        </Reveal>

        {/* The original sixty-gesture keyboard, fully interactive */}
        <Reveal>
          <ConceptV1Demo />
        </Reveal>

        {/* What changed, and why */}
        <div className="mt-16 grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
          <Reveal>
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
                  <g key={i} className="point-pop" style={{ animationDelay: `${0.2 + i * 0.07}s` }}>
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
              <figcaption className="mt-3 font-mono-label text-foreground">
                Current design · 9 commands on 8 points
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={0.12}>
            <h3 className="mb-3">Why the keyboard had to go</h3>
            <p className="text-muted-foreground mb-4 max-w-[52ch]">
              Sixty-plus gestures on fifteen points meant targets barely 8&nbsp;mm apart, multi-tap
              counting, and a delete cluster one mis-tap away from clearing a field. It typed
              English — and demanded pinpoint thumb accuracy all day.
            </p>
            <p className="text-muted-foreground mb-6 max-w-[52ch]">
              The capacity analysis found the knee: pushing past eight points adds almost no
              usable information while the worst command's accuracy collapses from 87% to
              roughly 50%. Typing moved out; trust moved in. Every current command is
              recoverable, and Undo has its own dedicated point.
            </p>
            <EvidenceStatus kind="simulation">Capacity analysis — Tactiq paper 1</EvidenceStatus>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
