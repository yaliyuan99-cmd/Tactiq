import { motion } from 'motion/react';
import { Quote, Star } from 'lucide-react';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
  tint: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      'For the first time I can fire off a text while walking with my cane in the other hand. No screen, no voice in a quiet train — it just works.',
    name: 'Maya R.',
    role: 'Beta tester · screen-reader user',
    initials: 'MR',
    tint: 'from-primary/20 to-primary/5',
  },
  {
    quote:
      'My mum struggles with touchscreens, but tapping her own fingers is something she never has to think about. This is the first tech I’ve seen her actually enjoy.',
    name: 'David K.',
    role: 'Early-access family',
    initials: 'DK',
    tint: 'from-chart-1/20 to-chart-1/5',
  },
  {
    quote:
      'I map shortcuts to gestures and run my whole workout playlist without pulling my phone out. It feels like a superpower hiding in plain sight.',
    name: 'Priya S.',
    role: 'Beta tester · runner',
    initials: 'PS',
    tint: 'from-chart-2/20 to-chart-2/5',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-accent/15 to-transparent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl mb-4">From our early testers</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We put prototypes in real hands long before launch. Here’s what they told us.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-gradient-to-br ${t.tint} backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-lg flex flex-col`}
            >
              <Quote className="w-8 h-8 text-primary/40 mb-4" aria-hidden="true" />
              <blockquote className="text-foreground leading-relaxed flex-1">
                “{t.quote}”
              </blockquote>
              <div
                className="flex gap-0.5 mt-6 mb-4"
                aria-label="Rated 5 out of 5"
              >
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className="w-4 h-4 text-chart-2 fill-chart-2"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <figcaption className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary flex items-center justify-center text-sm font-semibold">
                  {t.initials}
                </div>
                <div>
                  <div className="font-medium leading-tight">{t.name}</div>
                  <div className="text-sm text-muted-foreground">{t.role}</div>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Quotes from our pre-launch testing programme. Names shortened for privacy.
        </motion.p>
      </div>
    </section>
  );
}
