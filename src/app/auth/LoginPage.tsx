import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Loader2, ShoppingBag } from 'lucide-react';
import { signIn } from '../../lib/api';
import { useAuth } from './AuthContext';
import AuthLayout, { fieldClass } from './AuthLayout';

export default function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const next = params.get('next') || '/account';
  const intent = params.get('intent');
  const isBuyIntent = intent === 'buy';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already signed in? Skip straight to the destination.
  if (user) {
    return <Navigate to={next} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Please try again.');
      setLoading(false);
    }
  };

  // Preserve next/intent/plan when bouncing over to sign-up.
  const signUpHref = `/signup${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage your account and gesture layouts."
      banner={
        isBuyIntent ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span>Sign in to continue your purchase — your cart is waiting.</span>
          </div>
        ) : null
      }
      footer={
        <>
          New to Tactiq?{' '}
          <Link to={signUpHref} className="text-primary hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm mb-1.5">
            Email
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-sm">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={fieldClass}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
