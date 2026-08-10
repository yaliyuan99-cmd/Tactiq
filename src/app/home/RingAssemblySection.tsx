/**
 * Inside the ring — the public hardware-inspection section on /project.
 *
 * Two instruments, one shared selection:
 *  - The 3D demo: the assembled concept to drag, rotate, and click. three.js
 *    loads lazily when the section scrolls into view; without WebGL the
 *    section simply doesn't render the canvas — nothing is lost but the
 *    rotation.
 *  - The assembly animation: strictly 2D — the slider opens the vertical
 *    exploded engineering sheet, which prerenders with the page and works
 *    everywhere.
 * Selecting a part anywhere (3D ring, 2D sheet, numbered list) highlights
 * it in all three. The list is the keyboard and screen-reader surface.
 */
import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import EvidenceStatus from './EvidenceStatus';
import RingExploded2D from '../components/RingExploded2D';
import { RING_PARTS, type PartId } from '../ring3d/ringParts';
import { cn } from '../../lib/utils';

const RingScene = lazy(() => import('../ring3d/RingScene'));

/** If the 3D canvas throws (lost context, odd driver), drop it quietly —
 * the 2D assembly below carries the whole story on its own. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function RingAssemblySection() {
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<PartId | null>(null);
  const [mounted, setMounted] = useState(false);
  const [inView, setInView] = useState(false);
  const [webgl, setWebgl] = useState(true);
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement('canvas');
      setWebgl(!!(canvas.getContext('webgl2') || canvas.getContext('webgl')));
    } catch {
      setWebgl(false);
    }
  }, []);

  // Fetch three.js only when the visitor actually reaches this section.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || !mounted) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  const selectedPart = RING_PARTS.find((p) => p.id === selected) ?? null;
  const show3d = mounted && inView && webgl;

  return (
    <section
      ref={sectionRef}
      id="ring-assembly"
      aria-labelledby="ring-assembly-h"
      className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
          <h2 id="ring-assembly-h" className="text-3xl sm:text-4xl">
            Inside the ring
          </h2>
          <EvidenceStatus kind="simulation">Stylised engineering view</EvidenceStatus>
        </div>
        <p className="text-muted-foreground max-w-[42rem] mb-10">
          Meet the concept in 3D, then pull the slider to open it into its parts — shell,
          sensing ring, three magnetometers, squeeze sensor, haptic motor, radio. No
          wearable ring has been built yet; this is the design as specified, drawn to be
          handled.
        </p>

        {/* ------------------------------------------------ the 3D demo --- */}
        {show3d && (
          <SceneBoundary>
            <Suspense fallback={<div className="mx-auto aspect-square w-full max-w-md" aria-hidden />}>
              <div className="mx-auto aspect-square w-full max-w-md">
                <RingScene
                  explode={0}
                  selected={selected}
                  onSelect={setSelected}
                  reducedMotion={reducedMotion}
                  zoom={3.4}
                />
              </div>
              <p aria-hidden className="mt-1 mb-10 text-center font-mono-label text-muted-foreground">
                Drag to rotate · click a part to inspect it
              </p>
            </Suspense>
          </SceneBoundary>
        )}

        {/* -------------------------------- the 2D assembly + component list */}
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <RingExploded2D
              explode={explode / 100}
              selected={selected}
              onSelect={setSelected}
              className="w-full max-h-[430px] h-auto select-none text-foreground"
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

            {/* Selected part readout under the drawing */}
            <div aria-live="polite" className="mt-3 min-h-14">
              {selectedPart && (
                <p className="text-[0.95rem] text-muted-foreground">
                  <span className="font-mono-label text-primary-strong">{selectedPart.number}</span>{' '}
                  <span className="font-medium text-foreground">{selectedPart.label}.</span>{' '}
                  {selectedPart.fact}
                </p>
              )}
            </div>
          </div>

          <div>
            <ol className="border-y border-border divide-y divide-border">
              {RING_PARTS.map((part) => {
                const isSelected = selected === part.id;
                return (
                  <li key={part.id}>
                    <button
                      aria-expanded={isSelected}
                      onClick={() => setSelected(isSelected ? null : part.id)}
                      className={cn(
                        'w-full flex items-baseline gap-3.5 px-1.5 py-3 text-left transition-colors hover:bg-secondary/60',
                        isSelected && 'bg-primary/5',
                      )}
                    >
                      <span className="font-mono-label text-muted-foreground shrink-0">{part.number}</span>
                      <span className={cn('text-[0.95rem]', isSelected && 'font-medium text-primary-strong')}>
                        {part.label}
                      </span>
                    </button>
                    {isSelected && (
                      <div className="px-1.5 pb-4 pl-11">
                        <p className="text-[0.95rem] text-muted-foreground max-w-[46ch]">{part.fact}</p>
                        <ul className="flex flex-wrap gap-1.5 mt-2.5">
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
            <p className="text-sm text-muted-foreground mt-4 max-w-[48ch]">
              The shell lifts away first, then the sensing ring, then the electronics — and
              the passive thumb magnet appears last, because it never lives inside the ring
              at all.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
