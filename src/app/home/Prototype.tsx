/**
 * Meet the prototype — an honest hardware section drawn like an industrial
 * design sheet: annotated parts, evidence-status labels on every claim, and
 * an *opt-in* 3D concept model (never auto-loaded, never auto-rotating).
 */
import { lazy, Suspense, useState } from 'react';
import { Link } from 'react-router';
import { Box } from 'lucide-react';
import EvidenceStatus from './EvidenceStatus';
import RingExploded2D from '../components/RingExploded2D';
import { RING_PARTS, type PartId } from '../components/ringParts';
import { cn } from '../../lib/utils';

const ProductViewer = lazy(() => import('../components/ProductViewer'));

const RING_MODEL = '/models/ring.glb';
const RING_POSTER = '/models/ring-poster.svg';

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

export default function Prototype() {
  const [show3d, setShow3d] = useState(false);
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<PartId | null>(null);
  const selectedPart = RING_PARTS.find((p) => p.id === selected) ?? null;

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
            {/* The assembly, alive: pull the slider and the concept opens
                into its parts. Selection is shared with the list beside it. */}
            <RingExploded2D
              explode={explode / 100}
              selected={selected}
              onSelect={setSelected}
              className="w-full max-h-[420px] h-auto select-none text-foreground"
            />
            <div className="mt-4">
              <div aria-hidden className="mb-1.5 flex justify-between font-mono-label text-muted-foreground">
                <span>ASSEMBLED</span>
                <span>EXPLODED</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={explode}
                onChange={(e) => setExplode(Number(e.target.value))}
                aria-label="Ring assembly. 0 is fully assembled, 100 is the full exploded engineering view."
                aria-valuetext={`${explode} percent exploded`}
                className="h-11 w-full cursor-ew-resize accent-[var(--primary)]"
              />
            </div>
            <div aria-live="polite" className="mt-2 min-h-12">
              {selectedPart ? (
                <p className="text-[0.95rem] text-muted-foreground">
                  <span className="font-mono-label text-primary-strong">{selectedPart.number}</span>{' '}
                  <span className="font-medium text-foreground">{selectedPart.label}.</span>{' '}
                  {selectedPart.fact}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Concept layout of the bench prototype — part positions are indicative, not
                  final. Select a part here or in the list.
                </p>
              )}
            </div>
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
            <ol className="border-y border-border divide-y divide-border mb-10">
              {RING_PARTS.map((part) => {
                const isSelected = selected === part.id;
                return (
                  <li key={part.id}>
                    <button
                      aria-expanded={isSelected}
                      onClick={() => setSelected(isSelected ? null : part.id)}
                      className={cn(
                        'w-full flex items-baseline gap-3.5 px-1.5 py-2.5 text-left transition-colors hover:bg-secondary/60',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <span className="font-mono-label text-muted-foreground shrink-0">{part.number}</span>
                      <span className={cn('text-[0.95rem]', isSelected && 'font-medium text-primary-strong')}>
                        {part.label}
                      </span>
                    </button>
                    {isSelected && (
                      <div className="px-1.5 pb-3.5 pl-11">
                        <p className="text-[0.95rem] text-muted-foreground max-w-[46ch]">{part.fact}</p>
                        <ul className="flex flex-wrap gap-1.5 mt-2">
                          {part.pills.map((pill) => (
                            <li
                              key={pill}
                              className="font-mono-label text-muted-foreground border border-border rounded px-1.5 py-0.5"
                            >
                              {pill}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              })}
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

            <div className="mt-8 border border-border rounded-lg p-5">
              <h3 className="mb-1.5">Try the whole loop yourself</h3>
              <p className="text-[0.95rem] text-muted-foreground mb-4">
                A free account opens the simulator — squeeze to wake, tap the eight points,
                drill the emergency hold — and a five-lesson training mode. All simulated, and
                labelled as such; no hardware exists yet.
              </p>
              <Link
                to="/signup?next=%2Fdashboard%2Fsimulator"
                className="inline-flex items-center h-11 px-5 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Open the simulator
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
