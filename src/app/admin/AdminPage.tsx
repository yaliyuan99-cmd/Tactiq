import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  Hand,
  ArrowLeft,
  Users as UsersIcon,
  Download,
  Loader2,
  AlertTriangle,
  Inbox,
  ShieldAlert,
  ShoppingBag,
  LayoutDashboard,
  Ban,
  ShieldCheck,
  Trash2,
  Crown,
  RefreshCw,
  FileDown,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  listWaitlist,
  isAdmin as checkIsAdmin,
  listAllOrders,
  listAllUsers,
  getAdminStats,
  setUserBanned,
  setUserAdmin,
  updateOrderStatus,
  deleteOrder,
  deleteWaitlistEntry,
  exportUserData,
  eraseUserData,
} from '../../lib/api';
import type { AdminUser, AdminStats } from '../../lib/api';
import type { WaitlistRow, OrderRow, OrderStatus } from '../../lib/database.types';
import { useAuth } from '../auth/AuthContext';

const CATEGORY_LABELS: Record<string, string> = {
  'blind-low-vision': 'Blind / low-vision',
  elderly: 'Elderly / motor-impaired',
  'motor-accessibility': 'Accessibility',
  developer: 'Developer',
  'early-adopter': 'Early adopter',
  other: 'Other',
};

const ORDER_STATUSES: OrderStatus[] = ['reserved', 'paid', 'shipped', 'cancelled'];

function money(cents: number, currency = 'AUD'): string {
  return (cents / 100).toLocaleString(undefined, { style: 'currency', currency });
}

