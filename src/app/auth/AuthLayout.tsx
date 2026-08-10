/**
 * Shared shell for the sign-in / sign-up / password screens.
 *
 * Understated split layout: a quiet product panel on the left (the hand,
 * because the hand is the interface), the form flat on the right — no
 * floating card, no gradient backdrop. On small screens the panel folds
 * away and the form stands alone.
 */
import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router';
import { Hand } from 'lucide-react';
import { HandIllustration } from '../components/SimHand';

/** Shared input styling used across the auth forms. */
export const fieldClass =
  'w-full px-3.5 py-3 rounded-md border border-input bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow';

export default function AuthLayout({
  title,
  subtitle,
  banner,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  banner?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  // Every auth screen gets its own tab title (P1-4 in AUDIT.md).
  useEffect(() => {
    document.title = `${title} · Tactiq`;
  }, [title]);

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[5fr_7fr]">
      {/* Quiet product panel — desktop only. */}
      <div className="hidden lg:flex flex-col justify-between border-r border-border px-10 py-8">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Hand className="w-6 h-6" aria-hidden />
          <span className="text-xl font-semibold">Tactiq</span>
        </Link>
        <div aria-hidden className="w-full max-w-[260px] mx-auto opacity-80">
          <HandIllustration />
        </div>
        <p className="text-sm text-muted-foreground max-w-[34ch]">
          Nine commands on the fingers you can always feel. A student research
          prototype — nothing to buy, nothing to charge yet.
        </p>
      </div>

      {/* The form, flat. */}
      <div className="flex min-h-screen flex-col">
        <header className="lg:hidden px-4 sm:px-6 py-5">
          <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hand className="w-6 h-6" aria-hidden />
            <span className="text-xl font-semibold">Tactiq</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center px-4 sm:px-6 lg:px-16 py-10">
          <div className="w-full max-w-sm mx-auto lg:mx-0">
            {banner}
            <h1 className="text-2xl font-semibold mb-1.5">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-sm mb-8">{subtitle}</p>}
            {!subtitle && <div className="mb-8" />}
            {children}
            {footer && <div className="mt-8 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </main>
      </div>
    </div>
  );
}
