import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import Header from '../components/layout/Header';
import { PageLoader } from '../components/ui/LoadingSpinner';
import api from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function Inventory() {
  const { onMenuClick } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [form, setForm] = useState({ name: '', flavor: '', price: '', quantity: '', expiryDate: '' });
  const [assignForm, setAssignForm] = useState({ sellerId: '', productId: '', quantity: '' });

  const fetchData = async () => {
    const [prodRes, sellerRes, alertRes] = await Promise.all([
      api.get('/inventory'),
      api.get('/sellers'),
      api.get('/inventory/alerts')
    ]);
    setProducts(prodRes.data);
    setSellers(sellerRes.data);
    setAlerts(alertRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    await api.post('/inventory', {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity)
    });
    setShowForm(false);
    setForm({ name: '', flavor: '', price: '', quantity: '', expiryDate: '' });
    fetchData();
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    await api.post('/inventory/assign', {
      sellerId: assignForm.sellerId,
      productId: assignForm.productId,
      quantity: Number(assignForm.quantity)
    });
    setShowAssign(false);
    setAssignForm({ sellerId: '', productId: '', quantity: '' });
    fetchData();
  };

  if (loading) return <><Header title="Inventory Management" onMenuClick={onMenuClick} /><PageLoader /></>;

  return (
    <>
      <Header title="Inventory Management" subtitle="Products, stock & assignments" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
          <button onClick={() => setShowAssign(true)} className="btn-secondary flex items-center gap-2">
            <Package className="w-4 h-4" /> Assign Stock
          </button>
        </div>

        {alerts.length > 0 && (
          <div className="card p-4 border-l-4 border-l-orange-500">
            <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
              <AlertTriangle className="w-5 h-5" /> Low Stock Alerts ({alerts.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {alerts.map(p => (
                <span key={p._id} className="badge bg-orange-100 text-orange-700">
                  {p.name}: {p.quantity} left
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr className="text-left text-slate-500">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Flavor</th>
                <th className="p-4 font-medium">Price</th>
                <th className="p-4 font-medium">Quantity</th>
                <th className="p-4 font-medium">Expiry</th>
                <th className="p-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id} className="border-t border-slate-100">
                  <td className="p-4 font-medium">{p.name}</td>
                  <td className="p-4">{p.flavor}</td>
                  <td className="p-4">{formatCurrency(p.price)}</td>
                  <td className="p-4">{p.quantity}</td>
                  <td className="p-4 text-slate-500">{new Date(p.expiryDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`badge ${p.quantity <= p.lowStockThreshold ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {p.quantity <= p.lowStockThreshold ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleAddProduct} className="card p-6 w-full max-w-md space-y-4">
              <h3 className="font-semibold text-lg">Add Product</h3>
              {['name', 'flavor', 'price', 'quantity', 'expiryDate'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium mb-1 capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <input
                    type={field === 'expiryDate' ? 'date' : field === 'price' || field === 'quantity' ? 'number' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              ))}
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {showAssign && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleAssign} className="card p-6 w-full max-w-md space-y-4">
              <h3 className="font-semibold text-lg">Assign Stock to Seller</h3>
              <div>
                <label className="block text-sm font-medium mb-1">Seller</label>
                <select value={assignForm.sellerId} onChange={(e) => setAssignForm({ ...assignForm, sellerId: e.target.value })} className="input" required>
                  <option value="">Select seller</option>
                  {sellers.map(s => <option key={s._id} value={s._id}>{s.name} — {s.area}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product</label>
                <select value={assignForm.productId} onChange={(e) => setAssignForm({ ...assignForm, productId: e.target.value })} className="input" required>
                  <option value="">Select product</option>
                  {products.map(p => <option key={p._id} value={p._id}>{p.name} ({p.quantity} available)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input type="number" value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })} className="input" required min="1" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">Assign</button>
                <button type="button" onClick={() => setShowAssign(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
