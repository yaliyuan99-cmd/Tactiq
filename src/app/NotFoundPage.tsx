/**
 * Real 404 page — served for unknown URLs (and prerendered to dist/404.html).
 *
 * The title is set here as well as in the prerender, because the two arrive by
 * different routes: a direct hit on a bad URL gets dist/404.html (correct title
 * already baked in), but an in-app link to a dead route renders this component
 * client-side, where the previous page's title would otherwise stick. Screen
 * readers announce the document title on navigation, so a stale one tells a
 * blind user they are somewhere they are not (WCAG 2.4.2).
 */
import { useEffect } from 'react';
import { Link } from 'react-router';
import { Hand, Compass } from 'lucide-react';

/** Kept identical to the `/404` entry in prerender.mjs. */
export const NOT_FOUND_TITLE = 'Page not found · Tactiq';

export default function NotFoundPage() {
  useEffect(() => {
    document.title = NOT_FOUND_TITLE;
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-5">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Hand className="w-6 h-6" />
          <span className="text-xl font-semibold">Tactiq</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md text-center bg-card border border-border/60 rounded-2xl p-10 shadow-2xl">
          <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-5">
            <Compass className="w-7 h-7" aria-hidden />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-muted-foreground mb-8">
            That address doesn't exist on this site. Tactiq is small — everything lives on
            the homepage and the product page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Back to home
            </Link>
            <Link
              to="/how-it-works"
              className="px-6 py-3 border border-border rounded-xl hover:bg-secondary transition-colors font-medium"
            >
              See how the ring works
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
