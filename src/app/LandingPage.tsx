import { motion, AnimatePresence, useScroll, useSpring, animate } from 'motion/react';
import { Hand, Zap, Users, Shield, ChevronRight, Menu, X, Keyboard, Command, MessageSquare, Music, Check, AlertCircle, CheckCircle2, Loader2, Sun, Moon, Brain, Radio, CircleCheck, User as UserIcon, ArrowUp, FlaskConical } from 'lucide-react';
import { useState, useEffect, lazy, Suspense, type ComponentProps } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router';
import InteractiveHandDemo from './components/InteractiveHandDemo';
import Testimonials from './components/Testimonials';
import FaqSection from './components/FaqSection';
import SiteFooter from './components/SiteFooter';
import { joinWaitlist } from '../lib/api';
import { useAuth } from './auth/AuthContext';

const RING_MODEL = '/models/ring.glb';
const RING_POSTER = '/models/ring-poster.svg';

// The 3D viewer pulls in the heavy @google/model-viewer element, so it's split
// into its own chunk and loaded only once the landing page has painted. Until it
// arrives (or on any failure) the static ring poster is shown in its place.
const ProductViewer = lazy(() => import('./components/ProductViewer'));

function RingViewer(props: ComponentProps<typeof ProductViewer>) {
  return (
    <Suspense
      fallback={<img src={RING_POSTER} alt="Concept model of the Tactiq smart ring" className="w-full h-full object-contain" />}
    >
      <ProductViewer {...props} />
    </Suspense>
  );
}
const HANDS_PHOTO =
  'https://images.unsplash.com/photo-1529264563814-0aa1e17d2a4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw0fHxvcGVuJTIwcGFsbSUyMGhhbmQlMjBkYXJrJTIwbWluaW1hbGlzdHxlbnwxfHx8fDE3Nzk4NDY3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1600';

/**
 * Counts from 0 → `value` on mount, then holds. Used for the hero stats so the
 * numbers feel "live". Animating on mount (rather than on scroll-into-view) keeps
 * it reliable across environments, and `onComplete` guarantees the final value
 * is shown even if animation frames are throttled.
 */
