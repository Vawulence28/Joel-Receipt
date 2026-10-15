import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Receipt, Plus, Search } from 'lucide-react';

export const ReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [clients, setClients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ client_id: '', amount_received: '', payment_method: 'Bank Transfer', description: '', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([api.getReceipts(), api.getClients()])
      .then(([rRes, cRes]) => {
        setReceipts(rRes.receipts || []);
        setClients(cRes.clients || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createStandaloneReceipt(formData);
      setShowModal(false);
      setFormData({ client_id: '', amount_received: '', payment_method: 'Bank Transfer', description: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Payment Receipts</h2>
            <p className="text-xs sm:text-sm text-slate-500">Official proof of payment generated for invoices and standalone transactions.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Standalone Receipt</span>
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-100 text-xs font-semibold text-slate-700 uppercase">
                <tr>
                  <th className="px-6 py-3">Receipt #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3">Amount Received</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {receipts.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <Link to={`/receipts/${r.id}`} className="text-teal-600 hover:underline">{r.receipt_number}</Link>
                    </td>
                    <td className="px-6 py-4">{r.company_name}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{r.description}</td>
                    <td className="px-6 py-4 font-semibold text-emerald-700">{formatNaira(r.amount_received)}</td>
                    <td className="px-6 py-4">{r.payment_method}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/receipts/${r.id}`} className="text-teal-600 hover:underline text-xs font-semibold">View / Print</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl my-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Generate Standalone Receipt</h3>
              {error && <p className="mb-4 text-xs text-red-600">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Client *</label>
                  <select
                    required value={formData.client_id} onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.company_name} ({c.email})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Amount Received (₦) *</label>
                  <input
                    type="number" step="0.01" required placeholder="0.00"
                    value={formData.amount_received} onChange={e => setFormData({ ...formData, amount_received: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={formData.payment_method} onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer (TRF)</option>
                    <option value="Cash">Cash (CSH)</option>
                    <option value="POS">POS (POS)</option>
                    <option value="Cheque">Cheque (CHQ)</option>
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">Reference number will be generated automatically based on payment method.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Description *</label>
                  <input
                    type="text" required placeholder="e.g. Advance consultancy advisory fee"
                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                </div>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="w-full sm:w-auto rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm">Generate Receipt</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
