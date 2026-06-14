import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
const PERIODS = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' }
];

export default function SalesAnalytics() {
  const { onMenuClick } = useOutletContext();
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/sales/analytics?period=${period}`)
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading) return <><Header title="Sales Analytics" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Sales Analytics" subtitle="Performance insights and trends" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {PERIODS.map(p => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${period === p.value ? 'bg-brand-600 text-white' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-4 text-sm">
            <span>Total Sales: <strong>{data.totalSales}</strong></span>
            <span>Revenue: <strong>{formatCurrency(data.totalRevenue)}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4">Revenue Trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Peak Selling Hours</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.byHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip labelFormatter={(h) => `${h}:00 - ${h + 1}:00`} />
                <Bar dataKey="quantity" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Top Selling Areas</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.byArea} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="area" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="quantity" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold mb-4">Flavor Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={data.byFlavor} dataKey="quantity" nameKey="flavor" cx="50%" cy="50%" outerRadius={90} label={({ flavor, percent }) => `${flavor} ${(percent * 100).toFixed(0)}%`}>
                  {data.byFlavor.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Seller Performance Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-slate-500">
                  <th className="pb-3 font-medium">Seller</th>
                  <th className="pb-3 font-medium">Area</th>
                  <th className="pb-3 font-medium">Units Sold</th>
                  <th className="pb-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {data.bySeller.map((s, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-3 font-medium">{s.name}</td>
                    <td className="py-3 text-slate-500">{s.area}</td>
                    <td className="py-3">{s.quantity}</td>
                    <td className="py-3 font-semibold text-green-600">{formatCurrency(s.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
