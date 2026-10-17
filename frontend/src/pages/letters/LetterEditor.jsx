import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { PrintableLetter } from '../../components/common/PrintableLetter';
import { Save, Printer, ArrowLeft, CheckCircle } from 'lucide-react';

export const LetterEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    recipient_name: '',
    recipient_address: '',
    subject: '',
    salutation: 'Dear Sir/Madam,',
    letter_body: '',
    closing_statement: 'Yours faithfully,',
    signatory_name: '',
    signatory_position: 'Managing Consultant',
    letter_date: new Date().toISOString().split('T')[0],
    status: 'Draft'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings and letter if editing
    api.getSettings().then(res => {
      // Extract the nested settings object returned by your controller
      const fetchedSettings = res.settings || res;
      setSettings(fetchedSettings);
      
      if (!isEditing && fetchedSettings.managing_consultant) {
        setFormData(prev => ({ ...prev, signatory_name: fetchedSettings.managing_consultant }));
      }
    }).catch(console.error);

    if (isEditing) {
      api.getLetter(id).then(res => {
        setFormData({
          recipient_name: res.letter.recipient_name,
          recipient_address: res.letter.recipient_address,
          subject: res.letter.subject,
          salutation: res.letter.salutation,
          letter_body: res.letter.letter_body,
          closing_statement: res.letter.closing_statement,
          signatory_name: res.letter.signatory_name,
          signatory_position: res.letter.signatory_position,
          letter_date: res.letter.letter_date?.split('T')[0],
          status: res.letter.status
        });
        setSettings(res.settings || res);
      }).catch(console.error);
    }
  }, [id, isEditing]);

  const handleSubmit = async (e, targetStatus = 'Draft') => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = { ...formData, status: targetStatus };
      if (isEditing) {
        await api.updateLetter(id, payload);
      } else {
        await api.createLetter(payload);
      }
      navigate('/letters');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => navigate('/letters')} className="inline-flex items-center space-x-1 text-sm font-semibold text-teal-600 hover:underline">
            <ArrowLeft className="h-4 w-4" /><span>Back to Letters</span>
          </button>
          <div className="flex space-x-3">
            <button
              onClick={(e) => handleSubmit(e, 'Draft')}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Save className="h-4 w-4" /><span>Save Draft</span>
            </button>
            <button
              onClick={(e) => handleSubmit(e, 'Finalized')}
              disabled={saving}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm"
            >
              <CheckCircle className="h-4 w-4" /><span>Finalize & Save</span>
            </button>
          </div>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Editor */}
          <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Letter Details</h2>
            
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Recipient Name *</label>
              <input
                type="text" required
                value={formData.recipient_name}
                onChange={e => setFormData({ ...formData, recipient_name: e.target.value })}
                placeholder="e.g. The Director, ABC Corp"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Recipient Address</label>
              <textarea
                rows={3}
                value={formData.recipient_address}
                onChange={e => setFormData({ ...formData, recipient_address: e.target.value })}
                placeholder="123 Business Avenue, Victoria Island, Lagos"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Letter Subject *</label>
                <input
                  type="text" required
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Proposal for AI Automation Services"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Letter Date</label>
                <input
                  type="date"
                  value={formData.letter_date}
                  onChange={e => setFormData({ ...formData, letter_date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Salutation</label>
                <input
                  type="text"
                  value={formData.salutation}
                  onChange={e => setFormData({ ...formData, salutation: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Closing Statement</label>
                <input
                  type="text"
                  value={formData.closing_statement}
                  onChange={e => setFormData({ ...formData, closing_statement: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Letter Body *</label>
              <textarea
                rows={8} required
                value={formData.letter_body}
                onChange={e => setFormData({ ...formData, letter_body: e.target.value })}
                placeholder="Write your letter body here. Paragraphs and line breaks are fully preserved..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Signatory Name *</label>
                <input
                  type="text" required
                  value={formData.signatory_name}
                  onChange={e => setFormData({ ...formData, signatory_name: e.target.value })}
                  placeholder="Oluwajuwonlo Emmanuel Olatoye"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Signatory Position</label>
                <input
                  type="text"
                  value={formData.signatory_position}
                  onChange={e => setFormData({ ...formData, signatory_position: e.target.value })}
                  placeholder="Managing Consultant"
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-teal-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Auto-Assigned Company:</span> {settings.company_name || 'Joel Consult'} will automatically appear in the signature block below the signatory position.
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-6">
            <div className="sticky top-20">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Letter Preview</span>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-200 hover:bg-teal-100"
                >
                  <Printer className="h-3.5 w-3.5" /><span>Print / Download PDF</span>
                </button>
              </div>
              <PrintableLetter letter={formData} settings={settings} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};