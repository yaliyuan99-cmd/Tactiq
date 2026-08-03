/**
 * Meet the prototype — an honest hardware section drawn like an industrial
 * design sheet: annotated parts, evidence-status labels on every claim, and
 * an *opt-in* 3D concept model (never auto-loaded, never auto-rotating).
 */
import { lazy, Suspense, useState } from 'react';
import { Box } from 'lucide-react';
import EvidenceStatus from './EvidenceStatus';

const ProductViewer = lazy(() => import('../components/ProductViewer'));

const RING_MODEL = '/models/ring.glb';
const RING_POSTER = '/models/ring-poster.svg';

/* Every note below describes the design as specified. No wearable ring has been
   built, so nothing here is a description of an object that exists. */
const PARTS: { n: number; name: string; note: string }[] = [
  { n: 1, name: 'Ring shell', note: '3D-printed for the bench rig; soft-touch polymer is the long-term aim.' },
  { n: 2, name: 'Three magnetometers', note: 'Low-cost sensors spaced around the band, to localise the thumb magnet.' },
  { n: 3, name: 'Squeeze input', note: 'Specified so that a deliberate squeeze of the band would wake the ring and open the command window.' },
  { n: 4, name: 'Haptic motor', note: 'Intended to play a distinct confirmation pattern per command. No haptic hardware has been built or measured.' },
  { n: 5, name: 'Bluetooth LE module', note: 'Intended to carry command tokens to VoiceOver or TalkBack on the paired phone. Not implemented.' },
  { n: 6, name: 'Passive thumb magnet', note: 'Worn flat on the thumb. It has no battery and emits nothing — it is only a magnet.' },
];

const CLAIMS: { text: string; kind: 'confirmed' | 'simulation' | 'target' | 'future'; label?: string }[] = [
  { text: 'No wearable ring exists. The parts above describe the design as specified; the bench rig is the only hardware, and its parts list was finalised 28 July 2026', kind: 'future', label: 'Design intent — not built' },
  { text: 'Bench-rig components ≈A$40 planned, against a ≤A$60 design criterion. Receipts pending', kind: 'target', label: 'Design target — receipts pending' },
  { text: 'At the hand scale, sensor noise alone localises the worst contact point to 1.7 mm — well inside the 11 mm decision radius around each point', kind: 'simulation' },
  { text: 'Under modelled worn conditions (4 mm thumb-placement scatter, 2 mm ring shift) worst-contact accuracy falls to 86%, against a 95% criterion. Thumb-placement scatter has never been measured — that is what the bench experiment is for', kind: 'simulation', label: 'Simulation result — the governing risk' },
  { text: 'At least 95% per-contact accuracy', kind: 'target' },
  { text: 'At most one false activation per hour', kind: 'target' },
  { text: 'Physical dimensions and weight', kind: 'future', label: 'Not yet measured' },
  { text: 'Bench experiment with real thumbs, August–October 2026', kind: 'future', label: 'Planned bench test' },
];

