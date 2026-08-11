/**
 * React binding for prefersReducedMotion(): re-renders when either source of
 * the answer changes — the OS media query, or the site's own "remove
 * non-essential animation" setting.
 *
 * Use this where motion is declared during render or held open by an effect
 * (a looping video, a scroll listener, MotionConfig). For motion that starts
 * inside an event handler, call prefersReducedMotion() directly instead: it
 * reads the live answer at the moment it matters and needs no subscription.
 */
import { useSyncExternalStore } from 'react';
import { prefersReducedMotion, subscribeReducedMotion } from './a11yPrefs';

// The prerender has no window, and its output is the resting, un-animated
// markup either way — so motion is never "reduced" from the server's point of
// view, and the client corrects on hydration if the user asked for it.
const getServerSnapshot = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, prefersReducedMotion, getServerSnapshot);
}
