import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { PrintableDocument } from '../../components/common/PrintableDocument';

export const PublicQuotation = () => {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getPublicQuotation(token)
      .then(res => setData(res))
      .catch(err => setError(err.message));
  }, [token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="max-w-md rounded-xl bg-white p-6 text-center shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">Access Revoked</h2>
          <p className="text-sm text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="py-20 text-center text-slate-500">Loading document...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="mb-6 max-w-3xl mx-auto flex justify-end">
        <button
          onClick={() => window.print()}
          className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-slate-800"
        >
          Print / Download PDF
        </button>
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
    </div>
  );
};