/**
 * Follow the project — the research sign-up form, named for what it actually
 * does. Visible labels above every field, accessible errors, a polite status
 * region, autocomplete attributes, loading and disabled states, and a plain
 * privacy explanation. Also carries the short affordability statement, since
 * there is no product to price.
 */
import { useState, type FormEvent } from 'react';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { joinWaitlist } from '../../lib/api';
import EvidenceStatus from './EvidenceStatus';

const RELATIONSHIPS = [
  { value: '', label: 'Prefer not to say' },
  { value: 'blind_accessibility', label: 'Blind or low-vision phone user' },
  { value: 'carer', label: 'Family member, carer or O&M professional' },
  { value: 'elderly', label: 'Older or motor-impaired phone user' },
  { value: 'developer', label: 'Accessibility researcher or developer' },
  { value: 'student', label: 'Student or educator' },
  { value: 'general', label: 'Interested observer' },
];

export default function FollowForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errors, setErrors] = useState<{ name?: string; email?: string; form?: string }>({});

  const validate = () => {
    const next: typeof errors = {};
    if (!fullName.trim()) next.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      next.email = email.trim() ? 'That doesn’t look like a valid email address.' : 'Please enter your email address.';
    }
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (v.name || v.email) {
      document.getElementById(v.name ? 'ff-name' : 'ff-email')?.focus();
      return;
    }
    setStatus('submitting');
    const result = await joinWaitlist({
      fullName,
      email,
      userCategory: relationship,
      country: 'AU',
    });
    if (result.ok) {
      setStatus('success');
    } else {
      setStatus('idle');
      setErrors({ form: result.error || 'Something went wrong — please try again.' });
    }
  };

  const fieldCls =
    'w-full h-12 px-3.5 rounded-md border border-input bg-input-background focus:outline-none focus-visible:outline-2 focus-visible:outline-ring';

  return (
    <section id="follow" aria-labelledby="follow-heading" className="px-4 sm:px-6 lg:px-8 py-16 border-t border-border">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Affordability statement — replaces pricing cards entirely */}
        <div>
          <h2 className="text-3xl sm:text-4xl mb-4">Designed around ordinary components</h2>
          <p className="text-muted-foreground mb-4 max-w-[42rem]">
            The bench prototype is built from off-the-shelf parts for under $60 — three
            magnetometers, a small magnet, a haptic motor and a Bluetooth module. That is the
            point of the design: nothing in it requires exotic hardware.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[42rem]">
            The long-term aim is consumer-electronics pricing — the kind of money people spend
            on earbuds, not the $799–$15,500 of refreshable braille hardware. No retail price or
            release date has been confirmed, and there is nothing to buy today.
          </p>
          <p className="mb-2">
            <EvidenceStatus kind="confirmed">Prototype component cost — under $60</EvidenceStatus>
          </p>
          <p>
            <EvidenceStatus kind="future">Retail pricing — no confirmed price or date</EvidenceStatus>
          </p>
        </div>

        {/* The form */}
        <div>
          <h2 id="follow-heading" className="text-3xl sm:text-4xl mb-3">
            Follow the project
          </h2>
          <p className="text-muted-foreground mb-8">
            Receive occasional updates about testing, results and opportunities to give feedback.
          </p>

          {status === 'success' ? (
            <div role="status" className="flex items-start gap-3 p-5 rounded-md bg-card border border-border">
              <CheckCircle2 className="w-5 h-5 text-status-confirmed shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium mb-1">You're on the list.</p>
                <p className="text-muted-foreground text-[0.95rem]">
                  Thanks{fullName ? `, ${fullName.trim().split(' ')[0]}` : ''} — we'll email{' '}
                  <span className="text-foreground">{email}</span> when there is something real to
                  report: bench results first.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="space-y-5">
              <div>
                <label htmlFor="ff-name" className="block font-medium mb-1.5">
                  Name
                </label>
                <input
                  id="ff-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? 'ff-name-error' : undefined}
                  className={`${fieldCls} ${errors.name ? 'border-destructive' : ''}`}
                  disabled={status === 'submitting'}
                />
                {errors.name && (
                  <p id="ff-name-error" className="mt-1.5 text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ff-email" className="block font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="ff-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'ff-email-error' : undefined}
                  className={`${fieldCls} ${errors.email ? 'border-destructive' : ''}`}
                  disabled={status === 'submitting'}
                />
                {errors.email && (
                  <p id="ff-email-error" className="mt-1.5 text-sm text-destructive flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0" aria-hidden />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="ff-relationship" className="block font-medium mb-1.5">
                  Your relationship to the project <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <select
                  id="ff-relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className={fieldCls}
                  disabled={status === 'submitting'}
                >
                  {RELATIONSHIPS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div aria-live="polite">
                {errors.form && (
                  <p role="alert" className="text-sm text-destructive mb-3">
                    {errors.form}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                    Joining…
                  </>
                ) : (
                  'Follow the project'
                )}
              </button>

              <p className="text-sm text-muted-foreground max-w-[48ch]">
                We store only what you enter here, use it only for project updates, and delete it
                on request — see the <a href="/privacy" className="underline underline-offset-4 hover:text-primary-strong">privacy policy</a>.
                No spam, no sharing, roughly one email a month at most.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
