import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { PrintableDocument } from '../../components/common/PrintableDocument';
import { Printer, CreditCard, Ban } from 'lucide-react';

export const InvoiceView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount_paid: '', payment_method: 'Bank Transfer', reference_number: '', notes: '' });
  const [error, setError] = useState('');

  const fetchInvoice = () => {
    api.getInvoice(id)
      .then(res => setData(res))
      .catch(console.error);
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.addPayment(id, paymentData);
      setShowPaymentModal(false);
      setPaymentData({ amount_paid: '', payment_method: 'Bank Transfer', reference_number: '', notes: '' });
      fetchInvoice();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelInvoice = async () => {
    if (window.confirm('Are you sure you want to cancel this invoice?')) {
      try {
        await api.cancelInvoice(id);
        fetchInvoice();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (!data) return <div className="py-20 text-center text-slate-500">Loading invoice...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hidden during print/PDF generation */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hidden during print/PDF generation */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button onClick={() => navigate('/invoices')} className="text-sm font-semibold text-teal-600 hover:underline">← Back to Invoices</button>
          <div className="flex space-x-3">
            <button onClick={() => window.print()} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /><span>Print PDF</span>
            </button>
            {data.invoice.status !== 'Paid' && data.invoice.status !== 'Cancelled' && (
              <button onClick={() => setShowPaymentModal(true)} className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                <CreditCard className="h-4 w-4" /><span>Record Payment</span>
              </button>
            )}
            {data.invoice.status !== 'Cancelled' && (
              <button onClick={handleCancelInvoice} className="inline-flex items-center space-x-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                <Ban className="h-4 w-4" /><span>Cancel</span>
              </button>
            )}
          </div>
        </div>

        <PrintableDocument
          title="INVOICE"
          docNumber={data.invoice.invoice_number}
          date={data.invoice.issue_date}
          client={{
            company_name: data.invoice.company_name,
            contact_person: data.invoice.contact_person,
            email: data.invoice.client_email,
            phone: data.invoice.phone,
            address: data.invoice.address,
          }}
          items={data.items}
          subtotal={data.invoice.subtotal}
          discount={data.invoice.discount_amount}
          additional={data.invoice.additional_charges}
          total={data.invoice.total_amount}
          notes={data.invoice.notes}
          bankDetails={data.settings?.bank_details}
          terms={data.invoice.terms_conditions}
        />

        {/* Payments History - Hidden during print */}
        <div className="mt-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm print:hidden">
          <h3 className="text-base font-bold text-slate-900 mb-4">Payment History & Status</h3>
          <div className="grid grid-cols-3 gap-4 mb-6 bg-slate-50 p-4 rounded-lg">
            <div><span className="text-xs text-slate-500">Total Amount</span><p className="text-lg font-bold text-slate-900">₦{parseFloat(data.invoice.total_amount).toLocaleString()}</p></div>
            <div><span className="text-xs text-slate-500">Amount Paid</span><p className="text-lg font-bold text-emerald-600">₦{parseFloat(data.invoice.amount_paid).toLocaleString()}</p></div>
            <div><span className="text-xs text-slate-500">Outstanding Balance</span><p className="text-lg font-bold text-amber-600">₦{parseFloat(data.invoice.outstanding_balance).toLocaleString()}</p></div>
          </div>

          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                <th className="py-2">Date</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Method</th>
                <th className="py-2">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.payments.map((p) => (
                <tr key={p.id}>
                  <td className="py-2.5 text-slate-600">{new Date(p.payment_date).toLocaleDateString()}</td>
                  <td className="py-2.5 font-semibold text-emerald-700">₦{parseFloat(p.amount_paid).toLocaleString()}</td>
                  <td className="py-2.5 text-slate-600">{p.payment_method}</td>
                  <td className="py-2.5 text-slate-500 text-xs">{p.reference_number || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 print:hidden">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Record Payment (₦)</h3>
              {error && <p className="mb-4 text-xs text-red-600">{error}</p>}
              <form onSubmit={handleRecordPayment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Amount Paid (₦) *</label>
                  <input
                    type="number" step="0.01" required placeholder="0.00"
                    value={paymentData.amount_paid} onChange={e => setPaymentData({ ...paymentData, amount_paid: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Payment Method</label>
                  <select
                    value={paymentData.payment_method} onChange={e => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="POS">POS</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Reference Number</label>
                  <input
                    type="text" placeholder="e.g. TRF-9823749"
                    value={paymentData.reference_number} onChange={e => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
                  <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Save Payment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};