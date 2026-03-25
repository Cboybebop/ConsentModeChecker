import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { AuthProvider } from './features/auth/AuthProvider';
import { useAuth } from './features/auth/useAuth';
import { supabaseEnabled } from './lib/supabaseClient';
import { Alert } from './components/ui/Alert';
import { LOCAL_MODE_BANNER, APP_NAME } from './constants/text';
import { HomePage } from './pages/HomePage';
import { HelpPage } from './pages/HelpPage';
import { QuickCheckPage } from './features/quick-check/QuickCheckPage';
import { AuditWizardPage } from './features/audit-wizard/AuditWizardPage';
import { SavedAuditsPage } from './features/audits/SavedAuditsPage';
import { AuthPage } from './features/auth/AuthPage';
import { PasswordReset } from './features/auth/PasswordReset';
import { DemoPage } from './features/demo/DemoPage';
import { useSystemTheme } from './hooks/useSystemTheme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000 } },
});

function Nav() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const showSavedAudits = supabaseEnabled ? !!user : true;

  return (
    <nav className="no-print border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          {APP_NAME}
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Home
          </Link>
          <Link
            to="/quick-check"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Quick Check
          </Link>
          <Link
            to="/audit"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Guided Audit
          </Link>
          {showSavedAudits && (
            <Link
              to="/saved"
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
            >
              Saved Audits
            </Link>
          )}
          <Link
            to="/help"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
          >
            Help
          </Link>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {supabaseEnabled && user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
              <button
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              >
                Sign out
              </button>
            </div>
          ) : supabaseEnabled ? (
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Log in / Sign up
            </Link>
          ) : null}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden rounded p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 px-4 py-3 md:hidden dark:border-gray-800">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Home
            </Link>
            <Link
              to="/quick-check"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Quick Check
            </Link>
            <Link
              to="/audit"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Guided Audit
            </Link>
            {showSavedAudits && (
              <Link
                to="/saved"
                onClick={() => setMenuOpen(false)}
                className="text-sm text-gray-600 dark:text-gray-300"
              >
                Saved Audits
              </Link>
            )}
            <Link
              to="/help"
              onClick={() => setMenuOpen(false)}
              className="text-sm text-gray-600 dark:text-gray-300"
            >
              Help
            </Link>
            {supabaseEnabled && user ? (
              <button
                onClick={async () => {
                  await signOut();
                  setMenuOpen(false);
                  navigate('/');
                }}
                className="text-left text-sm text-gray-600 dark:text-gray-300"
              >
                Sign out ({user.email})
              </button>
            ) : supabaseEnabled ? (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-primary-600"
              >
                Log in / Sign up
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <>
      <Nav />
      {!supabaseEnabled && (
        <div className="no-print">
          <Alert variant="info" className="rounded-none border-x-0 border-t-0">
            {LOCAL_MODE_BANNER}
          </Alert>
        </div>
      )}
      <main className="min-h-screen px-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quick-check" element={<QuickCheckPage />} />
          <Route path="/audit" element={<AuditWizardPage />} />
          <Route path="/saved" element={<SavedAuditsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/demo" element={<DemoPage />} />
          {supabaseEnabled && (
            <>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/reset-password" element={<PasswordReset />} />
            </>
          )}
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  useSystemTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
