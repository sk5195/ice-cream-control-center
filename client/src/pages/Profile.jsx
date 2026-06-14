import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Shield, Save } from 'lucide-react';
import Header from '../components/layout/Header';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { onMenuClick } = useOutletContext();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await updateProfile(form);
      setMessage('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      await api.put('/auth/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Password change failed');
    }
  };

  return (
    <>
      <Header title="Profile" subtitle="Account settings" onMenuClick={onMenuClick} />
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-600 text-white flex items-center justify-center text-2xl font-bold">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold">{user?.name}</h3>
                <p className="text-slate-500">{user?.email}</p>
                <span className="badge bg-brand-100 text-brand-700 mt-1 capitalize">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {message && <div className="bg-green-50 text-green-700 px-4 py-3 rounded-lg text-sm mb-4">{message}</div>}
            {error && <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Profile Information</h4>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </form>
          </div>

          <div className="card p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <h4 className="font-semibold">Change Password</h4>
              <div>
                <label className="block text-sm font-medium mb-1">Current Password</label>
                <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">New Password</label>
                <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="input" required minLength={6} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Confirm Password</label>
                <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="input" required />
              </div>
              <button type="submit" className="btn-primary">Update Password</button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
