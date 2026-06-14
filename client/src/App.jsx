import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LiveTracking from './pages/LiveTracking';
import SalesAnalytics from './pages/SalesAnalytics';
import AIFlavors from './pages/AIFlavors';
import Inventory from './pages/Inventory';
import Refrigerator from './pages/Refrigerator';
import Heatmap from './pages/Heatmap';
import Predictions from './pages/Predictions';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tracking" element={<LiveTracking />} />
          <Route path="/analytics" element={<SalesAnalytics />} />
          <Route path="/ai-flavors" element={<AIFlavors />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/refrigerator" element={<Refrigerator />} />
          <Route path="/heatmap" element={<Heatmap />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
