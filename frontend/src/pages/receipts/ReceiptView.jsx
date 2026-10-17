import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, Ban } from 'lucide-react';

export const ReceiptView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const fetchReceipt = () => {
    api.getReceipt(id).then(res => setData(res)).catch(console.error);
  };

  useEffect(() => { fetchReceipt(); }, [id]);

  const handleCancel = async () => {
    if (window.confirm('Cancel this official receipt?')) {
      try {
        await api.cancelReceipt(id);
        fetchReceipt();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  if (!data) return <div className="py-20 text-center text-slate-500">Loading receipt...</div>;

  const { receipt, settings } = data;
  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hidden during print/PDF generation */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hidden during print/PDF generation */}
        <div className="mb-6 flex justify-between items-center print:hidden">
          <button onClick={() => navigate('/receipts')} className="text-sm font-semibold text-teal-600 hover:underline">← Back to Receipts</button>
          <div className="flex space-x-3">
            <button onClick={() => window.print()} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /><span>Print PDF</span>
            </button>
            {receipt.status !== 'Cancelled' && (
              <button onClick={handleCancel} className="inline-flex items-center space-x-1.5 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
                <Ban className="h-4 w-4" /><span>Cancel Receipt</span>
              </button>
            )}
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div className="bg-white p-8 border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-950 tracking-tight">{settings.company_name}</h1>
              <p className="text-xs text-slate-500">{settings.tagline}</p>
              <p className="text-xs text-slate-500">Lagos, Nigeria | {settings.email}</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold uppercase tracking-wider text-teal-700">OFFICIAL RECEIPT</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{receipt.receipt_number}</p>
              <p className="text-xs text-slate-500">Date: {new Date(receipt.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Received From</h3>
            <p className="text-base font-bold text-slate-800">{receipt.company_name}</p>
            <p className="text-sm text-slate-600">{receipt.client_email}</p>
          </div>

          <table className="w-full text-left text-sm mb-6 border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 uppercase">
                <th className="py-2.5 px-3">Description / Particulars</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Reference</th>
                <th className="py-2.5 px-3 text-right">Amount Received</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-4 px-3 text-slate-800 font-medium">{receipt.description}</td>
                <td className="py-4 px-3 text-slate-600">{receipt.payment_method}</td>
                <td className="py-4 px-3 text-slate-500 text-xs">{receipt.reference_number || 'N/A'}</td>
                <td className="py-4 px-3 text-right font-bold text-teal-700">{formatNaira(receipt.amount_received)}</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-center border-t border-slate-200 pt-4 mt-8">
            <div className="text-xs text-slate-500">
              <p>Status: <strong className={receipt.status === 'Cancelled' ? 'text-red-600' : 'text-emerald-600'}>{receipt.status}</strong></p>
              {receipt.invoice_number && <p className="mt-1">Linked Invoice: #{receipt.invoice_number}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Authorized Signature</p>
              <div className="mt-4 font-serif italic text-slate-700 font-bold">Oluwajuwonlo Emmanuel</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};