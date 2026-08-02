/**
 * FAQ — native <details>/<summary> disclosures, so every answer opens without
 * JavaScript and expanded state is exposed to assistive tech by the platform.
 */

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'How does the ring know which point I tapped?',
    a: 'A passive magnet and three low-cost magnetometers in the ring localize the thumb using the inverse-cube law. In simulation that resolves position to about 1.65 mm at the array centre — against 20–25 mm between contact points. It all happens on-device: no camera, no microphone, no cloud round-trip. These are simulation results; the bench experiment (August–October 2026) measures real thumbs.',
  },
  {
    q: 'Do I need to look at my phone to use it?',
    a: 'No — that’s the whole point. Nine fixed commands on the fingers you can always feel drive VoiceOver or TalkBack, and a distinct haptic pattern confirms each one. An optional single earbud (one ear only — ambient sound is how blind users read the street) adds spoken detail when you want it.',
  },
  {
    q: 'What stops it firing in my pocket or mid-conversation?',
    a: 'The ring is idle until you deliberately squeeze the ring body, which opens a short command window. The pre-registered design target is at most one false activation per hour. Emergency is stricter still: a sustained 5-second hold on the pinky tip — never a tap count — so it cannot fire by accident.',
  },
  {
    q: 'Why only nine commands? Can it type?',
    a: 'Deliberately not. Our capacity analysis found a knee at eight contact points — going to sixteen adds only ~0.31 bits of information but collapses worst-command accuracy from 87% to roughly 50%. Text entry and any delete or clear-field gesture are excluded by design: every Tactiq command is recoverable, and Undo has its own dedicated point.',
  },
  {
    q: 'Does it replace VoiceOver or TalkBack?',
    a: 'Never — it augments them over Bluetooth. Your screen reader stays exactly as you configured it; Tactiq just gives its most-used actions a physical home on one hand, so the other hand is free for a cane or a guide-dog harness.',
  },
  {
    q: 'When does it ship and how much does it cost?',
    a: 'It doesn’t — yet. Tactiq is a student research project: the bench experiment runs August–October 2026, the AUSSEF submission is due 11 November 2026, and ISEF 2027 is the pathway after that. The bench prototype costs under $60 in parts, and the positioning aim is consumer-electronics pricing — there is deliberately no firm retail price to promise.',
  },
  {
    q: 'Is Tactiq only for blind or low-vision users?',
    a: 'Blind and low-vision users are who we design for first — one-handed, silent, eyes-free control is the core requirement. The same properties help older and motor-impaired users, and anyone whose eyes and hands are busy.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Tap detection runs on the ring itself, so your movements never leave your hand unless you choose to sync shortcut layouts. We collect the minimum needed to run your account, and never sell your data.',
  },
];

export default function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-3xl mx-auto">
        <h2 id="faq-heading" className="text-3xl sm:text-4xl mb-10">
          Questions people actually ask
        </h2>

        <div className="divide-y divide-border border-y border-border">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group py-1">
              <summary className="flex items-center justify-between gap-4 cursor-pointer list-none py-4 font-medium hover:text-primary-strong [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span aria-hidden className="text-muted-foreground text-xl leading-none group-open:hidden">+</span>
                <span aria-hidden className="text-muted-foreground text-xl leading-none hidden group-open:inline">−</span>
              </summary>
              <p className="pb-5 text-[0.95rem] text-muted-foreground max-w-[65ch]">{faq.a}</p>
            </details>
          ))}
        </div>

        <p className="text-muted-foreground mt-8 text-[0.95rem]">
          Something else?{' '}
          <a href="mailto:hello@tactiq.app" className="underline underline-offset-4 hover:text-primary-strong">
            Email the project
          </a>
          .
        </p>
      </div>
    </section>
  );
}
