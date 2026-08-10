import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import { signUp } from '../../lib/api';
import { useAuth } from './AuthContext';
import AuthLayout, { fieldClass } from './AuthLayout';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const next = params.get('next') || '/dashboard';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [userCategory, setUserCategory] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to={next} replace />;
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp({ email, password, fullName, userCategory });
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create your account.');
      setLoading(false);
    }
  };

  const signInHref = `/login${params.toString() ? `?${params.toString()}` : ''}`;

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Save sample command layouts, store your preferences and follow the research. There is nothing to buy — Tactiq is a research prototype."
      footer={
        <>
          Already have an account?{' '}
          <Link to={signInHref} className="text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="su-name" className="block text-sm mb-1.5">
            Full name
          </label>
          <input
            id="su-name"
            type="text"
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Ada Lovelace"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="su-email" className="block text-sm mb-1.5">
            Email
          </label>
          <input
            id="su-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldClass}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="su-password" className="block text-sm mb-1.5">
              Password
            </label>
            <input
              id="su-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="su-confirm" className="block text-sm mb-1.5">
              Confirm
            </label>
            <input
              id="su-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="su-category" className="block text-sm mb-1.5">
            How would you like to be involved? <span className="text-muted-foreground">(optional)</span>
          </label>
          <select
            id="su-category"
            value={userCategory}
            onChange={(e) => setUserCategory(e.target.value)}
            className={`${fieldClass} text-muted-foreground`}
          >
            <option value="">Prefer not to say</option>
            <option value="blind-low-vision">Exploring as a blind or low-vision phone user</option>
            <option value="testing-interest">Interested in prototype testing</option>
            <option value="researcher">Researcher or educator</option>
            <option value="accessibility-professional">Accessibility professional</option>
            <option value="supporter">Supporter</option>
            <option value="other">Other</option>
          </select>
          <p className="mt-1.5 text-xs text-muted-foreground">
            This helps us understand who is following the research. It changes nothing about
            your account and you can leave it blank.
          </p>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account…
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
