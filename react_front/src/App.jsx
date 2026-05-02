import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import TransferPage from './pages/TransferPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import BillPaymentPage from './pages/BillPaymentPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import LoansPage from './pages/LoansPage';

// Gestionnaire Pages
import GestionnaireDashboardPage from './pages/GestionnaireDashboardPage';
import PendingTransfersPage from './pages/PendingTransfersPage';
import LoanRequestsPage from './pages/LoanRequestsPage';
import CustomerAccountsPage from './pages/CustomerAccountsPage';

/**
 * ProtectedRoute with Layout
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" />
  );
};

/**
 * AdminRoute with Layout
 */
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && user?.role === 'admin' ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/dashboard" />
  );
};

/**
 * GestionnaireRoute - accessible by gestionnaire AND admin
 */
const GestionnaireRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated && (user?.role === 'gestionnaire' || user?.role === 'admin') ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/dashboard" />
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {!isAuthenticated ? (
        <>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </>
      ) : (
        <>
          {/* Protected Client Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/transfer" element={<ProtectedRoute><TransferPage /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
          <Route path="/bill-payment" element={<ProtectedRoute><BillPaymentPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/loans" element={<ProtectedRoute><LoansPage /></ProtectedRoute>} />

          {/* Gestionnaire Routes */}
          <Route path="/gestionnaire" element={<GestionnaireRoute><GestionnaireDashboardPage /></GestionnaireRoute>} />
          <Route path="/gestionnaire/transfers" element={<GestionnaireRoute><PendingTransfersPage /></GestionnaireRoute>} />
          <Route path="/gestionnaire/loans" element={<GestionnaireRoute><LoanRequestsPage /></GestionnaireRoute>} />
          <Route path="/gestionnaire/customers" element={<GestionnaireRoute><CustomerAccountsPage /></GestionnaireRoute>} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </>
      )}
    </Routes>
  );
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
