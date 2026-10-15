import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';

export const QuotationForm = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    valid_until: '',
    discount_amount: 0,
    additional_charges: 0,
    notes: '',
    terms_conditions: 'Payment terms: 70% advance, 30% upon completion.',
  });
  const [items, setItems] = useState([{ description: '', quantity: 1, unit_price: 0 }]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getClients().then(res => setClients(res.clients)).catch(console.error);
  }, []);

  const addItem = () => setItems([...items, { description: '', quantity: 1, unit_price: 0 }]);
  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0), 0);
  const calculateTotal = () => calculateSubtotal() - (parseFloat(formData.discount_amount) || 0) + (parseFloat(formData.additional_charges) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createQuotation({
        ...formData,
        items,
      });
      navigate('/quotations');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Quotation</h2>
        {error && <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Client *</label>
              <select
                required
                value={formData.client_id}
                onChange={e => setFormData({ ...formData, client_id: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              >
                <option value="">Select Client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.company_name} ({c.email})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Proposal Title *</label>
              <input
                type="text" required placeholder="e.g. Full-Stack LMS Development"
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-semibold uppercase text-slate-600">Line Items *</label>
              <button type="button" onClick={addItem} className="text-xs font-semibold text-teal-600 hover:underline flex items-center space-x-1">
                <Plus className="h-3.5 w-3.5" /><span>Add Item</span>
              </button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text" required placeholder="Description"
                    value={item.description} onChange={e => updateItem(index, 'description', e.target.value)}
                    className="flex-1 rounded-lg border border-slate-300 p-2 text-sm"
                  />
                  <input
                    type="number" min="1" required placeholder="Qty"
                    value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)}
                    className="w-20 rounded-lg border border-slate-300 p-2 text-sm"
                  />
                  <input
                    type="number" min="0" step="0.01" required placeholder="Unit Price (₦)"
                    value={item.unit_price} onChange={e => updateItem(index, 'unit_price', e.target.value)}
                    className="w-32 rounded-lg border border-slate-300 p-2 text-sm"
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(index)} className="text-red-500 hover:text-red-700 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-4 border-t border-slate-200">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Valid Until Date</label>
                <input
                  type="date"
                  value={formData.valid_until} onChange={e => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">Notes</label>
                <textarea
                  rows="2" placeholder="Optional notes..."
                  value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-sm"
                ></textarea>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal:</span><span className="font-medium">₦{calculateSubtotal().toLocaleString()}</span></div>
              <div className="flex justify-between items-center">
                <span>Discount (₦):</span>
                <input
                  type="number" min="0" value={formData.discount_amount} onChange={e => setFormData({ ...formData, discount_amount: e.target.value })}
                  className="w-28 rounded border border-slate-300 p-1 text-right text-sm"
                />
              </div>
              <div className="flex justify-between items-center">
                <span>Additional Charges (₦):</span>
                <input
                  type="number" min="0" value={formData.additional_charges} onChange={e => setFormData({ ...formData, additional_charges: e.target.value })}
                  className="w-28 rounded border border-slate-300 p-1 text-right text-sm"
                />
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-2 font-bold text-base text-slate-900">
                <span>Total Amount:</span><span className="text-teal-700">₦{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => navigate('/quotations')} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="rounded-lg bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Save Quotation</button>
          </div>
        </form>
      </main>
    </div>
  );
};