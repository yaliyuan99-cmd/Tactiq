/**
 * Screen-reader announcement bus. `announce()` can be called from anywhere
 * (services included); the <LiveRegions/> component in the dashboard shell
 * renders the aria-live regions that voice it.
 */

type Level = 'polite' | 'assertive';
type Listener = (message: string, level: Level) => void;

const listeners = new Set<Listener>();

export function announce(message: string, level: Level = 'polite') {
  listeners.forEach((l) => l(message, level));
}

export function subscribeAnnouncements(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
