import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowUpRight, Clock, Users, FilePlus, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const formatNaira = (amount) => {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Financial Overview</h2>
            <p className="text-sm text-slate-500">Real-time metrics derived from database transactions.</p>
          </div>
          <div className="mt-4 flex space-x-3 sm:mt-0">
            <Link
              to="/quotations/new"
              className="inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <FilePlus className="h-4 w-4" />
              <span>New Quotation</span>
            </Link>
            <Link
              to="/invoices/new"
              className="inline-flex items-center space-x-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              <Receipt className="h-4 w-4" />
              <span>New Invoice</span>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500">Loading financial stats...</div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</span>
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600"><TrendingUp className="h-5 w-5" /></div>
                </div>
                <div className="mt-4 text-2xl font-extrabold text-slate-900">{formatNaira(data?.summary?.totalInvoiced)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments Received</span>
                  <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600"><ArrowUpRight className="h-5 w-5" /></div>
                </div>
                <div className="mt-4 text-2xl font-extrabold text-emerald-700">{formatNaira(data?.summary?.totalReceived)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
                  <div className="rounded-lg bg-amber-50 p-2 text-amber-600"><Clock className="h-5 w-5" /></div>
                </div>
                <div className="mt-4 text-2xl font-extrabold text-amber-700">{formatNaira(data?.summary?.outstandingBalance)}</div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Amount</span>
                  <div className="rounded-lg bg-red-50 p-2 text-red-600"><AlertCircle className="h-5 w-5" /></div>
                </div>
                <div className="mt-4 text-2xl font-extrabold text-red-600">{formatNaira(data?.summary?.overdueAmount)}</div>
              </div>
            </div>

            {/* Recent Invoices Table */}
            <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Recent Invoices</h3>
                <Link to="/invoices" className="text-xs font-medium text-teal-600 hover:text-teal-700">View All →</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                    <tr>
                      <th className="px-6 py-3">Invoice #</th>
                      <th className="px-6 py-3">Client</th>
                      <th className="px-6 py-3">Due Date</th>
                      <th className="px-6 py-3">Total Amount</th>
                      <th className="px-6 py-3">Balance</th>
                      <th className="px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {data?.recentInvoices?.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-medium text-slate-900">
                          <Link to={`/invoices/${inv.id}`} className="text-teal-600 hover:underline">{inv.invoice_number}</Link>
                        </td>
                        <td className="px-6 py-4">{inv.company_name}</td>
                        <td className="px-6 py-4">{new Date(inv.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-semibold text-slate-900">{formatNaira(inv.total_amount)}</td>
                        <td className="px-6 py-4 text-amber-700 font-medium">{formatNaira(inv.outstanding_balance)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};