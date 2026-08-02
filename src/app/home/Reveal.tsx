/**
 * Scroll reveal that can never hide content: it animates transform only, so
 * with JavaScript missing, reduced motion on, or the animation frozen, the
 * element is always fully visible — motion only slides it into place.
 */
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: 18 }}
      whileInView={{ y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
