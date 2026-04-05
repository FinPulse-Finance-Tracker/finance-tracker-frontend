import { SignedIn, SignedOut, useAuth } from '@clerk/clerk-react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import api, { setAuthToken } from './services/api';
import Landing from './components/Landing';
import SignIn from './components/auth/SignIn';
import SignUp from './components/auth/SignUp';
import Dashboard from './components/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import CategoriesPage from './pages/CategoriesPage';
import BudgetPage from './pages/BudgetPage';
import SettingsPage from './pages/SettingsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import AppLayout from './components/Layout/AppLayout';
import { useEmailImportNotification } from './hooks/useEmailImportNotification';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes — don't refetch if data is fresh
      gcTime: 10 * 60 * 1000,         // 10 minutes — keep unused data in cache
      refetchOnWindowFocus: false,    // Don't refetch when user tabs back
    },
  },
});

import { DateProvider } from './context/DateContext';

// Inner component to encapsulate authenticated-only hooks
function AuthenticatedSession({ children }) {
  // Fire logic that should only run when signed in (like global login toast)
  useEmailImportNotification();
  return <>{children}</>;
}

function App() {
  const { getToken } = useAuth();

  useEffect(() => {
    // Set up request interceptor to always get fresh token
    const interceptor = api.interceptors.request.use(async (config) => {
      try {
        const token = await getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    });

    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, [getToken]);
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />

      <SignedOut>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up/*" element={<SignUp />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </SignedOut>

      <SignedIn>
        <AuthenticatedSession>
          <DateProvider>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/expenses" element={<ExpensesPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/budgets" element={<BudgetPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </AppLayout>
          </DateProvider>
        </AuthenticatedSession>
      </SignedIn>
    </QueryClientProvider>
  );
}

export default App;
