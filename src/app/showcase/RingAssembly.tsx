/**
 * "Inside the ring" — the interactive exploded-assembly experience, on the
 * public front page. Same digital twin as the dashboard (one part list, one
 * drawing), dressed in the showcase's light violet-paper language.
 *
 * The drawing is a 2D SVG engineering elevation — no WebGL, no heavy
 * chunks: it prerenders with the page and animates with CSS transitions
 * that the global reduced-motion kill switch disables wholesale.
 */
import { useState } from 'react';
import { FadeIn } from './components';
import RingExploded2D from '../components/RingExploded2D';
import { RING_PARTS, type PartId } from '../ring3d/ringParts';

export default function RingAssembly() {
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<PartId | null>(null);

  const selectedPart = RING_PARTS.find((p) => p.id === selected) ?? null;

  return (
    <section
      id="t-ring"
      aria-labelledby="t-ring-h"
      className="bg-[#f4f2fb] px-6 pb-24 pt-4 text-[#14122a] sm:pb-28 md:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <FadeIn y={30}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--t-violet-deep)]">
            Inside the ring
          </p>
          <h2
            id="t-ring-h"
            className="t-heavy mt-4 font-black uppercase leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
          >
            Pull it apart
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#4a4668] sm:text-lg">
            Drag the slider and the concept opens into its parts — shell, sensing ring,
            three magnetometers, squeeze sensor, haptic motor, radio. A stylised
            engineering view: no wearable ring has been built yet.
          </p>
        </FadeIn>

        <div className="mt-12 grid items-start gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          {/* ----------------------------------------------- drawing + slider */}
          <FadeIn y={24}>
            <RingExploded2D
              explode={explode / 100}
              selected={selected}
              onSelect={setSelected}
              accent="var(--t-violet-deep)"
              className="w-full max-h-[430px] h-auto select-none text-[#14122a]"
            />
            <p aria-hidden className="mt-1 text-center font-mono text-xs tracking-wide text-[#4a4668]">
              Tap a part to inspect it
            </p>

            <div className="mt-6">
              <div aria-hidden className="mb-1.5 flex justify-between font-mono text-xs tracking-wide text-[#4a4668]">
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
                className="h-11 w-full cursor-ew-resize accent-[var(--t-violet-deep)]"
              />
            </div>

            {/* Selected part readout under the drawing */}
            <div aria-live="polite" className="mt-3 min-h-14">
              {selectedPart && (
                <p className="text-[0.95rem] leading-relaxed text-[#4a4668]">
                  <span className="font-mono text-xs tracking-wide text-[var(--t-violet-deep)]">
                    {selectedPart.number}
                  </span>{' '}
                  <span className="font-semibold text-[#14122a]">{selectedPart.label}.</span>{' '}
                  {selectedPart.fact}
                </p>
              )}
            </div>
          </FadeIn>

          {/* ---------------------------------------------- component list */}
          <FadeIn y={24} delay={0.08}>
            <ol className="border-y border-[rgba(20,18,42,0.14)]">
              {RING_PARTS.map((part) => {
                const isSelected = selected === part.id;
                return (
                  <li key={part.id} className="border-b border-[rgba(20,18,42,0.14)] last:border-b-0">
                    <button
                      aria-expanded={isSelected}
                      onClick={() => setSelected(isSelected ? null : part.id)}
                      className={`flex w-full items-baseline gap-4 px-1.5 py-3 text-left transition-colors hover:bg-[rgba(20,18,42,0.04)] ${
                        isSelected ? 'bg-[rgba(93,74,226,0.07)]' : ''
                      }`}
                    >
                      <span className="shrink-0 font-mono text-xs tracking-wide text-[#4a4668]">
                        {part.number}
                      </span>
                      <span
                        className={`text-[0.95rem] ${
                          isSelected ? 'font-semibold text-[var(--t-violet-deep)]' : ''
                        }`}
                      >
                        {part.label}
                      </span>
                    </button>
                    {isSelected && (
                      <div className="px-1.5 pb-4 pl-12">
                        <p className="max-w-[46ch] text-[0.92rem] leading-relaxed text-[#4a4668]">
                          {part.fact}
                        </p>
                        <ul className="mt-2.5 flex flex-wrap gap-1.5">
                          {part.pills.map((pill) => (
                            <li
                              key={pill}
                              className="rounded border border-[rgba(20,18,42,0.18)] px-1.5 py-0.5 font-mono text-[0.68rem] tracking-wide text-[#4a4668]"
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
            <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-[#4a4668]">
              The shell lifts away first, then the sensing ring, then the electronics — and
              the passive thumb magnet appears last, because it never lives inside the ring
              at all.
            </p>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
