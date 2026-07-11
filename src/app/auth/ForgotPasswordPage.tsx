import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Loader2, MailCheck } from 'lucide-react';
import { resetPassword } from '../../lib/api';
import AuthLayout, { fieldClass } from './AuthLayout';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  // In local (no-Supabase) mode we can't email a link, so we offer a direct one.
  const [localMode, setLocalMode] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await resetPassword(email);
      setLocalMode(Boolean(res.local));
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={sent ? undefined : "Enter your email and we'll send you a reset link."}
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      {sent ? (
        <div className="text-center py-2">
          <div className="w-14 h-14 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Check your inbox</h2>
          <p className="text-muted-foreground text-sm">
            If an account exists for <span className="text-foreground">{email}</span>, a
            password-reset link is on its way.
          </p>

          {localMode && (
            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4 text-left text-sm">
              <p className="text-muted-foreground mb-3">
                <strong className="text-foreground">Dev mode:</strong> no email backend is
                connected, so use this direct link to set a new password.
              </p>
              <Link
                to={`/reset-password?email=${encodeURIComponent(email)}`}
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
              >
                Set a new password
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-sm mb-1.5">
              Email
            </label>
            <input
              id="fp-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
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
                Sending…
              </>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
