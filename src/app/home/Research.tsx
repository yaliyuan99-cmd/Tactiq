/**
 * Research and evidence — layered, not a wall of text.
 * Plain-language summary first; native <details> accordions for the technical
 * depth (they work without JavaScript and expose expanded state natively).
 * Findings look like research findings, not testimonial cards.
 */
import type { ReactNode } from 'react';
import EvidenceStatus from './EvidenceStatus';

const DETAILS: { summary: string; body: ReactNode }[] = [
  {
    summary: 'Why eight physical contact points, not more',
    body: (
      <>
        <p>
          The capacity analysis treats the hand as a channel: each extra contact point adds
          information but shrinks the landing zone a thumb has to hit. The analysis finds a knee
          at eight points — going to sixteen adds only about +0.31 bits of capacity while the
          worst command's accuracy collapses from 87% to roughly 50%.
        </p>
        <p className="mt-3">
          For context: Apple's AssistiveTouch ships 4 gestures, Meta's sEMG wristband handles
          roughly 9, and EFRing reached 89.5% accuracy on 9. Nine commands is where reliable sits.
        </p>
      </>
    ),
  },
  {
    summary: 'How magnetic localisation is expected to work',
    body: (
      <>
        <p>
          A passive magnet on the thumb creates a field that falls off with the cube of distance.
          Three magnetometers in the ring each read that field; solving the inverse problem gives
          the thumb's position. In simulation this resolves the thumb to about 1.65 mm at the
          array centre and about 4.4 mm off-centre — an order of magnitude finer than the
          20–25 mm spacing between contact points.
        </p>
        <p className="mt-3">
          The simulation assumes magnet tilt under ~12°, per-sensor gain calibration, and a
          minimum sensor standoff. Outside those conditions the error grows.
        </p>
      </>
    ),
  },
  {
    summary: 'What the bench experiment will test',
    body: (
      <p>
        The honest risk in the design is not sensor noise — it is thumb aim. The bench experiment
        (August–October 2026) therefore measures real thumbs first: per-contact accuracy across
        repeated prompted trials, false activations per hour of ordinary wear, and how quickly the
        squeeze-wake window feels natural. The protocol and targets were written down before the
        experiment, so results cannot quietly become claims.
      </p>
    ),
  },
  {
    summary: 'What remains uncertain',
    body: (
      <ul className="list-disc list-inside space-y-1.5">
        <li>Whether per-contact accuracy holds across different hand sizes and nail lengths.</li>
        <li>How often everyday movement squeezes the ring by accident.</li>
        <li>Battery life under realistic duty cycles — not yet measured.</li>
        <li>Comfort of all-day wear with the thumb magnet.</li>
      </ul>
    ),
  },
];

const SOURCES: { label: string; href?: string }[] = [
  { label: 'WebAIM Screen Reader Survey #10 (2024) — mobile screen-reader and braille usage', href: 'https://webaim.org/projects/screenreadersurvey10/' },
  { label: 'Ballati et al. (2018), "Hey Siri, do you understand me?" — voice assistants and dysarthric speech' },
  { label: 'Journal of Speech, Language, and Hearing Research (2024) — word error rates of unadapted ASR on disordered speech' },
  { label: 'Tactiq paper 1 — design principles and contact-point capacity analysis (available on request)' },
  { label: 'Tactiq paper 2 — magnet trilateration simulation (available on request)' },
];

export default function Research() {
  return (
    <section id="research" aria-labelledby="research-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <h2 id="research-heading" className="text-3xl sm:text-4xl mb-6">
          Why nine commands?
        </h2>

        <p className="text-lg mb-4">
          Because the evidence says fewer, better-spaced targets beat many crowded ones.
        </p>
        <p className="text-muted-foreground mb-4">
          91.3% of blind and low-vision screen-reader users rely on one on mobile, yet only 38%
          use braille output at all — and refreshable braille hardware runs from $799 to $15,500.
          Voice control is conditionally reliable: it fails in noise, broadcasts your business,
          and for atypical speech mainstream assistants have measured accuracy around 50–60%.
        </p>
        <p className="text-muted-foreground mb-10">
          Tactiq's answer is deliberately small: nine commands on eight contact points, driven by
          the screen reader you already use. Text entry is excluded on purpose, and every command
          is recoverable — Undo has its own dedicated point instead of any delete gesture.
        </p>

        <div className="divide-y divide-border border-y border-border mb-10">
          {DETAILS.map((d) => (
            <details key={d.summary} className="group py-1">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-3.5 font-medium hover:text-primary-strong [&::-webkit-details-marker]:hidden">
                {d.summary}
                <span aria-hidden className="text-muted-foreground text-xl leading-none group-open:hidden">+</span>
                <span aria-hidden className="text-muted-foreground text-xl leading-none hidden group-open:inline">−</span>
              </summary>
              <div className="pb-5 text-[0.95rem] text-muted-foreground max-w-[65ch]">{d.body}</div>
            </details>
          ))}
        </div>

        <h3 className="mb-3">Sources</h3>
        <ul className="space-y-2 mb-8">
          {SOURCES.map((s) => (
            <li key={s.label} className="text-sm text-muted-foreground">
              {s.href ? (
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-primary-strong">
                  {s.label}
                </a>
              ) : (
                s.label
              )}
            </li>
          ))}
        </ul>

        <p className="flex items-start gap-2">
          <EvidenceStatus kind="target" />
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          All ring performance figures on this site are pre-registered targets or simulation
          results, not achieved results. The bench experiment is what turns them into data.
        </p>
      </div>
    </section>
  );
}
