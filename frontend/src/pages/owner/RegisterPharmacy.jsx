import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building2, MapPin, ClipboardList, Phone, Clock, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPharmacy = () => {
  const { updatePharmacyState } = useAuth();
  const navigate = useNavigate();
  const [coords, setCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  // Get current location coords
  const handleGetLocation = () => {
    setLoadingCoords(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = [pos.coords.longitude, pos.coords.latitude]; // [lng, lat]
        setCoords(c);
        setValue('longitude', c[0]);
        setValue('latitude', c[1]);
        toast.success('Location coordinates loaded successfully.');
        setLoadingCoords(false);
      },
      (err) => {
        // Fallback Bangalore coordinates
        const c = [77.5946, 12.9716];
        setCoords(c);
        setValue('longitude', c[0]);
        setValue('latitude', c[1]);
        toast.warn('Location blocked. Populated Bangalore fallback coordinates.');
        setLoadingCoords(false);
      }
    );
  };

  const onSubmit = async (data) => {
    try {
      setLoadingSubmit(true);
      const payload = {
        pharmacyName: data.pharmacyName,
        licenseNumber: data.licenseNumber,
        address: data.address,
        phone: data.phone,
        workingHours: data.workingHours,
        coordinates: [Number(data.longitude), Number(data.latitude)] // [lng, lat]
      };

      const res = await api.post('/medicines/pharmacy', payload);
      
      // Update AuthContext state so Navbar / Dashboard displays it instantly!
      updatePharmacyState(res.data);
      
      toast.success('Pharmacy profile registered successfully!');
      navigate('/owner');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register pharmacy profile.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 pt-10 pb-20">
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="glass-panel w-full rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Register Pharmacy Listing</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure your store metadata and map locator coords
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
          
          {/* Pharmacy Name */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 uppercase tracking-wider block">Pharmacy Brand Name</label>
            <div className="relative flex items-center">
              <Building2 className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Apollo Pharmacy Indiranagar"
                {...register('pharmacyName', { required: 'Name is required' })}
                className="w-full rounded-xl border p-3 pl-10 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            {errors.pharmacyName && <p className="text-red-500">{errors.pharmacyName.message}</p>}
          </div>

          {/* License Number */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 uppercase tracking-wider block">License Certificate ID</label>
            <div className="relative flex items-center">
              <FileText className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="L-123456"
                {...register('licenseNumber', { required: 'License is required' })}
                className="w-full rounded-xl border p-3 pl-10 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
              />
            </div>
            {errors.licenseNumber && <p className="text-red-500">{errors.licenseNumber.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Phone */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase tracking-wider block">Contact Phone</label>
              <div className="relative flex items-center">
                <Phone className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="9876543210"
                  {...register('phone', { required: 'Phone is required' })}
                  className="w-full rounded-xl border p-3 pl-10 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
              {errors.phone && <p className="text-red-500">{errors.phone.message}</p>}
            </div>

            {/* Working Hours */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-500 uppercase tracking-wider block">Hours of Operation</label>
              <div className="relative flex items-center">
                <Clock className="absolute left-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="08:00 AM - 10:00 PM"
                  {...register('workingHours', { required: 'Hours is required' })}
                  className="w-full rounded-xl border p-3 pl-10 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
              {errors.workingHours && <p className="text-red-500">{errors.workingHours.message}</p>}
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 uppercase tracking-wider block">Physical Address</label>
            <textarea
              placeholder="100 Double Road, Indiranagar, Bangalore..."
              {...register('address', { required: 'Address is required' })}
              rows={2}
              className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
            />
            {errors.address && <p className="text-red-500">{errors.address.message}</p>}
          </div>

          {/* Coordinates Block */}
          <div className="space-y-2 border-t pt-4 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <label className="font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-4 w-4 text-indigo-600" /> Geolocation Coordinates
              </label>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={loadingCoords}
                className="text-[10px] font-bold bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 py-1.5 px-3 rounded-lg"
              >
                {loadingCoords ? 'Locating...' : 'Get Current Location'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Lng */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Longitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="77.5946"
                  {...register('longitude', { required: 'Longitude is required' })}
                  className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                />
              </div>

              {/* Lat */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-400 uppercase tracking-wider">Latitude</label>
                <input
                  type="number"
                  step="any"
                  placeholder="12.9716"
                  {...register('latitude', { required: 'Latitude is required' })}
                  className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900 dark:border-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center text-sm cursor-pointer"
          >
            {loadingSubmit ? 'Registering Store...' : 'Register Pharmacy Profile'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default RegisterPharmacy;
