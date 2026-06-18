import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Search, CheckCircle, Ban, CheckSquare, RefreshCw, Clipboard, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationsManager = () => {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchVal, setSearchVal] = useState('');

  // Fetch reservations for pharmacy
  const { data: reservations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['pharmacy-reservations'],
    queryFn: async () => {
      const { data } = await api.get('/reservations/pharmacy');
      return data;
    }
  });

  // Update reservation status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await api.patch(`/reservations/${id}/status`, { status });
      return data;
    },
    onSuccess: (data, variables) => {
      toast.success(`Reservation status updated to ${variables.status}.`);
      queryClient.invalidateQueries(['pharmacy-reservations']);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update reservation status.');
    }
  });

  // Status mappings
  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'confirmed': return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
      case 'ready': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'collected': return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'expired': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-600';
    }
  };

  // Filter & Search logic
  const filteredReservations = reservations.filter((resv) => {
    // 1. Filter status
    if (filterStatus !== 'all' && resv.status !== filterStatus) return false;
    
    // 2. Search filter (ID, Customer Name, Medicine Name)
    if (searchVal.trim()) {
      const term = searchVal.toLowerCase();
      return (
        resv._id.toLowerCase().includes(term) ||
        (resv.userId?.name || '').toLowerCase().includes(term) ||
        (resv.medicineId?.medicineName || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Customer Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Confirm bookings, prepare packs, and verify pickup vouchers
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-300 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        
        {/* Search by Reservation Code */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Reservation ID, Customer, Medicine..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0">
          {['all', 'pending', 'confirmed', 'ready', 'collected', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all capitalize ${
                filterStatus === status
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white border text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
              }`}
            >
              {status === 'ready' ? 'Ready for Pickup' : status}
            </button>
          ))}
        </div>

      </div>

      {/* Reservations Listings */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />)}
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-3 border">
          <Clipboard className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-slate-800 dark:text-white">No bookings found</h3>
          <p className="text-xs text-slate-500">No reservations matches current search or filter filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReservations.map((resv) => (
            <motion.div
              key={resv._id}
              layout
              className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Left Column: Medicine & Booking Info */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-indigo-600 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-lg uppercase">
                    ID: {resv._id.slice(-8).toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${getStatusStyle(resv.status)}`}>
                    {resv.status}
                  </span>
                </div>
                
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                  {resv.medicineId?.medicineName} <span className="text-xs font-semibold text-slate-400">({resv.medicineId?.strength})</span>
                </h3>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">Qty: {resv.quantity} units</span>
                  <span>Price: Rs. {(resv.quantity * (resv.medicineId?.price || 0)).toFixed(2)}</span>
                  <span>Date: {new Date(resv.reservationDate).toLocaleString()}</span>
                </div>
              </div>

              {/* Middle Column: Customer details */}
              <div className="text-xs space-y-1">
                <p className="font-semibold text-slate-400 uppercase tracking-wider text-[9px]">Reserved By</p>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <User className="h-4.5 w-4.5 text-indigo-500" />
                  <div>
                    <p className="font-bold">{resv.userId?.name}</p>
                    <p className="text-[10px] text-slate-400">{resv.userId?.email}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: State actions */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                {resv.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: resv._id, status: 'confirmed' })}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-4 rounded-xl shadow cursor-pointer"
                    >
                      <CheckCircle className="h-4 w-4" /> Confirm
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: resv._id, status: 'cancelled' })}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs font-bold border border-red-200 hover:bg-red-500/5 text-red-500 py-2.5 px-4 rounded-xl cursor-pointer"
                    >
                      <Ban className="h-4 w-4" /> Reject
                    </button>
                  </>
                )}

                {resv.status === 'confirmed' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: resv._id, status: 'ready' })}
                    className="w-full md:w-auto flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 px-5 rounded-xl shadow cursor-pointer"
                  >
                    Mark Ready for Pickup <ArrowRight className="h-4 w-4" />
                  </button>
                )}

                {resv.status === 'ready' && (
                  <>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: resv._id, status: 'collected' })}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl shadow cursor-pointer"
                    >
                      <CheckSquare className="h-4 w-4" /> Collected (Verify QR)
                    </button>
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: resv._id, status: 'cancelled' })}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1.5 text-xs font-bold border border-red-200 hover:bg-red-500/5 text-red-500 py-2.5 px-4 rounded-xl cursor-pointer"
                    >
                      <Ban className="h-4 w-4" /> Cancel Booking
                    </button>
                  </>
                )}

                {['collected', 'cancelled', 'expired'].includes(resv.status) && (
                  <span className="text-xs text-slate-400 italic font-medium py-2 px-3">
                    No action needed
                  </span>
                )}
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ReservationsManager;
