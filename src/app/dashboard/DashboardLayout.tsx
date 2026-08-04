/**
 * Protected dashboard shell: persistent sidebar on desktop, accessible
 * drawer on mobile, shared by every /dashboard page via <Outlet/>.
 */
import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router';
import {
  Hand,
  LayoutDashboard,
  Settings2,
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
import { signOut } from '../../lib/api';

const NAV = [
  { to: '/dashboard', label: 'Overview', Icon: LayoutDashboard, end: true },
  { to: '/dashboard/commands', label: 'Commands', Icon: Settings2 },
  { to: '/dashboard/device', label: 'Device', Icon: Bluetooth },
  { to: '/dashboard/history', label: 'Command history', Icon: History },
  { to: '/dashboard/accessibility', label: 'Accessibility', Icon: PersonStanding },
  { to: '/dashboard/account', label: 'Account', Icon: UserRound },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <>
      <ul className="space-y-1">
        {NAV.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary-strong font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`
              }
              aria-current={undefined /* NavLink sets aria-current="page" automatically */}
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden />
              {label}
            </NavLink>
          </li>
        ))}
        <li>
          <Link
            to="/help"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LifeBuoy className="w-4 h-4 shrink-0" aria-hidden />
            Help
          </Link>
        </li>
      </ul>
      <button
        onClick={handleSignOut}
        className="mt-6 flex w-full items-center gap-3 px-3 h-11 rounded-md text-[0.95rem] text-muted-foreground hover:text-destructive hover:bg-secondary transition-colors"
      >
        <LogOut className="w-4 h-4 shrink-0" aria-hidden />
        Sign out
      </button>
    </>
  );
}

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <a
        href="#dash-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
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
          <NavItems onNavigate={() => setDrawerOpen(false)} />
        </nav>
      )}

      <div className="lg:grid lg:grid-cols-[236px_1fr] max-w-[1320px] mx-auto">
        {/* Desktop sidebar */}
        <nav
          aria-label="Dashboard"
          className="hidden lg:flex flex-col gap-1 sticky top-0 h-screen border-r border-border px-4 py-6"
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
          <NavItems />
        </nav>

        <main id="dash-content" tabIndex={-1} className="focus:outline-none px-4 sm:px-6 lg:px-10 py-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
