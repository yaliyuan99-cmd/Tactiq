/** Shared shell for the sign-in / sign-up / password screens. */
import { Link } from 'react-router';
import { Hand } from 'lucide-react';
import type { ReactNode } from 'react';

/** Shared input styling used across the auth forms. */
export const fieldClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all';

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
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex flex-col">
      <header className="px-4 sm:px-6 lg:px-8 py-5">
        <Link to="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Hand className="w-6 h-6" />
          <span className="text-xl font-semibold">Tactiq</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md animate-enter-rise">
          {banner}
          <div className="bg-card border border-border/60 rounded-2xl p-8 shadow-2xl backdrop-blur-sm">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold mb-2">{title}</h1>
              {subtitle && <p className="text-muted-foreground text-sm">{subtitle}</p>}
            </div>
            {children}
          </div>
          {footer && (
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          )}
        </div>
      </main>
    </div>
  );
}
