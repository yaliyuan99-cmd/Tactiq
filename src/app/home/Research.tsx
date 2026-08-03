/**
 * Research and evidence — layered, not a wall of text.
 * Plain-language summary first; native <details> accordions for the technical
 * depth (they work without JavaScript and expose expanded state natively).
 * Findings look like research findings, not testimonial cards.
 */
import type { ReactNode } from 'react';

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
          For context: Apple's AssistiveTouch ships 4 gestures. EFRing reached 89.5%
          within-user accuracy on 9. Meta's sEMG wristband exceeds 90% on 9 gestures for
          unseen users — but was trained on thousands of participants, a scale no student
          project can match, so it sets the ceiling rather than the benchmark. Nine commands
          is where reliable sits.
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
          Constrain the geometry so the magnet stands vertical and every sensor sits in its
          equatorial plane, and the field's dependence on orientation collapses to exactly one —
          three plain magnitude readings then replace a full nine-component vector fit. That
          single mechanical constraint is why the method works; without it, field strength varies
          twofold with orientation alone.
        </p>
        <p className="mt-3">
          At the scale of a hand, simulation puts the worst contact point at 1.7 mm from sensor
          noise alone — comfortably inside the 11 mm decision radius around each point. Sensor
          noise, in other words, is not the problem. The estimator also sits at the
          Cramér–Rao bound, meaning no better estimator exists for this geometry: the three
          magnitude readings carry all the information the vector fit would.
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
      <>
        <p>
          The honest risk in the design is not sensor noise — it is thumb aim, and it decides
          everything. Model a worn ring with 4 mm of thumb-placement scatter and the worst
          contact point drops to <strong>86% accuracy against a 95% criterion</strong>. At 3 mm
          of scatter every contact clears 95%; at 5 mm the grid needs redesigning, not the
          physics. <strong>Thumb-placement scatter has never been measured.</strong> That single
          unmeasured number is the difference between a design that works and one that does not.
        </p>
        <p className="mt-3">
          The bench experiment (August–October 2026) therefore measures real thumbs first:
          thumb-placement scatter at felt landmarks, per-contact accuracy over 200 prompted taps
          per contact, false activations across at least three hours of ordinary wear, and how
          quickly the squeeze-wake window feels natural. The protocol, the sample sizes and the
          pass thresholds were all written down before the experiment, so results cannot quietly
          become claims — and a failed criterion will be reported as a failed criterion.
        </p>
      </>
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
  { label: 'Study of five commercial speech-recognition systems — racial disparity in word error rate (0.35 vs 0.19)' },
  { label: 'Tactiq paper 1 — design principles and contact-point capacity analysis' },
  { label: 'Tactiq paper 2 — magnet trilateration simulation' },
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
          use braille output at all — and refreshable braille hardware runs from US$799 to
          US$15,500, with mainstream 20–40 cell displays clustering at US$2,000–3,800.
        </p>
        <p className="text-muted-foreground mb-4">
          Voice control is conditionally reliable, and it fails in three separate ways. It fails
          in noise and broadcasts your business to the room. It carries measured demographic
          disparity: one study of five commercial systems found a word error rate of 0.35 for
          Black speakers against 0.19 for white speakers. And on dysarthric speech, mainstream
          assistants land around 50–60% accuracy, while unadapted state-of-the-art recognisers
          were still at roughly 50% word error rate on read disordered speech in 2024 — and
          about 71% conversationally.
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
        <ul className="space-y-2 mb-4">
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
        <p className="text-sm text-muted-foreground mb-8">
          The two Tactiq papers are being prepared for submission and are not published yet.
          To read a draft, email{' '}
          <a href="mailto:hello@tactiq.app" className="underline underline-offset-4 hover:text-primary-strong">
            hello@tactiq.app
          </a>
          .
        </p>

        <h3 className="mb-3">How to read the labels on this site</h3>
        <p className="text-sm text-muted-foreground mb-8 max-w-[65ch]">
          <strong>No figure on this site has been physically measured yet</strong> — nothing has
          reached <em>measured</em> status, because the bench rig is still being built. What we
          do have is real: <em>simulation results</em> are completed, reproducible computations
          from five seeded scripts, independently re-implemented from scratch as a check.{' '}
          <em>Design targets</em> are acceptance thresholds fixed in advance, so they cannot be
          moved to fit whatever the experiment returns. <em>Design intent</em> describes the
          system as specified — no wearable ring exists, so anything about haptics, wear or
          screen-reader integration is intent, not behaviour.
        </p>
      </div>
    </section>
  );
}
