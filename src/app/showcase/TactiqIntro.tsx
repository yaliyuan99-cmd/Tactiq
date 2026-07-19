/* ---------------------------------------------------------------------------
 * Tactiq — cinematic intro (the site homepage at `/`).
 *
 * A single, cohesive landing that MERGES two design languages:
 *   • Velorah's editorial cinematic hero — fullscreen video, Instrument Serif
 *     display type, quiet-luxury motion.
 *   • Jack's kinetic energy — a scroll-parallax keyword marquee, a per-character
 *     reveal, and sticky-stacking product cards.
 * …wearing Tactiq's OWN violet identity (see `.tactiq-scope` in showcase.css),
 * and telling the real product story: a wearable smart-ring control layer that
 * makes a whole phone usable with a gesture — accessibility without the
 * medical-grade price.
 *
 * The full product site (waitlist form, pricing, checkout) lives at /product;
 * every primary CTA here routes there.
 * ------------------------------------------------------------------------- */

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  Star,
  Fingerprint,
  Hand,
  ShieldCheck,
} from 'lucide-react';
import { FadeIn, Magnet } from './components';

const CDN =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';

const VIDEO_SRC = `${CDN}hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4`;
// Cinematic backdrop for the "control layer" section (space-travel prompt).
const CAP_VIDEO = `${CDN}hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4`;

const NAV = [
  { label: 'The layer', href: '#t-capabilities' },
  { label: 'How it works', href: '#t-how' },
];

// Kinetic marquee words — Tactiq's value carried as pure typography instead of
// borrowed portfolio imagery.
const MARQUEE_A = [
  'GESTURES',
  'INVISIBLE',
  'HANDS-FREE',
  'INDEPENDENCE',
  'NO SCREENS',
];
const MARQUEE_B = [
  'WEARABLE',
  '60+ CONTROLS',
  'CUSTOMIZABLE',
  'RAGNAR',
  'ACCESSIBLE',
];

const STEPS = [
  {
    n: '01',
    name: 'Think',
    desc: 'You decide what you want your phone to do — answer a call, scroll a page, trigger an SOS. No menus, no hunting for a button.',
  },
  {
    n: '02',
    name: 'Gesture',
    desc: 'A small, natural finger movement. Tap a thumb, curl a finger. The motions are yours to map, and they work without looking.',
  },
  {
    n: '03',
    name: 'Detect',
    desc: 'The RAGNAR rings read the motion instantly and privately on-device, then speak to your phone over Bluetooth.',
  },
  {
    n: '04',
    name: 'Execute',
    desc: 'Your phone runs the command in real time — the same action a touchscreen would, minus the touchscreen.',
  },
  {
    n: '05',
    name: 'Done',
    desc: 'Sixty-plus commands, always on your hands. The interface disappears and the control stays.',
  },
];

// Three capability cards rendered as liquid-glass panels over the cinematic
// video — the space-travel prompt's "Capabilities" grid, carrying Tactiq's
// real product story instead of borrowed portfolio imagery.
const CAPS = [
  {
    icon: Fingerprint,
    title: 'Meet RAGNAR',
    body: 'Two feather-light smart rings — one per hand — read intent from the smallest finger motion. All-day battery, water-resistant, invisible under a sleeve.',
    tags: ['Two rings', 'Bluetooth LE', 'On-device', 'All-day battery'],
  },
  {
    icon: Hand,
    title: 'Control everything',
    body: 'One gesture language for your entire phone. Calls, scrolling, camera, music, smart-home, emergency SOS — mapped the way your hands actually move.',
    tags: ['Scroll', 'Call', 'Camera', 'SOS'],
  },
  {
    icon: ShieldCheck,
    title: 'Built for independence',
    body: "Priced as consumer electronics, not medical equipment — because regaining control of your own phone shouldn't cost more than a laptop.",
    tags: ['From $249', '60+ commands', 'Voice setup', 'No screens'],
  },
] as const;