function toCsv(rows: WaitlistRow[]): string {
  const header = ['Name', 'Email', 'Category', 'Country', 'Joined'];
  const lines = rows.map((r) =>
    [r.full_name, r.email, r.user_category ?? '', r.country ?? '', r.joined_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  return [header.join(','), ...lines].join('\n');
}

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

type Tab = 'overview' | 'users' | 'waitlist' | 'orders';

export default function AdminPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [entries, setEntries] = useState<WaitlistRow[]>([]);
  const [isLocal, setIsLocal] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState('');

  // Modals
  const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
  const [banReason, setBanReason] = useState('');
  const [eraseTarget, setEraseTarget] = useState<AdminUser | null>(null);

  const showFlash = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(''), 3000);
  };

  const loadAll = useCallback(async () => {
    setError('');
    try {
      const [s, u, o, w] = await Promise.all([
        getAdminStats(),
        listAllUsers(),
        listAllOrders(),
        listWaitlist(),
      ]);
      setStats(s);
      setUsers(u);
      setOrders(o);
      if (w.ok) {
        setEntries(w.entries);
        setIsLocal(!!w.local);
      } else {
        setError(w.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load admin data.');
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    checkIsAdmin()
      .then(async (ok) => {
        if (!mounted) return;
        setAuthorized(ok);
        if (ok) await loadAll();
      })
      .catch(() => mounted && setAuthorized(false))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [loadAll]);

  // --- Actions --------------------------------------------------------------
  const run = async (key: string, fn: () => Promise<void>, ok: string) => {
    setBusy(key);
    setError('');
    try {
      await fn();
      await loadAll();
      showFlash(ok);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(null);
    }
  };

  const confirmBan = () =>
    banTarget &&
    run(
      `ban-${banTarget.id}`,
      () => setUserBanned(banTarget.id, true, banReason),
      'Account suspended.',
    ).then(() => {
      setBanTarget(null);
      setBanReason('');
    });

  const confirmErase = () =>
    eraseTarget &&
    run(`erase-${eraseTarget.id}`, () => eraseUserData(eraseTarget.id), 'User data erased.').then(
      () => setEraseTarget(null),
    );

  const handleExport = async (u: AdminUser) => {
    setBusy(`export-${u.id}`);
    try {
      const data = await exportUserData(u.id);
      download(
        `tactiq-user-${(u.email || u.id).replace(/[^a-z0-9]+/gi, '_')}.json`,
        JSON.stringify(data, null, 2),
        'application/json',
      );
      showFlash('Data export downloaded.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setBusy(null);
    }
  };

  const adminCount = useMemo(() => users.filter((u) => u.isAdmin).length, [users]);

  // --- Gated states ---------------------------------------------------------
  if (loading || authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (authorized === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg w-full text-center bg-card border border-border rounded-2xl p-10"
        >
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Admins only</h1>
          <p className="text-muted-foreground mb-6">
            Your account doesn’t have admin access. If you should be able to manage Tactiq,
            ask an existing admin to grant you access.
          </p>
          <Link
            to="/account"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity font-medium"
          >
            Back to your dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const TABS: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: UsersIcon },
    { id: 'waitlist', label: 'Waitlist', icon: Inbox },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Hand className="w-6 h-6" />
            <span className="text-xl font-semibold">Tactiq</span>
            <span className="ml-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Admin
            </span>
          </Link>
          <Link
            to="/account"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/account"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to dashboard
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-semibold mb-1">Admin console</h1>
            <p className="text-muted-foreground">
              Manage accounts, orders and signups{isLocal && ' · local preview data'}.
            </p>
          </div>
          <button
            onClick={() => run('reload', async () => {}, 'Refreshed.')}
            disabled={busy === 'reload'}
            className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${busy === 'reload' ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {isLocal && (
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 mb-6 text-sm">
            <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground">
              You’re viewing <strong>local preview data</strong> (no backend connected). Bans,
              role changes and deletions here affect this browser’s storage. With Supabase
              configured, the same controls run against the database via admin RLS — except a
              hard auth ban, which needs a server-side function (see <code>BACKEND.md</code>).
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            const count =
              t.id === 'users'
                ? users.length
                : t.id === 'waitlist'
                  ? entries.length
                  : t.id === 'orders'
                    ? orders.length
                    : undefined;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                {count !== undefined && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-full ${
                      active ? 'bg-primary-foreground/20' : 'bg-secondary'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-6 text-sm">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-foreground">{error}</p>
          </div>
        )}

        {/* ---------------- Overview ---------------- */}
        {tab === 'overview' && stats && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <StatCard label="Users" value={stats.users} sub={`${stats.admins} admin${stats.admins === 1 ? '' : 's'}`} icon={UsersIcon} />
            <StatCard label="Suspended" value={stats.banned} sub="banned accounts" icon={Ban} tone={stats.banned > 0 ? 'warn' : undefined} />
            <StatCard label="Waitlist" value={stats.waitlist} sub="signups" icon={Inbox} />
            <StatCard label="Orders" value={stats.orders} sub="reservations" icon={ShoppingBag} />
            <StatCard label="Reserved value" value={money(stats.reservedCents)} sub="across all orders" icon={CheckCircle2} />
            <StatCard label="Admins" value={stats.admins} sub="with full access" icon={Crown} />
          </motion.div>
        )}

        {/* ---------------- Users ---------------- */}
        {tab === 'users' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {users.length === 0 ? (
              <Empty icon={UsersIcon} text="No accounts yet." />
            ) : (
              <div className="space-y-3">
                {users.map((u) => {
                  const isYou = user?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className="bg-card border border-border rounded-2xl p-4 flex flex-wrap items-center gap-4"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{u.fullName || '—'}</span>
                          {isYou && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              You
                            </span>
                          )}
                          {u.isAdmin && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              <Crown className="w-3 h-3" /> Admin
                            </span>
                          )}
                          {u.banned && (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                              <Ban className="w-3 h-3" /> Suspended
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {u.email ?? 'email hidden (Supabase auth)'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {u.userCategory ? CATEGORY_LABELS[u.userCategory] ?? u.userCategory : 'No category'}
                          {' · '}joined {new Date(u.createdAt).toLocaleDateString()}
                          {' · '}{u.ordersCount} order{u.ordersCount === 1 ? '' : 's'}
                          {' · '}{u.layoutsCount} layout{u.layoutsCount === 1 ? '' : 's'}
                          {u.banned && u.bannedReason ? ` · reason: ${u.bannedReason}` : ''}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Admin toggle */}
                        <button
                          onClick={() =>
                            run(
                              `admin-${u.id}`,
                              () => setUserAdmin(u.id, !u.isAdmin),
                              u.isAdmin ? 'Admin access revoked.' : 'Admin access granted.',
                            )
                          }
                          disabled={busy === `admin-${u.id}` || (u.isAdmin && adminCount <= 1)}
                          title={u.isAdmin && adminCount <= 1 ? 'Can’t remove the only admin' : ''}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                          {u.isAdmin ? <ShieldCheck className="w-4 h-4" /> : <Crown className="w-4 h-4" />}
                          {u.isAdmin ? 'Revoke admin' : 'Make admin'}
                        </button>

                        {/* Ban toggle */}
                        {u.banned ? (
                          <button
                            onClick={() =>
                              run(
                                `ban-${u.id}`,
                                () => setUserBanned(u.id, false),
                                'Account restored.',
                              )
                            }
                            disabled={busy === `ban-${u.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50"
                          >
                            <ShieldCheck className="w-4 h-4" /> Unsuspend
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setBanReason('');
                              setBanTarget(u);
                            }}
                            disabled={isYou || busy === `ban-${u.id}`}
                            title={isYou ? 'You can’t suspend yourself' : ''}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" /> Suspend
                          </button>
                        )}

                        {/* Privacy: export */}
                        <button
                          onClick={() => handleExport(u)}
                          disabled={busy === `export-${u.id}`}
                          title="Download all data we hold on this user"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                          <FileDown className="w-4 h-4" /> Export
                        </button>

                        {/* Privacy: erase */}
                        <button
                          onClick={() => setEraseTarget(u)}
                          disabled={isYou || busy === `erase-${u.id}`}
                          title={isYou ? 'You can’t erase your own account here' : 'Erase this user’s data'}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/5 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" /> Erase
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* ---------------- Waitlist ---------------- */}
        {tab === 'waitlist' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-end mb-4">
              {entries.length > 0 && (
                <button
                  onClick={() => download('tactiq-waitlist.csv', toCsv(entries), 'text/csv')}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm hover:bg-secondary transition-colors"
                >
                  <Download className="w-4 h-4" /> Export CSV
                </button>
              )}
            </div>
            {entries.length === 0 ? (
              <Empty icon={Inbox} text="No signups yet." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Country</th>
                      <th className="px-4 py-3 font-medium">Joined</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((e) => (
                      <tr key={e.id} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium">{e.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{e.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {e.user_category ? CATEGORY_LABELS[e.user_category] ?? e.user_category : '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{e.country ?? '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(e.joined_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              run(`wl-${e.id}`, () => deleteWaitlistEntry(e.id), 'Signup removed.')
                            }
                            disabled={busy === `wl-${e.id}`}
                            aria-label={`Remove ${e.email}`}
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* ---------------- Orders ---------------- */}
        {tab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {orders.length === 0 ? (
              <Empty icon={ShoppingBag} text="No reservations yet." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Reserved</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-border/60 last:border-0">
                        <td className="px-4 py-3 font-medium">
                          {o.plan === 'pro' ? 'Tactiq Pro' : 'Tactiq Essential'}
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={o.status}
                            onChange={(ev) =>
                              run(
                                `os-${o.id}`,
                                () => updateOrderStatus(o.id, ev.target.value as OrderStatus),
                                'Order status updated.',
                              )
                            }
                            disabled={busy === `os-${o.id}`}
                            className="bg-secondary border border-border rounded-lg px-2 py-1 text-sm capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s} className="capitalize">
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {money(o.amount_cents, o.currency)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {new Date(o.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() =>
                              run(`od-${o.id}`, () => deleteOrder(o.id), 'Order deleted.')
                            }
                            disabled={busy === `od-${o.id}`}
                            aria-label="Delete order"
                            className="inline-flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Flash toast */}
      {flash && (
        <motion.div
          key={flash}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background text-sm shadow-lg"
        >
          <CheckCircle2 className="w-4 h-4" /> {flash}
        </motion.div>
      )}

      {/* Ban modal */}
      <Modal open={!!banTarget} onClose={() => setBanTarget(null)}>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Ban className="w-5 h-5 text-destructive" /> Suspend account
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {banTarget?.fullName || banTarget?.email} will be blocked from signing in. You can add
          a reason they’ll see at login.
        </p>
        <textarea
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
          rows={3}
          placeholder="Reason (optional) — e.g. abuse, spam, chargeback"
          className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary mb-4 resize-none"
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setBanTarget(null)}
            className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmBan}
            disabled={!!banTarget && busy === `ban-${banTarget.id}`}
            className="px-4 py-2 rounded-xl text-sm bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            Suspend account
          </button>
        </div>
      </Modal>

      {/* Erase modal */}
      <Modal open={!!eraseTarget} onClose={() => setEraseTarget(null)}>
        <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-destructive" /> Erase user data
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This permanently deletes <strong>{eraseTarget?.fullName || eraseTarget?.email}</strong>’s
          orders, saved layouts and account record
          {isLocal ? ' from this browser' : ''}. This can’t be undone.
          {!isLocal && (
            <>
              {' '}Their Supabase Auth login must be removed separately with the service_role
              Admin API on a server.
            </>
          )}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setEraseTarget(null)}
            className="px-4 py-2 rounded-xl text-sm border border-border hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmErase}
            disabled={!!eraseTarget && busy === `erase-${eraseTarget.id}`}
            className="px-4 py-2 rounded-xl text-sm bg-destructive text-white hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            Erase everything
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number | string;
  sub: string;
  icon: typeof LayoutDashboard;
  tone?: 'warn';
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            tone === 'warn' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
          }`}
        >
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  );
}

function Empty({ icon: Icon, text }: { icon: typeof LayoutDashboard; text: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground rounded-2xl border border-border bg-card">
      <Icon className="w-10 h-10 mx-auto mb-3 opacity-60" />
      <p>{text}</p>
    </div>
  );
}

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  // Conditional render (no AnimatePresence exit) so closing unmounts immediately
  // and never depends on an exit animation completing.
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </motion.div>
    </div>
  );
}
