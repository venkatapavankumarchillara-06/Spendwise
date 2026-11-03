import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Layout from './components/layout/Layout';
import TransactionModal from './components/transactions/TransactionModal';
import api from './services/api';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const AppContent = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const handleQuickAdd = async (formData) => {
    try {
      const response = await api.post('/transactions', formData);
      if (response.data.success) {
        showToast('Transaction added successfully!', 'success');
        // Refresh by triggering window event or state if needed
        window.dispatchEvent(new Event('spendwise:transaction_added'));
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected App Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout onOpenAddTransaction={() => setIsQuickAddOpen(true)} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={<Dashboard onOpenAddTransaction={() => setIsQuickAddOpen(true)} />}
          />
          <Route path="transactions" element={<Transactions />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Quick Add Transaction Modal */}
      {user && (
        <TransactionModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          onSubmit={handleQuickAdd}
          currency={user?.currency || 'INR'}
        />
      )}
    </>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
