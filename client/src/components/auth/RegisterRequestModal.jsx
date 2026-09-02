import React, { useState } from 'react';
import { X, User, Mail, Lock, Phone, Home, Users, MessageSquare, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WHATSAPP_NUMBER = '923270220077';
const WHATSAPP_DISPLAY = '+92 327 022 0077';
const WHATSAPP_MSG = encodeURIComponent("Hello Admin! I've submitted a registration request for Smart Kitchen Inventory and would like to follow up.");
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

export default function RegisterRequestModal({ onClose }) {
  const { submitRegistrationRequest } = useAuth();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', kitchen_name: '', household_size: '2', notes: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      return setError('Name, email, and password are required.');
    }
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    setError('');
    try {
      await submitRegistrationRequest({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        kitchen_name: form.kitchen_name.trim(),
        household_size: parseInt(form.household_size) || 2,
        notes: form.notes.trim()
      });
      setStep('success');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div>
            <h2 className="text-xl font-bold text-white">Request an Account</h2>
            <p className="text-emerald-100 text-sm">Fill in your details for admin approval</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white">
            <X size={18} />
          </button>
        </div>

        {step === 'success' ? (
          /* SUCCESS STATE */
          <div className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                <CheckCircle size={48} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted! 🎉</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your account request has been received. The admin will review it and notify you.
              </p>
            </div>

            {/* WhatsApp Follow-up */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-left">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">⚡ Want faster approval?</p>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                Message the admin directly on WhatsApp to speed up your request:
              </p>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 justify-center px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
              >
                <MessageSquare size={18} />
                Message Admin: {WHATSAPP_DISPLAY}
                <ExternalLink size={14} />
              </a>
            </div>

            <button onClick={onClose} className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors">
              Close
            </button>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="name" type="text" required value={form.name} onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="password" type="password" required value={form.password} onChange={handleChange}
                    placeholder="Min 6 chars"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">WhatsApp / Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  placeholder="+92 300 1234567"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
              </div>
            </div>

            {/* Kitchen Name + Household size */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Kitchen / Pantry Name</label>
                <div className="relative">
                  <Home size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input name="kitchen_name" type="text" value={form.kitchen_name} onChange={handleChange}
                    placeholder="My Family Kitchen"
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Household Size</label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select name="household_size" value={form.household_size} onChange={handleChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none">
                    {[1,2,3,4,5,6,7,8,10,12].map(n => <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                placeholder="Briefly describe your use case or any questions..."
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none" />
            </div>

            {/* WhatsApp contact tip */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
              <MessageSquare size={18} className="text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-green-700 dark:text-green-400 font-medium">Need instant help?</p>
                <p className="text-xs text-green-600 dark:text-green-500">Contact admin on WhatsApp: <strong>{WHATSAPP_DISPLAY}</strong></p>
              </div>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="flex-shrink-0 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1">
                Chat <ExternalLink size={11} />
              </a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              {loading ? 'Submitting Request…' : '🚀 Submit Account Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
