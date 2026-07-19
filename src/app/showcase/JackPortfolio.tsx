import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import {
  FadeIn,
  Magnet,
  AnimatedText,
  ContactButton,
  LiveProjectButton,
} from './components';

/* ---------------------------------------------------------------------------
 * Jack — 3D Creator portfolio. Dark (#0C0C0C) Kanit-typeset landing page.
 * Everything sits inside a `.jack-scope` wrapper (see showcase.css) so the
 * gradient heading helper and background are isolated from Tactiq's theme.
 * ------------------------------------------------------------------------- */

const PORTRAIT =
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png';

const MARQUEE = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
];

const NAV = [
  { label: 'About', href: '#jack-about' },
  { label: 'Price', href: '#jack-services' },
  { label: 'Projects', href: '#jack-projects' },
  { label: 'Contact', href: '#jack-contact' },
];

const SERVICES = [
  {
    n: '01',
    name: '3D Modeling',
    desc: 'Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations.',
  },
  {
    n: '02',
    name: 'Rendering',
    desc: 'High-quality, photorealistic renders that showcase designs with custom lighting, textures, and materials to bring concepts to life.',
  },
  {
    n: '03',
    name: 'Motion Design',
    desc: 'Dynamic animations and motion graphics that add energy and storytelling to brands, products, and digital experiences.',
  },
  {
    n: '04',
    name: 'Branding',
    desc: 'Crafting cohesive visual identities — from logos to full brand systems — that communicate a clear and memorable presence.',
  },
  {
    n: '05',
    name: 'Web Design',
    desc: 'Designing clean, modern, and conversion-focused websites with attention to layout, typography, and user experience.',
  },
];

const PROJECTS = [
  {
    n: '01',
    category: 'Client',
    name: 'Nextlevel Studio',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
  },
  {
    n: '02',
    category: 'Personal',
    name: 'Aura Brand Identity',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
  },
  {
    n: '03',
    category: 'Client',
    name: 'Solaris Digital',
    col1: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    ],
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
  },
];

const ABOUT_ICONS = {
  moon: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
  p59: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
  lego: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
  group:
    'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
};

