import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Mail, Phone, Users } from 'lucide-react';

export const ClientList = () => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ company_name: '', contact_person: '', email: '', phone: '', address: '' });
  const [error, setError] = useState('');

  const fetchClients = () => {
    setLoading(true);
    api.getClients(search)
      .then(res => setClients(res.clients || []))
      .catch(err => console.error('Failed to load clients:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createClient(formData);
      setShowModal(false);
      setFormData({ company_name: '', contact_person: '', email: '', phone: '', address: '' });
      fetchClients();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Clients Directory</h2>
            <p className="text-xs sm:text-sm text-slate-500">Manage client profiles and financial histories.</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        </div>

        {/* Search */}
        <div className="mb-6 relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company, contact, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2.5 text-sm focus:border-teal-600 focus:outline-none bg-white shadow-sm"
          />
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 sm:p-12 text-center shadow-sm">
            <Users className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-base font-semibold text-slate-800">No clients found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Get started by creating your first client profile.</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add First Client</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <Link key={c.id} to={`/clients/${c.id}`} className="block rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-teal-500 transition-colors">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="rounded-full bg-teal-100 p-2.5 text-teal-700 shrink-0"><User className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 truncate">{c.company_name}</h3>
                    <p className="text-xs text-slate-500 truncate">{c.contact_person || 'No contact person'}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center space-x-2 truncate"><Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{c.email}</span></div>
                  {c.phone && <div className="flex items-center space-x-2 truncate"><Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" /><span className="truncate">{c.phone}</span></div>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Create Client Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl my-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Create New Client</h3>
              {error && <p className="mb-4 text-xs text-red-600">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text" required placeholder="Company Name *"
                  value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
                <input
                  type="text" placeholder="Contact Person"
                  value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
                <input
                  type="email" required placeholder="Email Address *"
                  value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
                <input
                  type="text" placeholder="Phone Number"
                  value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
                <textarea
                  placeholder="Address" rows="3"
                  value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                ></textarea>
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-full sm:w-auto px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button type="submit" className="w-full sm:w-auto rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 shadow-sm">Save Client</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};