import React from 'react';
import logo from '../../assets/logo.png';

export const PrintableDocument = ({ title, docNumber, date, client, items, subtotal, discount, additional, total, notes, terms, bankDetails }) => {
  const formatNaira = (val) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(val || 0);

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-none print:m-0 print:p-0">
      {/* Header with Official Logo */}
      <div className="flex justify-between items-start border-b border-slate-300 pb-6">
        <div className="flex items-center space-x-3">
          <img src={logo} alt="Joel Consult Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">JOEL CONSULT</h1>
            <p className="text-xs text-slate-500">Innovation through Structured Intelligence</p>
            <p className="text-xs text-slate-500">Lagos, Nigeria | joelconsult01@gmail.com</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xl font-bold uppercase tracking-wider text-teal-700">{title}</span>
          <p className="text-sm font-semibold text-slate-800 mt-1">{docNumber}</p>
          <p className="text-xs text-slate-500">Date: {new Date(date).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Information */}
      <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Billed To</h3>
        <p className="text-base font-bold text-slate-800">{client?.company_name}</p>
        {client?.contact_person && <p className="text-sm text-slate-600">Attn: {client.contact_person}</p>}
        <p className="text-sm text-slate-600">{client?.email}</p>
        {client?.phone && <p className="text-sm text-slate-600">{client.phone}</p>}
        {client?.address && <p className="text-sm text-slate-600">{client.address}</p>}
      </div>

      {/* Items Table */}
      <table className="w-full text-left text-sm mb-6 border-collapse">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-100 text-xs font-bold text-slate-700 uppercase">
            <th className="py-2.5 px-3">Description</th>
            <th className="py-2.5 px-3 text-center">Qty</th>
            <th className="py-2.5 px-3 text-right">Unit Price</th>
            <th className="py-2.5 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-3 px-3 text-slate-800 font-medium">{item.description}</td>
              <td className="py-3 px-3 text-center text-slate-600">{item.quantity}</td>
              <td className="py-3 px-3 text-right text-slate-600">{formatNaira(item.unit_price)}</td>
              <td className="py-3 px-3 text-right text-slate-800 font-semibold">{formatNaira(item.total_price)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Calculations */}
      <div className="flex justify-end mb-6">
        <div className="w-64 space-y-2 text-sm text-slate-600">
          <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium text-slate-800">{formatNaira(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Discount:</span><span>-{formatNaira(discount)}</span></div>}
          {additional > 0 && <div className="flex justify-between"><span>Additional Charges:</span><span>+{formatNaira(additional)}</span></div>}
          <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-slate-900 text-base">
            <span>Total:</span><span className="text-teal-700">{formatNaira(total)}</span>
          </div>
        </div>
      </div>

      {/* Bank Payment Details Section */}
      <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 space-y-1">
        <h4 className="font-bold text-slate-900 uppercase tracking-wide mb-2">Direct Bank Transfer Details</h4>
        <p><span className="font-semibold">Bank / Details:</span> {bankDetails || 'Bank: OPAY | Account No: 8136452818 | Account Name: Oluwajuwonlo Emmanuel Olatoye'}</p>
        <p className="text-slate-500 mt-1 italic">Please use your Invoice Number as the transfer reference.</p>
      </div>

      {/* Notes & Terms */}
      {(notes || terms) && (
        <div className="border-t border-slate-200 pt-4 text-xs text-slate-500 space-y-2">
          {notes && <div><strong className="text-slate-700">Notes:</strong> {notes}</div>}
          {terms && <div><strong className="text-slate-700">Terms & Conditions:</strong> {terms}</div>}
        </div>
      )}
    </div>
  );
};