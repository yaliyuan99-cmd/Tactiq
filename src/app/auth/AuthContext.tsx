/**
 * App-wide auth state. Wrap the app in <AuthProvider> once, then read the
 * current user anywhere with the useAuth() hook from ./useAuth.
 *
 * This file exports only the provider component, on purpose: React Fast
 * Refresh cannot hot-update a module that also exports non-components, and a
 * remount here would drop the session and all state below it on every save.
 * The context and the hook live in ./useAuth.ts for that reason.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { getCurrentUser, onAuthChange, type AuthUser } from '../../lib/api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getCurrentUser()
      .then((u) => {
        if (mounted) setUser(u);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const unsubscribe = onAuthChange((u) => {
      if (mounted) setUser(u);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  );
}
