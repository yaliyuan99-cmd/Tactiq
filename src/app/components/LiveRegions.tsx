/**
 * The aria-live regions that voice announce() calls from anywhere in the app
 * (simulator, training, device events). Mounted once in the dashboard shell.
 * Visually hidden; screen readers speak the messages.
 *
 * The re-announcement trick lives in lib/announce.ts as `withVariation` —
 * this component only renders what the bus hands it.
 */
import { useEffect, useState } from 'react';
import { subscribeAnnouncements, withVariation } from '../../lib/announce';

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
