import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, ClipboardList, Package, Bell, CheckCircle, XCircle, Clock, Phone,
  Home, RefreshCw, Trash2, UserPlus, Activity, Shield, TrendingUp, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

function StatCard({ icon: Icon, label, value, color, badge }) {
  const colorStyles = {
    emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30',
    amber: 'from-amber-500 to-orange-500 shadow-amber-500/30',
    blue: 'from-blue-500 to-indigo-600 shadow-blue-500/30',
    rose: 'from-rose-500 to-red-600 shadow-rose-500/30',
    purple: 'from-purple-500 to-violet-600 shadow-purple-500/30',
  };
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorStyles[color]} shadow-lg`}>
          <Icon size={22} className="text-white" />
        </div>
        {badge != null && badge > 0 && (
          <span className="px-2.5 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-bold rounded-full">
            {badge} New
          </span>
        )}
      </div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value ?? '—'}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function RequestCard({ request, onApprove, onReject, loading }) {
  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="p-5 bg-white dark:bg-gray-800 border border-amber-200 dark:border-amber-700/50 rounded-2xl space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {request.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{request.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{request.email}</p>
          </div>
        </div>
        <span className="flex-shrink-0 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-full font-medium">
          <Clock size={11} /> {timeAgo(request.submitted_at)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        {request.phone && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Phone size={13} className="text-gray-400" /> {request.phone}
          </div>
        )}
        {request.kitchen_name && (
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Home size={13} className="text-gray-400" /> {request.kitchen_name}
          </div>
        )}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Users size={13} className="text-gray-400" /> {request.household_size} people
        </div>
      </div>

      {request.notes && (
        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 italic">
          "{request.notes}"
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button onClick={() => onApprove(request.id)} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
          <CheckCircle size={15} /> Approve & Create Account
        </button>
        <button onClick={() => onReject(request.id)} disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 text-sm font-medium rounded-xl transition-colors">
          <XCircle size={15} /> Reject
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, requestsRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/admin/metrics`).then(r => r.json()),
        fetch(`${API_BASE}/admin/requests?status=pending`).then(r => r.json()),
        fetch(`${API_BASE}/admin/users`).then(r => r.json()),
      ]);
      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (requestsRes.success) setRequests(requestsRes.requests);
      if (usersRes.success) setUsers(usersRes.users);
    } catch (err) {
      showToast('Failed to load admin data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${id}/approve`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`✅ ${data.message}`);
        fetchAll();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Failed to approve request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast('Request rejected.');
        fetchAll();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Failed to reject request.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user account permanently?')) return;
    try {
      await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
      showToast('User account deleted.');
      fetchAll();
    } catch {
      showToast('Failed to delete user.', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      showToast(`User ${newStatus === 'active' ? 'reactivated' : 'suspended'}.`);
      fetchAll();
    } catch {
      showToast('Failed to update user status.', 'error');
    }
  };

  const pendingCount = requests.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-fade-in ${toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">Admin Control Center</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">👑 Admin</span>
                <span className="text-xs text-gray-500">{user?.name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll} disabled={loading} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => navigate('/')} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors">
              Kitchen View
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl transition-colors">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Customers" value={metrics?.total_customers} color="emerald" />
          <StatCard icon={ClipboardList} label="Pending Requests" value={pendingCount} color="amber" badge={pendingCount} />
          <StatCard icon={Package} label="Total Stock Items" value={metrics?.total_items} color="blue" />
          <StatCard icon={AlertTriangle} label="Low/Out of Stock" value={(metrics?.low_stock_items ?? 0) + (metrics?.out_of_stock_items ?? 0)} color="rose" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          <button onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'requests' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <ClipboardList size={15} />
            Pending Requests
            {pendingCount > 0 && <span className="px-1.5 py-0.5 bg-amber-500 text-white text-xs font-bold rounded-full">{pendingCount}</span>}
          </button>
          <button onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'users' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            <Users size={15} />
            Customer Accounts
            <span className="px-1.5 py-0.5 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-full">{users.filter(u => u.role === 'customer').length}</span>
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ClipboardList size={20} className="text-amber-500" />
                Account Requests Inbox
              </h2>
              {pendingCount === 0 && (
                <span className="text-sm text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">No pending requests</span>
              )}
            </div>
            {pendingCount === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ClipboardList size={48} className="mb-4 opacity-30" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-sm">No pending account requests at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {requests.map(req => (
                  <RequestCard key={req.id} request={req} onApprove={handleApprove} onReject={handleReject} loading={actionLoading} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-emerald-500" />
                Customer Accounts
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      {['Name', 'Email', 'Role', 'Phone', 'Kitchen', 'Household', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-violet-600' : 'bg-gradient-to-br from-emerald-500 to-teal-600'}`}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white text-sm">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{u.phone || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{u.kitchen_name || '—'}</td>
                        <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{u.household_size} ppl</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {u.role !== 'admin' && (
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleToggleStatus(u.id, u.status)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${u.status === 'active' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/60' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200'}`}>
                                {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                              </button>
                              <button onClick={() => handleDeleteUser(u.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
