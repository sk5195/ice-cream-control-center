import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

const ZONE_COLORS = { hot: '#ef4444', normal: '#f59e0b', cold: '#3b82f6' };
const ZONE_LABELS = { hot: 'Hot Zone', normal: 'Normal Zone', cold: 'Cold Zone' };

export default function Heatmap() {
  const { onMenuClick } = useOutletContext();
  const [heatmap, setHeatmap] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/areas/heatmap')
      .then(res => { setHeatmap(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <><Header title="Area Demand Heatmap" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Area Demand Heatmap" subtitle="Sales intensity by location" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 relative min-h-[400px]">
          <MapContainer center={[12.9716, 77.5946]} zoom={11} className="h-full w-full" style={{ minHeight: '400px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {heatmap.map(area => (
              <CircleMarker
                key={area.name}
                center={[area.center.lat, area.center.lng]}
                radius={15 + area.intensity * 0.3}
                pathOptions={{
                  color: ZONE_COLORS[area.zone],
                  fillColor: ZONE_COLORS[area.zone],
                  fillOpacity: 0.5 + area.intensity * 0.003,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{area.name}</p>
                    <p>{ZONE_LABELS[area.zone]}</p>
                    <p>Sales: {area.sales}</p>
                    <p>Revenue: {formatCurrency(area.revenue)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        <aside className="w-full lg:w-96 bg-white border-l overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Area Rankings</h3>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" /> Hot</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" /> Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500" /> Cold</span>
            </div>
          </div>
          <div className="divide-y">
            {heatmap.map(area => (
              <div key={area.name} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{area.name}</h4>
                  <span className="badge" style={{ background: `${ZONE_COLORS[area.zone]}20`, color: ZONE_COLORS[area.zone] }}>
                    {ZONE_LABELS[area.zone]}
                  </span>
                </div>
                <div className="text-sm text-slate-500 space-y-1">
                  <p>Sales: <strong className="text-slate-900">{area.sales}</strong></p>
                  <p>Revenue: <strong className="text-slate-900">{formatCurrency(area.revenue)}</strong></p>
                  <p>Intensity: <strong className="text-slate-900">{area.intensity}%</strong></p>
                  <p>Sellers: <strong className="text-slate-900">{area.activeSellers}</strong></p>
                </div>
                <p className="text-xs mt-2 p-2 bg-slate-50 rounded text-slate-600">{area.recommendation}</p>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </>
  );
}
