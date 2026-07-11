/**
 * App-wide auth state. Wrap the app in <AuthProvider> once, then read the
 * current user anywhere with the useAuth() hook.
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { getCurrentUser, onAuthChange, type AuthUser } from '../../lib/api';

interface AuthContextValue {
  /** The signed-in user, or null when logged out. */
  user: AuthUser | null;
  /** True until the initial session lookup resolves. */
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

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

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
