import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat,
  Bell,
  ShoppingCart,
  TrendingDown,
  BarChart3,
  Smartphone,
  Share2,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  ExternalLink,
  Star,
  Users,
  Package,
  Zap,
  Shield,
  RefreshCw,
  Moon,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  Check,
  Flame,
  Activity,
  LogIn,
  UserPlus
} from 'lucide-react';
import RegisterRequestModal from '../components/auth/RegisterRequestModal';

const WHATSAPP_NUMBER = '923270220077';
const WHATSAPP_DISPLAY = '+92 327 022 0077';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Admin! I'm interested in Smart Kitchen Inventory. I want to get an account.")}`;

const FEATURES = [
  {
    icon: Bell,
    color: 'amber',
    title: 'Smart Stock Alerts',
    desc: 'Instant notifications when pantry items drop below your custom threshold — before you run out.',
    badge: 'Real-time'
  },
  {
    icon: ShoppingCart,
    color: 'blue',
    title: 'Auto-Synced Shopping List',
    desc: 'Auto-partitions into "Buy Now" (urgent) and "Well Stocked" items. Never forget an essential.',
    badge: 'Auto-Sync'
  },
  {
    icon: BarChart3,
    color: 'emerald',
    title: 'Burn Rate & Days Left',
    desc: 'Calculates weekly depletion rate and estimates exactly how many days of supply remain.',
    badge: 'Smart Math'
  },
  {
    icon: Package,
    color: 'purple',
    title: 'Category Organization',
    desc: 'Produce, Dairy, Meat, Bakery, Pantry, Beverages — with custom icons, colors, and sorting.',
    badge: '6+ Categories'
  },
  {
    icon: Share2,
    color: 'rose',
    title: '1-Click List Sharing',
    desc: 'Export your shopping list to WhatsApp, Notes, SMS, or native share with clean formatting.',
    badge: 'Instant'
  },
  {
    icon: RefreshCw,
    color: 'orange',
    title: 'Bulk Restock with Confetti',
    desc: 'Check off items as you buy them and restock your whole kitchen in 1 click with confetti celebration.',
    badge: '1-Click'
  },
  {
    icon: Smartphone,
    color: 'cyan',
    title: '100% Mobile Responsive',
    desc: 'Optimized for desktop, tablet, and smartphone. Manage your pantry on the go seamlessly.',
    badge: 'Cross-Device'
  },
  {
    icon: Moon,
    color: 'indigo',
    title: 'Dark & Light Themes',
    desc: 'Tailored sleek dark mode and vibrant light mode designed to be easy on your eyes any time of day.',
    badge: 'Themes'
  }
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Add Your Kitchen Items',
    desc: 'Organize your groceries by category, set your current quantity and weekly consumption rate.',
    icon: Package,
    color: 'emerald'
  },
  {
    step: '02',
    title: 'Get Automatic Stock Alerts',
    desc: 'The stock engine calculates daily depletion and triggers amber and red alerts before you run out.',
    icon: Bell,
    color: 'amber'
  },
  {
    step: '03',
    title: 'Shop & Restock in 1 Click',
    desc: 'Take your auto-generated shopping list to the store, check off items, and bulk restock instantly.',
    icon: ShoppingCart,
    color: 'blue'
  }
];

const SAMPLE_ITEMS = [
  { name: 'Organic Whole Milk', category: 'Dairy', qty: '2.5 L', days: '6 days', status: 'in_stock', color: 'emerald' },
  { name: 'Cage-Free Eggs', category: 'Dairy', qty: '4 pcs', days: '2 days', status: 'low', color: 'amber' },
  { name: 'Ripe Bananas', category: 'Produce', qty: '0 pcs', days: '0 days', status: 'out_of_stock', color: 'rose' },
  { name: 'Sourdough Bread', category: 'Bakery', qty: '1 loaf', days: '3 days', status: 'low', color: 'amber' },
  { name: 'Chicken Breast', category: 'Meat', qty: '1.2 kg', days: '5 days', status: 'in_stock', color: 'emerald' },
];

const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Mother of 3',
    stars: 5,
    text: 'We cut our grocery waste by 40% in the first month. The days-remaining calculations are spot on!'
  },
  {
    name: 'Ahmed Al-Rashid',
    role: 'Guesthouse Owner',
    stars: 5,
    text: 'Managing kitchen inventory for multiple guests used to take hours. Now it runs automatically.'
  },
  {
    name: 'Emily Davis',
    role: 'Working Professional',
    stars: 5,
    text: 'The WhatsApp shopping list export is pure genius. I share the list with my partner in 1 click!'
  }
];

const colorIconMap = {
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
};

const statusStyle = {
  in_stock: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
  low: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800',
  out_of_stock: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800',
};

