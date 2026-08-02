import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// The cinematic motion showcase is the front page (it loads eagerly, no
// Suspense flash); the research-journal site lives at /project.
import ShowcasePage from './showcase/ShowcasePage';

// Non-landing routes are split into their own chunks so a first-time visitor to
// the front page never downloads the account / customiser / admin code.
// Each loads on demand behind Suspense.
const LandingPage = lazy(() => import('./LandingPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const SignUpPage = lazy(() => import('./auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage'));
const AccountPage = lazy(() => import('./account/AccountPage'));
const CheckoutPage = lazy(() => import('./checkout/CheckoutPage'));
const CustomizePage = lazy(() => import('./customize/CustomizePage'));
const AdminPage = lazy(() => import('./admin/AdminPage'));
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
          <Route path="/" element={<ShowcasePage />} />
          <Route path="/project" element={<LandingPage />} />
          {/* Legacy aliases */}
          <Route path="/product" element={<Navigate to="/project" replace />} />
          <Route path="/showcase" element={<Navigate to="/" replace />} />
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
            <Route path="/account" element={<AccountPage />} />
            <Route path="/customize" element={<CustomizePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Route>
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
