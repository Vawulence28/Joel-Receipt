import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Receipt, Plus } from 'lucide-react';

export const InvoiceList = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInvoices()
      .then(res => setInvoices(res.invoices))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Invoices & Payments</h2>
            <p className="text-xs sm:text-sm text-slate-500">Track issued invoices, outstanding balances, and incoming payments.</p>
          </div>
          <Link
            to="/invoices/new"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>New Invoice</span>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Outstanding</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link to={`/invoices/${inv.id}`} className="text-teal-600 hover:underline">{inv.invoice_number}</Link>
                    </td>
                    <td className="px-6 py-4">{inv.company_name}</td>
                    <td className="px-6 py-4">{new Date(inv.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatNaira(inv.total_amount)}</td>
                    <td className="px-6 py-4 font-medium text-amber-700">{formatNaira(inv.outstanding_balance)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/invoices/${inv.id}`} className="text-teal-600 hover:underline text-xs font-semibold">View / Pay</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};