import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Building2, Package, CalendarDays, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const { data: analytics = null, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/admin');
      return data;
    }
  });

  const COLORS = ['#3b82f6', '#4f46e5', '#10b981', '#cbd5e1', '#ef4444', '#f59e0b'];

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  const { summary = {}, reservationPie = [], userGrowth = [], categoryDistribution = [] } = analytics || {};

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Platform Operations</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Supervise user registrations, store compliance, and global booking metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Users */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Active Users</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalUsers || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Total Stores */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pharmacies</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalPharmacies || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* Total Catalog */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listed Medicines</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalMedicines || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* Total Bookings */}
        <div className="glass-card rounded-2xl p-6 shadow-sm border border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Reservations</p>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{summary.totalReservations || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* User Growth */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm lg:col-span-2 space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">User Registration Growth</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={userGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reservation Status Pie */}
        <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Reservation Status Share</h3>
          <div className="h-80 w-full flex flex-col justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reservationPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {reservationPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Catalog Category distribution */}
      <div className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">Listed Medicines Distribution (Top Categories)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryDistribution}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
