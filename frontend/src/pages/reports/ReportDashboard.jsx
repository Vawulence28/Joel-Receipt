import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { TrendingUp, ArrowUpRight, Clock, Users, Download } from 'lucide-react';

export const ReportDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = () => {
    setLoading(true);
    api.getFinancialReport()
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReport(); }, []);

  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  const exportCSV = () => {
    if (!data || !data.clientReports) return;
    let csv = 'Client Name,Email,Total Invoiced,Total Paid,Total Outstanding\n';
    data.clientReports.forEach(c => {
      csv += `"${c.company_name}","${c.email}",${c.total_invoiced},${c.total_paid},${c.total_outstanding}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Joel_Consult_Financial_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || !data) return <div className="py-20 text-center text-slate-500">Loading financial reports...</div>;

  const { summary, clientReports } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Financial Reports & Analytics</h2>
            <p className="text-xs sm:text-sm text-slate-500">Comprehensive summary of business performance and client ledgers.</p>
          </div>
          <button
            onClick={exportCSV}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Summary Metrics */}
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Invoiced</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900">{formatNaira(summary.total_invoiced)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments Received</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-emerald-700">{formatNaira(summary.total_received)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Balance</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-amber-700">{formatNaira(summary.total_outstanding)}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Clients</span>
            <div className="mt-2 text-xl sm:text-2xl font-extrabold text-teal-700">{summary.total_clients}</div>
          </div>
        </div>

        {/* Client Ledger Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Client Financial Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Client Company</th>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Invoices</th>
                  <th className="px-6 py-3">Total Invoiced</th>
                  <th className="px-6 py-3">Total Paid</th>
                  <th className="px-6 py-3">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {clientReports.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{c.company_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{c.email}</td>
                    <td className="px-6 py-4">{c.invoice_count}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatNaira(c.total_invoiced)}</td>
                    <td className="px-6 py-4 font-medium text-emerald-700">{formatNaira(c.total_paid)}</td>
                    <td className="px-6 py-4 font-medium text-amber-700">{formatNaira(c.total_outstanding)}</td>
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