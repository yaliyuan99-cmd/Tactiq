import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Hand, ArrowLeft } from 'lucide-react';
import SiteFooter from '../components/SiteFooter';

interface LegalSection {
  heading: string;
  body: ReactNode;
}

interface LegalPageProps {
  title: string;
  updated: string;
  intro: ReactNode;
  sections: LegalSection[];
}

/** Shared shell for the Privacy Policy and Terms pages — reuses Tactiq's theme
 *  tokens so these read as part of the product site. */
export default function LegalPage({
  title,
  updated,
  intro,
  sections,
}: LegalPageProps) {
  useEffect(() => {
    document.title = `${title} · Tactiq`;
    window.scrollTo(0, 0);
  }, [title]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Hand className="w-6 h-6" />
            <span className="text-xl font-semibold">Tactiq</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>
        <div className="mt-8 text-base leading-relaxed text-muted-foreground">
          {intro}
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="text-xl font-semibold text-foreground">
                {s.heading}
              </h2>
              <div className="mt-3 text-base leading-relaxed text-muted-foreground space-y-3">
                {s.body}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 text-sm text-muted-foreground">
          Questions about this document? Email us at{' '}
          <a
            href="mailto:hello@tactiq.app"
            className="text-foreground underline underline-offset-4 hover:no-underline"
          >
            hello@tactiq.app
          </a>
          .
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
