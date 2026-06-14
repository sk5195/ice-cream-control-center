import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Target, Route, Package, IndianRupee } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function Predictions() {
  const { onMenuClick } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ai/predictions')
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="AI Predictions" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="AI Prediction Dashboard" subtitle="ML-powered demand forecasting" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Tomorrow's Demand" value={`${data.tomorrowDemand} units`} icon={Target} color="brand" subtitle={`${data.confidence}% confidence`} />
          <StatCard title="Expected Revenue" value={formatCurrency(data.expectedRevenue)} icon={IndianRupee} color="green" />
          <StatCard title="Best Routes" value={data.bestRoutes.length} icon={Route} color="purple" />
          <StatCard title="Flavor Types" value={data.flavorRequirements.length} icon={Package} color="orange" />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-brand-600" /> 7-Day Sales Trend
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Units" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Flavor Requirements (Tomorrow)</h3>
            <div className="space-y-3">
              {data.flavorRequirements.map(f => (
                <div key={f.flavor} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium">{f.flavor}</p>
                    <p className="text-xs text-slate-500">Trend: {f.currentTrend}</p>
                  </div>
                  <span className="text-lg font-bold text-brand-600">{f.required} units</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Best Seller Routes</h3>
            <div className="space-y-3">
              {data.bestRoutes.map(route => (
                <div key={route.area} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                    {route.priority}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{route.area}</p>
                    <p className="text-xs text-slate-500">Expected: {route.expectedSales} sales</p>
                  </div>
                  <span className={`badge ${route.demandLevel === 'hot' ? 'bg-red-100 text-red-700' : route.demandLevel === 'cold' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                    {route.demandLevel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Seller Stock Assignments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {data.sellerAssignments.map(s => (
              <div key={s.seller} className="p-3 border rounded-lg">
                <p className="font-medium text-sm">{s.seller}</p>
                <p className="text-xs text-slate-500">{s.area}</p>
                <p className="text-lg font-bold text-brand-600 mt-1">{s.recommendedStock} units</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
