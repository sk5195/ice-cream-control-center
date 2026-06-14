import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FileText, Download } from 'lucide-react';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';

export default function Reports() {
  const { onMenuClick } = useOutletContext();
  const [types, setTypes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/types')
      .then(res => {
        setTypes(res.data);
        if (res.data.length) setSelected(res.data[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/reports/${selected}`).then(res => setReport(res.data));
  }, [selected]);

  const download = async (format) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/reports/${selected}/download/${format}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected}-report.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <><Header title="Reports" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Reports" subtitle="Generate and download reports" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          {types.map(t => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${selected === t.id ? 'bg-brand-600 text-white' : 'bg-white border hover:bg-slate-50'}`}
            >
              <FileText className="w-4 h-4" />
              {t.title}
            </button>
          ))}
        </div>

        {report && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-semibold text-lg">{report.title}</h3>
              <div className="flex gap-2">
                <button onClick={() => download('pdf')} className="btn-secondary flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button onClick={() => download('excel')} className="btn-primary flex items-center gap-2 text-sm">
                  <Download className="w-4 h-4" /> Excel
                </button>
              </div>
            </div>

            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      {report.columns.map(col => (
                        <th key={col} className="p-4 text-left font-medium text-slate-500">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.data.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        {report.columns.map((col, j) => {
                          const key = col.toLowerCase().replace(/\s+/g, '_');
                          return (
                            <td key={j} className="p-4">
                              {row[key] ?? row[col] ?? row[Object.keys(row)[j]] ?? ''}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
