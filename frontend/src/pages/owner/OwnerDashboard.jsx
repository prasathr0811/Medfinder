import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { ShieldAlert, Package, CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react';

const OwnerDashboard = () => {
  // Fetch analytics
  const { data: analytics = null, isLoading } = useQuery({
    queryKey: ['owner-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/owner');
      return data;
    }
  });

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const { summary = {}, reservationTrends = [], inventoryTrends = [], medicineDemand = [], lowStockList = [] } = analytics || {};

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Pharmacy Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track sales demand, stock levels, and active bookings in real-time
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Meds */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Medicines</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalMedicines || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reservations</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalReservations || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Active Bookings */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Bookings</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.activeReservations || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <CheckSquare className="h-6 w-6" />
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock Warnings</p>
            <p className="text-3xl font-extrabold text-red-500">{summary.lowStockMedicines || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Reservation trends (7 days) */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Reservation Volume (Last 7 Days)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={reservationTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="reservations" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category distribution */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Stock Levels by Category</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Bar dataKey="stock" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Demand Medicines */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider font-semibold">Medicine Booking Demand</h3>
          {medicineDemand.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-10">No booking statistics yet.</p>
          ) : (
            <div className="h-72 w-full flex flex-col justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={medicineDemand}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {medicineDemand.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-4 w-4 text-red-500" /> Low Stock Inventory Items
          </h3>
          {lowStockList.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-10">All stock items are healthy (&gt;10 units).</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b dark:border-slate-800 text-slate-400">
                    <th className="py-2.5 font-semibold">Medicine Name</th>
                    <th className="py-2.5 font-semibold">Composition</th>
                    <th className="py-2.5 font-semibold">Category</th>
                    <th className="py-2.5 font-semibold text-right">Stock Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-slate-800">
                  {lowStockList.map((med) => (
                    <tr key={med._id}>
                      <td className="py-2.5 font-semibold text-slate-800 dark:text-white">{med.medicineName}</td>
                      <td className="py-2.5 text-slate-500">{med.composition}</td>
                      <td className="py-2.5 text-slate-500">{med.category}</td>
                      <td className={`py-2.5 text-right font-bold ${med.quantity === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                        {med.quantity} units
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;
