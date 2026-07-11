import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { updatePassword } from '../../lib/api';
import AuthLayout, { fieldClass } from './AuthLayout';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  // Present in local/dev mode (carried from the forgot-password page).
  // With Supabase the recovery session is detected from the URL automatically.
  const email = params.get('email') ?? undefined;

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await updatePassword(password, email ? { email } : undefined);
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password.');
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Choose a new password"
      subtitle={done ? undefined : 'Enter a new password for your account.'}
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Password updated</h2>
          <p className="text-muted-foreground text-sm">
            Redirecting you to sign in…
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="rp-password" className="block text-sm mb-1.5">
              New password
            </label>
            <input
              id="rp-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className={fieldClass}
            />
          </div>
          <div>
            <label htmlFor="rp-confirm" className="block text-sm mb-1.5">
              Confirm new password
            </label>
            <input
              id="rp-confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat password"
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
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
