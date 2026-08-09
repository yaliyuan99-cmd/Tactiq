/**
 * The aria-live regions that voice announce() calls from anywhere in the app
 * (simulator, training, device events). Mounted once in the dashboard shell.
 * Visually hidden; screen readers speak the messages.
 */
import { useEffect, useState } from 'react';
import { subscribeAnnouncements } from '../../lib/announce';

export default function LiveRegions() {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');

  useEffect(
    () =>
      subscribeAnnouncements((message, level) => {
        // Re-set to the same string won't re-announce; append a zero-width
        // variation only when the message repeats verbatim.
        if (level === 'assertive') {
          setAssertive((prev) => (prev === message ? `${message}​` : message));
        } else {
          setPolite((prev) => (prev === message ? `${message}​` : message));
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
