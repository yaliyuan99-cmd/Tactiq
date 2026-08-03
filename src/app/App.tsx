import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// The canonical research site is the homepage (eager, no Suspense flash).
// The standalone section pages reuse the same already-loaded components, so
// they are eager too. The earlier cinematic homepage is archived at /showcase.
import LandingPage from './LandingPage';
import {
  HowItWorksPage,
  PrototypePage,
  ResearchPage,
  StatusPage,
  FaqPage,
  HelpPage,
} from './SectionPages';

// Everything else is split into its own chunk so a first-time visitor never
// downloads the dashboard / admin / showcase code. Each loads behind Suspense.
const ShowcasePage = lazy(() => import('./showcase/ShowcasePage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const SignUpPage = lazy(() => import('./auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage'));
const CheckoutPage = lazy(() => import('./checkout/CheckoutPage'));
const CustomizePage = lazy(() => import('./customize/CustomizePage'));
const AdminPage = lazy(() => import('./admin/AdminPage'));
const DashboardLayout = lazy(() => import('./dashboard/DashboardLayout'));
const OverviewPage = lazy(() => import('./dashboard/OverviewPage'));
const DevicePage = lazy(() => import('./dashboard/DevicePage'));
const HistoryPage = lazy(() => import('./dashboard/HistoryPage'));
const DashboardAccessibilityPage = lazy(() => import('./dashboard/AccessibilityPage'));
const AccountSettingsPage = lazy(() => import('./dashboard/AccountSettingsPage'));
const PrivacyPage = lazy(() => import('./legal/PrivacyPage'));
const TermsPage = lazy(() => import('./legal/TermsPage'));
const AccessibilityPage = lazy(() => import('./legal/AccessibilityPage'));
const NotFoundPage = lazy(() => import('./NotFoundPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div
        className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"
        aria-label="Loading"
      />
    </div>
  );
}

/**
 * The route table, exported without a router so the prerender (SSG) entry can
 * wrap it in a StaticRouter while the browser app wraps it in BrowserRouter.
 */
export function AppRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Canonical public site */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/prototype" element={<PrototypePage />} />
          <Route path="/research" element={<ResearchPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/help" element={<HelpPage />} />
          {/* Design-history archive (the earlier cinematic homepage) */}
          <Route path="/showcase" element={<ShowcasePage />} />
          {/* Legacy aliases */}
          <Route path="/project" element={<Navigate to="/" replace />} />
          <Route path="/product" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />
          {/* Authenticated-only */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="commands" element={<CustomizePage />} />
              <Route path="device" element={<DevicePage />} />
              <Route path="activity" element={<HistoryPage />} />
              <Route path="accessibility" element={<DashboardAccessibilityPage />} />
              <Route path="account" element={<AccountSettingsPage />} />
            </Route>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          {/* Old authenticated URLs */}
          <Route path="/account" element={<Navigate to="/dashboard" replace />} />
          <Route path="/customize" element={<Navigate to="/dashboard/commands" replace />} />
          {/* Unknown paths get a real 404 page (also prerendered to /404.html). */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default function App() {
  // Restore the saved colour theme on first load so every route (not just the
  // landing page) renders in the user's preferred mode.
  useEffect(() => {
    if (localStorage.getItem('tactiq-theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