/* === Hero ================================================================ */
function HeroSection() {
  return (
    <section
      className="relative flex h-screen flex-col"
      style={{ overflowX: 'clip' }}
    >
      <FadeIn as="nav" delay={0} y={-20}>
        <div className="flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
          {NAV.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="inline-flex min-h-11 items-center font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 text-sm md:text-lg lg:text-[1.4rem]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </FadeIn>

      <div className="overflow-hidden">
        <FadeIn as="h2" delay={0.15} y={40}>
          <span className="hero-heading block w-full whitespace-nowrap font-black uppercase leading-none tracking-tight mt-6 text-[14vw] sm:mt-4 sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]">
            Hi, i&apos;m jack
          </span>
        </FadeIn>
      </div>

      <div className="mt-auto flex items-end justify-between px-6 pb-7 md:px-10 sm:pb-8 md:pb-10">
        <FadeIn delay={0.35} y={20}>
          <p
            className="max-w-[160px] font-light uppercase leading-snug tracking-wide text-[#D7E2EA] sm:max-w-[220px] md:max-w-[260px]"
            style={{ fontSize: 'clamp(0.75rem, 1.4vw, 1.5rem)' }}
          >
            a 3d creator driven by crafting striking and unforgettable projects
          </p>
        </FadeIn>
        <FadeIn delay={0.5} y={20}>
          <ContactButton />
        </FadeIn>
      </div>

      {/* Magnetic centred portrait */}
      <FadeIn
        delay={0.6}
        y={30}
        className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 sm:bottom-0 sm:top-auto sm:translate-y-0"
      >
        <Magnet
          padding={150}
          strength={3}
          activeTransition="transform 0.3s ease-out"
          inactiveTransition="transform 0.6s ease-in-out"
        >
          <img
            src={PORTRAIT}
            alt="Jack portrait"
            className="w-[280px] sm:w-[360px] md:w-[440px] lg:w-[520px]"
          />
        </Magnet>
      </FadeIn>
    </section>
  );
}

/* === Marquee ============================================================= */
function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  // Scroll-linked parallax written straight to the DOM inside rAF — no React
  // state, so the 63 tiles never re-render while scrolling. Skipped entirely
  // for reduced-motion users, who see the two rows sitting still.
  useEffect(() => {
    const reduce = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    if (reduce) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY;
      const offset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;
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

  const row1 = MARQUEE.slice(0, 11);
  const row2 = MARQUEE.slice(11);
  const triple = (arr: string[]) => [...arr, ...arr, ...arr];

  const tile = (src: string, i: number) => (
    <img
      key={i}
      src={src}
      alt=""
      loading="lazy"
      className="rounded-2xl object-cover"
      style={{ width: 420, height: 270, flex: '0 0 auto' }}
    />
  );

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-[#0C0C0C] pt-24 pb-10 sm:pt-32 md:pt-40"
    >
      <div className="flex flex-col gap-3">
        <div ref={row1Ref} className="flex gap-3" style={{ willChange: 'transform' }}>
          {triple(row1).map(tile)}
        </div>
        <div ref={row2Ref} className="flex gap-3" style={{ willChange: 'transform' }}>
          {triple(row2).map(tile)}
        </div>
      </div>
    </section>
  );
}

/* === About =============================================================== */
function AboutSection() {
  return (
    <section
      id="jack-about"
      className="relative flex min-h-screen flex-col items-center justify-center gap-10 px-5 py-20 sm:gap-14 sm:px-8 md:gap-16 md:px-10"
    >
      {/* Decorative corner 3D objects */}
      <FadeIn
        delay={0.1}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute left-[1%] top-[4%] sm:left-[2%] md:left-[4%]"
      >
        <img
          src={ABOUT_ICONS.moon}
          alt=""
          className="w-[120px] sm:w-[160px] md:w-[210px]"
        />
      </FadeIn>
      <FadeIn
        delay={0.15}
        x={80}
        y={0}
        duration={0.9}
        className="absolute right-[1%] top-[4%] sm:right-[2%] md:right-[4%]"
      >
        <img
          src={ABOUT_ICONS.lego}
          alt=""
          className="w-[120px] sm:w-[160px] md:w-[210px]"
        />
      </FadeIn>
      <FadeIn
        delay={0.25}
        x={-80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] left-[3%] sm:left-[6%] md:left-[10%]"
      >
        <img
          src={ABOUT_ICONS.p59}
          alt=""
          className="w-[100px] sm:w-[140px] md:w-[180px]"
        />
      </FadeIn>
      <FadeIn
        delay={0.3}
        x={80}
        y={0}
        duration={0.9}
        className="absolute bottom-[8%] right-[3%] sm:right-[6%] md:right-[10%]"
      >
        <img
          src={ABOUT_ICONS.group}
          alt=""
          className="w-[130px] sm:w-[170px] md:w-[220px]"
        />
      </FadeIn>

      <FadeIn delay={0} y={40}>
        <h2
          className="hero-heading text-center font-black uppercase leading-none tracking-tight"
          style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
        >
          About me
        </h2>
      </FadeIn>

      <AnimatedText
        text="With more than five years of experience in design, i focus on branding, web design, and user experience, i truly enjoy working with businesses that aim to stand out and present their best image. Let's build something incredible together!"
        className="max-w-[560px] text-center font-medium leading-relaxed text-[#D7E2EA]"
        style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)' }}
      />

      <div id="jack-contact" className="mt-6 sm:mt-10 md:mt-14">
        <FadeIn delay={0.1} y={20}>
          <ContactButton />
        </FadeIn>
      </div>
    </section>
  );
}

/* === Services ============================================================ */
function ServicesSection() {
  return (
    <section
      id="jack-services"
      className="rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
    >
      <h2
        className="mb-16 text-center font-black uppercase text-[#0C0C0C] sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Services
      </h2>

      <div className="mx-auto max-w-5xl">
        {SERVICES.map((s, i) => (
          <FadeIn
            key={s.n}
            delay={i * 0.1}
            className="flex items-start gap-6 border-t py-8 sm:py-10 md:py-12"
            style={{ borderColor: 'rgba(12, 12, 12, 0.15)' }}
          >
            <span
              className="font-black leading-none text-[#0C0C0C]"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {s.n}
            </span>
            <div className="flex flex-col gap-3">
              <h3
                className="font-medium uppercase text-[#0C0C0C]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {s.name}
              </h3>
              <p
                className="max-w-2xl font-light leading-relaxed text-[#0C0C0C]"
                style={{
                  fontSize: 'clamp(0.85rem, 1.6vw, 1.25rem)',
                  opacity: 0.6,
                }}
              >
                {s.desc}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

/* === Projects (sticky-stacking cards) ==================================== */
function ProjectCard({
  project,
  index,
  total,
  progress,
}: {
  project: (typeof PROJECTS)[number];
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  // Each earlier card scales down slightly as later ones stack on top of it.
  const prefersReduced = useReducedMotion();
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const range: [number, number] = [index / total, 1];
  const scale = useTransform(progress, range, [1, prefersReduced ? 1 : targetScale]);

  return (
    <div
      className="sticky top-24 flex h-[85vh] items-start justify-center md:top-32"
      style={{ top: `${index * 28}px` }}
    >
      <motion.div
        style={{ scale }}
        className="w-full rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:rounded-[60px] md:p-8"
      >
        {/* Top row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 md:mb-6">
          <div className="flex items-center gap-4 md:gap-6">
            <span
              className="hero-heading font-black leading-none"
              style={{ fontSize: 'clamp(3rem, 10vw, 140px)' }}
            >
              {project.n}
            </span>
            <div className="flex flex-col">
              <span className="text-sm uppercase tracking-widest text-[#D7E2EA]/60">
                {project.category}
              </span>
              <span
                className="font-medium uppercase text-[#D7E2EA]"
                style={{ fontSize: 'clamp(1rem, 2.2vw, 2.1rem)' }}
              >
                {project.name}
              </span>
            </div>
          </div>
          <LiveProjectButton />
        </div>

        {/* Image grid */}
        <div className="flex gap-3 sm:gap-4">
          <div className="flex w-2/5 flex-col gap-3 sm:gap-4">
            <img
              src={project.col1[0]}
              alt={`${project.name} preview 1`}
              loading="lazy"
              className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(130px, 16vw, 230px)' }}
            />
            <img
              src={project.col1[1]}
              alt={`${project.name} preview 2`}
              loading="lazy"
              className="w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
              style={{ height: 'clamp(160px, 22vw, 340px)' }}
            />
          </div>
          <div className="w-3/5">
            <img
              src={project.col2}
              alt={`${project.name} feature`}
              loading="lazy"
              className="h-full w-full rounded-[40px] object-cover sm:rounded-[50px] md:rounded-[60px]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ProjectsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  return (
    <section
      id="jack-projects"
      ref={ref}
      className="relative z-10 -mt-10 rounded-t-[40px] bg-[#0C0C0C] px-5 pt-20 pb-32 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 md:-mt-14 md:rounded-t-[60px] md:px-10"
    >
      <h2
        className="hero-heading mb-16 text-center font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
        style={{ fontSize: 'clamp(3rem, 12vw, 160px)' }}
      >
        Project
      </h2>
      <div className="mx-auto max-w-6xl">
        {PROJECTS.map((p, i) => (
          <ProjectCard
            key={p.n}
            project={p}
            index={i}
            total={PROJECTS.length}
            progress={scrollYProgress}
          />
        ))}
      </div>
    </section>
  );
}

export default function JackPortfolio() {
  return (
    <div className="jack-scope" style={{ overflowX: 'clip' }}>
      <HeroSection />
      <MarqueeSection />
      <AboutSection />
      <ServicesSection />
      <ProjectsSection />
    </div>
  );
}
