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
import { LettersList } from './pages/letters/LettersList';
import { LetterEditor } from './pages/letters/LetterEditor';
import { LetterView } from './pages/letters/LetterView';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/quotations/public/:token" element={<PublicQuotation />} />

          {/* Protected Dashboard & Core Modules */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
          
          {/* Quotations */}
          <Route path="/quotations" element={<ProtectedRoute><QuotationList /></ProtectedRoute>} />
          <Route path="/quotations/new" element={<ProtectedRoute><QuotationForm /></ProtectedRoute>} />
          <Route path="/quotations/:id" element={<ProtectedRoute><QuotationView /></ProtectedRoute>} />
          
          {/* Invoices */}
          <Route path="/invoices" element={<ProtectedRoute><InvoiceList /></ProtectedRoute>} />
          <Route path="/invoices/new" element={<ProtectedRoute><InvoiceForm /></ProtectedRoute>} />
          <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceView /></ProtectedRoute>} />
          
          {/* Receipts */}
          <Route path="/receipts" element={<ProtectedRoute><ReceiptList /></ProtectedRoute>} />
          <Route path="/receipts/:id" element={<ProtectedRoute><ReceiptView /></ProtectedRoute>} />
          
          {/* Reports & Settings */}
          <Route path="/reports" element={<ProtectedRoute><ReportDashboard /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsManager /></ProtectedRoute>} />

          {/* Business Letters Module */}
          <Route path="/letters" element={<ProtectedRoute><LettersList /></ProtectedRoute>} />
          <Route path="/letters/new" element={<ProtectedRoute><LetterEditor /></ProtectedRoute>} />
          <Route path="/letters/:id/edit" element={<ProtectedRoute><LetterEditor /></ProtectedRoute>} />
          <Route path="/letters/:id/view" element={<ProtectedRoute><LetterView /></ProtectedRoute>} />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;