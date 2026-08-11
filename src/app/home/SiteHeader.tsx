/**
 * Calm, compact site header shared by every public page.
 * Router-aware links with aria-current, a skip link, an auth-aware
 * Sign in / Dashboard slot, and one restrained primary CTA.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Hand, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const NAV_LINKS = [
  { label: 'How it works', to: '/how-it-works' },
  { label: 'The ring', to: '/prototype' },
  { label: 'Research', to: '/research' },
  { label: 'Project status', to: '/status' },
  { label: 'FAQ', to: '/faq' },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
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

  const linkCls = (to: string) =>
    `text-[0.95rem] underline-offset-4 hover:underline transition-colors ${
      pathname === to ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <>
      {/* bg-foreground, not bg-primary: white on the dark theme's primary is
          4.03:1, under the 4.5:1 that 16px normal-weight text needs. The
          foreground/background pair clears it in both themes (15.1 / 14.4). */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <nav aria-label="Primary" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link to="/" className="flex items-center gap-2" aria-label="Tactiq home">
              <Hand className="w-5 h-5" aria-hidden />
              <span className="text-lg font-semibold">Tactiq</span>
            </Link>

            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  aria-current={pathname === l.to ? 'page' : undefined}
                  className={linkCls(l.to)}
                >
                  {l.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <Link
                  to="/dashboard"
                  aria-current={pathname.startsWith('/dashboard') ? 'page' : undefined}
                  className="hidden sm:inline-flex items-center h-11 px-3 text-[0.95rem] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:inline-flex items-center h-11 px-3 text-[0.95rem] text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              )}
              <button
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="w-11 h-11 flex items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Moon className="w-4 h-4" aria-hidden /> : <Sun className="w-4 h-4" aria-hidden />}
              </button>
              <a
                href="/#follow"
                className="hidden sm:inline-flex items-center px-4 h-11 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity"
              >
                Follow the project
              </a>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-md border border-border"
              >
                {menuOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <div className="lg:hidden border-t border-border py-3 space-y-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === l.to ? 'page' : undefined}
                  className={`block px-2 py-3 rounded-md hover:bg-secondary ${
                    pathname === l.to ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
              {user ? (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary">
                  Dashboard
                </Link>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)} className="block px-2 py-3 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary">
                  Sign in
                </Link>
              )}
              <a
                href="/#follow"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-3 font-medium text-primary-strong"
              >
                Follow the project
              </a>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
