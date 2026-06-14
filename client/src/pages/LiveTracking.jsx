import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { getStatusColor, getStatusLabel, formatCurrency } from '../utils/helpers';

const createIcon = (color) => L.divIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
}

export default function LiveTracking() {
  const { onMenuClick } = useOutletContext();
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const mapCenter = [12.9716, 77.5946];

  useEffect(() => {
    api.get('/sellers').then(res => {
      setSellers(res.data);
      setLoading(false);
    });

    const socket = io('/', { path: '/socket.io' });
    socket.emit('join-dashboard');

    socket.on('seller-location', (data) => {
      setSellers(prev => prev.map(s =>
        s._id === data.id
          ? { ...s, location: { lat: data.lat, lng: data.lng }, status: data.status, currentStock: data.currentStock, salesToday: data.salesToday }
          : s
      ));
    });

    return () => socket.disconnect();
  }, []);

  if (loading) return <><Header title="Live Seller Tracking" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Live Seller Tracking" subtitle="Real-time GPS positions" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        <div className="flex-1 relative min-h-[400px]">
          <MapContainer center={mapCenter} zoom={12} className="h-full w-full" style={{ minHeight: '400px' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            <MapUpdater center={mapCenter} />
            {sellers.map(seller => (
              <Marker
                key={seller._id}
                position={[seller.location.lat, seller.location.lng]}
                icon={createIcon(getStatusColor(seller.status))}
                eventHandlers={{ click: () => setSelected(seller) }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold">{seller.name}</p>
                    <p>Stock: {seller.currentStock}</p>
                    <p>Sales: {seller.salesToday}</p>
                    <p>{getStatusLabel(seller.status)}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="w-full lg:w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Sellers ({sellers.length})</h3>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> Low Stock</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Issue</span>
            </div>
          </div>
          <div className="divide-y">
            {sellers.map(seller => (
              <button
                key={seller._id}
                onClick={() => setSelected(seller)}
                className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${selected?._id === seller._id ? 'bg-brand-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: getStatusColor(seller.status) }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{seller.name}</p>
                    <p className="text-xs text-slate-500">{seller.area}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold">{seller.salesToday} sold</p>
                    <p className="text-slate-400">Stock: {seller.currentStock}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selected && (
          <div className="absolute bottom-4 left-4 right-4 lg:left-auto lg:right-84 lg:w-72 card p-4 z-[1000]">
            <h4 className="font-bold text-lg">{selected.name}</h4>
            <div className="mt-2 space-y-1 text-sm">
              <p><span className="text-slate-500">Area:</span> {selected.area}</p>
              <p><span className="text-slate-500">Stock:</span> {selected.currentStock} units</p>
              <p><span className="text-slate-500">Sales Today:</span> {selected.salesToday}</p>
              <p><span className="text-slate-500">Revenue:</span> {formatCurrency(selected.revenueToday)}</p>
              <p><span className="text-slate-500">Hours:</span> {selected.workingHours?.start} - {selected.workingHours?.end}</p>
              <p><span className="text-slate-500">Status:</span> {getStatusLabel(selected.status)}</p>
              <p className="text-xs text-slate-400">📍 {selected.location.lat.toFixed(4)}, {selected.location.lng.toFixed(4)}</p>
            </div>
            <button onClick={() => setSelected(null)} className="mt-3 text-xs text-brand-600">Close</button>
          </div>
        )}
      </main>
    </>
  );
}
