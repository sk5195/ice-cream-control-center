import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Thermometer, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';

export default function Refrigerator() {
  const { onMenuClick } = useOutletContext();
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/refrigerator'),
      api.get('/refrigerator/summary')
    ]).then(([repRes, sumRes]) => {
      setReports(repRes.data);
      setSummary(sumRes.data);
      setLoading(false);
    });
  }, []);

  const statusBadge = (status) => {
    const styles = {
      ok: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      failed: 'bg-red-100 text-red-700',
      good: 'bg-green-100 text-green-700',
      soft: 'bg-yellow-100 text-yellow-700',
      melted: 'bg-red-100 text-red-700',
      damaged: 'bg-orange-100 text-orange-700',
      flagged: 'bg-red-100 text-red-700',
      pending: 'bg-slate-100 text-slate-700',
      reviewed: 'bg-blue-100 text-blue-700',
      resolved: 'bg-green-100 text-green-700'
    };
    return styles[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) return <><Header title="Refrigerator Monitoring" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Refrigerator Monitoring" subtitle="Digital verification & AI image analysis" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Cooling OK" value={summary.coolingOk} icon={CheckCircle} color="green" />
          <StatCard title="Failed Reports" value={summary.failed} icon={XCircle} color="red" />
          <StatCard title="Warnings" value={summary.warnings} icon={AlertTriangle} color="orange" />
          <StatCard title="Spoilage Alerts" value={summary.spoilageWarnings} icon={Thermometer} color="red" />
        </div>

        <div className="card overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Seller Verification Reports</h3>
          </div>
          <div className="divide-y">
            {reports.map(report => (
              <div key={report._id} className="p-4 hover:bg-slate-50">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{report.seller?.name}</p>
                    <p className="text-sm text-slate-500">{report.seller?.area} — {new Date(report.submittedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`badge ${statusBadge(report.coolingStatus)}`}>Cooling: {report.coolingStatus}</span>
                    <span className={`badge ${statusBadge(report.iceCreamCondition)}`}>Product: {report.iceCreamCondition}</span>
                    <span className={`badge ${statusBadge(report.status)}`}>{report.status}</span>
                  </div>
                </div>

                {report.aiAnalysis && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">AI Analysis</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-slate-500">Melt Risk</p>
                        <p className={`font-bold ${report.aiAnalysis.meltedProbability > 50 ? 'text-red-600' : 'text-green-600'}`}>
                          {report.aiAnalysis.meltedProbability}%
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Quality Score</p>
                        <p className="font-bold">{report.aiAnalysis.qualityScore}/100</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Packaging</p>
                        <p className="font-bold">{report.aiAnalysis.packagingDamage ? 'Damaged' : 'OK'}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Issues</p>
                        <p className="font-bold">{report.aiAnalysis.issues?.length || 0}</p>
                      </div>
                    </div>
                    <p className="text-sm mt-2 text-brand-700">
                      <strong>Recommendation:</strong> {report.aiAnalysis.recommendation}
                    </p>
                    {report.aiAnalysis.issues?.length > 0 && (
                      <ul className="mt-2 text-xs text-red-600 list-disc list-inside">
                        {report.aiAnalysis.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
