import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Plus, FileText, Share2 } from 'lucide-react';

export const QuotationList = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getQuotations()
      .then(res => setQuotations(res.quotations))
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Quotations</h2>
            <p className="text-xs sm:text-sm text-slate-500">Create, manage, and share proposals with clients.</p>
          </div>
          <Link
            to="/quotations/new"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Create Quotation</span>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Quotation #</th>
                  <th className="px-6 py-3">Title</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link to={`/quotations/${q.id}`} className="text-teal-600 hover:underline">{q.quotation_number}</Link>
                    </td>
                    <td className="px-6 py-4 text-slate-800">{q.title}</td>
                    <td className="px-6 py-4">{q.company_name}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatNaira(q.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        {q.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link to={`/quotations/${q.id}`} className="text-teal-600 hover:underline text-xs font-semibold">View</Link>
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