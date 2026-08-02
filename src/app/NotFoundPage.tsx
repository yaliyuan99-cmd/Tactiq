/** Real 404 page — served for unknown URLs (and prerendered to dist/404.html). */
import { Link } from 'react-router';
import { Hand, Compass } from 'lucide-react';

export default function NotFoundPage() {
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
              to="/project#how-it-works"
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
