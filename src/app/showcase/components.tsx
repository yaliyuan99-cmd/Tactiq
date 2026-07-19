import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

/* ---------------------------------------------------------------------------
 * Reusable building blocks shared by the Jack "3D Creator" portfolio sections.
 * All are scoped visually by their parent `.jack-scope` wrapper.
 * ------------------------------------------------------------------------- */

const EASE = [0.25, 0.1, 0.25, 1] as const;

interface FadeInProps {
  children: ReactNode;
  /** Element tag to render (motion.create memoised so it never remounts). */
  as?: ElementType;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}

/** Scroll-into-view entrance: fades + slides from (x, y) once on first view. */
export function FadeIn({
  children,
  as = 'div',
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className,
  style,
}: FadeInProps) {
  // motion.create() builds a motion component for an arbitrary tag; memoise so
  // changing unrelated props doesn't remount (which would replay the anim).
  const Motion = useMemo(() => motion.create(as), [as]);
  return (
    <Motion
      className={className}
      style={style}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '50px', amount: 0 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </Motion>
  );
}

interface MagnetProps {
  children: ReactNode;
  /** Distance (px) from the element edge at which the magnet engages. */
  padding?: number;
  /** Higher = weaker pull (offset is divided by this). */
  strength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  className?: string;
  style?: CSSProperties;
}

/** Magnetic hover: the child eases toward the cursor when it's within range. */
export function Magnet({
  children,
  padding = 150,
  strength = 3,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.6s ease-in-out',
  className,
  style,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const within =
      Math.abs(dx) < r.width / 2 + padding &&
      Math.abs(dy) < r.height / 2 + padding;
    if (within) {
      setActive(true);
      setOffset({ x: dx / strength, y: dy / strength });
    } else {
      setActive(false);
      setOffset({ x: 0, y: 0 });
    }
  };

  const onLeave = () => {
    setActive(false);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: active ? activeTransition : inactiveTransition,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
  style?: CSSProperties;
}

/** Character-by-character scroll reveal: each glyph brightens 0.2 → 1 as the
 *  paragraph passes through the viewport. Words are kept as non-breaking
 *  inline-block groups with real spaces between them, so the line only wraps at
 *  word boundaries (never mid-word) and whitespace is preserved. */
export function AnimatedText({ text, className, style }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  });
  const total = text.length;
  const words = text.split(' ');
  let idx = 0; // running glyph index across the whole paragraph
  return (
    <p ref={ref} className={className} style={style}>
      {words.map((word, wi) => {
        const chars = word.split('');
        const group = (
          <span style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {chars.map((ch) => {
              const start = idx / total;
              const end = start + 1 / total;
              idx += 1;
              return (
                <Char key={start} progress={scrollYProgress} range={[start, end]}>
                  {ch}
                </Char>
              );
            })}
          </span>
        );
        idx += 1; // account for the space that followed this word in `text`
        return (
          <span key={wi}>
            {group}
            {wi < words.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </p>
  );
}

function Char({
  children,
  progress,
  range,
}: {
  children: ReactNode;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);
  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <span style={{ opacity: 0.2 }}>{children}</span>
      <motion.span style={{ position: 'absolute', inset: 0, opacity }}>
        {children}
      </motion.span>
    </span>
  );
}

/** Gradient pill CTA used throughout the Jack sections. */
export function ContactButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full text-white font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 md:px-12 md:py-4 text-xs sm:text-sm md:text-base transition-transform hover:scale-[1.03] ${className}`}
      style={{
        background:
          'linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)',
        boxShadow:
          '0px 4px 4px rgba(181, 1, 167, 0.25), 4px 4px 12px #7721B1 inset',
        outline: '2px solid #fff',
        outlineOffset: '-3px',
      }}
    >
      Contact Me
    </button>
  );
}

/** Ghost / outline pill used on each project card. */
export function LiveProjectButton({ className = '' }: { className?: string }) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full border-2 border-[#D7E2EA] text-[#D7E2EA] font-medium uppercase tracking-widest px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base transition-colors hover:bg-[#D7E2EA]/10 ${className}`}
    >
      Live Project
    </button>
  );
}
