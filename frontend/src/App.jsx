import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ClientList } from './pages/clients/ClientList';
import { ClientDetail } from './pages/clients/ClientDetail';
import { QuotationList } from './pages/quotations/QuotationList';
import { QuotationForm } from './pages/quotations/QuotationForm';
import { QuotationView } from './pages/quotations/QuotationView';
import { PublicQuotation } from './pages/quotations/PublicQuotation';
import { InvoiceList } from './pages/invoices/InvoiceList';
import { InvoiceForm } from './pages/invoices/InvoiceForm';
import { InvoiceView } from './pages/invoices/InvoiceView';
import { ReceiptList } from './pages/receipts/ReceiptList';
import { ReceiptView } from './pages/receipts/ReceiptView';
import { ReportDashboard } from './pages/reports/ReportDashboard';
import { SettingsManager } from './pages/settings/SettingsManager';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/quotations/public/:token" element={<PublicQuotation />} />

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
          <Route path="/quotations" element={<ProtectedRoute><QuotationList /></ProtectedRoute>} />
          <Route path="/quotations/new" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
          <Route path="/quotations/:id" element={<ProtectedRoute><QuotationView /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
          <Route path="/receipts" element={<ProtectedRoute><ReceiptList /></ProtectedRoute>} />
          <Route path="/receipts/:id" element={<ProtectedRoute><ReceiptView /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;