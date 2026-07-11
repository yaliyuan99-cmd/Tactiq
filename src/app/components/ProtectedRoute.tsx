/** Gate for authenticated-only routes. Redirects to /login (preserving the
 *  intended destination) when there's no signed-in user. */
import { Navigate, Outlet, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
