import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Brain, Lightbulb, Clock } from 'lucide-react';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';

const FLAVOR_COLORS = {
  Chocolate: '#78350f', Vanilla: '#fef3c7', Mango: '#f59e0b',
  Strawberry: '#ef4444', Butterscotch: '#d97706', Pista: '#22c55e', Kulfi: '#a855f7'
};

export default function AIFlavors() {
  const { onMenuClick } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ai/flavor-intelligence')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="AI Flavor Intelligence" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="AI Flavor Intelligence" subtitle="Demand patterns and stock recommendations" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="card p-5 bg-gradient-to-r from-brand-600 to-purple-600 text-white">
          <div className="flex items-start gap-4">
            <Brain className="w-8 h-8 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg">Customer Demand Insight</h3>
              <p className="text-brand-100 mt-1">{data.patterns.insight}</p>
              <p className="text-sm mt-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Peak hour: {data.patterns.peakHourLabel}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {data.intelligence.map((area) => (
            <div key={area.area} className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">{area.area}</h3>
                <span className="text-sm text-slate-500">{area.totalSold} sold (30d)</span>
              </div>

              <div className="space-y-3 mb-4">
                {area.distribution.map((flavor) => (
                  <div key={flavor.flavor}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{flavor.flavor}</span>
                      <span className="text-slate-500">{flavor.percentage}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${flavor.percentage}%`,
                          background: FLAVOR_COLORS[flavor.flavor] || '#3b82f6'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  <strong>AI Recommendation:</strong> {area.recommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
