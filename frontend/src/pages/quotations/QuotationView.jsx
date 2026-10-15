import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { PrintableDocument } from '../../components/common/PrintableDocument';
import { Share2, Lock, Receipt, Printer } from 'lucide-react';

export const QuotationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [publicLink, setPublicLink] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchQuotation = () => {
    api.getQuotation(id)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuotation(); }, [id]);

  const handleShare = async () => {
    try {
      const res = await api.shareQuotation(id);
      const link = `${window.location.origin}/quotations/public/${res.token}`;
      setPublicLink(link);
      fetchQuotation();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRevoke = async () => {
    try {
      await api.revokeQuotationShare(id);
      setPublicLink('');
      fetchQuotation();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConvertToInvoice = async () => {
    try {
      const q = data.quotation;
      const res = await api.createInvoice({
        client_id: q.client_id,
        quotation_id: q.id,
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        items: data.items,
        discount_amount: q.discount_amount,
        additional_charges: q.additional_charges,
        notes: q.notes,
        terms_conditions: q.terms_conditions,
      });
      navigate(`/invoices/${res.invoice.id}`);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || !data) return <div className="py-20 text-center text-slate-500">Loading quotation...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => navigate('/quotations')} className="text-sm font-semibold text-teal-600 hover:underline">← Back to Quotations</button>
          <div className="flex space-x-3">
            <button onClick={() => window.print()} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /><span>Print PDF</span>
            </button>
            <button onClick={handleConvertToInvoice} className="inline-flex items-center space-x-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
              <Receipt className="h-4 w-4" /><span>Convert to Invoice</span>
            </button>
          </div>
        </div>

        {/* Share Section */}
        <div className="mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Client Public Link Sharing</h4>
            <p className="text-xs text-slate-500">Allow clients to view this quotation securely without an account.</p>
          </div>
          {data.quotation.is_public_active ? (
            <div className="flex items-center space-x-2">
              <input type="text" readOnly value={publicLink || 'Active link secured in database'} className="text-xs bg-slate-100 p-2 rounded border w-64 truncate" />
              <button onClick={handleRevoke} className="rounded bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Revoke Link</button>
            </div>
          ) : (
            <button onClick={handleShare} className="rounded bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 flex items-center space-x-1.5">
              <Share2 className="h-4 w-4" /><span>Generate Shareable Link</span>
            </button>
          )}
        </div>

        <PrintableDocument
          title="QUOTATION"
          docNumber={data.quotation.quotation_number}
          date={data.quotation.created_at}
          client={{
            company_name: data.quotation.company_name,
            contact_person: data.quotation.contact_person,
            email: data.quotation.client_email,
            phone: data.quotation.phone,
            address: data.quotation.address,
          }}
          items={data.items}
          subtotal={data.quotation.subtotal}
          discount={data.quotation.discount_amount}
          additional={data.quotation.additional_charges}
          total={data.quotation.total_amount}
          notes={data.quotation.notes}
          terms={data.quotation.terms_conditions}
        />
      </main>
    </div>
  );
};