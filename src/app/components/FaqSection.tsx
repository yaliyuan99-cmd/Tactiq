import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, HelpCircle } from 'lucide-react';

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
    a: 'It doesn’t — yet. Tactiq is a student research project: the bench experiment runs August–October 2026, the AUSSEF submission is due 11 November 2026, and ISEF 2027 is the pathway after that. The bench prototype costs under $60 in parts, and the positioning commitment is “priced like earbuds” — there is deliberately no firm retail price to promise.',
  },
  {
    q: 'Is Tactiq only for blind or low-vision users?',
    a: 'Blind and low-vision users are who we design for first — one-handed, silent, eyes-free control is the core requirement. The same properties help elderly and motor-impaired users, and anyone whose eyes and hands are busy.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Tap detection runs on the ring itself, so your movements never leave your hand unless you choose to sync shortcut layouts. We collect the minimum needed to run your account, and never sell your data.',
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <HelpCircle className="w-4 h-4" />
            Questions & answers
          </div>
          <h2 className="text-3xl sm:text-4xl mb-4">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about how Tactiq works.
          </p>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-2xl overflow-hidden"
              >
                <h3>
                  <button
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-secondary/40 transition-colors"
                  >
                    <span className="font-medium">{faq.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex-shrink-0 text-primary"
                    >
                      <Plus className="w-5 h-5" />
                    </motion.span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-muted-foreground mt-10"
        >
          Still have a question?{' '}
          <a href="mailto:hello@tactiq.app" className="text-primary hover:underline">
            Email our team
          </a>
        </motion.p>
      </div>
    </section>
  );
}
