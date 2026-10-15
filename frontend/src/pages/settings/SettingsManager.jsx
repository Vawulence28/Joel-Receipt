import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { Save, CheckCircle2 } from 'lucide-react';

export const SettingsManager = () => {
  const [settings, setSettings] = useState({
    company_name: '',
    tagline: '',
    email: '',
    phone: '',
    address: '',
    currency_symbol: '₦',
    currency_code: 'NGN',
    default_payment_terms: '',
    bank_details: '',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.getSettings().then(res => {
      if (res.settings) setSettings(res.settings);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await api.updateSettings(settings);
      setSuccess('Business settings updated successfully.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Business Settings</h2>
          <p className="text-sm text-slate-500">Configure corporate branding, bank details, and document terms.</p>
        </div>

        {success && <div className="mb-4 flex items-center space-x-2 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-200"><CheckCircle2 className="h-5 w-5" /><span>{success}</span></div>}
        {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Company Name *</label>
              <input
                type="text" required value={settings.company_name} onChange={e => setSettings({ ...settings, company_name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Tagline</label>
              <input
                type="text" value={settings.tagline || ''} onChange={e => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Email *</label>
              <input
                type="email" required value={settings.email} onChange={e => setSettings({ ...settings, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Phone</label>
              <input
                type="text" value={settings.phone || ''} onChange={e => setSettings({ ...settings, phone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Currency</label>
              <input
                type="text" value={settings.currency_code || 'NGN'} onChange={e => setSettings({ ...settings, currency_code: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Address</label>
            <input
              type="text" value={settings.address || ''} onChange={e => setSettings({ ...settings, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Default Payment Terms</label>
            <textarea
              rows="2" value={settings.default_payment_terms || ''} onChange={e => setSettings({ ...settings, default_payment_terms: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Bank Payment Details</label>
            <textarea
              rows="2" value={settings.bank_details || ''} onChange={e => setSettings({ ...settings, bank_details: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <button type="submit" className="inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
              <Save className="h-4 w-4" /><span>Save Settings</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};