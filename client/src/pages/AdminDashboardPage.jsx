import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  Package,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Home,
  RefreshCw,
  Trash2,
  UserPlus,
  Activity,
  Shield,
  TrendingUp,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
  Edit3,
  Search,
  LogOut,
  Radio,
  Check,
  X,
  Lock,
  Mail,
  UserCheck,
  UserX,
  Sparkles,
  FlameKindling
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api';

function formatTimestamp(isoString) {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'requests' | 'trash' | 'activity'
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [toast, setToast] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');

  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    kitchen_name: '',
    household_size: '2'
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const fetchEndpoint = async (path) => {
        try {
          const r = await fetch(path);
          return await r.json();
        } catch {
          const r = await fetch(`${API_BASE}${path.replace('/api', '')}`);
          return await r.json();
        }
      };

      const [metricsRes, requestsRes, usersRes, activityRes] = await Promise.all([
        fetchEndpoint('/api/admin/metrics'),
        fetchEndpoint('/api/admin/requests'),
        fetchEndpoint('/api/admin/users'),
        fetchEndpoint('/api/admin/activity'),
      ]);

      if (metricsRes.success) setMetrics(metricsRes.metrics);
      if (requestsRes.success) setRequests(requestsRes.requests);
      if (usersRes.success) setUsers(usersRes.users);
      if (activityRes.success) setActivityLogs(activityRes.logs);
    } catch {
      showToast('Failed to load admin telemetry.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 12000); // Auto-refresh live data every 12s
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApproveRequest = async (id) => {
    setApprovingId(id);
    try {
      let data;
      try {
        const res = await fetch(`/api/admin/requests/${id}/approve`, { method: 'POST' });
        data = await res.json();
      } catch {
        const res = await fetch(`${API_BASE}/admin/requests/${id}/approve`, { method: 'POST' });
        data = await res.json();
      }
      if (data && data.success) {
        showToast(data.message || 'Account approved successfully!');
        fetchAllData();
      } else {
        showToast(data?.error || 'Approval failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Approval failed.', 'error');
    } finally {
      setApprovingId(null);
    }
  };

  const handleRejectRequest = async (id) => {
    setRejectingId(id);
    try {
      let data;
      try {
        const res = await fetch(`/api/admin/requests/${id}/reject`, { method: 'POST' });
        data = await res.json();
      } catch {
        const res = await fetch(`${API_BASE}/admin/requests/${id}/reject`, { method: 'POST' });
        data = await res.json();
      }
      if (data && data.success) {
        showToast('Request rejected and moved to Trash.');
        fetchAllData();
      } else {
        showToast(data?.error || 'Rejection failed.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Rejection failed.', 'error');
    } finally {
      setRejectingId(null);
    }
  };

  const handleDeleteRequestPermanently = async (id, email) => {
    if (!confirm(`Permanently delete the request from "${email}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/requests/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Request permanently deleted from Trash.');
        fetchAllData();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Failed to permanently delete request.', 'error');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Account marked as ${newStatus}.`);
        fetchAllData();
      }
    } catch {
      showToast('Status update failed.', 'error');
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!confirm(`Are you sure you want to permanently delete user "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('User account deleted.');
        fetchAllData();
      }
    } catch {
      showToast('Delete failed.', 'error');
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPasswordInput) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${passwordModalUser.id}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_password: newPasswordInput })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Password updated to "${newPasswordInput}"`);
        setPasswordModalUser(null);
        setNewPasswordInput('');
        fetchAllData();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Password change failed.', 'error');
    }
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      const res = await fetch(`${API_BASE}/admin/users/${editUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Customer profile updated.');
        setEditUser(null);
        fetchAllData();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Update failed.', 'error');
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!addForm.name || !addForm.email || !addForm.password) {
      return showToast('Name, email, and password are required.', 'error');
    }
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...addForm, role: 'customer' })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Customer account created for ${addForm.name}`);
        setShowAddModal(false);
        setAddForm({ name: '', email: '', password: '', phone: '', kitchen_name: '', household_size: '2' });
        fetchAllData();
      } else {
        showToast(data.error, 'error');
      }
    } catch {
      showToast('Creation failed.', 'error');
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const trashRequests = requests.filter((r) => r.status === 'rejected');
  const customers = users.filter((u) => u.role === 'customer');
  const onlineCustomers = customers.filter((u) => u.is_online);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      (c.kitchen_name && c.kitchen_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-2xl text-white text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-200 border ${
            toast.type === 'error' ? 'bg-rose-950 border-rose-700 text-rose-200' : 'bg-emerald-950 border-emerald-700 text-emerald-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex-shrink-0 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-900/40">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white truncate">Admin Master Control</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-purple-950 border border-purple-700 text-purple-300 flex-shrink-0">
                  SUPERUSER
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                Logged in as <strong className="text-slate-200">{user?.email}</strong> ({user?.name})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Live Data"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-purple-400' : ''} />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Home size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Kitchen View</span>
            </button>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="px-2.5 sm:px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── 4 STAT METRICS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {/* Online Active Customers */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-emerald-800/40 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                Live Online
              </span>
              <div className="p-2 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400">
                <Radio size={16} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white">{onlineCustomers.length}</p>
            <p className="text-xs text-slate-400 mt-1">
              Active right now out of {customers.length} total
            </p>
          </div>

          {/* Total Customers */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-purple-800/40 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Customers</span>
              <div className="p-2 rounded-xl bg-purple-950 border border-purple-800 text-purple-400">
                <Users size={16} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white">{customers.length}</p>
            <p className="text-xs text-slate-400 mt-1">Registered kitchen accounts</p>
          </div>

          {/* Pending Approval Requests */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-amber-800/40 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Requests</span>
              <div className="p-2 rounded-xl bg-amber-950 border border-amber-800 text-amber-400">
                <ClipboardList size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl sm:text-4xl font-black text-white">{pendingRequests.length}</p>
              {pendingRequests.length > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-bounce">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">Waiting for Admin approval</p>
          </div>

          {/* Total Tracked Items */}
          <div className="p-5 rounded-3xl bg-slate-900/80 border border-blue-800/40 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tracked Inventory</span>
              <div className="p-2 rounded-xl bg-blue-950 border border-blue-800 text-blue-400">
                <Package size={16} />
              </div>
            </div>
            <p className="text-3xl sm:text-4xl font-black text-white">{metrics?.total_items ?? '—'}</p>
            <p className="text-xs text-slate-400 mt-1">Across 6 master categories</p>
          </div>
        </div>

        {/* ── TAB SELECTOR & TOOLBAR ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1 p-1 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users size={16} />
              <span>Customers ({customers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'requests'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ClipboardList size={16} />
              <span>Requests</span>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('trash')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 relative ${
                activeTab === 'trash'
                  ? 'bg-rose-700 text-white shadow-lg shadow-rose-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Trash2 size={16} />
              <span>Trash</span>
              {trashRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-600 text-white text-[10px] font-black flex items-center justify-center">
                  {trashRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'activity'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity size={16} />
              <span>Audit Feed</span>
            </button>
          </div>

          {activeTab === 'customers' && (
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search customers..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md shadow-purple-900/30 flex items-center gap-1.5 flex-shrink-0"
              >
                <UserPlus size={15} />
                <span>Add Customer</span>
              </button>
            </div>
          )}
        </div>

        {/* ── TAB 1: CUSTOMERS TABLE WITH PASSWORDS & TIMESTAMPS ── */}
        {activeTab === 'customers' && (
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  Customer Directory &amp; Security Control
                </h3>
                <p className="text-xs text-slate-400">
                  Full visibility into customer credentials, plain passwords, and live login/logout telemetry.
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                {filteredCustomers.length} Accounts
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/60">
                    <th className="p-4 pl-6">Customer</th>
                    <th className="p-4">Plain Password</th>
                    <th className="p-4">Live Status</th>
                    <th className="p-4">Last Login</th>
                    <th className="p-4">Last Logout</th>
                    <th className="p-4">Kitchen Info</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="p-10 text-center text-slate-500">
                        No customer accounts found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((c) => {
                      const isPwVisible = visiblePasswords[c.id];
                      return (
                        <tr key={c.id} className="hover:bg-slate-850/50 transition-colors group">
                          {/* Name & Email */}
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                                {c.name ? c.name[0].toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-white truncate">{c.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">{c.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Password with Eye Toggle */}
                          <td className="p-4">
                            <div className="flex items-center gap-2 bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-800 w-fit">
                              <span className="font-mono text-xs text-purple-300 select-all">
                                {isPwVisible ? (c.password_plain || 'user123') : '••••••••'}
                              </span>
                              <button
                                onClick={() => togglePasswordVisibility(c.id)}
                                className="text-slate-400 hover:text-white transition-colors"
                                title={isPwVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isPwVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                            </div>
                          </td>

                          {/* Online Status */}
                          <td className="p-4">
                            {c.is_online ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[10px]">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Active Now
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 font-medium text-[10px]">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Offline
                              </span>
                            )}
                          </td>

                          {/* Last Login */}
                          <td className="p-4 text-slate-300 font-medium">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-emerald-400 flex-shrink-0" />
                              <span>{formatTimestamp(c.last_login)}</span>
                            </div>
                          </td>

                          {/* Last Logout */}
                          <td className="p-4 text-slate-400">
                            <div className="flex items-center gap-1">
                              <Clock size={12} className="text-slate-500 flex-shrink-0" />
                              <span>{formatTimestamp(c.last_logout)}</span>
                            </div>
                          </td>

                          {/* Kitchen & Household */}
                          <td className="p-4 text-slate-300">
                            <p className="font-semibold text-white">{c.kitchen_name || 'Kitchen'}</p>
                            <p className="text-[10px] text-slate-400">{c.household_size || 2} members &bull; {c.phone || 'No phone'}</p>
                          </td>

                          {/* Account Status */}
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                c.status === 'active'
                                  ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                                  : 'bg-rose-950/80 border-rose-700 text-rose-300'
                              }`}
                            >
                              {c.status}
                            </span>
                          </td>

                          {/* Action Buttons */}
                          <td className="p-4 pr-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Change Password */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(c);
                                  setNewPasswordInput('');
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 hover:text-purple-300 transition-colors"
                                title="Reset / Change Customer Password"
                              >
                                <KeyRound size={14} />
                              </button>

                              {/* Edit Profile */}
                              <button
                                onClick={() => setEditUser({ ...c })}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
                                title="Edit Customer Details"
                              >
                                <Edit3 size={14} />
                              </button>

                              {/* Suspend / Reactivate */}
                              <button
                                onClick={() => handleToggleStatus(c.id, c.status)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  c.status === 'active'
                                    ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800'
                                    : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                                }`}
                                title={c.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                              >
                                {c.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => handleDeleteUser(c.id, c.name)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                                title="Permanently Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB 2: PENDING REGISTRATION REQUESTS ── */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <ClipboardList size={20} className="text-amber-400" />
                  Applicant Inbox &amp; Approval Station
                </h3>
                <p className="text-xs text-slate-400">
                  Review pending signup requests. Rejected requests are moved to the Trash tab.
                </p>
              </div>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <ClipboardList size={40} className="mx-auto text-slate-600" />
                <p className="text-base font-bold text-slate-300">No Pending Requests</p>
                <p className="text-xs text-slate-500">When users submit the signup form, their details will appear here for review.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-amber-700/60 shadow-xl shadow-amber-950/30 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-amber-950 border-amber-600 text-amber-300">
                          Pending Review
                        </span>
                        <h4 className="font-extrabold text-base text-white mt-1.5">{req.name}</h4>
                        <p className="text-xs text-slate-400">{req.email}</p>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium flex-shrink-0">
                        {formatTimestamp(req.submitted_at)}
                      </span>
                    </div>

                    {/* Requested Password Preview */}
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Lock size={13} className="text-purple-400" /> Requested Password:
                      </span>
                      <span className="font-mono text-purple-300 font-bold bg-slate-900 px-2 py-0.5 rounded-md border border-slate-700">
                        {req.password_plain || '••••••••'}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">WhatsApp Phone</p>
                        <p className="font-semibold text-slate-200 mt-0.5">{req.phone || '—'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Kitchen Name</p>
                        <p className="font-semibold text-slate-200 mt-0.5">{req.kitchen_name || 'My Kitchen'}</p>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-xs text-slate-300 italic">
                        &ldquo;{req.notes}&rdquo;
                      </p>
                    )}

                    {/* Approve & Reject Buttons */}
                    <div className="flex items-center gap-3 pt-2">
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={approvingId === req.id || rejectingId === req.id}
                        className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                      >
                        {approvingId === req.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Activating Account…</span>
                          </>
                        ) : (
                          <>
                            <Check size={14} />
                            <span>Approve &amp; Create Account</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={approvingId === req.id || rejectingId === req.id}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
                      >
                        {rejectingId === req.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                            <span>Moving…</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={14} />
                            <span>Reject → Trash</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: TRASH — REJECTED REQUESTS ── */}
        {activeTab === 'trash' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <Trash2 size={20} className="text-rose-400" />
                  Rejected Requests Trash
                </h3>
                <p className="text-xs text-slate-400">
                  Rejected applicant requests are stored here. You can permanently delete them to clear the trash.
                </p>
              </div>
              {trashRequests.length > 0 && (
                <span className="text-xs font-bold bg-rose-950 border border-rose-800 text-rose-300 px-3 py-1 rounded-full">
                  {trashRequests.length} item{trashRequests.length > 1 ? 's' : ''} in trash
                </span>
              )}
            </div>

            {trashRequests.length === 0 ? (
              <div className="p-16 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <Trash2 size={40} className="mx-auto text-slate-700" />
                <p className="text-base font-bold text-slate-400">Trash is Empty</p>
                <p className="text-xs text-slate-500">Rejected requests will appear here. You can permanently delete them from here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {trashRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-6 rounded-3xl bg-slate-900/90 border border-rose-900/50 opacity-80 hover:opacity-100 transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border bg-rose-950 border-rose-700 text-rose-300">
                          Rejected
                        </span>
                        <h4 className="font-extrabold text-base text-white mt-1.5">{req.name}</h4>
                        <p className="text-xs text-slate-400">{req.email}</p>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium flex-shrink-0">
                        Rejected {formatTimestamp(req.reviewed_at || req.submitted_at)}
                      </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-[10px] text-slate-600 uppercase font-bold">Phone</p>
                        <p className="font-medium text-slate-300 mt-0.5">{req.phone || '—'}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                        <p className="text-[10px] text-slate-600 uppercase font-bold">Kitchen</p>
                        <p className="font-medium text-slate-300 mt-0.5">{req.kitchen_name || '—'}</p>
                      </div>
                    </div>

                    {/* Permanent Delete Button */}
                    <button
                      onClick={() => handleDeleteRequestPermanently(req.id, req.email)}
                      className="w-full py-2.5 rounded-xl bg-rose-950 hover:bg-rose-900 border border-rose-800 hover:border-rose-600 text-rose-300 hover:text-rose-200 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Trash2 size={14} />
                      <span>Permanently Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: LIVE AUDIT & LOGIN/LOGOUT ACTIVITY LOG ── */}
        {activeTab === 'activity' && (
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                  <Activity size={18} className="text-emerald-400" />
                  Real-time System Audit &amp; Session Timeline
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological log of customer sign-ins, sign-outs, registrations, and administrative updates.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
                Live Feed
              </span>
            </div>

            {activityLogs.length === 0 ? (
              <p className="text-center py-10 text-xs text-slate-500">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {activityLogs.map((log) => {
                  const isLogin = log.action === 'login';
                  const isLogout = log.action === 'logout';
                  const isSignup = log.action === 'signup_request';
                  const isApprove = log.action === 'request_approved';
                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                            isLogin
                              ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                              : isLogout
                              ? 'bg-slate-800 text-slate-400'
                              : isSignup
                              ? 'bg-amber-950 border border-amber-700 text-amber-300'
                              : 'bg-purple-950 border border-purple-700 text-purple-300'
                          }`}
                        >
                          {isLogin ? 'IN' : isLogout ? 'OUT' : isSignup ? 'REQ' : 'ADM'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">
                            {log.user_name}{' '}
                            <span className="text-[11px] font-normal text-slate-400">({log.user_email})</span>
                          </p>
                          <p className="text-[11px] text-slate-300">{log.details}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-500 font-semibold flex-shrink-0">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── MODAL: ADD CUSTOMER ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <UserPlus size={18} className="text-purple-400" />
                Provision New Customer
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Fatima Tariq"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="fatima@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="e.g. fatima123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+92 300 0000000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kitchen Name</label>
                  <input
                    type="text"
                    value={addForm.kitchen_name}
                    onChange={(e) => setAddForm({ ...addForm, kitchen_name: e.target.value })}
                    placeholder="Fatima's Kitchen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all mt-2"
              >
                Create Customer Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: CHANGE/RESET CUSTOMER PASSWORD ── */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <KeyRound size={16} className="text-purple-400" />
                Change Password
              </h3>
              <button onClick={() => setPasswordModalUser(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Set a new plaintext password for{' '}
              <strong className="text-white">{passwordModalUser.email}</strong>:
            </p>

            <form onSubmit={handleSavePassword} className="space-y-3">
              <input
                type="text"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-purple-300 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all"
              >
                Update Password Immediately
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT CUSTOMER DETAILS ── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                <Edit3 size={16} className="text-blue-400" />
                Edit Customer Details
              </h3>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={editUser.phone || ''}
                  onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Kitchen Name</label>
                <input
                  type="text"
                  value={editUser.kitchen_name || ''}
                  onChange={(e) => setEditUser({ ...editUser, kitchen_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
