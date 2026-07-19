import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
// The Velorah + Jack showcase is now the site's homepage, so it loads eagerly
// (no Suspense flash on first paint). The original Tactiq marketing page is
// code-split and served at /product.
import ShowcasePage from './showcase/ShowcasePage';

// Non-landing routes are split into their own chunks so a first-time visitor to
// the marketing page never downloads the account / customiser / admin code.
// Each loads on demand behind Suspense.
const LoginPage = lazy(() => import('./auth/LoginPage'));
const SignUpPage = lazy(() => import('./auth/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage'));
const AccountPage = lazy(() => import('./account/AccountPage'));
const CheckoutPage = lazy(() => import('./checkout/CheckoutPage'));
const CustomizePage = lazy(() => import('./customize/CustomizePage'));
const AdminPage = lazy(() => import('./admin/AdminPage'));
const LandingPage = lazy(() => import('./LandingPage'));
const PrivacyPage = lazy(() => import('./legal/PrivacyPage'));
const TermsPage = lazy(() => import('./legal/TermsPage'));

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
        <AuthProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<ShowcasePage />} />
              <Route path="/product" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              {/* Legacy alias — the showcase now lives at the site root. */}
              <Route path="/showcase" element={<Navigate to="/" replace />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              {/* Authenticated-only */}
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<AccountPage />} />
                <Route path="/customize" element={<CustomizePage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Route>
              {/* Unknown paths fall back to the landing page. */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