function RingDiagram() {
  return (
    <figure>
      <svg
        viewBox="0 0 360 300"
        role="img"
        aria-label="Technical diagram of the ring prototype: a cross-section of the band showing three magnetometers spaced around it, the squeeze zone, the haptic motor and the Bluetooth module, with the passive magnet drawn separately on the thumb."
        className="w-full h-auto text-foreground"
      >
        {/* Band cross-section */}
        <g fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="150" cy="150" r="95" />
          <circle cx="150" cy="150" r="68" />
        </g>
        {/* Magnetometers (2) at 120° spacing */}
        {[90, 210, 330].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 150 + Math.cos(rad) * 81.5;
          const y = 150 + Math.sin(rad) * 81.5;
          return <rect key={deg} x={x - 7} y={y - 7} width="14" height="14" fill="var(--color-status-simulation)" transform={`rotate(${deg + 90} ${x} ${y})`} />;
        })}
        {/* Squeeze zone (3) */}
        <path d="M 62 120 A 95 95 0 0 1 92 74" fill="none" stroke="var(--color-primary)" strokeWidth="8" strokeLinecap="round" />
        {/* Haptic motor (4) */}
        <circle cx="205" cy="215" r="11" fill="currentColor" />
        {/* BLE module (5) */}
        <rect x="130" y="52" width="40" height="14" rx="3" fill="currentColor" opacity="0.75" />
        {/* Thumb + passive magnet (6) */}
        <g transform="translate(285 60)">
          <rect x="0" y="0" width="44" height="140" rx="22" fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" />
          <rect x="12" y="24" width="20" height="10" rx="2" fill="var(--color-primary)" />
        </g>
        {/* Callout numbers */}
        <g className="font-mono-label" fill="currentColor" fontSize="12">
          <text x="42" y="160">1</text>
          <text x="240" y="155">2</text>
          <text x="58" y="80">3</text>
          <text x="222" y="240">4</text>
          <text x="145" y="42">5</text>
          <text x="300" y="48">6</text>
        </g>
        {/* Leader lines */}
        <g stroke="currentColor" strokeOpacity="0.35" strokeWidth="1">
          <line x1="50" y1="155" x2="66" y2="152" />
          <line x1="238" y1="150" x2="228" y2="150" />
          <line x1="66" y1="84" x2="76" y2="92" />
          <line x1="218" y1="232" x2="211" y2="223" />
          <line x1="150" y1="46" x2="150" y2="52" />
        </g>
      </svg>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        Concept drawing of the bench prototype's layout — part positions are indicative, not final.
      </figcaption>
    </figure>
  );
}

export default function Prototype() {
  const [show3d, setShow3d] = useState(false);

  return (
    <section id="the-ring" aria-labelledby="proto-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <h2 id="proto-heading" className="text-3xl sm:text-4xl mb-3">
          Meet the prototype
        </h2>
        <p className="text-muted-foreground max-w-[42rem] mb-12">
          Everything below is labelled the way a lab notebook would label it: what is
          measured, what is simulated, what is a target, and what is still a plan.
        </p>

        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <RingDiagram />
            <div className="mt-6">
              {show3d ? (
                <div>
                  <div className="relative rounded-lg overflow-hidden bg-card aspect-square max-w-sm">
                    <Suspense
                      fallback={
                        <img src={RING_POSTER} alt="Static concept image of the Tactiq smart ring" className="w-full h-full object-contain" />
                      }
                    >
                      <ProductViewer
                        src={RING_MODEL}
                        poster={RING_POSTER}
                        alt="Interactive 3D concept model of the Tactiq smart ring. Drag or use arrow keys to rotate."
                        cameraControls
                        exposure={1.1}
                        className="w-full h-full"
                      >
                        <img src={RING_POSTER} alt="Static concept image of the Tactiq smart ring" className="w-full h-full object-contain" />
                      </ProductViewer>
                    </Suspense>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Concept model — not a finished production device. Drag with a pointer or
                    focus the model and use arrow keys to rotate; it never rotates on its own.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => setShow3d(true)}
                  className="inline-flex items-center gap-2 h-11 px-4 border border-border rounded-md text-[0.95rem] hover:bg-secondary transition-colors"
                >
                  <Box className="w-4 h-4" aria-hidden />
                  Load the interactive 3D concept model
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="mb-4">Parts</h3>
            <ol className="space-y-3 mb-10">
              {PARTS.map((p) => (
                <li key={p.n} className="flex gap-3">
                  <span aria-hidden className="font-mono-label text-muted-foreground w-5 shrink-0 pt-0.5">
                    {p.n}
                  </span>
                  <p className="text-[0.95rem]">
                    <span className="font-medium">{p.name}.</span>{' '}
                    <span className="text-muted-foreground">{p.note}</span>
                  </p>
                </li>
              ))}
            </ol>

            <h3 className="mb-4">What we claim, and how sure we are</h3>
            <ul className="space-y-3">
              {CLAIMS.map((c) => (
                <li key={c.text} className="flex flex-col gap-0.5">
                  <EvidenceStatus kind={c.kind}>{c.label}</EvidenceStatus>
                  <p className="text-[0.95rem] text-muted-foreground">{c.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
