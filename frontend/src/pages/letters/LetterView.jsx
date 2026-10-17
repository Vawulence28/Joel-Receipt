import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/Navbar';
import { api } from '../../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import { PrintableLetter } from '../../components/common/PrintableLetter';
import { Printer, Edit } from 'lucide-react';

export const LetterView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.getLetter(id)
      .then(res => setData(res))
      .catch(console.error);
  }, [id]);

  if (!data) return <div className="py-20 text-center text-slate-500">Loading letter...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <button onClick={() => navigate('/letters')} className="text-sm font-semibold text-teal-600 hover:underline">← Back to Letters</button>
          <div className="flex space-x-3">
            <button onClick={() => window.print()} className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-4 w-4" /><span>Print / PDF</span>
            </button>
            <button onClick={() => navigate(`/letters/${id}/edit`)} className="inline-flex items-center space-x-1.5 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700">
              <Edit className="h-4 w-4" /><span>Edit Letter</span>
            </button>
          </div>
        </div>

        <PrintableLetter letter={data.letter} settings={data.settings} />
      </main>
    </div>
  );
};