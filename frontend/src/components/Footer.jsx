import React from 'react';
import { HeartPulse } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow">
                <HeartPulse className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">
                Med<span className="text-indigo-600 dark:text-indigo-400">Finder</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Locate, verify, and reserve medications in real-time. Powering local pharmacy networks with intelligent search and real-time stock tracking.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase">Product</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/dashboard" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">Search Engine</a></li>
              <li><a href="/dashboard" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">Locator Map</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-slate-900 dark:text-white uppercase">For Owners</h3>
            <ul className="mt-4 space-y-2">
              <li><a href="/register?role=owner" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">Register Pharmacy</a></li>
              <li><a href="/login" className="text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400">Owner Portal</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-200 pt-8 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">&copy; {new Date().getFullYear()} MedFinder SaaS Platform. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-400 hover:text-indigo-500">Privacy Policy</a>
            <a href="#" className="text-xs text-slate-400 hover:text-indigo-500">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
