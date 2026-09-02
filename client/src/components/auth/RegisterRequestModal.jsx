import React, { useState, useRef } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Home,
  Users,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const WHATSAPP_NUMBER = '923270220077';
const WHATSAPP_DISPLAY = '+92 327 022 0077';
const WHATSAPP_MSG = encodeURIComponent(
  "Hello Admin! I have submitted a registration request for Smart Kitchen Inventory and would like to follow up for account activation."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`;

export default function RegisterRequestModal({ onClose }) {
  const { submitRegistrationRequest } = useAuth();
  const [step, setStep] = useState('form'); // 'form' | 'success'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    kitchen_name: '',
    household_size: '2',
    notes: ''
  });

  const errorRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    // 1. Validation checks
    const trimmedName = form.name.trim();
    const trimmedEmail = form.email.trim();
    const password = form.password;

    if (!trimmedName) {
      setError('Please enter your Full Name.');
      return;
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid Email Address.');
      return;
    }
    if (!password || password.length < 3) {
      setError('Please enter a password with at least 3 characters.');
      return;
    }
    if (form.confirmPassword && password !== form.confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: trimmedName,
        email: trimmedEmail,
        password: password,
        phone: form.phone.trim(),
        kitchen_name: form.kitchen_name.trim() || `${trimmedName}'s Kitchen`,
        household_size: parseInt(form.household_size) || 2,
        notes: form.notes.trim()
      };

      const result = await submitRegistrationRequest(payload);
      setSuccessData(result);
      setStep('success');
    } catch (err) {
      console.error('Registration submission error:', err);
      setError(err.message || 'Failed to submit registration request. Please check your connection or contact Admin on WhatsApp.');
      if (errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
              <Sparkles size={20} className="text-emerald-200" />
              Request Kitchen Account
            </h2>
            <p className="text-xs text-emerald-100 mt-0.5">
              Submit your details &bull; Admin will review and approve
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-100 flex-1">
          {step === 'success' ? (
            /* ── SUCCESS STATE ── */
            <div className="py-6 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-900/40">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-white">Request Submitted! 🎉</h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                  {successData?.message ||
                    `Your account application for ${form.email} has been received and is waiting for admin approval.`}
                </p>
              </div>

              {/* WhatsApp Expedited Approval Card */}
              <div className="p-4 rounded-2xl bg-green-950/50 border border-green-700/60 text-left space-y-2.5">
                <div className="flex items-center gap-2 text-green-300 font-bold text-xs">
                  <MessageSquare size={16} />
                  <span>⚡ Want Instant Activation?</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Message the platform admin directly on WhatsApp to get your account activated immediately:
                </p>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/30 transition-all hover:scale-[1.02]"
                >
                  <MessageSquare size={16} />
                  <span>Chat with Admin on WhatsApp ({WHATSAPP_DISPLAY})</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Close &amp; Return to Homepage
              </button>
            </div>
          ) : (
            /* ── FORM STATE ── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Top Error Alert */}
              {error && (
                <div
                  ref={errorRef}
                  className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
                >
                  <AlertCircle size={17} className="text-rose-400 flex-shrink-0 mt-0.5" />
                  <span className="leading-relaxed font-medium">{error}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Full Name <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Fatima Tariq"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Email Address <span className="text-emerald-400">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Desired Password <span className="text-emerald-400">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 3 characters"
                      className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Repeat password"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Phone / WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Phone / WhatsApp Number
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+92 300 0000000 or your WhatsApp number"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              {/* Kitchen Name & Household Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Kitchen / Pantry Name
                  </label>
                  <div className="relative">
                    <Home size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      name="kitchen_name"
                      type="text"
                      value={form.kitchen_name}
                      onChange={handleChange}
                      placeholder="e.g. Tariq Family Kitchen"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Household Members
                  </label>
                  <div className="relative">
                    <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                      name="household_size"
                      value={form.household_size}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                        <option key={n} value={n} className="bg-slate-900 text-white">
                          {n} {n === 1 ? 'Person' : 'People'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Tell the admin a little about your kitchen or needs..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
                />
              </div>

              {/* Bottom Error Alert (Right above button so it's impossible to miss!) */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* WhatsApp Quick Note */}
              <div className="p-3 rounded-xl bg-green-950/40 border border-green-800/50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-green-400 font-semibold min-w-0">
                  <MessageSquare size={14} className="flex-shrink-0" />
                  <span className="truncate">WhatsApp Admin: {WHATSAPP_DISPLAY}</span>
                </div>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-green-500 hover:bg-green-400 text-slate-950 font-bold text-[11px] flex items-center gap-1 flex-shrink-0"
                >
                  <span>Chat</span> <ExternalLink size={10} />
                </a>
              </div>

              {/* 🚀 SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Request…</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">🚀</span>
                    <span>Submit Account Request</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
