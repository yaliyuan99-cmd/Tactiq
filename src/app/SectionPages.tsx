/**
 * Standalone public pages. Each wraps the same section components the
 * homepage composes, so content exists in exactly one place and the pages
 * can never drift from the homepage narrative.
 */
import { useEffect, type ReactNode } from 'react';
import SiteHeader from './home/SiteHeader';
import SiteFooter from './components/SiteFooter';
import Sequence from './home/Sequence';
import TryIt from './home/TryIt';
import HandMap from './home/HandMap';
import Prototype from './home/Prototype';
import DesignEvolution from './home/DesignEvolution';
import Research from './home/Research';
import Timeline from './home/Timeline';
import FaqSection from './components/FaqSection';
import FollowForm from './home/FollowForm';

function PageShell({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = `${title} · Tactiq`;
    window.scrollTo(0, 0);
  }, [title]);
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="focus:outline-none">
        {/* One page heading; the reused section components carry h2s. */}
        <h1 className="sr-only">{title}</h1>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <PageShell title="How it works">
      <Sequence />
      <TryIt />
      <HandMap />
    </PageShell>
  );
}

export function PrototypePage() {
  return (
    <PageShell title="The ring — prototype">
      <Prototype />
      <DesignEvolution />
    </PageShell>
  );
}

export function ResearchPage() {
  return (
    <PageShell title="Research">
      <Research />
    </PageShell>
  );
}

export function StatusPage() {
  return (
    <PageShell title="Project status">
      <Timeline />
      <FollowForm />
    </PageShell>
  );
}

export function FaqPage() {
  return (
    <PageShell title="FAQ">
      <FaqSection />
    </PageShell>
  );
}

export function HelpPage() {
  return (
    <PageShell title="Help">
      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl mb-6">Help</h2>
          <p className="text-muted-foreground mb-10 max-w-[60ch]">
            Tactiq is a student research prototype, so the honest answer to many questions is
            "not yet" — here is what you can do today, and how to reach us when something breaks.
          </p>

          <h2 className="text-2xl mb-3">Using the dashboard</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-10">
            <li>The command layout editor lets you assign your two personal shortcuts and save named layouts.</li>
            <li>No physical ring can be paired yet — the device page explains what pairing will look like, using clearly labelled interface previews.</li>
            <li>Command history shows sample data until real hardware exists to record from.</li>
            <li>Accessibility settings apply to this website immediately and are saved in your browser.</li>
          </ul>

          <h2 className="text-2xl mb-3">Troubleshooting</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-10">
            <li>If a saved layout doesn't appear, check you are signed in with the same account.</li>
            <li>If a page looks broken, a hard refresh (Cmd/Ctrl + Shift + R) clears stale files.</li>
            <li>If anything is hard to use with a screen reader or keyboard, that is a bug we treat as top priority — please tell us.</li>
          </ul>

          <h2 className="text-2xl mb-3">Contact</h2>
          <p className="text-muted-foreground">
            Email{' '}
            <a href="mailto:hello@tactiq.app" className="underline underline-offset-4 hover:text-primary-strong">
              hello@tactiq.app
            </a>{' '}
            — accessibility problems go to the top of the list.
          </p>
        </div>
      </section>
    </PageShell>
  );
}
