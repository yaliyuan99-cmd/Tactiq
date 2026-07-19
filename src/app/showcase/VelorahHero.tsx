/* ---------------------------------------------------------------------------
 * Velorah® — cinematic single-screen hero with a fullscreen looping video
 * background, glassmorphic nav and Instrument Serif display type.
 *
 * All colours live behind the `.velorah-scope` wrapper (see showcase.css) so
 * nothing here bleeds into Tactiq's global theme.
 * ------------------------------------------------------------------------- */

import { useEffect, useRef } from 'react';

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

// Every link resolves to real content further down the combined page, so the
// nav is functional rather than decorative.
const NAV_LINKS = [
  { label: 'Home', href: '#velorah-home' },
  { label: 'Studio', href: '#jack-services' },
  { label: 'About', href: '#jack-about' },
  { label: 'Journal', href: '#jack-projects' },
  { label: 'Reach Us', href: '#jack-contact' },
];

export default function VelorahHero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reduced-motion users shouldn't get an autoplaying video: pause it and reset
  // to the first frame so the navy scene reads as an intentional still.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.autoplay = false;
      v.pause();
    }
  }, []);

  return (
    <section className="velorah-scope relative min-h-screen w-full overflow-hidden">
      {/* Fullscreen video backdrop — provides all the visual depth. */}
      <video
        ref={videoRef}
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        src={VIDEO_SRC}
      />

      {/* Navigation */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
        <a
          href="#velorah-home"
          className="v-display v-foreground text-3xl tracking-tight"
        >
          Velorah<sup className="text-xs">®</sup>
        </a>

        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              className={`inline-flex min-h-11 items-center px-1 text-sm transition-colors hover:text-white ${
                i === 0 ? 'v-foreground' : 'v-muted'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <button className="v-btn-outline inline-flex min-h-11 items-center rounded-full px-6 text-sm hover:scale-[1.03]">
          Begin Journey
        </button>
      </nav>

      {/* Hero copy */}
      <div
        id="velorah-home"
        className="relative z-10 flex flex-col items-center px-6 pt-32 pb-40 text-center"
      >
        <h1
          className="v-display v-legible animate-fade-rise max-w-7xl text-5xl font-normal leading-[0.95] tracking-[-2.46px] sm:text-7xl md:text-8xl"
          style={{ color: 'hsl(var(--v-foreground))' }}
        >
          Where <em className="not-italic v-muted">dreams</em> rise{' '}
          <em className="not-italic v-muted">through the silence.</em>
        </h1>

        <p className="v-muted v-legible animate-fade-rise-delay mt-8 max-w-2xl text-base leading-relaxed sm:text-lg">
          We&apos;re designing tools for deep thinkers, bold creators, and quiet
          rebels. Amid the chaos, we build digital spaces for sharp focus and
          inspired work.
        </p>

        <button className="v-btn-solid animate-fade-rise-delay-2 mt-12 cursor-pointer rounded-full px-14 py-5 text-base font-medium hover:scale-[1.03]">
          Begin Journey
        </button>
      </div>
    </section>
  );
}
