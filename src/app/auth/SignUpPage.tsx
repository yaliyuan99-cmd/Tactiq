import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router';
import { Loader2, ShoppingBag } from 'lucide-react';
import { signUp } from '../../lib/api';
import { useAuth } from './AuthContext';
import AuthLayout, { fieldClass } from './AuthLayout';

const PLAN_LABELS: Record<string, string> = {
  essential: 'Tactiq Essential',
  pro: 'Tactiq Pro',
};

export default function SignUpPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const next = params.get('next') || '/account';
  const intent = params.get('intent');
  const plan = params.get('plan');
  const isBuyIntent = intent === 'buy';

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
  const planLabel = plan ? PLAN_LABELS[plan] : null;

  return (
    <AuthLayout
      title={isBuyIntent ? 'Create an account to buy' : 'Create your account'}
      subtitle={
        isBuyIntent
          ? 'Sign up first — then we’ll take you straight to checkout.'
          : 'Join Tactiq to save layouts and manage your orders.'
      }
      banner={
        isBuyIntent ? (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm">
            <ShoppingBag className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span>
              <strong className="font-medium">Sign up, then buy.</strong> You need a free
              account to purchase
              {planLabel ? <> {planLabel}</> : <> your Tactiq rings</>}. It only takes a
              moment — we’ll send you right to checkout afterwards.
            </span>
          </div>
        ) : null
      }
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
            I'm joining as… <span className="text-muted-foreground">(optional)</span>
          </label>
          <select
            id="su-category"
            value={userCategory}
            onChange={(e) => setUserCategory(e.target.value)}
            className={`${fieldClass} text-muted-foreground`}
          >
            <option value="">Select one…</option>
            <option value="blind-low-vision">Blind or low-vision user</option>
            <option value="elderly">Elderly or motor-impaired user</option>
            <option value="motor-accessibility">Accessibility user</option>
            <option value="developer">Developer / Tech enthusiast</option>
            <option value="early-adopter">Early adopter</option>
            <option value="other">Other</option>
          </select>
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
              Creating account…
            </>
          ) : isBuyIntent ? (
            'Sign up & continue to checkout'
          ) : (
            'Create account'
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
