/**
 * The auth context and its reader hook.
 *
 * Deliberately separate from AuthContext.tsx, which exports the provider
 * component. A file that exports both a component and something else breaks
 * React Fast Refresh: editing it during development remounts the tree instead
 * of hot-updating it, so the signed-in user and every piece of state below the
 * provider is thrown away on each save. Keeping the non-component exports here
 * means AuthContext.tsx exports only <AuthProvider>, and refresh works.
 */
import { createContext, useContext } from 'react';
import type { AuthUser } from '../../lib/api';

export interface AuthContextValue {
  /** The signed-in user, or null when logged out. */
  user: AuthUser | null;
  /** True until the initial session lookup resolves. */
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
