/**
 * How it works — one continuous physical sequence, not five floating cards.
 * Horizontal on desktop with a connecting line; vertical on mobile.
 * The haptic pulse on the last step is decorative reinforcement only and is
 * removed entirely under prefers-reduced-motion (theme.css global rule).
 */

const STEPS: { verb: string; body: string }[] = [
  { verb: 'Squeeze', body: 'A deliberate squeeze of the ring body wakes it and opens a short command window.' },
  { verb: 'Tap', body: 'Your thumb taps one of eight contact points on the tips and bases of your fingers.' },
  { verb: 'Detect', body: 'The ring senses which point was touched, on-device — no camera, no microphone.' },
  { verb: 'Act', body: 'Your phone runs the command through VoiceOver or TalkBack over Bluetooth.' },
  { verb: 'Confirm', body: 'A distinct vibration pattern tells your hand which command the ring heard.' },
];

export default function Sequence() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-heading"
      className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <h2 id="how-heading" className="text-3xl sm:text-4xl mb-3">
          How it works
        </h2>
        <p className="text-muted-foreground max-w-[42rem] mb-12">
          One continuous movement of the hand, from intention to confirmation.
          The design target is at most one false activation per hour — the squeeze
          is what stops taps from firing accidentally.
        </p>

        <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6 list-none">
          {/* Connecting path: vertical rule on mobile, horizontal on desktop */}
          <div
            aria-hidden
            className="absolute left-[1.05rem] top-2 bottom-2 w-px bg-border md:left-0 md:right-0 md:top-[1.05rem] md:bottom-auto md:w-auto md:h-px"
          />
          {STEPS.map((step, i) => (
            <li key={step.verb} className="relative pl-12 md:pl-0 md:pt-12">
              <span
                className={`absolute left-0 top-0 md:top-0 md:left-0 w-[2.1rem] h-[2.1rem] rounded-full flex items-center justify-center text-sm font-semibold tabular-nums ${
                  i === STEPS.length - 1
                    ? 'bg-primary text-primary-foreground haptic-pulse'
                    : 'bg-foreground text-background'
                }`}
              >
                {i + 1}
              </span>
              <h3 className="mb-1.5">{step.verb}</h3>
              <p className="text-muted-foreground text-[0.95rem]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
