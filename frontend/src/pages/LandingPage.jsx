import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, ShieldCheck, Clock, Building2, HelpCircle, Activity, QrCode } from 'lucide-react';

const LandingPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/dashboard?q=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/dashboard');
    }
  };

  const stats = [
    { label: 'Available Medicines', value: '15,000+' },
    { label: 'Partnered Pharmacies', value: '120+' },
    { label: 'Successful Reservations', value: '45,000+' },
    { label: 'Active Users', value: '10,000+' }
  ];

  const features = [
    {
      title: 'Smart Search Engine',
      description: 'Search medicine stocks and compositions instantly. Auto-complete and fuzzy matching help find the right medicine.',
      icon: Search,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Pharmacy Locator Map',
      description: 'Find pharmacies near your location on an interactive map. Compare distances, stock availability, and working hours.',
      icon: MapPin,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    },
    {
      title: 'Secure Online Reservations',
      description: 'Reserve medicines before visiting. Track status, get countdown timers, and pick up verified by secure QR codes.',
      icon: ShieldCheck,
      color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
    },
    {
      title: 'Real-time Stock Tracking',
      description: 'Live inventory updates from pharmacies. Know exactly how many units are left before you travel.',
      icon: Clock,
      color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    }
  ];

  const faqs = [
    { q: "How does the reservation system work?", a: "Once you search and find your medicine at a nearby pharmacy, you can choose the quantity and reserve it. Your stock will be secured instantly, and a QR code receipt will be generated. You have 24 hours to collect it at the pharmacy." },
    { q: "What happens if a medicine is out of stock?", a: "You can search for the same medicine at other nearby pharmacies. MedFinder shows real-time stock from all partner pharmacies so you can find the nearest available option quickly." },
    { q: "Is registration free for pharmacy owners?", a: "Yes, pharmacy registration and listing inventory are free. Owners get access to a full analytics dashboard, order tracking, and stock management system." }
  ];

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-20">
        {/* Decorative background blobs */}
        <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10"></div>
        <div className="absolute top-1/3 left-1/4 -z-10 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-500/10"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-600 dark:bg-indigo-500/5 dark:text-indigo-400">
              <Activity className="h-4 w-4" />
              Real-time stock locator
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white max-w-3xl mx-auto leading-none">
              Find Medicines Before Visiting a <span className="text-gradient">Pharmacy</span>
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Search medicine availability, reserve medicines instantly, and locate nearby pharmacies on an interactive map.
            </p>
          </motion.div>

          {/* Glassmorphic Search Box */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mx-auto max-w-2xl"
          >
            <form onSubmit={handleSearchSubmit} className="glass-panel p-2 rounded-2xl flex flex-col sm:flex-row gap-2 shadow-xl">
              <div className="flex-grow flex items-center px-3 gap-2">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 'Dolo 650', 'Paracetamol', 'Vitamins'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-3 focus:outline-none text-slate-800 dark:text-white placeholder-slate-400"
                />
              </div>
              <button
                type="submit"
                className="bg-indigo-600 text-white rounded-xl px-8 py-3.5 font-medium hover:bg-indigo-500 shadow-md shadow-indigo-600/10 transition-all flex items-center justify-center gap-1.5"
              >
                Search Stocks
              </button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/dashboard"
              className="px-6 py-3 rounded-xl border border-slate-200 bg-white/50 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Browse Catalog
            </Link>
            <Link
              to="/register?role=owner"
              className="px-6 py-3 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 shadow-md shadow-slate-900/10"
            >
              Register Pharmacy
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATISTICS COUNTER */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 shadow-md">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Everything You Need, in One Platform
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            A premium full-stack system designed to connect health customers with local pharmacies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What Users & Owners Say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { quote: "MedFinder saved me a trip to four different pharmacies last week. I could see that Crocin was available just 500m away, reserved it, and picked it up in 10 minutes.", author: "Arjun Mehta", role: "Customer" },
            { quote: "As a pharmacy owner, inventory management was a headache. MedFinder analytics helps me see what medicines are high in demand and handle reservations instantly.", author: "Dr. Rajesh Gowda", role: "Pharmacy Owner" },
            { quote: "When my regular blood pressure tablet was out of stock nearby, I found the same medicine at another pharmacy 1.2km away using MedFinder and reserved it instantly.", author: "Sarah Fernandes", role: "Customer" }
          ].map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-slate-600 dark:text-slate-300">"{t.quote}"</p>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {t.author[0]}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{t.author}</h4>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUSTED PHARMACIES */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Trusted Partner Pharmacy Networks</h3>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-65 grayscale dark:invert">
          <div className="flex items-center gap-1.5 text-lg font-bold text-slate-700"><Building2 className="h-5 w-5" /> Apollo Pharmacy</div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-slate-700"><Building2 className="h-5 w-5" /> MedPlus Care</div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-slate-700"><Building2 className="h-5 w-5" /> Aster Medics</div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-slate-700"><Building2 className="h-5 w-5" /> HealthKart</div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2"><HelpCircle className="h-8 w-8 text-indigo-600" /> FAQ</h2>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 shadow-sm space-y-2">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-start gap-2">
                <span className="text-indigo-600">Q:</span> {faq.q}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
