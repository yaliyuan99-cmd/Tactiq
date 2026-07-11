import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, HelpCircle } from 'lucide-react';

interface Faq {
  q: string;
  a: string;
}

const FAQS: Faq[] = [
  {
    q: 'How do the rings know which gesture I’m making?',
    a: 'Each ring packs a 9-axis motion sensor (gyroscope + accelerometer) that tracks tap pressure and knuckle flex across all ten fingers. On-device software translates those movements into phone commands in real time — no camera, no cloud round-trip.',
  },
  {
    q: 'Do I need to look at my phone to use it?',
    a: 'No. That’s the whole point. Every gesture maps to muscle memory, so you can type, send messages, control media, and trigger shortcuts entirely without a screen or your voice. Haptic feedback confirms each action.',
  },
  {
    q: 'Is Tactiq only for blind or low-vision users?',
    a: 'Blind and low-vision users are who we design for first, but Tactiq works for anyone — elderly and motor-impaired users, commuters, athletes, and anyone who wants eyes-free phone control. It’s a performance device that happens to be life-changing.',
  },
  {
    q: 'How long does the battery last?',
    a: 'A full week of everyday gesture control on a single charge. The titanium shell is water-resistant, so you can wear the rings in the shower or the rain without taking them off to charge.',
  },
  {
    q: 'Which phones are supported?',
    a: 'Both iOS and Android, over Bluetooth 5.3 LE. The companion app handles voice-guided setup and lets you customise every gesture profile.',
  },
  {
    q: 'When does it ship and how much does it cost?',
    a: 'Tactiq Essential is $249 AUD and Tactiq Pro is $349 AUD — priced as consumer electronics, not medical equipment. We launch Q3 2026, and the first 500 customers get 20% off. Reserve now and you won’t be charged until your rings ship.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Gesture detection runs on the rings themselves, so your movements never leave your hand unless you choose to sync layouts. We collect the minimum needed to run your account, and never sell your data.',
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
                className="bg-card border border-border rounded-2xl overflow-hidden"
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