export default function PublicShowcasePage() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* ── TOP NAVBAR ── */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center gap-2">
                Smart Kitchen
                <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60">
                  Inventory
                </span>
              </span>
              <p className="text-[11px] text-slate-400 hidden sm:block">Grocery &amp; Stock Intelligence</p>
            </div>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#preview" className="hover:text-emerald-400 transition-colors">Live Demo</a>
            <a href="#testimonials" className="hover:text-emerald-400 transition-colors">Reviews</a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageSquare size={15} />
              {WHATSAPP_DISPLAY}
            </a>
          </div>

          {/* Action Buttons: Sign In & Request Access */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/60 text-slate-200 hover:text-white text-sm font-semibold transition-all flex items-center gap-2 bg-slate-900/60 hover:bg-slate-800"
            >
              <LogIn size={16} className="text-emerald-400" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => setShowRegister(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 flex items-center gap-1.5"
            >
              <UserPlus size={16} />
              <span>Request Account</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32">
        {/* Background glow meshes */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-400 text-xs font-semibold shadow-inner">
              <Sparkles size={14} className="text-emerald-400" />
              <span>Powered by PostgreSQL / Supabase &amp; React</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Never Run Out of{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Kitchen Essentials
              </span>{' '}
              Again.
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Smart Kitchen Inventory automatically tracks your pantry items, calculates weekly burn rates,
              alerts you before you run out, and generates your shopping list in real-time.
            </p>

            {/* Primary Hero CTA Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2.5"
              >
                <LogIn size={20} />
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </button>

              <button
                onClick={() => setShowRegister(true)}
                className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/60 text-white font-bold text-base transition-all hover:scale-105 flex items-center justify-center gap-2"
              >
                <UserPlus size={20} className="text-emerald-400" />
                <span>Request New Account</span>
              </button>
            </div>

            {/* WhatsApp Direct Connect Strip */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <MessageSquare size={14} className="text-green-400" />
              <span>Direct WhatsApp Contact:</span>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 font-bold hover:underline flex items-center gap-1"
              >
                {WHATSAPP_DISPLAY} <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* ── LIVE INTERACTIVE PREVIEW CARD ── */}
          <div id="preview" className="mt-16 lg:mt-24 max-w-5xl mx-auto">
            <div className="p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-slate-800/80 to-slate-900/80 border border-slate-700/80 shadow-2xl shadow-emerald-950/40 backdrop-blur-2xl">
              <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Mock Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Activity size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Live Kitchen Stock Snapshot</h3>
                      <p className="text-xs text-slate-400">Real-time status calculation &amp; burn rate forecast</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 text-xs font-bold">
                      92% Stock Health
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                      27 Total Items
                    </span>
                  </div>
                </div>

                {/* Sample Inventory Items List */}
                <div className="space-y-3">
                  {SAMPLE_ITEMS.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3.5 sm:p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-3 h-3 rounded-full ${item.status === 'in_stock' ? 'bg-emerald-400' : item.status === 'low' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                        <div>
                          <p className="text-sm font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-8">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-slate-200">{item.qty}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 justify-end">
                            <Clock size={11} /> {item.days} left
                          </p>
                        </div>

                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${statusStyle[item.status]}`}>
                          {item.status === 'in_stock' ? 'In Stock' : item.status === 'low' ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Card Footer Bar */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Flame size={15} className="text-amber-400" />
                    <span>Calculates burn rate dynamically based on your family's weekly consumption.</span>
                  </div>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    Open Live App <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-STEP HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Simple Workflow</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How Smart Kitchen Works</h2>
            <p className="text-slate-400 text-sm sm:text-base">Take full control of your kitchen in three intuitive steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-8 rounded-3xl bg-slate-950 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:-translate-y-1 relative space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className={`p-3.5 rounded-2xl ${colorIconMap[step.color]}`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-3xl font-black text-slate-800">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8 FEATURE HIGHLIGHTS ── */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Zero Food Waste</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Every tool you need to track stock, automate grocery runs, and save hundreds of dollars a month.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-emerald-500/40 transition-all hover:shadow-xl hover:-translate-y-1 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-2xl ${colorIconMap[feat.color]}`}>
                    <Icon size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STATS / IMPACT BANNER ── */}
      <section className="py-16 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border-y border-emerald-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-emerald-400">40%</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Average Food Waste Reduction</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-teal-400">27+</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Starter Grocery Items</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-cyan-400">1-Click</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Shopping List Restock</p>
            </div>
            <div className="space-y-1">
              <p className="text-4xl sm:text-5xl font-extrabold text-purple-400">2 Roles</p>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">Admin &amp; Customer RBAC</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Reviews</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Loved by Families &amp; Kitchens</h2>
          <p className="text-slate-400 text-sm sm:text-base">Hear from households transforming the way they manage groceries.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm text-slate-300 italic leading-relaxed">"{t.text}"</p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-400">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ── */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 font-bold">
            <ChefHat className="w-8 h-8 text-white" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white">Ready to Upgrade Your Kitchen?</h2>
            <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
              Get an account, connect your household, and experience stress-free grocery management.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-base shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              <span>Sign In to Your Kitchen</span>
            </button>

            <button
              onClick={() => setShowRegister(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-base transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} className="text-emerald-400" />
              <span>Request Access</span>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <span>Admin Contact on WhatsApp:</span>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 font-bold hover:underline flex items-center gap-1"
            >
              <MessageSquare size={13} /> {WHATSAPP_DISPLAY}
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; 2024 Smart Kitchen Inventory &bull; Managed by 24p1fsmb028-jpg &bull; WhatsApp: {WHATSAPP_DISPLAY}</p>
      </footer>

      {/* Registration Request Modal */}
      {showRegister && <RegisterRequestModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