/* === FadingVideo ========================================================= */
/* A looping background video that crossfades its own loop seam: instead of the
 * hard cut a plain `loop` produces, it fades the current frame out just before
 * the clip ends, resets, and fades the fresh frame back in — a seamless,
 * cinematic loop. Opacity is animated in rAF (never a CSS transition, so it can
 * resume mid-fade). Reduced-motion users get a plain, static-opacity loop. */
function FadingVideo({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const v = ref.current;
    if (!v) return;

    // Reduced motion: a calm, plain loop with no crossfade choreography.
    if (prefersReduced) {
      v.loop = true;
      v.style.opacity = '1';
      const play = () => void v.play().catch(() => {});
      v.addEventListener('loadeddata', play);
      return () => v.removeEventListener('loadeddata', play);
    }

    const FADE_MS = 500;
    const FADE_OUT_LEAD = 0.55; // seconds before end to begin fading out
    let raf = 0;
    let fadingOut = false;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const fadeTo = (target: number, duration: number) => {
      if (raf) cancelAnimationFrame(raf);
      const from = parseFloat(v.style.opacity || '0');
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / duration);
        v.style.opacity = String(from + (target - from) * p);
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    // Visible by default (CSS opacity:1) — just start playback. The crossfade
    // is applied only at the loop seam below, never as a gate on visibility.
    const onLoaded = () => {
      void v.play().catch(() => {});
    };
    const onTime = () => {
      const remaining = v.duration - v.currentTime;
      if (!fadingOut && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOut = true;
        fadeTo(0, FADE_MS);
      }
    };
    const onEnded = () => {
      v.style.opacity = '0';
      resetTimer = setTimeout(() => {
        v.currentTime = 0;
        void v.play().catch(() => {});
        fadingOut = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    v.addEventListener('loadeddata', onLoaded);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('ended', onEnded);
    // If the clip is already buffered (cached / fast network), `loadeddata`
    // has already fired and won't fire again — kick the fade-in ourselves so
    // the video never stays stuck at opacity 0.
    if (v.readyState >= 2) onLoaded();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (resetTimer) clearTimeout(resetTimer);
      v.removeEventListener('loadeddata', onLoaded);
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('ended', onEnded);
    };
  }, [prefersReduced, src]);

  return (
    <video
      ref={ref}
      // Opacity lives on the CSS class + imperative rAF, never a React style
      // prop, so re-renders can't reset an in-flight crossfade to 0.
      className={`t-fade-video ${className ?? ''}`}
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      src={src}
    />
  );
}

/* === BlurText ============================================================ */
/* Word-by-word reveal: each word rises out of a blur once the paragraph enters
 * the viewport. Enhances already-visible text (words render immediately for
 * reduced-motion / no-JS), so the copy never ships blank. */
function BlurText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [shown, setShown] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) {
      setShown(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [prefersReduced]);

  const words = text.split(' ');

  return (
    <p
      ref={ref}
      className={className}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        rowGap: '0.1em',
        ...style,
      }}
    >
      {words.map((w, i) => (
        <motion.span
          key={`${w}-${i}`}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
          // Opacity stays 1 the whole time so the heading is fully legible even
          // when the reveal never runs (background tab / headless render). The
          // reveal is a de-blur + slide only — enhancement, not a visibility gate.
          initial={prefersReduced ? false : { filter: 'blur(12px)', y: 24 }}
          animate={shown ? { filter: 'blur(0px)', y: 0 } : undefined}
          transition={{
            duration: 0.7,
            ease: 'easeOut',
            delay: (i * 90) / 1000,
          }}
        >
          {w}
        </motion.span>
      ))}
    </p>
  );
}

