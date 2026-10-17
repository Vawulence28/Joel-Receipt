import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FileText, Edit, Copy, Trash2, Eye } from 'lucide-react';

export const LettersList = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const data = await api.getLetters(search, statusFilter);
      setLetters(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLetters();
  }, [search, statusFilter]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this draft letter?')) {
      try {
        await api.deleteLetter(id);
        fetchLetters();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const newLetter = await api.duplicateLetter(id);
      navigate(`/letters/${newLetter.id}/edit`);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business Letters</h1>
            <p className="text-sm text-slate-500">Create, manage, and print official company correspondence.</p>
          </div>
          <button
            onClick={() => navigate('/letters/new')}
            className="inline-flex items-center space-x-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Write a Letter</span>
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by recipient, subject, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-teal-600"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-teal-600"
          >
            <option value="">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Finalized">Finalized</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Letters Table / Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500">Loading business letters...</div>
        ) : letters.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="font-bold text-slate-800 text-base">No letters found</h3>
            <p className="text-xs text-slate-500 mt-1">Get started by writing your first official business letter.</p>
            <button
              onClick={() => navigate('/letters/new')}
              className="mt-4 inline-flex items-center space-x-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" /><span>Write a Letter</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase">
                  <th className="py-3 px-4">Ref & Date</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {letters.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900">{l.letter_number}</span>
                      <p className="text-xs text-slate-500">{new Date(l.letter_date).toLocaleDateString()}</p>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">{l.recipient_name}</td>
                    <td className="py-3.5 px-4 text-slate-600 truncate max-w-xs">{l.subject}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                        l.status === 'Finalized' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'Archived' ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/letters/${l.id}/view`)}
                        title="Preview & Print"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/letters/${l.id}/edit`)}
                        title="Edit Letter"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-teal-600"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDuplicate(l.id)}
                        title="Duplicate Letter"
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-blue-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(l.id)}
                        title="Delete Draft"
                        className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};