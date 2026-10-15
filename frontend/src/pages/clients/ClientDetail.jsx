import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, Link } from 'react-router-dom';
import { User, Mail, Phone, MapPin, FileText, Receipt } from 'lucide-react';

export const ClientDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getClient(id)
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !data) return <div className="py-20 text-center text-slate-500">Loading client profile...</div>;

  const { client, quotations, invoices } = data;
  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/clients" className="text-sm font-semibold text-teal-600 hover:underline mb-6 inline-block">← Back to Clients</Link>

        {/* Client Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="rounded-full bg-teal-100 p-3 text-teal-700"><User className="h-8 w-8" /></div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{client.company_name}</h2>
              <p className="text-sm text-slate-500">{client.contact_person || 'No contact person specified'}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-sm text-slate-600">
            <div className="flex items-center space-x-2"><Mail className="h-4 w-4 text-slate-400" /><span>{client.email}</span></div>
            {client.phone && <div className="flex items-center space-x-2"><Phone className="h-4 w-4 text-slate-400" /><span>{client.phone}</span></div>}
            {client.address && <div className="flex items-center space-x-2"><MapPin className="h-4 w-4 text-slate-400" /><span>{client.address}, {client.city} {client.state}</span></div>}
          </div>
        </div>

        {/* Quotations & Invoices Tabs / Sections */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Quotations History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-teal-600" /><span>Quotations ({quotations.length})</span>
            </h3>
            {quotations.length === 0 ? (
              <p className="text-sm text-slate-400">No quotations found for this client.</p>
            ) : (
              <div className="space-y-3">
                {quotations.map(q => (
                  <div key={q.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <Link to={`/quotations/${q.id}`} className="font-semibold text-teal-600 hover:underline text-sm">{q.quotation_number}</Link>
                      <p className="text-xs text-slate-500">{q.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatNaira(q.total_amount)}</p>
                      <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-medium">{q.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices History */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Receipt className="h-5 w-5 text-teal-600" /><span>Invoices ({invoices.length})</span>
            </h3>
            {invoices.length === 0 ? (
              <p className="text-sm text-slate-400">No invoices found for this client.</p>
            ) : (
              <div className="space-y-3">
                {invoices.map(inv => (
                  <div key={inv.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div>
                      <Link to={`/invoices/${inv.id}`} className="font-semibold text-teal-600 hover:underline text-sm">{inv.invoice_number}</Link>
                      <p className="text-xs text-slate-500">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">{formatNaira(inv.total_amount)}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};