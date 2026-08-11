/**
 * Protected dashboard shell — the control-centre chrome around every
 * /dashboard page.
 *
 *  - Desktop: narrow grouped sidebar; the active indicator is one shared
 *    element that slides between items (layoutId) instead of blinking.
 *  - Mobile: compact top bar + drawer for the full list, plus a fixed
 *    bottom navigation for the five everyday destinations (44px targets).
 *  - Every page change plays a 200 ms transform-only entrance;
 *    ReducedMotionProvider honours both reduced-motion sources for all of it.
 *  - Mounts the live regions, the ⌘K command palette, and starts the local
 *    telemetry recorder that feeds the Activity page.
 */
import { useEffect, useState } from 'react';
import { NavLink, Link, Outlet, useLocation, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  Hand,
  LayoutDashboard,
  Settings2,
  CircleDot,
  Grip,
  GraduationCap,
  Bluetooth,
  History,
  PersonStanding,
  UserRound,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from 'lucide-react';
import { signOut, listGestureConfigs } from '../../lib/api';
import { useAuth } from '../auth/AuthContext';
import { deviceManager } from '../../services/device/manager';
import { startTelemetry, setTelemetryLayout } from '../../services/telemetry';
import { DEFAULT_LAYOUT } from '../../lib/gestures';
import LiveRegions from '../components/LiveRegions';
import ReducedMotionProvider from '../components/ReducedMotionProvider';
import CommandPalette from './CommandPalette';

const NAV_GROUPS: {
  label: string | null;
  items: { to: string; label: string; Icon: typeof Hand; end?: boolean }[];
}[] = [
  {
    label: null,
    items: [{ to: '/dashboard', label: 'Home', Icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Product',
    items: [
      { to: '/dashboard/ring', label: 'Ring', Icon: CircleDot },
      { to: '/dashboard/simulator', label: 'Simulator', Icon: Grip },
      { to: '/dashboard/training', label: 'Training', Icon: GraduationCap },
    ],
  },
  {
    label: 'Control',
    items: [
      { to: '/dashboard/commands', label: 'Commands', Icon: Settings2 },
      { to: '/dashboard/history', label: 'History', Icon: History },
      { to: '/dashboard/device', label: 'Device', Icon: Bluetooth },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/dashboard/accessibility', label: 'Accessibility', Icon: PersonStanding },
      { to: '/dashboard/account', label: 'Account', Icon: UserRound },
    ],
  },
];

/** The five everyday destinations that earn a spot in the bottom bar. */
const BOTTOM_NAV = [
  { to: '/dashboard', label: 'Home', Icon: LayoutDashboard, end: true },
  { to: '/dashboard/ring', label: 'Ring', Icon: CircleDot },
  { to: '/dashboard/simulator', label: 'Simulator', Icon: Grip },
  { to: '/dashboard/history', label: 'History', Icon: History },
  { to: '/dashboard/commands', label: 'Commands', Icon: Settings2 },
];

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label ?? 'root'} className="mb-4">
          {group.label && (
            <p className="font-mono-label text-muted-foreground/80 px-3 mb-1.5">{group.label}</p>
          )}
          <ul className="space-y-0.5">
            {group.items.map(({ to, label, Icon, end }) => {
              const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
              return (
                <li key={to} className="relative">
                  {isActive && (
                    <motion.span
                      layoutId="dash-nav-active"
                      aria-hidden
                      transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      className="absolute inset-0 rounded-md bg-primary/10"
                    />
                  )}
                  <NavLink
                    to={to}
                    end={end}
                    onClick={onNavigate}
                    className={`relative flex items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] transition-colors ${
                      isActive
                        ? 'text-primary-strong font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" aria-hidden />
                    {label}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <Link
        to="/help"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden />
        Help
      </Link>
      <button
        onClick={handleSignOut}
        className="mt-2 flex w-full items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
      >
        <LogOut className="w-4 h-4 shrink-0" aria-hidden />
        Sign out
      </button>
      <p className="mt-4 px-3 font-mono-label text-muted-foreground/70">
        ⌘K — jump anywhere
      </p>
    </>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  // Point the device manager and telemetry recorder at this user; the
  // simulator, training, history and ring pages all share the one store.
  useEffect(() => {
    deviceManager.setNamespace(user?.id ?? null);
    startTelemetry(user?.id ?? null);
  }, [user?.id]);

  // Shortcut names in recorded history resolve through the active layout.
  useEffect(() => {
    if (!user) return;
    listGestureConfigs()
      .then((rows) => {
        const active = rows.find((r) => r.is_active) ?? rows[0];
        setTelemetryLayout(active ? { ...DEFAULT_LAYOUT, ...active.layout } : { ...DEFAULT_LAYOUT });
      })
      .catch(() => setTelemetryLayout({ ...DEFAULT_LAYOUT }));
  }, [user]);

  return (
    <ReducedMotionProvider>
      <div className="min-h-screen bg-background">
        <LiveRegions />
        <CommandPalette />
        {/* See SiteHeader: bg-primary fails contrast in the dark theme. */}
        <a
          href="#dash-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-foreground focus:text-background focus:rounded-md"
        >
          Skip to content
        </a>

        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm">
          <Link to="/" className="flex items-center gap-2">
            <Hand className="w-5 h-5" aria-hidden />
            <span className="font-semibold">Tactiq</span>
          </Link>
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            aria-label={drawerOpen ? 'Close dashboard menu' : 'Open dashboard menu'}
            aria-expanded={drawerOpen}
            className="w-11 h-11 flex items-center justify-center rounded-md border border-border"
          >
            {drawerOpen ? <X className="w-5 h-5" aria-hidden /> : <Menu className="w-5 h-5" aria-hidden />}
          </button>
        </header>
        {drawerOpen && (
          <nav aria-label="Dashboard" className="lg:hidden border-b border-border px-4 py-4 bg-background">
            <SidebarNav onNavigate={() => setDrawerOpen(false)} />
          </nav>
        )}

        <div className="lg:grid lg:grid-cols-[232px_1fr] max-w-[1360px] mx-auto">
          {/* Desktop sidebar */}
          <nav
            aria-label="Dashboard"
            className="hidden lg:flex flex-col sticky top-0 h-screen overflow-y-auto border-r border-border px-3 py-6"
          >
            <Link to="/" className="flex items-center gap-2 px-3 mb-1">
              <Hand className="w-5 h-5" aria-hidden />
              <span className="text-lg font-semibold">Tactiq</span>
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 px-3 mb-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden />
              Back to site
            </Link>
            <SidebarNav />
          </nav>

          <main
            id="dash-content"
            tabIndex={-1}
            className="focus:outline-none px-4 sm:px-6 lg:px-10 py-8 pb-28 lg:pb-10 min-w-0"
          >
            {/* Re-mounts per route: a short transform-only entrance keeps
                navigation feeling instant while preserving continuity. */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>

        {/* Mobile bottom navigation — the everyday five, thumb-reachable. */}
        <nav
          aria-label="Dashboard quick navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <ul className="grid grid-cols-5">
            {BOTTOM_NAV.map(({ to, label, Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex flex-col items-center justify-center gap-1 h-16 min-h-11 text-[0.68rem] font-medium transition-colors ${
                      isActive ? 'text-primary-strong' : 'text-muted-foreground hover:text-foreground'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </ReducedMotionProvider>
  );
}
