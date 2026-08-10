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

/**
 * Zero-width space. Screen readers only announce a live region when its text
 * actually changes, so a message repeated verbatim would stay silent.
 * Written as an escape, not a literal, so it can't be mistaken for a stray
 * character while editing.
 */
const ZERO_WIDTH = '\u200B';

/**
 * Next value for a live region, given what it currently holds. Alternating an
 * invisible suffix guarantees the text changes on every announcement — even a
 * message repeated verbatim — without altering what is spoken.
 *
 * Lives here rather than in <LiveRegions/> because it is announcement
 * semantics, not rendering, and so it can be tested without React.
 */
export function withVariation(previous: string, message: string): string {
  return previous === message ? `${message}${ZERO_WIDTH}` : message;
}
