import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Calendar, Building2, Eye, Download, Ban, AlertCircle, RefreshCw, Clock, QrCode, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ReservationTracker = () => {
  const queryClient = useQueryClient();
  const [activeQrRes, setActiveQrRes] = useState(null);

  // Fetch reservations
  const { data: reservations = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['customer-reservations'],
    queryFn: async () => {
      const { data } = await api.get('/reservations/customer');
      return data;
    }
  });

  // Cancel reservation mutation
  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/reservations/${id}/status`, { status: 'cancelled' });
      return data;
    },
    onSuccess: () => {
      toast.success('Reservation cancelled successfully.');
      queryClient.invalidateQueries(['customer-reservations']);
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to cancel reservation.';
      toast.error(msg);
    }
  });

  // Status visual mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return { text: 'Pending Approval', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'confirmed':
        return { text: 'Confirmed', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      case 'ready':
        return { text: 'Ready for Pickup', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'collected':
        return { text: 'Collected', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
      case 'cancelled':
        return { text: 'Cancelled', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
      case 'expired':
        return { text: 'Expired', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      default:
        return { text: status, color: 'bg-slate-500/10 text-slate-600' };
    }
  };

  // Live Expiry Timer component
  const ExpiryTimer = ({ expiresAt, status }) => {
    const calculateTimeLeft = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) return 'Expired';
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
      if (timeLeft === 'Expired' || !['pending', 'confirmed', 'ready'].includes(status)) return;
      const interval = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
      return () => clearInterval(interval);
    }, [expiresAt, status]);

    if (!['pending', 'confirmed', 'ready'].includes(status)) return null;

    return (
      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20 bg-amber-500/5 px-2 py-0.5 rounded-lg">
        <Clock className="h-3 w-3 animate-spin" /> Expiry: {timeLeft}
      </span>
    );
  };

  // Trigger PDF download from server directly
  const handleDownloadReceipt = (id) => {
    const token = localStorage.getItem('medfinder_token');
    // We fetch using axios to handle error and headers, then convert response to blob and trigger download!
    api.get(`/reservations/${id}/receipt`, { responseType: 'blob' })
      .then((response) => {
        const file = new Blob([response.data], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(file);
        const pdfLink = document.createElement('a');
        pdfLink.href = fileURL;
        pdfLink.setAttribute('download', `MedFinder-Receipt-${id}.pdf`);
        document.body.appendChild(pdfLink);
        pdfLink.click();
        document.body.removeChild(pdfLink);
        toast.success('Receipt download started.');
      })
      .catch((error) => {
        console.error('Download Receipt error:', error);
        toast.error('Could not download receipt.');
      });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Header Info */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Reservation Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track, cancel, and verify your medicine reserves instantly
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-4 max-w-lg mx-auto border border-slate-200/50">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">No active reservations</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              You haven't made any medicine reservations yet. Search and reserve medicines nearby!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {reservations.map((resv) => {
            const badge = getStatusBadge(resv.status);
            const canCancel = ['pending', 'confirmed'].includes(resv.status);
            
            return (
              <motion.div
                key={resv._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                {/* Medicine & Pharmacy Details */}
                <div className="flex gap-4">
                  <img
                    src={resv.medicineId?.image}
                    alt={resv.medicineId?.medicineName}
                    className="h-16 w-16 object-cover rounded-xl bg-slate-100 dark:bg-slate-800 hidden sm:block"
                  />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">{resv.medicineId?.medicineName || 'Unknown Medicine'}</h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded border bg-slate-100 dark:bg-slate-800">
                        {resv.medicineId?.strength}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.text}
                      </span>
                      <ExpiryTimer expiresAt={resv.expiresAt} status={resv.status} />
                    </div>
                    
                    <p className="text-xs text-slate-400 font-medium">Qty: <span className="text-slate-800 dark:text-slate-200 font-bold">{resv.quantity}</span> • Total: Rs. <span className="text-slate-800 dark:text-slate-200 font-bold">{(resv.quantity * (resv.medicineId?.price || 0)).toFixed(2)}</span></p>
                    
                    <div className="flex flex-wrap gap-4 text-xs pt-1 text-slate-500">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-indigo-500" /> {resv.pharmacyId?.pharmacyName}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-indigo-500" /> {new Date(resv.reservationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0">
                  
                  {/* QR Code Trigger */}
                  {['pending', 'confirmed', 'ready'].includes(resv.status) && (
                    <button
                      onClick={() => setActiveQrRes(resv)}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 text-xs font-bold border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-300 transition-all"
                    >
                      <QrCode className="h-4 w-4 text-indigo-600" /> View QR
                    </button>
                  )}

                  {/* PDF Receipt */}
                  <button
                    onClick={() => handleDownloadReceipt(resv._id)}
                    className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 text-xs font-bold border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 py-2.5 px-4 rounded-xl text-slate-700 dark:text-slate-300 transition-all"
                  >
                    <Download className="h-4 w-4 text-indigo-600" /> Receipt
                  </button>

                  {/* Cancel Button */}
                  {canCancel && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to cancel this reservation?')) {
                          cancelMutation.mutate(resv._id);
                        }
                      }}
                      disabled={cancelMutation.isPending}
                      className="flex-grow md:flex-grow-0 flex items-center justify-center gap-1 text-xs font-bold border border-red-200 bg-red-500/5 hover:bg-red-500/10 py-2.5 px-4 rounded-xl text-red-600 dark:border-red-900 dark:hover:bg-red-950 transition-all"
                    >
                      <Ban className="h-4 w-4" /> Cancel
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      )}

      {/* QR CODE DISPLAY MODAL */}
      <AnimatePresence>
        {activeQrRes && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center space-y-4 relative border border-white/20"
            >
              <button
                onClick={() => setActiveQrRes(null)}
                className="absolute right-4 top-4 p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-1 pt-4">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Verification QR Code</h3>
                <p className="text-xs text-slate-400">Present at the counter for pickup verification</p>
              </div>

              {/* QR Image */}
              <div className="border-4 border-indigo-600/25 p-2 rounded-2xl bg-white">
                <img
                  src={activeQrRes.qrCode}
                  alt="Pickup QR Code"
                  className="h-48 w-48 object-contain"
                />
              </div>

              {/* Receipt short details */}
              <div className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl w-full text-left space-y-1.5 border">
                <p><strong>Medicine:</strong> {activeQrRes.medicineId?.medicineName} ({activeQrRes.quantity} units)</p>
                <p><strong>Pharmacy:</strong> {activeQrRes.pharmacyId?.pharmacyName}</p>
                <p><strong>Expiry Date:</strong> {new Date(activeQrRes.expiresAt).toLocaleString()}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ReservationTracker;
