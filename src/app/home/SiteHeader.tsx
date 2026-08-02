/**
 * Calm, compact site header: skip link, five section links, one quiet CTA.
 * "Sign in" is deliberately not in the primary navigation (accounts exist but
 * are secondary to the research story — the footer links to them).
 */
import { useEffect, useState } from 'react';
import { Hand, Menu, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'The ring', href: '#the-ring' },
  { label: 'Research', href: '#research' },
  { label: 'Project status', href: '#status' },
  { label: 'FAQ', href: '#faq' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('tactiq-theme', theme);
  }, [theme]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <nav aria-label="Primary" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#main-content" className="flex items-center gap-2" aria-label="Tactiq — back to top of page">
              <Hand className="w-5 h-5" aria-hidden />
              <span className="text-lg font-semibold">Tactiq</span>
            </a>

            <div className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-[0.95rem] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-11 h-11 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" aria-hidden /> : <Sun className="w-4 h-4" aria-hidden />}
              </button>
              <a
                href="#follow"
                className="hidden sm:inline-flex items-center px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Join the research
              </a>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-md border border-border"
              >
                {menuOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="md:hidden border-t border-border py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="block px-2 py-3 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"
                >
                  {l.label}
                </a>
              ))}
              <a
                href="#follow"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-3 font-medium text-primary-strong"
              >
                Join the research
              </a>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
