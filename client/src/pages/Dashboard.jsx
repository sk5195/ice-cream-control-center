import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, IceCream, IndianRupee, Package, Trash2, AlertTriangle
} from 'lucide-react';
import Header from '../components/layout/Header';
import StatCard from '../components/ui/StatCard';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { formatCurrency, formatNumber } from '../utils/helpers';

export default function Dashboard() {
  const { onMenuClick } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/recent-activity')
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <><Header title="Command Dashboard" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header
        title="Command Dashboard"
        subtitle="Real-time ice cream distribution overview"
        onMenuClick={onMenuClick}
        alerts={stats?.refrigeratorAlerts}
      />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Active Sellers" value={stats.activeSellers} icon={Users} color="green" />
          <StatCard title="Sold Today" value={formatNumber(stats.iceCreamsSoldToday)} icon={IceCream} color="brand" />
          <StatCard title="Revenue Today" value={formatCurrency(stats.totalRevenue)} icon={IndianRupee} color="purple" />
          <StatCard title="Inventory" value={formatNumber(stats.remainingInventory)} icon={Package} color="blue" />
          <StatCard title="Wastage Today" value={formatNumber(stats.wastageToday)} icon={Trash2} color="orange" subtitle={`Loss: ${formatCurrency(stats.wastageLoss)}`} />
          <StatCard title="Fridge Alerts" value={stats.refrigeratorAlerts} icon={AlertTriangle} color="red" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Seller Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-green-500" /> Active</span>
                <span className="font-semibold">{stats.activeSellers - stats.lowStockSellers - stats.issueSellers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-yellow-500" /> Low Stock</span>
                <span className="font-semibold">{stats.lowStockSellers}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm"><span className="w-3 h-3 rounded-full bg-red-500" /> Issues</span>
                <span className="font-semibold">{stats.issueSellers}</span>
              </div>
            </div>
          </div>

          <div className="card p-5 lg:col-span-2">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Sales</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {activity?.recentSales?.slice(0, 8).map((sale) => (
                <div key={sale._id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{sale.seller?.name}</p>
                    <p className="text-xs text-slate-500">{sale.flavor} × {sale.quantity} — {sale.area}</p>
                  </div>
                  <span className="text-sm font-semibold text-green-600">{formatCurrency(sale.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Refrigerator Alerts</h3>
            <div className="space-y-2">
              {activity?.recentReports?.map((report) => (
                <div key={report._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{report.seller?.name}</p>
                    <p className="text-xs text-slate-500">{report.seller?.area} — {report.coolingStatus}</p>
                  </div>
                  <span className={`badge ${report.status === 'flagged' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-4">Recent Wastage</h3>
            <div className="space-y-2">
              {activity?.recentWastage?.map((w) => (
                <div key={w._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{w.flavor} × {w.quantity}</p>
                    <p className="text-xs text-slate-500">{w.area} — {w.reason}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(w.estimatedLoss)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
