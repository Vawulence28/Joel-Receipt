import React from 'react';
import logo from '../../assets/logo.png';

export const PrintableLetter = ({ letter, settings }) => {
  if (!settings || !settings.company_name || !settings.email) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-300 rounded-lg text-amber-800 text-center">
        <h3 className="font-bold text-base mb-1">Configuration Warning</h3>
        <p className="text-xs">Essential business settings (Company Name, Email, Address) are incomplete. Please update your Business Settings before generating finalized letters.</p>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white p-12 max-w-3xl mx-auto border border-slate-200 rounded-xl shadow-sm print:shadow-none print:border-none print:m-0 print:p-8 font-sans text-slate-800">
      {/* Letterhead Header */}
      <div className="flex justify-between items-start border-b-2 border-teal-700 pb-6 mb-8">
        <div className="flex items-center space-x-4">
          <img src={logo} alt="Joel Consult Logo" className="h-14 w-14 object-contain" />
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{settings.company_name}</h1>
            <p className="text-xs font-semibold text-teal-700 italic">Innovation through Structured Intelligence</p>
            <p className="text-xs text-slate-500 mt-0.5">{settings.address || 'Lagos, Nigeria'}</p>
          </div>
        </div>
        <div className="text-right text-xs text-slate-600 space-y-0.5">
          <p className="font-medium">{settings.email}</p>
          {settings.phone && <p>{settings.phone}</p>}
          {settings.website && <p className="text-teal-600">{settings.website}</p>}
        </div>
      </div>

      {/* Date & Reference */}
      <div className="flex justify-between items-start mb-8 text-sm">
        <div>
          <p className="font-semibold text-slate-900">{letter?.recipient_name}</p>
          <div className="text-xs text-slate-600 whitespace-pre-line mt-1 max-w-xs">{letter?.recipient_address}</div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">Ref: {letter?.letter_number || 'JC-LTR-Draft'}</p>
          <p className="text-sm font-bold text-slate-800 mt-1">{formatDate(letter?.letter_date)}</p>
        </div>
      </div>

      {/* Subject */}
      <div className="mb-6 font-bold text-slate-900 text-base underline decoration-amber-500 decoration-2 underline-offset-4">
        SUBJECT: {letter?.subject?.toUpperCase()}
      </div>

      {/* Salutation */}
      <div className="mb-4 text-sm font-semibold text-slate-900">
        {letter?.salutation || 'Dear Sir/Madam,'}
      </div>

      {/* Letter Body */}
      <div className="mb-8 text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-line text-justify">
        {letter?.letter_body || 'Letter body content goes here...'}
      </div>

      {/* Closing Statement */}
      <div className="mb-12 text-sm font-medium text-slate-800">
        {letter?.closing_statement || 'Yours faithfully,'}
        <div className="mt-8 font-bold text-slate-900 text-base">{letter?.signatory_name}</div>
        <div className="text-xs font-semibold text-slate-600">{letter?.signatory_position || 'Managing Consultant'}</div>
        <div className="text-xs font-bold text-teal-700 mt-0.5">{settings.company_name}</div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 pt-4 mt-12 text-[10px] text-center text-slate-400 flex justify-between">
        <span>{settings.company_name} — All Rights Reserved</span>
        <span>Generated via Joel Consult Front Desk</span>
      </div>
    </div>
  );
};