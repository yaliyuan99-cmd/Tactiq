/**
 * Everyday use — three recognisable situations, told plainly.
 * Small line illustrations, short headings, two sentences at most.
 * This section answers: "When would someone actually use this?"
 */
import type { ReactNode } from 'react';

function CaneFigure() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="w-16 h-16 text-foreground/70">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="34" cy="14" r="7" />
        <path d="M34 22 L34 46 M34 30 L20 42 M34 30 L50 38 M34 46 L26 68 M34 46 L44 66" />
        <path d="M50 38 L62 64" strokeDasharray="3 3" />
        <path d="M56 64 L68 64" />
      </g>
    </svg>
  );
}

function PhoneRingFigure() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="w-16 h-16 text-foreground/70">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <rect x="28" y="18" width="24" height="42" rx="4" />
        <path d="M18 26 C14 34 14 44 18 52" />
        <path d="M62 26 C66 34 66 44 62 52" />
        <path d="M36 68 h8" stroke="var(--color-primary)" strokeWidth="4" />
      </g>
    </svg>
  );
}

function QuietBrowseFigure() {
  return (
    <svg viewBox="0 0 80 80" aria-hidden className="w-16 h-16 text-foreground/70">
      <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M20 58 C20 44 28 40 40 40 C52 40 60 44 60 58" />
        <circle cx="40" cy="26" r="10" />
        <path d="M64 22 l6 -6 M66 32 l8 -2 M60 14 l3 -8" stroke="var(--color-primary)" />
      </g>
    </svg>
  );
}

const SCENARIOS: { figure: ReactNode; heading: string; body: string }[] = [
  {
    figure: <CaneFigure />,
    heading: 'One hand is already busy',
    body: 'A cane or a guide-dog harness occupies one hand outdoors. Tactiq puts every command on the free hand, so nothing has to be put down.',
  },
  {
    figure: <PhoneRingFigure />,
    heading: 'A call in a loud place',
    body: 'On a train platform, voice control fails and a touchscreen demands attention. A tap on the index finger answers the call; a tap below it declines.',
  },
  {
    figure: <QuietBrowseFigure />,
    heading: 'Moving through a screen reader, silently',
    body: 'Next, previous, read again, confirm — the four moves screen-reader users repeat hundreds of times a day, without speaking aloud or finding a spot on glass.',
  },
];

export default function Scenarios() {
  return (
    <section aria-labelledby="everyday-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <h2 id="everyday-heading" className="text-3xl sm:text-4xl mb-3">
          Where it fits in a day
        </h2>
        <p className="text-muted-foreground max-w-[42rem] mb-12">
          Not a new way to live — a quieter way to do the small things a phone already does.
        </p>

        <div className="grid sm:grid-cols-3 gap-x-10 gap-y-10">
          {SCENARIOS.map((s) => (
            <div key={s.heading} className="max-w-[24rem]">
              {s.figure}
              <h3 className="mt-4 mb-2">{s.heading}</h3>
              <p className="text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
