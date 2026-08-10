/**
 * The aria-live regions that voice announce() calls from anywhere in the app
 * (simulator, training, device events). Mounted once in the dashboard shell.
 * Visually hidden; screen readers speak the messages.
 */
import { useEffect, useState } from 'react';
import { subscribeAnnouncements } from '../../lib/announce';

/**
 * Zero-width space. Screen readers only announce a live region when its text
 * actually changes, so a message repeated verbatim would stay silent. Toggling
 * this invisible suffix guarantees a change without altering what is spoken.
 * Written as an escape, not a literal, so it can't be mistaken for a stray
 * character while editing.
 */
const ZERO_WIDTH = '\u200B';

/** Alternate the suffix so consecutive identical messages still announce. */
function withVariation(previous: string, message: string): string {
  return previous === message ? `${message}${ZERO_WIDTH}` : message;
}

export default function LiveRegions() {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');

  useEffect(
    () =>
      subscribeAnnouncements((message, level) => {
        if (level === 'assertive') {
          setAssertive((prev) => withVariation(prev, message));
        } else {
          setPolite((prev) => withVariation(prev, message));
        }
      }),
    [],
  );

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div aria-live="assertive" role="alert" aria-atomic="true" className="sr-only">
        {assertive}
      </div>
    </>
  );
}
