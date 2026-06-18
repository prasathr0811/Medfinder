import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, LogOut, LayoutDashboard, Search, FileText, Settings, HeartPulse } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const navLinks = {
    customer: [
      { name: 'Search Medicines', path: '/dashboard', icon: Search },
      { name: 'My Reservations', path: '/reservations', icon: FileText }
    ],
    owner: [
      { name: 'Dashboard', path: '/owner', icon: LayoutDashboard },
      { name: 'Inventory', path: '/owner/inventory', icon: Settings },
      { name: 'Reservations', path: '/owner/reservations', icon: FileText }
    ],
    admin: [
      { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
      { name: 'Users', path: '/admin/users', icon: Settings },
      { name: 'Pharmacies', path: '/admin/pharmacies', icon: FileText }
    ]
  };

  const currentLinks = user ? navLinks[user.role] : [];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
      <div className="glass-panel flex items-center justify-between rounded-2xl px-6 py-3 shadow-lg transition-all duration-300">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
            Med<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden items-center gap-6 md:flex">
          {currentLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                <Icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-4 md:flex">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 rounded-full">
                {user.role}
              </span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white/50 text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="glass-panel mt-2 rounded-2xl p-4 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-3">
              {currentLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-indigo-500/10 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-indigo-500/10"
                  >
                    <Icon className="h-4 w-4" />
                    {link.name}
                  </Link>
                );
              })}

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-1" />

              {user ? (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="px-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1 rounded-full">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-medium text-white dark:bg-white dark:text-slate-900"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3 text-sm font-medium text-white hover:bg-indigo-500"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
