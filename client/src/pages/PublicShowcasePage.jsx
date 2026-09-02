import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChefHat, Bell, ShoppingCart, TrendingDown, BarChart3, Smartphone, Share2,
  CheckCircle, ArrowRight, MessageSquare, ExternalLink, Star, Users,
  Package, Zap, Shield, RefreshCw, Moon
} from 'lucide-react';
import RegisterRequestModal from '../components/auth/RegisterRequestModal';

const WHATSAPP_NUMBER = '923270220077';
const WHATSAPP_DISPLAY = '+92 327 022 0077';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello! I'm interested in Smart Kitchen Inventory. Can I get an account?")}`;

const FEATURES = [
  { icon: Bell, color: 'amber', title: 'Smart Stock Alerts', desc: 'Get instant notifications when items run low or go out of stock — before you run out.', badge: 'Real-time' },
  { icon: ShoppingCart, color: 'blue', title: 'Auto Shopping List', desc: 'Automatically generates a prioritized shopping list split into "Buy Now" and "Well Stocked".', badge: 'Auto-Sync' },
  { icon: BarChart3, color: 'emerald', title: 'Burn Rate & Days Left', desc: 'Calculates daily usage based on your weekly consumption rate and estimates exactly how many days remain.', badge: 'Smart Math' },
  { icon: Package, color: 'purple', title: 'Category Organization', desc: 'Organize groceries into Produce, Dairy, Meat, Bakery, Pantry, Beverages — with custom icons and colors.', badge: '6+ Categories' },
  { icon: Share2, color: 'rose', title: 'Shareable Lists', desc: 'Export & share your shopping list via WhatsApp, Notes, SMS, or native share — formatted beautifully.', badge: 'One Click' },
  { icon: Smartphone, color: 'cyan', title: 'Mobile Responsive', desc: 'Perfect on every screen — desktop, tablet, or mobile. Manage your kitchen from anywhere.', badge: 'All Devices' },
  { icon: Moon, color: 'indigo', title: 'Dark & Light Mode', desc: 'Switch between dark and light themes. Designed to be easy on your eyes at any time of day.', badge: 'Theme' },
  { icon: RefreshCw, color: 'orange', title: 'One-Click Restock', desc: 'Bulk restock checked shopping items instantly with a single click — with confetti celebrations!', badge: 'Instant' },
];

const WHY_CHOOSE = [
  { icon: TrendingDown, color: 'emerald', title: 'Zero Food Waste', desc: 'Track expiry & usage to eliminate waste and save money on groceries every week.' },
  { icon: Zap, color: 'amber', title: 'Save Time & Money', desc: 'Stop over-buying and under-buying. Know exactly what you need before you go shopping.' },
  { icon: Shield, color: 'blue', title: 'Admin-Managed Platform', desc: 'A secure, admin-controlled platform — your personal kitchen data is always safe and private.' },
  { icon: Users, color: 'purple', title: 'Family-Scale Management', desc: 'Designed for households of all sizes — from a single person to a family of 12+.' },
];

const TESTIMONIALS = [
  { name: 'Sarah J.', household: 'Family of 5', stars: 5, text: 'This app completely changed how we shop. No more wasted groceries and we save money every week!' },
  { name: 'Ahmed R.', household: 'Guesthouse Kitchen', stars: 5, text: 'Managing kitchen stock for guests was a nightmare. Now it\'s completely organized and automated.' },
  { name: 'Maria L.', household: 'Family of 3', stars: 5, text: 'The shopping list feature is genius. I just open it before leaving and buy exactly what\'s needed.' },
];

const colorMap = {
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  rose: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
};

const badgeColorMap = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300',
  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300',
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
  orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
};

export default function PublicShowcasePage() {
  const navigate = useNavigate();
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
      {/* NAVBAR */}
      <nav className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
              <ChefHat size={22} className="text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Smart Kitchen <span className="text-emerald-500">Inventory</span></span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#features" className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition-colors">Features</a>
            <a href="#why" className="hidden sm:block text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 text-sm font-medium transition-colors">Why Us</a>
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Sign In</button>
            <button onClick={() => setShowRegister(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors">
              Get Access
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-300 text-sm font-medium mb-8">
            <Zap size={14} />
            Powered by Supabase &amp; React
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Never Run Out of
            <span className="block bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              Kitchen Essentials
            </span>
          </h1>

          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Smart Kitchen Inventory automatically tracks your grocery stock, calculates burn rates,
            alerts you when items run low, and generates your weekly shopping list — all in one beautiful app.
          </p>

          {/* Status badges preview */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-full text-xs font-semibold">✅ Milk — In Stock (8 days left)</span>
            <span className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full text-xs font-semibold">⚠️ Eggs — Low Stock (2 days)</span>
            <span className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-full text-xs font-semibold">🚨 Bananas — Out of Stock</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 hover:scale-105">
              Sign In to Dashboard <ArrowRight size={20} />
            </button>
            <button onClick={() => setShowRegister(true)} className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl text-lg transition-all flex items-center justify-center gap-2 hover:scale-105">
              📋 Request an Account
            </button>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wide">Features</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">
              Everything You Need to Run a Smart Kitchen
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Built specifically for households who want to eliminate food waste, save money, and never run out of essentials again.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, color, title, desc, badge }) => (
              <div key={title} className="group p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${colorMap[color]}`}>
                    <Icon size={22} />
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeColorMap[color]}`}>{badge}</span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section id="why" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wide">Why Choose Us</span>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4">
              The Smart Choice for Your Household
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WHY_CHOOSE.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex gap-5 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                <div className={`flex-shrink-0 p-3 rounded-xl h-fit ${colorMap[color]}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">What Users Say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, household, stars, text }) => (
              <div key={name} className="p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(stars)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{name}</p>
                  <p className="text-gray-400 text-xs">{household}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-950 via-gray-900 to-emerald-950 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl w-fit mx-auto shadow-lg shadow-emerald-500/30">
            <ChefHat size={40} className="text-white" />
          </div>
          <h2 className="text-4xl font-extrabold">Ready to Stop Wasting Food?</h2>
          <p className="text-gray-300 text-lg">Request access today and start managing your kitchen like a pro.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => setShowRegister(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 hover:scale-105">
              📋 Request an Account <ArrowRight size={20} />
            </button>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl text-lg transition-all flex items-center justify-center gap-2 hover:scale-105">
              <MessageSquare size={20} />
              WhatsApp: {WHATSAPP_DISPLAY}
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 bg-gray-950 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
            <ChefHat size={16} className="text-white" />
          </div>
          <span className="text-gray-400 font-medium text-sm">Smart Kitchen Inventory</span>
        </div>
        <p className="text-gray-600 text-sm">
          &copy; 2024 &bull; Built with ❤️ &bull; Contact: <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-green-500 hover:text-green-400 transition-colors">{WHATSAPP_DISPLAY}</a>
        </p>
      </footer>

      {showRegister && <RegisterRequestModal onClose={() => setShowRegister(false)} />}
    </div>
  );
}
