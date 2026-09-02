import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ChefHat, MessageSquare, ExternalLink, ShieldCheck, User, AlertCircle, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RegisterRequestModal from '../components/auth/RegisterRequestModal';

const WHATSAPP_NUMBER = '923270220077';
const WHATSAPP_DISPLAY = '+92 327 022 0077';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Admin! I'd like to get an account for Smart Kitchen Inventory. Please assist.")}`;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email.trim(), password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoEmail, demoPassword) => {
    setLoading(true);
    setError('');
    try {
      const user = await login(demoEmail, demoPassword);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30">
              <ChefHat size={36} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Smart Kitchen</h1>
            <p className="text-emerald-400 font-medium">Inventory Management</p>
          </div>
          <p className="text-gray-400 text-sm">Sign in to access your kitchen workspace</p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-900/30 border border-red-700/50 rounded-xl text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email" required value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'} required value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <Zap size={16} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs">Quick Demo Login</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Demo Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => quickLogin('admin@smartkitchen.io', 'admin123')} disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/50 hover:border-purple-600 text-purple-300 rounded-xl text-sm font-medium transition-all group">
              <ShieldCheck size={16} className="group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold">Admin Demo</div>
                <div className="text-xs opacity-70">admin@smartkitchen.io</div>
              </div>
            </button>
            <button onClick={() => quickLogin('customer@smartkitchen.io', 'user123')} disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-700/50 hover:border-emerald-600 text-emerald-300 rounded-xl text-sm font-medium transition-all group">
              <User size={16} className="group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <div className="text-xs font-bold">Customer Demo</div>
                <div className="text-xs opacity-70">customer@smartkitchen.io</div>
              </div>
            </button>
          </div>

          {/* Register / WhatsApp */}
          <div className="space-y-3 pt-2 border-t border-gray-800">
            <p className="text-center text-gray-500 text-sm">Don't have an account?</p>
            <button onClick={() => setShowRegister(true)}
              className="w-full py-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-600/50 text-gray-300 hover:text-white font-medium rounded-xl transition-all text-sm">
              📋 Request an Account
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-900/30 hover:bg-green-900/50 border border-green-700/50 hover:border-green-600 text-green-400 hover:text-green-300 font-medium rounded-xl transition-all text-sm">
              <MessageSquare size={16} />
              WhatsApp Admin: {WHATSAPP_DISPLAY}
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">
          Smart Kitchen Inventory &copy; 2024 &bull; Managed by 24p1fsmb028-jpg
        </p>
      </div>

      {showRegister && <RegisterRequestModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
