import { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { motion } from 'motion/react';
import {
  Hand,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Check,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { createOrder } from '../../lib/api';
import type { PlanId } from '../../lib/database.types';

interface Plan {
  id: PlanId;
  name: string;
  price: number;
  blurb: string;
  features: string[];
}

const PLANS: Record<string, Plan> = {
  essential: {
    id: 'essential',
    name: 'Tactiq Essential',
    price: 249,
    blurb: 'Two smart rings with the core gesture toolkit.',
    features: ['Two smart rings (left & right)', 'Voice-guided setup', '60+ commands'],
  },
  pro: {
    id: 'pro',
    name: 'Tactiq Pro',
    price: 349,
    blurb: 'Everything in Essential, plus cloud sync and priority support.',
    features: [
      'Advanced gesture profiles',
      'Cloud sync across devices',
      'Priority support',
      '2-year extended warranty',
    ],
  },
};

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();
  const planId = params.get('plan') ?? 'pro';
  const plan = PLANS[planId] ?? PLANS.pro;

  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderError, setOrderError] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Logged-out shoppers are sent to sign up first — then back here.
  if (!user) {
    const next = encodeURIComponent(`/checkout?plan=${plan.id}`);
    return <Navigate to={`/signup?intent=buy&plan=${plan.id}&next=${next}`} replace />;
  }

  const shipping = 0;
  const total = plan.price + shipping;

  const handlePlaceOrder = async () => {
    // Pre-launch reservation: the order is persisted, but no payment is taken.
    setOrderError('');
    setPlacing(true);
    try {
      await createOrder({
        plan: plan.id,
        amountCents: Math.round(plan.price * 100),
        currency: 'AUD',
      });
      setPlaced(true);
    } catch (err) {
      setOrderError(
        err instanceof Error ? err.message : 'Could not reserve your order. Please try again.',
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hand className="w-6 h-6" />
            <span className="text-xl font-semibold">Tactiq</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </Link>

        {placed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-10 text-center max-w-xl mx-auto"
          >
            <div className="w-16 h-16 bg-accent/15 text-accent rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">Order reserved!</h1>
            <p className="text-muted-foreground mb-6">
              Thanks, {(user.fullName || user.email || '').split(' ')[0]} — your{' '}
              {plan.name} reservation is confirmed. We'll email{' '}
              <span className="text-foreground">{user.email}</span> with shipping details
              before the Q3 2026 launch.
            </p>
            <Link
              to="/account"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Go to your account
            </Link>
          </motion.div>
        ) : (
          <>
            <h1 className="text-3xl font-semibold mb-8">Checkout</h1>
            <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
              {/* Plan / details */}
              <section className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-1">{plan.name}</h2>
                <p className="text-muted-foreground text-sm mb-5">{plan.blurb}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  {Object.values(PLANS).map((p) => (
                    <Link
                      key={p.id}
                      to={`/checkout?plan=${p.id}`}
                      className={`flex-1 text-center px-4 py-3 rounded-xl border text-sm transition-colors ${
                        p.id === plan.id
                          ? 'border-primary bg-primary/5 font-medium'
                          : 'border-border hover:bg-secondary'
                      }`}
                    >
                      {p.name}
                      <span className="block text-muted-foreground">${p.price} AUD</span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Order summary */}
              <aside className="bg-card border border-border rounded-2xl p-6 lg:sticky lg:top-6">
                <h2 className="text-lg font-semibold mb-4">Order summary</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">{plan.name}</dt>
                    <dd>${plan.price.toFixed(2)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Shipping</dt>
                    <dd className="text-primary">Free</dd>
                  </div>
                  <div className="border-t border-border my-3" />
                  <div className="flex justify-between text-base font-semibold">
                    <dt>Total</dt>
                    <dd>${total.toFixed(2)} AUD</dd>
                  </div>
                </dl>

                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {placing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" /> Placing…
                    </>
                  ) : (
                    'Reserve now'
                  )}
                </button>

                {orderError && (
                  <p role="alert" className="mt-3 text-sm text-destructive">
                    {orderError}
                  </p>
                )}

                <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  This is a pre-launch reservation — you won't be charged today. Payment is
                  collected when your rings ship.
                </p>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