/* === Cinematic hero ====================================================== */
function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Reduced-motion users get a still first frame rather than an autoplay loop.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      v.autoplay = false;
      v.pause();
    }
  }, []);

  return (
    <section
      id="t-home"
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
    >
      {/* Fullscreen cinematic backdrop + legibility scrim. */}
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
      <div
        className="absolute inset-0 z-0"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(180deg, rgba(11,10,20,0.55) 0%, rgba(11,10,20,0.25) 38%, rgba(11,10,20,0.7) 78%, #0b0a14 100%)',
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a
          href="#t-home"
          className="t-serif inline-flex min-h-11 items-center text-3xl tracking-tight text-[var(--t-ink)]"
        >
          Tactiq
        </a>

        <div className="hidden items-center gap-7 md:flex">
          {NAV.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex min-h-11 items-center text-sm text-[var(--t-muted)] transition-colors hover:text-[var(--t-ink)]"
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link
          to="/product#waitlist"
          className="t-btn-outline inline-flex min-h-11 items-center rounded-full px-5 text-sm font-medium"
        >
          Get early access
        </Link>
      </nav>

      {/* Hero copy */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <span className="t-rise mb-6 inline-flex items-center gap-2 rounded-full border border-[rgba(240,238,252,0.22)] bg-[rgba(11,10,20,0.35)] px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-[var(--t-muted)] backdrop-blur-sm">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: 'var(--t-green)' }}
          />
          Next-gen wearable control
        </span>

        <h1
          className="t-serif t-legible t-rise-2 max-w-4xl font-normal leading-[0.95] tracking-[-0.02em]"
          style={{ fontSize: 'clamp(2.75rem, 8vw, 6rem)' }}
        >
          Your hands.{' '}
          <em className="not-italic" style={{ color: 'var(--t-violet)' }}>
            Your controller.
          </em>
        </h1>

        <p className="t-legible t-rise-3 mt-7 max-w-xl text-base leading-relaxed text-[var(--t-muted)] sm:text-lg">
          Tactiq is a wearable control layer for your phone. Two smart rings
          turn the smallest finger motion into any command — invisible, instant,
          and entirely yours.
        </p>

        <div className="t-rise-3 mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            to="/product#waitlist"
            className="t-btn-solid inline-flex min-h-12 items-center gap-2 rounded-full px-8 py-3.5 text-base font-semibold"
          >
            Get early access
            <ArrowUpRight className="h-5 w-5" />
          </Link>
          <a
            href="#t-how"
            className="t-btn-outline inline-flex min-h-12 items-center rounded-full px-8 py-3.5 text-base font-medium"
          >
            See how it works
          </a>
        </div>

        {/* Trust row */}
        <div className="t-rise-3 mt-9 flex items-center gap-3">
          <span className="flex items-center gap-0.5" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star
                key={i}
                className="h-4 w-4"
                style={{ fill: 'var(--t-violet)', color: 'var(--t-violet)' }}
              />
            ))}
          </span>
          <span className="text-sm text-[var(--t-muted)]">
            <span className="font-semibold text-[var(--t-ink)]">1,200+</span>{' '}
            early adopters on the waitlist
          </span>
        </div>
      </div>

      {/* Hero stat strip */}
      <div className="relative z-10 mx-auto grid w-full max-w-3xl grid-cols-3 gap-4 px-6 pb-12">
        {[
          { v: '60+', l: 'Gestures' },
          { v: '2', l: 'Smart rings' },
          { v: '0', l: 'Screens' },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <div
              className="t-heavy font-black tabular-nums leading-none"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                color: 'var(--t-ink)',
              }}
            >
              {s.v}
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[var(--t-muted)]">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* === Kinetic keyword marquee ============================================= */
function Marquee() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax written straight to the DOM in rAF — no React state,
  // so the rows never re-render while scrolling. Skipped for reduced-motion.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const offset = (window.scrollY - top + window.innerHeight) * 0.22;
      if (row1Ref.current)
        row1Ref.current.style.transform = `translateX(${offset - 200}px)`;
      if (row2Ref.current)
        row2Ref.current.style.transform = `translateX(${-(offset - 200)}px)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const triple = (arr: string[]) => [...arr, ...arr, ...arr];

  const word = (w: string, i: number, filled: boolean) => (
    <span key={`${w}-${i}`} className="flex flex-shrink-0 items-center gap-6 sm:gap-9">
      <span
        className="t-display whitespace-nowrap"
        style={{
          fontSize: 'clamp(2rem, 6vw, 4.5rem)',
          color: filled ? 'var(--t-ink)' : 'transparent',
          WebkitTextStroke: filled ? '0' : '1.5px var(--t-violet)',
        }}
      >
        {w}
      </span>
      <span
        aria-hidden="true"
        className="inline-block h-2.5 w-2.5 rotate-45"
        style={{ background: 'var(--t-violet)' }}
      />
    </span>
  );

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className="overflow-hidden border-y border-[rgba(240,238,252,0.08)] bg-[var(--t-bg)] py-8 sm:py-10"
    >
      <div className="flex flex-col gap-2">
        <div ref={row1Ref} className="flex gap-6 sm:gap-9" style={{ willChange: 'transform' }}>
          {triple(MARQUEE_A).map((w, i) => word(w, i, true))}
        </div>
        <div ref={row2Ref} className="flex gap-6 sm:gap-9" style={{ willChange: 'transform' }}>
          {triple(MARQUEE_B).map((w, i) => word(w, i, false))}
        </div>
      </div>
    </section>
  );
}

/* === How it works (numbered sequence, light section) ==================== */
function HowItWorks() {
  return (
    <section
      id="t-how"
      className="rounded-t-[36px] bg-[#f4f2fb] px-6 py-24 text-[#14122a] sm:rounded-t-[48px] sm:py-28 md:rounded-t-[60px] md:px-10"
    >
      <div className="mx-auto max-w-5xl">
        <FadeIn y={30}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--t-violet-deep)]">
            Intention → action, in real time
          </p>
          <h2
            className="t-heavy mt-4 font-black uppercase leading-[0.95] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5.5rem)' }}
          >
            How Tactiq works
          </h2>
        </FadeIn>

        <div className="mt-14 md:mt-20">
          {STEPS.map((s, i) => (
            <FadeIn
              key={s.n}
              delay={i * 0.06}
              className="flex flex-col gap-4 border-t border-[rgba(20,18,42,0.14)] py-8 sm:flex-row sm:items-baseline sm:gap-10 md:py-10"
            >
              <span
                className="t-heavy flex-shrink-0 font-black leading-none tabular-nums"
                style={{
                  fontSize: 'clamp(2.5rem, 7vw, 5rem)',
                  color: 'var(--t-violet-deep)',
                }}
              >
                {s.n}
              </span>
              <div className="flex flex-col gap-2 sm:pt-1">
                <h3
                  className="t-heavy font-semibold uppercase tracking-tight"
                  style={{ fontSize: 'clamp(1.35rem, 3vw, 2.25rem)' }}
                >
                  {s.name}
                </h3>
                <p className="max-w-2xl text-base leading-relaxed text-[#4a4668] sm:text-lg">
                  {s.desc}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

/* === Cinematic capabilities (liquid-glass over full-bleed video) ========= */
/* The space-travel prompt's design language — a lit cinematic backdrop with
 * frosted "liquid-glass" panels floating over it, and a word-by-word blur
 * reveal on the heading — carrying Tactiq's real control-layer story. */
function GlassCapCard({
  cap,
  index,
}: {
  cap: (typeof CAPS)[number];
  index: number;
}) {
  const Icon = cap.icon;
  return (
    <FadeIn y={36} delay={index * 0.12} className="h-full">
      <article className="t-glass t-glass-panel flex h-full flex-col rounded-[1.5rem] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="t-glass flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl">
            <Icon className="h-6 w-6 text-[var(--t-ink)]" strokeWidth={1.75} />
          </span>
          <div className="flex flex-wrap justify-end gap-1.5">
            {cap.tags.map((t) => (
              <span
                key={t}
                className="t-barlow t-glass rounded-full px-3 py-1 text-xs font-medium text-[rgba(240,238,252,0.85)]"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <h3
          className="t-serif mt-16 italic leading-none text-[var(--t-ink)]"
          style={{ fontSize: 'clamp(1.9rem, 3vw, 2.5rem)' }}
        >
          {cap.title}
        </h3>
        <p className="t-barlow mt-3 text-[15px] leading-relaxed text-[rgba(240,238,252,0.82)]">
          {cap.body}
        </p>
      </article>
    </FadeIn>
  );
}

function CinematicCapabilities() {
  return (
    <section
      id="t-capabilities"
      className="relative w-full overflow-hidden bg-black"
    >
      {/* Full-bleed cinematic backdrop — seamless crossfade loop, no overlay
          tint; legibility comes from the glass chrome itself. */}
      <FadingVideo
        src={CAP_VIDEO}
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      {/* A restrained bottom-weighted scrim so the glass cards keep contrast
          against the brightest video frames — not a decorative overlay. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.42) 42%, rgba(0,0,0,0.66) 100%)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-32 md:px-10">
        <FadeIn y={24}>
          <p className="t-barlow text-sm font-medium uppercase tracking-[0.28em] text-[rgba(240,238,252,0.7)]">
            // The control layer
          </p>
        </FadeIn>

        <BlurText
          text="Your phone, answered by intention."
          className="t-serif mt-6 max-w-[15ch] italic text-[var(--t-ink)]"
          style={{
            fontSize: 'clamp(2.75rem, 7vw, 6rem)',
            lineHeight: 0.9,
            letterSpacing: '-0.03em',
          }}
        />

        <FadeIn y={20} delay={0.15}>
          <p className="t-barlow mt-6 max-w-xl text-base leading-relaxed text-[rgba(240,238,252,0.85)] sm:text-lg">
            No menus, no hunting for a button. A small, natural finger motion is
            all it takes — Tactiq reads it on your hand and your phone simply
            responds.
          </p>
        </FadeIn>

        <div className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3">
          {CAPS.map((cap, i) => (
            <GlassCapCard key={cap.title} cap={cap} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* === Closing CTA ========================================================= */
function ClosingCTA() {
  return (
    <section className="relative overflow-hidden px-6 py-28 text-center sm:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 60% at 50% 30%, rgba(139,108,255,0.22), transparent 70%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <FadeIn y={30}>
          <h2
            className="t-serif t-legible font-normal leading-[0.98] tracking-[-0.02em]"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5.25rem)' }}
          >
            Accessibility shouldn&apos;t cost{' '}
            <em className="not-italic" style={{ color: 'var(--t-violet)' }}>
              more than a laptop.
            </em>
          </h2>
        </FadeIn>
        <FadeIn y={20} delay={0.1}>
          <p className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[var(--t-muted)] sm:text-lg">
            Tactiq starts at $249 — two rings, sixty-plus commands, and your
            phone back under your control. Join the waitlist and be first when
            RAGNAR ships.
          </p>
        </FadeIn>
        <FadeIn y={20} delay={0.2}>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/product#waitlist"
              className="t-btn-solid inline-flex min-h-12 items-center gap-2 rounded-full px-9 py-4 text-base font-semibold"
            >
              Get early access
              <ArrowUpRight className="h-5 w-5" />
            </Link>
            <Magnet padding={80} strength={4}>
              <Link
                to="/product#pricing"
                className="t-btn-outline inline-flex min-h-12 items-center rounded-full px-9 py-4 text-base font-medium"
              >
                See pricing
              </Link>
            </Magnet>
          </div>
        </FadeIn>

        <FadeIn y={16} delay={0.3}>
          <div className="mt-14 flex flex-col items-center gap-1 text-sm text-[var(--t-muted)] sm:flex-row sm:justify-center sm:gap-4">
            <Link
              to="/product"
              className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]"
            >
              Explore the full product site
            </Link>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <Link
              to="/privacy"
              className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]"
            >
              Privacy
            </Link>
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <Link
              to="/terms"
              className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-[var(--t-ink)]"
            >
              Terms
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

export default function TactiqIntro() {
  return (
    <div className="tactiq-scope" style={{ overflowX: 'clip' }}>
      <Hero />
      <Marquee />
      <CinematicCapabilities />
      <HowItWorks />
      <ClosingCTA />
    </div>
  );
}
