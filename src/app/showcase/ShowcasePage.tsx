import { useEffect } from 'react';
import TactiqIntro from './TactiqIntro';

/* ---------------------------------------------------------------------------
 * / — the Tactiq homepage: a single cinematic intro that merges two design
 * languages (Velorah's editorial video hero + Jack's kinetic marquee and
 * sticky-stacking cards) into one cohesive, on-brand landing for the real
 * Tactiq product story. All colour lives behind `.tactiq-scope` (showcase.css)
 * so it never disturbs Tactiq's global product theme; the page forces a dark
 * canvas while mounted. The full product site lives at /product.
 * ------------------------------------------------------------------------- */
export default function ShowcasePage() {
  useEffect(() => {
    document.title = 'Tactiq — Your hands. Your controller.';
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#0b0a14';
    return () => {
      document.body.style.backgroundColor = prev;
    };
  }, []);

  return (
    <main style={{ backgroundColor: '#0b0a14', overflowX: 'clip' }}>
      <TactiqIntro />
    </main>
  );
}
