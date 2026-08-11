/**
 * Wraps motion/react's MotionConfig so it honours the site's own reduced-motion
 * setting as well as the OS one.
 *
 * MotionConfig's built-in `reducedMotion="user"` reads only the media query, so
 * on its own it would ignore a visitor who ticked the site setting while their
 * OS preference stays off. Passing "always" in that case covers both; "user" is
 * still the fallback so the OS preference keeps working on its own.
 */
import type { ReactNode } from 'react';
import { MotionConfig } from 'motion/react';
import { useReducedMotion } from '../../lib/useReducedMotion';

export default function ReducedMotionProvider({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return <MotionConfig reducedMotion={reduced ? 'always' : 'user'}>{children}</MotionConfig>;
}
