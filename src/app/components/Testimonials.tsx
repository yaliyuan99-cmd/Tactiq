import { motion } from 'motion/react';
import { Quote } from 'lucide-react';

// Honesty rule: Tactiq has no product and no testers yet, so this section
// carries cited evidence instead of testimonials — same cards, real sources.
interface Testimonial {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      '91.3% of blind and low-vision screen-reader users rely on one on mobile — yet only 38% use braille output at all.',
    name: 'WebAIM',
    role: 'Screen Reader Survey #10',
    initials: 'WA',
  },
  {
    quote:
      'Going from eight contact points to sixteen adds about +0.31 bits of capacity — but collapses worst-command accuracy from 87% to roughly 50%.',
    name: 'Design study',
    role: 'Tactiq paper 1 · capacity analysis',
    initials: 'S1',
  },
  {
    quote:
      'Simulated magnet trilateration localizes the thumb to about 1.65 mm at the array centre — against 20–25 mm between contact points.',
    name: 'Physics study',
    role: 'Tactiq paper 2 · simulation',
    initials: 'S2',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl mb-4">What the evidence says</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No testers yet — the bench experiment comes first. These are the numbers the design stands on.
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
              className="relative bg-card rounded-2xl p-8 flex flex-col"
            >
              <Quote className="w-8 h-8 text-primary/40 mb-4" aria-hidden="true" />
              <blockquote className="text-foreground leading-relaxed flex-1">
                “{t.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-6">
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
          Sources: WebAIM Screen Reader Survey #10 (webaim.org) and Tactiq’s two pre-registered studies — papers available on request.
        </motion.p>
      </div>
    </section>
  );
}