function CountUp({
  value,
  suffix = '',
  duration = 1.2,
  delay = 0,
}: {
  value: number;
  suffix?: string;
  duration?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      delay,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => setDisplay(value),
    });
    return () => controls.stop();
  }, [value, duration, delay]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Smooth scroll-progress value for the top reading-progress bar.
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.3,
  });

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 700);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );
  const [form, setForm] = useState({ fullName: '', email: '', userCategory: '' });
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formError, setFormError] = useState('');
  // Track which fields the user has interacted with so inline hints only appear
  // after a field is touched (not while it's still empty on first paint).
  const [touched, setTouched] = useState({ name: false, email: false });

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const nameValid = form.fullName.trim().length > 0;
  const nameFieldError = touched.name && !nameValid ? 'Please enter your name.' : '';
  const emailFieldError =
    touched.email && !emailValid
      ? form.email.trim().length > 0
        ? 'That doesn’t look like a valid email.'
        : 'Email is required.'
      : '';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tactiq-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const scrollToWaitlist = () => {
    setMobileMenuOpen(false);
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleWaitlistSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nameValid || !emailValid) {
      // Reveal every field's inline hint (the per-field <p>s do the messaging)
      // and move focus to the first problem field.
      setTouched({ name: true, email: true });
      setFormError('');
      document.getElementById(!nameValid ? 'wl-name' : 'wl-email')?.focus();
      return;
    }
    setFormError('');
    setFormStatus('submitting');

    const result = await joinWaitlist({
      fullName: form.fullName,
      email: form.email,
      userCategory: form.userCategory,
      country: 'AU',
    });

    if (result.ok) {
      setFormStatus('success');
    } else {
      setFormStatus('idle');
      setFormError(result.error || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>

      {/* Scroll-progress indicator */}
      <motion.div
        aria-hidden
        style={{ scaleX: progressScaleX }}
        className="fixed top-0 left-0 right-0 h-1 origin-left z-[60] bg-primary"
      />
      {/* Navigation */}
      <nav aria-label="Primary" className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Hand className="w-6 h-6" />
              <span className="text-xl font-semibold">Tactiq</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#for-who" className="text-muted-foreground hover:text-foreground transition-colors">Who It's For</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#hardware" className="text-muted-foreground hover:text-foreground transition-colors">Hardware</a>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#research" className="text-muted-foreground hover:text-foreground transition-colors">Research</a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors overflow-hidden"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ y: -16, opacity: 0, rotate: -90 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 16, opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                    className="absolute"
                  >
                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>
              {user ? (
                <Link
                  to="/account"
                  className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  Account
                </Link>
              ) : (
                <Link to="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                  Log in
                </Link>
              )}
              <button onClick={scrollToWaitlist} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              <button
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#hardware" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Hardware</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#for-who" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Who It's For</a>
              <a href="#research" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Research</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
              {user ? (
                <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Account</Link>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
              )}
              <button onClick={scrollToWaitlist} className="w-full px-6 py-2 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Main landmark — an unstyled block wrapper, so it renders identically;
          it exists so all page content sits inside a labelled landmark. */}
      <main>
      {/* Hero Section */}
      <section id="main-content" tabIndex={-1} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden focus:outline-none">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-script text-primary text-lg sm:text-xl mb-5"
              >
                silent, eyes-free phone control
              </motion.div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl mb-6 leading-[1.02] tracking-tight">
                One ring.
                <br />
                <span className="text-primary">Nine commands.</span>
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Nine commands on the fingers you can always feel. Tactiq is a smart ring for blind users that <span className="text-foreground font-semibold">augments VoiceOver and TalkBack</span> — silent, one-handed, and priced like earbuds.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <motion.button
                  onClick={scrollToWaitlist}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2 group"
                >
                  Get Early Access
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
                <motion.a
                  href="#how-it-works"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-card rounded-xl hover:bg-secondary transition-colors text-center"
                >
                  Watch Demo
                </motion.a>
              </div>

              {/* Rating / trust row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 mb-10"
              >
                <span className="text-sm text-muted-foreground">
                  A <span className="text-foreground font-semibold">student research project</span> from
                  Sydney, Australia — all performance figures are pre-registered targets, not achieved
                  results
                </span>
              </motion.div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { value: 9, suffix: "", label: "Fixed commands" },
                  { value: 1, suffix: "", label: "Ring, one hand" },
                  { value: 0, suffix: "", label: "Screens needed" }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="text-3xl font-semibold text-primary tabular-nums">
                      <CountUp value={stat.value} suffix={stat.suffix} delay={0.5 + i * 0.15} />
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Dramatic hand image */}
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{
                duration: 1,
                type: "spring",
                stiffness: 100,
                damping: 20
              }}
              className="order-1 lg:order-2 relative"
            >
              <div className="relative">
                {/* Product render */}
                <div className="relative rounded-3xl overflow-hidden bg-card aspect-square">
                  <RingViewer
                    src={RING_MODEL}
                    poster={RING_POSTER}
                    alt="Concept model of the Tactiq smart ring, rotating slowly"
                    autoRotate
                    exposure={1.1}
                    className="w-full h-full"
                  >
                    <img src={RING_POSTER} alt="Concept model of the Tactiq smart ring" className="w-full h-full object-contain" />
                  </RingViewer>
                </div>

                {/* Floating label */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="absolute -bottom-6 -left-6 bg-popover border border-border rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <Hand className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">Tactiq · Research Prototype</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* How It Works Flow */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8 md:p-12"
          >
            <h2 className="text-2xl sm:text-3xl text-center mb-8">How It Works: Instant Control</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-start">
              {[
                { label: "Squeeze to wake", Icon: Brain, tile: "bg-primary/10", icon: "text-primary" },
                { label: "Thumb taps a point", Icon: Hand, tile: "bg-accent/10", icon: "text-accent" },
                { label: "Ring detects", Icon: Radio, tile: "bg-chart-1/10", icon: "text-chart-1" },
                { label: "Phone acts", Icon: Zap, tile: "bg-chart-3/10", icon: "text-chart-3" },
                { label: "Haptic confirms", Icon: CircleCheck, tile: "bg-primary/10", icon: "text-primary" }
              ].map((step, i) => (
                <div key={i} className="relative flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0, rotate: -12 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, type: "spring", stiffness: 260, damping: 18 }}
                    whileHover={{ scale: 1.08, y: -3 }}
                    className={`mb-3 w-16 h-16 rounded-2xl ${step.tile} flex items-center justify-center`}
                  >
                    <step.Icon className={`w-7 h-7 ${step.icon}`} strokeWidth={1.75} />
                  </motion.div>
                  <div className="text-sm font-medium text-center">{step.label}</div>
                  {i < 4 && (
                    <ChevronRight className="hidden md:block absolute top-5 -right-2 w-5 h-5 text-primary/40" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-muted-foreground mt-8 italic">
              "A deliberate squeeze wakes the ring → the thumb taps a contact point → a distinct haptic pattern confirms the command"
            </p>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl mb-6">The Problem We're Solving</h2>
            <p className="text-xl text-muted-foreground">
              The WHO estimates at least 2.2 billion people live with a vision impairment, and 91.3% of screen-reader users rely on one on mobile (WebAIM Screen Reader Survey #10). Yet the phone in their pocket still assumes eyes, a free hand, and a quiet room.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Touchscreens Give No Feedback",
                description: "Visual interfaces demand precision and constant attention. For blind users and those with motor difficulties, every interaction is a challenge.",
                color: "from-destructive/10 to-destructive/5"
              },
              {
                title: "Voice Is Conditionally Reliable",
                description: "Voice control fails in noise — and broadcasts your business to the street. For atypical speech it's worse: studies measured mainstream assistants at roughly 50–60% accuracy (Ballati et al. 2018), and unadapted state-of-the-art recognition still shows around 60% median word error on disordered speech (JSLHR 2024).",
                color: "from-chart-1/10 to-chart-1/5"
              },
              {
                title: "Braille Hardware Costs Too Much",
                description: "Refreshable braille displays run from $799 (Orbit Reader 20) to $15,500 (APH Monarch), with mainstream 20–40-cell displays around $2,000–$3,800 — and only 38% of screen-reader users use braille output at all (WebAIM Survey #10).",
                color: "from-chart-2/10 to-chart-2/5"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl"
              >
                <h3 className="mb-4">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For Section */}
      <section id="for-who" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl mb-6">Who It's For</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tactiq is transformative for those who need it most, and valuable for everyone else.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Blind & Visually Impaired Users",
                description: "Tactiq augments VoiceOver and TalkBack over Bluetooth — it never replaces them. The nine commands you use most live on the fingers you can always feel, and it works one-handed while the other hand holds a cane or a guide-dog harness.",
                highlight: "Primary Users",
                gradient: "from-primary/20 to-primary/5",
                borderColor: "border-primary/30"
              },
              {
                title: "Elderly & Motor-Impaired",
                description: "Replace touchscreen precision demands with the gross motor familiarity of tapping your own fingers — something that requires no training to understand.",
                highlight: "Secondary Users",
                gradient: "from-chart-1/20 to-chart-1/5",
                borderColor: "border-chart-1/30"
              },
              {
                title: "Everyone Else",
                description: "Commuters, students, athletes, workers — anyone who wants phone control without demanding full attention. A performance device that happens to be life-changing.",
                highlight: "Tertiary Users",
                gradient: "from-chart-2/20 to-chart-2/5",
                borderColor: "border-chart-2/30"
              }
            ].map((user, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-card p-8 rounded-2xl"
              >
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm mb-4">{user.highlight}</div>
                <h3 className="mb-4 text-xl">{user.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{user.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl mb-6">How Tactiq Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One ring, worn on the index finger of either hand. The thumb taps eight contact points — the tips and bases of the four fingers — carrying nine fixed commands.
            </p>
          </motion.div>

          {/* Interactive Hand Demo */}
          <div className="mb-20">
            <InteractiveHandDemo />
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Keyboard className="w-8 h-8 text-chart-2" />
                <h3>Wake, Tap, Confirm</h3>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-chart-2 flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Squeeze to Wake:</strong> The ring is idle until a deliberate squeeze of the ring body opens a short command window — design target: at most 1 false activation per hour</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-chart-2 flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Haptic Feedback:</strong> Distinct vibration patterns confirm each command, so you always know what the ring heard</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-chart-2 flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Optional Single Earbud:</strong> One ear only — ambient sound is how blind users read the street, so the other ear always stays open</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-12 flex items-center justify-center h-80 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Hand className="w-48 h-48 text-chart-2 transform -scale-x-100" />
              </motion.div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="bg-card rounded-3xl p-12 flex items-center justify-center h-80 md:order-1 relative overflow-hidden"
            >
              <motion.div
                animate={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Hand className="w-48 h-48 text-primary" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:order-2"
            >
              <div className="flex items-center gap-3 mb-6">
                <Command className="w-8 h-8 text-primary" />
                <h3>The Nine Commands</h3>
              </div>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Index finger:</strong> Confirm (tip) · Dismiss/Back (base)</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Middle finger:</strong> Undo (tip) · Next (base)</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Ring finger:</strong> Read/Repeat (tip) · Previous (base)</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  <span><strong className="text-foreground">Pinky:</strong> Shortcut 1 (base) · Shortcut 2 (tip, brief tap) · Emergency (tip, sustained 5-second hold — never a tap count; the only shared point, separated by duration)</span>
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center bg-primary text-primary-foreground rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="inline-block mb-4"
              >
                <Zap className="w-12 h-12 text-primary-foreground mx-auto" />
              </motion.div>
              <h3 className="mb-4 text-2xl">Nine Commands. Deliberately Capped.</h3>
              <p className="text-primary-foreground/85 max-w-2xl mx-auto text-lg">
                Our capacity analysis found a knee at eight contact points — more points add little information but collapse accuracy. Text entry and any clear-field or delete gesture are deliberately excluded: recoverable commands only, on the fingers you can always feel.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hardware Section */}
      <section id="hardware" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-script text-primary text-lg sm:text-xl block mb-3">
              the hardware
            </span>
            <h2 className="text-4xl sm:text-5xl mb-6">Meet the Tactiq Ring</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A single ring for the index finger of either hand. Drag to spin the concept model — and note: every performance figure below is a pre-registered target, not an achieved result.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden bg-card aspect-square"
            >
              <RingViewer
                src={RING_MODEL}
                poster={RING_POSTER}
                alt="Concept model of the Tactiq smart ring — drag to rotate"
                cameraControls
                autoRotate
                ar
                exposure={1.1}
                className="w-full h-full"
              >
                <img src={RING_POSTER} alt="Concept model of the Tactiq smart ring" className="w-full h-full object-contain" />
              </RingViewer>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Hand, title: 'Magnetic sensing', desc: 'A passive magnet and three low-cost magnetometers localize the thumb as it taps — no camera, no microphone.' },
                  { icon: Zap, title: 'Squeeze to wake', desc: 'Idle until deliberately squeezed. Target: at most 1 false activation per hour.' },
                  { icon: Shield, title: '≥95% per-contact accuracy', desc: 'Pre-registered target for the bench experiment — not an achieved result.' },
                  { icon: Check, title: 'Under $60 in parts', desc: 'The bench prototype is built from off-the-shelf components.' },
                ].map((spec) => (
                  <div key={spec.title} className="p-5 rounded-2xl bg-card">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <spec.icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg mb-1">{spec.title}</h3>
                    <p className="text-sm text-muted-foreground">{spec.desc}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Bluetooth LE</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Augments VoiceOver & TalkBack</span>
                <span className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Haptic feedback</span>
              </div>
              <button onClick={scrollToWaitlist} className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity">
                Follow the research
              </button>
            </motion.div>
          </div>

          {/* Worn on the hand — real photo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 relative rounded-3xl overflow-hidden"
          >
            <img
              src={HANDS_PHOTO}
              alt="A hand wearing the Concept model of the Tactiq smart ring"
              loading="lazy"
              className="w-full h-[280px] sm:h-[360px] lg:h-[440px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-10 max-w-xl">
              <h3 className="text-2xl sm:text-3xl mb-2">Made to disappear on your hand</h3>
              <p className="text-muted-foreground">
                Worn like jewellery, the ring puts nine commands on the fingers you can always feel — no screen, no voice, one hand free for a cane or a guide dog.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Command Capabilities Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6">Eight Points, Nine Commands</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The thumb taps the tips and bases of the four fingers — eight contact points you can find without looking, carrying nine fixed commands that drive VoiceOver and TalkBack.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                icon: <Check className="w-6 h-6" />,
                title: "Index Tip — Confirm",
                commands: ["Answer a call", "Activate the focused item", "Accept a suggestion"]
              },
              {
                icon: <X className="w-6 h-6" />,
                title: "Index Base — Dismiss/Back",
                commands: ["Decline a call", "Go back a screen", "Silence an alarm"]
              },
              {
                icon: <Command className="w-6 h-6" />,
                title: "Middle Tip — Undo",
                commands: ["Reverse the last action", "Recover from a mis-tap"]
              },
              {
                icon: <ChevronRight className="w-6 h-6" />,
                title: "Middle Base — Next",
                commands: ["Next item in a list", "Next element on screen", "Skip forward"]
              },
              {
                icon: <MessageSquare className="w-6 h-6" />,
                title: "Ring Tip — Read/Repeat",
                commands: ["Read the current item again", "Repeat the last announcement"]
              },
              {
                icon: <Music className="w-6 h-6" />,
                title: "Ring Base — Previous",
                commands: ["Previous item in a list", "Previous element on screen", "Skip back"]
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Pinky Base & Tip — Shortcuts",
                commands: ["Shortcut 1 (base): your choice", "Shortcut 2 (tip, brief tap): your choice"]
              },
              {
                icon: <AlertCircle className="w-6 h-6" />,
                title: "Pinky Tip — Emergency",
                commands: ["Sustained 5-second hold — never a tap count", "The only shared point, separated by duration"]
              }
            ].map((category, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-card rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {category.icon}
                  </div>
                  <h3 className="text-lg">{category.title}</h3>
                </div>
                <ul className="space-y-2">
                  {category.commands.map((cmd, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                      {cmd}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Profile Modes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-3xl p-8"
          >
            <h3 className="text-2xl mb-4 text-center">Two Shortcuts, Fully Yours</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
              Seven commands never move — muscle memory depends on it. The two shortcut points are the personal part. Examples of what they could trigger:
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Speak the time", "Where am I?", "Call a favourite", "Play / pause podcast", "Speak battery level", "Toggle flashlight", "Send a preset message"].map((mode, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.05 }}
                  className="px-4 py-2 bg-secondary rounded-full text-sm"
                >
                  {mode}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6">Built for Independence</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature is designed to answer one question: <span className="text-primary font-semibold">can a blind user do this entirely on their own?</span>
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="w-10 h-10" />,
                title: "Voice-Guided Setup",
                description: "Complete pairing and customization without any visual interaction required.",
                gradient: "from-chart-1/20 to-chart-1/5",
                iconColor: "text-chart-1"
              },
              {
                icon: <Hand className="w-10 h-10" />,
                title: "Proprioceptive Navigation",
                description: "Your body is the map. No sight needed — you always know where your hands are.",
                gradient: "from-primary/20 to-primary/5",
                iconColor: "text-primary"
              },
              {
                icon: <AlertCircle className="w-10 h-10" />,
                title: "Emergency Gestures",
                description: "Fixed emergency gesture triggers SOS call, shares location, and alerts emergency contacts instantly.",
                gradient: "from-destructive/20 to-destructive/5",
                iconColor: "text-destructive"
              },
              {
                icon: <Users className="w-10 h-10" />,
                title: "Consumer Design",
                description: "Slim, minimal, premium — designed as consumer electronics, not medical devices.",
                gradient: "from-chart-5/20 to-chart-5/5",
                iconColor: "text-chart-5"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-card p-8 rounded-2xl"
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`mb-6 ${feature.iconColor}`}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="mb-3 text-lg">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl mb-6">Priced Like Earbuds</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tactiq is a research project, so there is no product to buy and no retail price to promise. The positioning is the commitment: consumer electronics money, not braille-display money.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Essential Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -8 }}
              className="bg-card rounded-3xl p-8"
            >
              <div className="mb-6">
                <h3 className="text-2xl mb-2">Bench Prototype</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold">Under $60</span>
                  <span className="text-muted-foreground">in parts</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "One 3D-printed ring shell",
                  "Passive magnet + three low-cost magnetometers",
                  "Squeeze-to-wake sensing",
                  "Haptic feedback motor",
                  "Bluetooth LE module",
                  "Built entirely from off-the-shelf components",
                  "Bench experiment: August–October 2026"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={scrollToWaitlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 border-2 border-primary/20 rounded-xl hover:bg-primary/5 transition-colors"
              >
                Follow the Research
              </motion.button>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -8 }}
              className="bg-primary text-primary-foreground rounded-3xl p-8 relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-foreground text-primary rounded-full text-sm font-semibold">
                Design Target
              </div>

              <div className="mb-6">
                <h3 className="text-2xl mb-2">Retail Vision</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold">Earbud-class</span>
                  <span className="text-primary-foreground/70">pricing</span>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "If the research holds, one day:",
                  "One ring — index finger, either hand",
                  "Nine fixed commands",
                  "Distinct haptic confirmation patterns",
                  "Optional single-earbud audio",
                  "Augments VoiceOver & TalkBack",
                  "No subscription",
                  "No firm retail price — earbud-class is the promise"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary-foreground flex-shrink-0 mt-0.5" />
                    <span className={i === 0 ? "font-medium" : "text-primary-foreground/85"}>{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={scrollToWaitlist}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-primary-foreground text-primary rounded-xl font-semibold hover:opacity-90 transition-opacity"
              >
                Join the Waitlist
              </motion.button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="text-muted-foreground">
              <span className="text-primary font-medium">Where things stand:</span> bench experiment August–October 2026 · AUSSEF submission 11 November 2026 · ISEF 2027 pathway.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing Philosophy Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="inline-block mb-6"
            >
              <div className="w-16 h-16 bg-primary-foreground/20 rounded-2xl flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8" />
              </div>
            </motion.div>

            <h2 className="text-4xl sm:text-5xl mb-8 leading-tight">Accessibility Should Not Cost More Than a Laptop</h2>
            <p className="text-xl opacity-95 mb-8 leading-relaxed">
              Refreshable braille displays run from <span className="font-bold">$799 to $15,500</span>, and the mainstream 20–40-cell models most people actually buy sit around $2,000–$3,800. Tactiq is built from ordinary consumer components and positioned to be priced like earbuds.
            </p>
            <div className="inline-block bg-primary-foreground/10 rounded-2xl px-8 py-6">
              <p className="text-2xl font-semibold">
                Tactiq is built to prove accessibility doesn't have to be expensive.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Research */}
      <section id="research" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-script text-primary text-lg sm:text-xl block mb-3">
              the research
            </span>
            <h2 className="text-4xl sm:text-5xl mb-6">Two Studies Behind the Ring</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tactiq's design is not a guess — it comes out of two linked studies, and every claim below is either a published measurement, a simulation result, or a pre-registered target.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                  <Hand className="w-6 h-6" />
                </div>
                <h3 className="text-xl">Study 1 — Design</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The design study derives nine design principles for eyes-free wearable input, then asks how many contact points a thumb can reliably hit. The capacity analysis finds a knee at eight: going to sixteen points adds only about +0.31 bits of information but collapses worst-command accuracy from 87% to roughly 50%.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                For context: Apple's AssistiveTouch ships 4 gestures, Meta's sEMG wristband handles roughly 9, and EFRing reached 89.5% accuracy on 9. Nine commands is not timid — it is where reliable sits.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card p-8 rounded-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center text-chart-1">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <h3 className="text-xl">Study 2 — Physics</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-4">
                The physics study simulates magnet trilateration: a passive magnet and three low-cost magnetometers, using the inverse-cube law, localize the thumb to about 1.65 mm at the array centre and about 4.4 mm off-centre (a ≈2 mm realistic centroid budget) — against 20–25 mm between contact points. That is an order-of-magnitude margin, in simulation, under stated conditions: magnet tilt under ~12°, per-sensor gain calibration, and a minimum sensor standoff.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The honest risk: sensor noise is not the bottleneck — thumb aim is. That is exactly why the bench work measures real thumbs first.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-card rounded-2xl p-8"
          >
            <p className="text-muted-foreground mb-3">
              <span className="text-foreground font-medium">Status:</span> bench experiment August–October 2026 · AUSSEF submission 11 November 2026 · ISEF 2027 pathway · papers available on request.
            </p>
            <p className="text-sm text-muted-foreground italic">
              All performance figures are pre-registered targets, not achieved results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <FaqSection />

      {/* CTA Section */}
      <section id="waitlist" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background gradients */}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h2 className="text-5xl sm:text-6xl mb-4 text-primary">
                Feel in Control
              </h2>
            </motion.div>

            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              The hand is the controller. Join the waitlist to follow the research — and be first to know when there is something real to try.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl p-8 max-w-xl mx-auto"
            >
              {formStatus === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  role="status"
                  className="py-6 text-center"
                >
                  <div className="w-14 h-14 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
                  <p className="text-muted-foreground">
                    Thanks{form.fullName ? `, ${form.fullName.trim().split(' ')[0]}` : ''} — we'll email{' '}
                    <span className="text-foreground">{form.email}</span> with research updates and bench-experiment results as they land.
                  </p>
                </motion.div>
              ) : (
                <>
                  <form onSubmit={handleWaitlistSubmit} noValidate className="space-y-4 text-left">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="wl-name" className="sr-only">Full name</label>
                        <input
                          id="wl-name"
                          type="text"
                          autoComplete="name"
                          value={form.fullName}
                          onChange={(e) => {
                            setForm({ ...form, fullName: e.target.value });
                            if (formError) setFormError('');
                          }}
                          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                          placeholder="Full name"
                          aria-invalid={!!nameFieldError}
                          aria-describedby={nameFieldError ? 'wl-name-error' : undefined}
                          className={`w-full px-6 py-4 rounded-xl border bg-input-background focus:outline-none focus:ring-2 transition-all ${
                            nameFieldError
                              ? 'border-destructive focus:ring-destructive/40'
                              : 'border-border focus:ring-primary/50'
                          }`}
                        />
                        {nameFieldError && (
                          <p id="wl-name-error" className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {nameFieldError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="wl-email" className="sr-only">Email address</label>
                        <div className="relative">
                          <input
                            id="wl-email"
                            type="email"
                            autoComplete="email"
                            value={form.email}
                            onChange={(e) => {
                              setForm({ ...form, email: e.target.value });
                              if (formError) setFormError('');
                            }}
                            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                            placeholder="Email address"
                            aria-invalid={!!emailFieldError}
                            aria-describedby={emailFieldError ? 'wl-email-error' : undefined}
                            className={`w-full px-6 py-4 pr-12 rounded-xl border bg-input-background focus:outline-none focus:ring-2 transition-all ${
                              emailFieldError
                                ? 'border-destructive focus:ring-destructive/40'
                                : 'border-border focus:ring-primary/50'
                            }`}
                          />
                          {emailValid && (
                            <CheckCircle2
                              aria-hidden
                              className="w-5 h-5 text-accent absolute right-4 top-1/2 -translate-y-1/2"
                            />
                          )}
                        </div>
                        {emailFieldError && (
                          <p id="wl-email-error" className="mt-1.5 text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            {emailFieldError}
                          </p>
                        )}
                      </div>
                    </div>
                    <label htmlFor="wl-category" className="sr-only">I'm interested as a...</label>
                    <select
                      id="wl-category"
                      value={form.userCategory}
                      onChange={(e) => setForm({ ...form, userCategory: e.target.value })}
                      className="w-full px-6 py-4 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-muted-foreground"
                    >
                      <option value="">I'm interested as a...</option>
                      <option value="blind_accessibility">Blind or visually impaired user</option>
                      <option value="elderly">Elderly or motor-impaired user</option>
                      <option value="student">Student</option>
                      <option value="commuter">Commuter / Professional</option>
                      <option value="athlete">Athlete / Fitness enthusiast</option>
                      <option value="developer">Developer / Tech enthusiast</option>
                      <option value="carer">Carer / Healthcare professional</option>
                      <option value="general">General interest</option>
                    </select>

                    {formError && (
                      <p role="alert" className="text-sm text-destructive">{formError}</p>
                    )}

                    <motion.button
                      type="submit"
                      disabled={formStatus === 'submitting'}
                      whileHover={{ scale: formStatus === 'submitting' ? 1 : 1.02 }}
                      whileTap={{ scale: formStatus === 'submitting' ? 1 : 0.98 }}
                      className="w-full px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {formStatus === 'submitting' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Joining…
                        </>
                      ) : (
                        <>
                          Join the Waitlist
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </motion.button>
                  </form>
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    No spam. Just research updates — and first word when there is something real to try.
                  </p>
                </>
              )}
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm">Student research project</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">Privacy first</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-sm">Bench experiment Aug–Oct 2026</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      </main>

      {/* Footer */}
      <SiteFooter />

      {/* Back-to-top floating button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 12 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="fixed bottom-6 right-6 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl transition-shadow"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}