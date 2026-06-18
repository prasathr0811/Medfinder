import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Layers, X, Building, Phone, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MedicineSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const availableOnly = searchParams.get('availableOnly') || 'false';
  const sort = searchParams.get('sort') || 'nearest';

  const [coords, setCoords] = useState(null);
  const [selectedMed, setSelectedMed] = useState(null);
  const [reserveQty, setReserveQty] = useState(1);
  const [reservationResult, setReservationResult] = useState(null); // holds the created reservation

  const categories = ['All', 'Analgesics', 'Antihistamines', 'Antibiotics', 'Antacids', 'Vitamins', 'Cardiovascular', 'First Aid', 'Ointments', 'Cough & Cold'];

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        // Distance check from Chennai Central (13.0827, 80.2707) in degrees
        const diffLat = lat - 13.0827;
        const diffLng = lng - 80.2707;
        const degDist = Math.sqrt(diffLat * diffLat + diffLng * diffLng);
        
        // If user is far from Chennai Central (> 1 degree, ~110 km), fallback to Chennai Central
        if (degDist > 1.0) {
          setCoords({ lat: 13.0827, lng: 80.2707 });
        } else {
          setCoords({ lat, lng });
        }
      },
      () => setCoords({ lat: 13.0827, lng: 80.2707 }) // Chennai central fallback
    );
  }, []);

  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines', q, category, availableOnly, sort, coords],
    queryFn: async () => {
      const params = {};
      if (q) params.q = q;
      if (category && category !== 'All') params.category = category;
      if (availableOnly === 'true') params.availableOnly = 'true';
      if (sort) params.sort = sort;
      if (coords) { params.lat = coords.lat; params.lng = coords.lng; }
      const { data } = await api.get('/medicines', { params });
      return data;
    },
    enabled: !!coords
  });

  const reservationMutation = useMutation({
    mutationFn: async ({ medicineId, quantity }) => {
      const { data } = await api.post('/reservations', { medicineId, quantity });
      return data;
    },
    onSuccess: (data) => {
      toast.success('✅ Medicine reserved successfully!');
      queryClient.invalidateQueries(['medicines']);
      setReservationResult(data); // show success screen inside modal
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to reserve medicine.';
      toast.error(msg);
    }
  });

  const handleSearchChange = (val) => {
    setSearchParams(prev => {
      if (val) prev.set('q', val); else prev.delete('q');
      return prev;
    });
  };

  const handleCategorySelect = (cat) => {
    setSearchParams(prev => {
      if (cat && cat !== 'All') prev.set('category', cat); else prev.delete('category');
      return prev;
    });
  };

  const closeModal = () => {
    setSelectedMed(null);
    setReservationResult(null);
    setReserveQty(1);
  };

  const toggleAvailableOnly = () => {
    setSearchParams(prev => {
      const current = prev.get('availableOnly') === 'true';
      prev.set('availableOnly', current ? 'false' : 'true');
      return prev;
    });
  };

  const handleSortChange = (e) => {
    setSearchParams(prev => { prev.set('sort', e.target.value); return prev; });
  };

  const handleReserveSubmit = (e) => {
    e.preventDefault();
    if (!selectedMed) return;
    reservationMutation.mutate({ medicineId: selectedMed._id, quantity: reserveQty });
  };

  const getStockStatus = (quantity) => {
    const qty = Number(quantity) || 0;
    if (qty === 0) return { text: 'Out of Stock', color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    if (qty <= 10) return { text: 'Low Stock', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    return { text: 'In Stock', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  };

  const formatDistance = (med) => {
    if (!med || med.distance == null) return '';
    const distNum = Number(med.distance);
    
    // Check pharmacy name to map specific local mock distances
    const pharmacyName = med.pharmacyId?.pharmacyName || '';
    
    // If distance is very large (e.g. > 100km), map to local mock distances requested by user
    if (distNum > 100) {
      if (pharmacyName.includes('Adyar')) return '50 m';
      if (pharmacyName.includes('T.Nagar')) return '100 m';
      if (pharmacyName.includes('Tambaram')) return '10 m';
      if (pharmacyName.includes('Anna Nagar')) return '20 m';
      if (pharmacyName.includes('Velachery')) return '200 m';
      if (pharmacyName.includes('Porur')) return '35 m';
      if (pharmacyName.includes('Perungudi')) return '150 m';
      if (pharmacyName.includes('Mylapore')) return '80 m';
      if (pharmacyName.includes('Chromepet')) return '300 m';
      if (pharmacyName.includes('Guindy')) return '450 m';
      return '500 m';
    }
    
    if (distNum < 1) {
      return `${Math.round(distNum * 1000)} m`;
    }
    return `${distNum.toFixed(1)} km`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Medicine Stock Locator</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time stocks mapped near you {coords ? `(${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})` : '(locating...)'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 cursor-pointer border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium">
            <input type="checkbox" checked={availableOnly === 'true'} onChange={toggleAvailableOnly} className="text-indigo-600 rounded" />
            Available Only
          </label>
          <select value={sort} onChange={handleSortChange} className="border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-4 py-2.5 rounded-xl text-sm font-medium focus:outline-none">
            <option value="nearest">Nearest Pharmacy</option>
            <option value="cheapest">Cheapest Price</option>
            <option value="stock">Highest Stock</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-5 rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50">
            <h3 className="font-semibold text-slate-950 dark:text-white mb-3 flex items-center gap-1.5 text-sm uppercase tracking-wider">
              <Layers className="h-4 w-4 text-indigo-500" /> Categories
            </h3>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategorySelect(cat)}
                  className={`text-left text-sm px-3 py-2 rounded-xl transition-all font-medium ${
                    (category === cat || (cat === 'All' && !category))
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search medicine name, composition, manufacturer..."
              value={q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full rounded-2xl border border-slate-200/80 bg-white py-4 pl-12 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {(isLoading || !coords) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center space-y-3">
              <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">No medicines found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {medicines.map((med) => {
                const stock = getStockStatus(med.quantity);
                return (
                  <motion.div
                    key={med._id}
                    layout
                    whileHover={{ y: -4 }}
                    className="glass-card rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-sm flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <img
                        src={med.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60'}
                        alt={med.medicineName}
                        className="h-36 w-full object-cover rounded-xl bg-slate-100 dark:bg-slate-800"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60'; }}
                      />
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{med.medicineName}</h3>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-slate-100 dark:bg-slate-800 whitespace-nowrap">{med.strength}</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">{med.manufacturer}</p>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className={`px-2 py-0.5 rounded-md border font-semibold ${stock.color}`}>
                          {stock.text} ({med.quantity})
                        </span>
                        {med.distance != null && (
                          <span className="text-slate-500 font-medium flex items-center gap-0.5">
                            <MapPin className="h-3 w-3 text-indigo-500" /> {formatDistance(med)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg line-clamp-1">
                        {med.composition}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4 flex items-center justify-between">
                      <p className="font-extrabold text-slate-900 dark:text-white text-lg">
                        Rs. {med.price != null ? Number(med.price).toFixed(2) : '—'}
                      </p>
                      <button
                        onClick={() => { setSelectedMed(med); setReserveQty(1); }}
                        disabled={Number(med.quantity) === 0}
                        className="text-xs font-bold bg-indigo-600 text-white px-3.5 py-2 rounded-lg hover:bg-indigo-500 transition-all shadow shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {Number(med.quantity) === 0 ? 'Out of Stock' : 'Reserve Now'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RESERVE MODAL */}
      <AnimatePresence>
        {selectedMed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-5 relative border border-white/20"
            >
              {/* Close */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              {/* SUCCESS SCREEN */}
              {reservationResult ? (
                <div className="flex flex-col items-center text-center space-y-5 py-6">
                  <div className="h-20 w-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reserved Successfully!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your medicine has been reserved at the pharmacy.</p>
                  </div>

                  <div className="w-full bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 space-y-2 text-sm text-left border border-slate-100 dark:border-slate-900">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Medicine</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedMed.medicineName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pharmacy</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{selectedMed.pharmacyId?.pharmacyName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Quantity</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{reserveQty} unit(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total</span>
                      <span className="font-bold text-indigo-600">Rs. {(reserveQty * Number(selectedMed.price || 0)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className="font-semibold text-amber-600 capitalize">{reservationResult.status || 'pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Expires in</span>
                      <span className="font-semibold text-red-500">24 hours</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
                    <button
                      onClick={closeModal}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => { closeModal(); navigate('/reservations'); }}
                      className="flex-1 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      View My Reservations →
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Medicine Image + Title */}
                  <div className="flex gap-4 pt-1">
                    <img
                      src={selectedMed.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60'}
                      alt={selectedMed.medicineName}
                      className="h-24 w-24 object-cover rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60'; }}
                    />
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedMed.medicineName}</h2>
                      <p className="text-sm text-slate-400">{selectedMed.manufacturer}</p>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/5 text-indigo-600 border border-indigo-500/10 inline-block">
                        {selectedMed.category}
                      </span>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        Rs. {selectedMed.price != null ? Number(selectedMed.price).toFixed(2) : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Medicine Details */}
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100 dark:border-slate-900">
                    <p><strong>Composition:</strong> {selectedMed.composition}</p>
                    <p><strong>Strength:</strong> {selectedMed.strength}</p>
                    {selectedMed.description && <p className="line-clamp-2"><strong>Description:</strong> {selectedMed.description}</p>}
                  </div>

                  {/* Pharmacy Info */}
                  {selectedMed.pharmacyId && (
                    <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 space-y-1.5">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-indigo-500" />
                        {selectedMed.pharmacyId?.pharmacyName || 'Unknown Pharmacy'}
                      </h3>
                      <p className="text-xs text-slate-500">{selectedMed.pharmacyId?.address}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-1">
                        {selectedMed.pharmacyId?.phone && (
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedMed.pharmacyId.phone}</span>
                        )}
                        {selectedMed.pharmacyId?.workingHours && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{selectedMed.pharmacyId.workingHours}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stock Badge */}
                  <div className="flex items-center justify-between text-sm">
                    <span className={`px-3 py-1 rounded-lg font-semibold border text-xs ${getStockStatus(selectedMed.quantity).color}`}>
                      {getStockStatus(selectedMed.quantity).text} — {selectedMed.quantity} units left
                    </span>
                    {selectedMed.distance != null && (
                      <span className="text-slate-500 text-xs flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" /> {formatDistance(selectedMed)} away
                      </span>
                    )}
                  </div>

                  {/* Reserve Form */}
                  {Number(selectedMed.quantity) > 0 ? (
                    <form onSubmit={handleReserveSubmit} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-4">
                        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 w-20">Quantity</label>
                        <select
                          value={reserveQty}
                          onChange={(e) => setReserveQty(Number(e.target.value))}
                          className="border rounded-xl px-3 py-2 text-sm font-semibold dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        >
                          {[...Array(Math.min(10, Number(selectedMed.quantity))).keys()].map((n) => (
                            <option key={n + 1} value={n + 1}>{n + 1}</option>
                          ))}
                        </select>
                        <span className="text-sm font-bold text-indigo-600">
                          Total: Rs. {(reserveQty * Number(selectedMed.price || 0)).toFixed(2)}
                        </span>
                      </div>

                      <button
                        type="submit"
                        disabled={reservationMutation.isPending}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                      >
                        {reservationMutation.isPending ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Reserving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-5 w-5" />
                            Confirm Reservation
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <div className="pt-4 border-t text-sm font-semibold text-red-500 text-center py-3">
                      This medicine is currently out of stock at this pharmacy.
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicineSearch;
