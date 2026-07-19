import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Hand,
  LogOut,
  User as UserIcon,
  KeyRound,
  Layers,
  Trash2,
  Loader2,
  Check,
  ArrowLeft,
  ShoppingBag,
  Settings2,
  Users,
  ChevronRight,
  Pencil,
} from 'lucide-react';
import {
  signOut,
  updateProfile,
  listGestureConfigs,
  deleteGestureConfig,
  getLatestOrder,
  isAdmin as checkIsAdmin,
} from '../../lib/api';
import type { GestureConfigRow, OrderRow } from '../../lib/database.types';
import { commandLabelFor } from '../../lib/gestures';
import { useAuth } from '../auth/AuthContext';
import { fieldClass } from '../auth/AuthLayout';
import DeviceDashboard from './DeviceDashboard';
import GestureActivity from './GestureActivity';

const CATEGORY_LABELS: Record<string, string> = {
  'blind-low-vision': 'Blind or low-vision user',
  elderly: 'Elderly or motor-impaired user',
  'motor-accessibility': 'Accessibility user',
  developer: 'Developer / Tech enthusiast',
  'early-adopter': 'Early adopter',
  other: 'Other',
};

export default function AccountPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [userCategory, setUserCategory] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [configs, setConfigs] = useState<GestureConfigRow[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);

  const [latestOrder, setLatestOrder] = useState<OrderRow | null>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setFullName(user?.fullName ?? '');
  }, [user?.fullName]);

  useEffect(() => {
    let mounted = true;
    listGestureConfigs()
      .then((rows) => {
        if (mounted) setConfigs(rows);
      })
      .catch(() => {
        if (mounted) setConfigs([]);
      })
      .finally(() => {
        if (mounted) setLoadingConfigs(false);
      });
    getLatestOrder()
      .then((o) => mounted && setLatestOrder(o))
      .catch(() => {});
    checkIsAdmin()
      .then((a) => mounted && setAdmin(a))
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setSavedProfile(false);
    setSavingProfile(true);
    try {
      await updateProfile({ fullName, userCategory: userCategory || undefined });
      setSavedProfile(true);
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    await deleteGestureConfig(id);
    setConfigs((prev) => prev.filter((c) => c.id !== id));
  };

  const firstName = (user?.fullName || user?.email || 'there').split(' ')[0];
  const seedKey = user?.id || user?.email || 'demo';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Top bar */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hand className="w-6 h-6" />
            <span className="text-xl font-semibold">Tactiq</span>
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>

        <div className="animate-enter-rise">
          <h1 className="text-3xl font-semibold mb-1">Hi, {firstName}</h1>
          <p className="text-muted-foreground mb-8">
            Your device, your keyboard, your account — all in one place.
          </p>

          {/* Customise keyboard — hero action */}
          <Link
            to="/customize"
            className="group block mb-6 rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-chart-2/10 p-6 hover:shadow-lg transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <Settings2 className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">Customise your keyboard &amp; inputs</h2>
                <p className="text-sm text-muted-foreground">
                  Remap any key — letters, spacebar, thumb, pinky and palm — then save
                  layouts for different moments.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Device telemetry — full width */}
            <DeviceDashboard seedKey={seedKey} />

            {/* Live gesture recognitions — full width */}
            <GestureActivity seedKey={seedKey} />

            {/* Profile card */}
            <section className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <UserIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Profile</h2>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-4">
                <div>
                  <label htmlFor="acct-email" className="block text-sm mb-1.5">
                    Email
                  </label>
                  <input
                    id="acct-email"
                    type="email"
                    value={user?.email ?? ''}
                    disabled
                    className={`${fieldClass} opacity-60 cursor-not-allowed`}
                  />
                </div>
                <div>
                  <label htmlFor="acct-name" className="block text-sm mb-1.5">
                    Full name
                  </label>
                  <input
                    id="acct-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="acct-category" className="block text-sm mb-1.5">
                    I use Tactiq as…
                  </label>
                  <select
                    id="acct-category"
                    value={userCategory}
                    onChange={(e) => setUserCategory(e.target.value)}
                    className={`${fieldClass} text-muted-foreground`}
                  >
                    <option value="">Prefer not to say</option>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {profileError && (
                  <p role="alert" className="text-sm text-destructive">
                    {profileError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:shadow-lg transition-shadow font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving…
                    </>
                  ) : savedProfile ? (
                    <>
                      <Check className="w-4 h-4" /> Saved
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
              </form>
            </section>

            {/* Security + orders column */}
            <div className="space-y-6">
              <section className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <KeyRound className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Security</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Keep your account secure with a strong, unique password.
                </p>
                <Link
                  to="/reset-password"
                  className="inline-block px-5 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                >
                  Change password
                </Link>
              </section>

              <section className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Your order</h2>
                </div>
                {latestOrder ? (
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">
                        {latestOrder.plan === 'pro' ? 'Tactiq Pro' : 'Tactiq Essential'}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/15 text-accent capitalize">
                        {latestOrder.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {(latestOrder.amount_cents / 100).toLocaleString(undefined, {
                        style: 'currency',
                        currency: latestOrder.currency,
                      })}{' '}
                      · Reserved {new Date(latestOrder.created_at).toLocaleDateString()}. We’ll email
                      you before the Q3 2026 launch.
                    </p>
                    <Link
                      to="/checkout?plan=pro"
                      className="inline-block px-5 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm font-medium"
                    >
                      Change or add an order
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground mb-4">
                      Ready to get your Tactiq rings? Pick a plan and check out.
                    </p>
                    <Link
                      to="/checkout?plan=pro"
                      className="inline-block px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity text-sm font-medium"
                    >
                      Go to checkout
                    </Link>
                  </>
                )}
              </section>
            </div>

            {/* Saved layouts — full width */}
            <section className="bg-card border border-border rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold">Saved gesture layouts</h2>
                </div>
                <Link
                  to="/customize"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:shadow-lg transition-shadow"
                >
                  <Settings2 className="w-4 h-4" /> Customise
                </Link>
              </div>

              {loadingConfigs ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading…
                </div>
              ) : configs.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">
                  You haven't saved any layouts yet.{' '}
                  <Link to="/customize" className="text-primary hover:underline">
                    Open the customiser
                  </Link>{' '}
                  to build and save your first one.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {configs.map((config) => (
                    <li key={config.id} className="flex items-center justify-between py-3 gap-3">
                      <div className="min-w-0">
                        <p className="font-medium flex items-center gap-2">
                          {config.name}
                          {config.is_active && (
                            <span className="text-xs text-primary">· Active</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          Pinky: {commandLabelFor(config.layout, 'pinky-mid')} ·{' '}
                          {commandLabelFor(config.layout, 'pinky-bottom')} · Updated{' '}
                          {new Date(config.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Link
                          to={`/customize?id=${config.id}`}
                          aria-label={`Edit ${config.name}`}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteConfig(config.id)}
                          aria-label={`Delete ${config.name}`}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Admin entry — full width, admins only */}
            {admin && (
              <Link
                to="/admin"
                className="lg:col-span-2 group flex items-center justify-between gap-4 bg-card border border-border rounded-2xl p-5 hover:bg-secondary/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Waitlist admin</p>
                    <p className="text-sm text-muted-foreground">
                      View and export everyone who has signed up.
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
