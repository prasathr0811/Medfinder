import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const InventoryManager = () => {
  const { pharmacy } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // limit 2MB
        toast.error('Image size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Base64 data URL
        setValue('image', reader.result); // Save into form state
      };
      reader.readAsDataURL(file);
    }
  };

  // Categories list
  const categories = ['Analgesics', 'Antihistamines', 'Antibiotics', 'Antacids', 'Vitamins', 'Cardiovascular', 'First Aid', 'Ointments', 'Cough & Cold'];

  // Fetch all medicines (client-side filter for owner pharmacy)
  const { data: medicines = [], isLoading } = useQuery({
    queryKey: ['medicines-all'],
    queryFn: async () => {
      const { data } = await api.get('/medicines');
      return data;
    }
  });

  const myMedicines = medicines.filter(
    (m) => m.pharmacyId && m.pharmacyId._id === pharmacy?._id
  );

  // Add medicine mutation
  const addMutation = useMutation({
    mutationFn: async (newMed) => {
      const { data } = await api.post('/medicines', newMed);
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine added to inventory.');
      queryClient.invalidateQueries(['medicines-all']);
      setModalOpen(false);
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add medicine');
    }
  });

  // Edit medicine mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, updatedFields }) => {
      const { data } = await api.put(`/medicines/${id}`, updatedFields);
      return data;
    },
    onSuccess: () => {
      toast.success('Medicine updated successfully.');
      queryClient.invalidateQueries(['medicines-all']);
      setEditingMed(null);
      reset();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update medicine');
    }
  });

  // Delete medicine mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/medicines/${id}`);
    },
    onSuccess: () => {
      toast.success('Medicine deleted from inventory.');
      queryClient.invalidateQueries(['medicines-all']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete medicine');
    }
  });

  const onSubmit = (data) => {
    // Map empty image to fallback
    if (!data.image) {
      data.image = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=60&ixlib=rb-4.0.3';
    }
    
    // Parse numeric fields
    data.quantity = Number(data.quantity);
    data.price = Number(data.price);

    if (editingMed) {
      editMutation.mutate({ id: editingMed._id, updatedFields: data });
    } else {
      addMutation.mutate(data);
    }
  };

  const openEditModal = (med) => {
    setEditingMed(med);
    setValue('medicineName', med.medicineName);
    setValue('manufacturer', med.manufacturer);
    setValue('category', med.category);
    setValue('composition', med.composition);
    setValue('strength', med.strength);
    setValue('description', med.description);
    setValue('quantity', med.quantity);
    setValue('price', med.price);
    setValue('image', med.image);
    setImagePreview(med.image || '');
    setModalOpen(true);
  };

  const openAddModal = () => {
    setEditingMed(null);
    reset();
    setImagePreview('');
    setModalOpen(true);
  };

  const getStockIndicator = (quantity) => {
    if (quantity === 0) return 'text-red-500 font-bold border border-red-500/20 bg-red-500/5 px-2.5 py-1 rounded-full text-[10px] uppercase';
    if (quantity <= 10) return 'text-amber-500 font-bold border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 rounded-full text-[10px] uppercase';
    return 'text-emerald-500 font-bold border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 rounded-full text-[10px] uppercase';
  };

  if (!pharmacy) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center space-y-4 pt-20">
        <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-950/30 text-red-500 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold">No Pharmacy Registered</h2>
        <p className="text-sm text-slate-500">
          You must register a pharmacy listing profile before you can manage your medicine inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inventory Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, update, and manage your medicine listings for {pharmacy.pharmacyName}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      {/* Inventory Table */}
      {isLoading ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : myMedicines.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-4 border border-slate-200/50">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Inventory is empty</h3>
            <p className="text-sm text-slate-500 mt-1">Get started by listing your first medicine stock item.</p>
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/50 border-b dark:bg-slate-900/50 dark:border-slate-800 text-slate-400">
                  <th className="p-4 font-semibold">Medicine</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Composition</th>
                  <th className="p-4 font-semibold">Strength</th>
                  <th className="p-4 font-semibold">Stock status</th>
                  <th className="p-4 font-semibold">Price</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {myMedicines.map((med) => (
                  <tr key={med._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={med.image}
                          alt={med.medicineName}
                          className="h-10 w-10 object-cover rounded-lg bg-slate-100 dark:bg-slate-800"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{med.medicineName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{med.manufacturer}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium">{med.category}</td>
                    <td className="p-4 text-slate-500 max-w-[150px] truncate">{med.composition}</td>
                    <td className="p-4 text-slate-500 font-medium">{med.strength}</td>
                    <td className="p-4">
                      <span className={getStockIndicator(med.quantity)}>
                        {med.quantity === 0 ? 'Out of Stock' : `${med.quantity} left`}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800 dark:text-white">Rs. {med.price.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(med)}
                          className="p-2 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this medicine from inventory permanently?')) {
                              deleteMutation.mutate(med._id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="p-2 border border-red-200/50 rounded-xl hover:bg-red-500/5 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-lg rounded-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 relative border border-white/20"
            >
              
              {/* Close Icon */}
              <button
                onClick={() => setModalOpen(false)}
                className="absolute right-4 top-4 p-1.5 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {editingMed ? 'Edit Inventory Item' : 'List New Medicine'}
                </h2>
                <p className="text-xs text-slate-400">Specify precise medicine chemical details and inventory quantities</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Brand name */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Medicine Name</label>
                    <input
                      type="text"
                      placeholder="Dolo 650"
                      {...register('medicineName', { required: 'Name is required' })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                    />
                    {errors.medicineName && <p className="text-red-500">{errors.medicineName.message}</p>}
                  </div>

                  {/* Manufacturer */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Manufacturer</label>
                    <input
                      type="text"
                      placeholder="Micro Labs Ltd"
                      {...register('manufacturer', { required: 'Manufacturer is required' })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                    />
                    {errors.manufacturer && <p className="text-red-500">{errors.manufacturer.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900 font-semibold"
                    >
                      {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  {/* Strength */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Strength</label>
                    <input
                      type="text"
                      placeholder="650mg"
                      {...register('strength', { required: 'Strength is required' })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                    />
                    {errors.strength && <p className="text-red-500">{errors.strength.message}</p>}
                  </div>
                </div>

                {/* Composition */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">Composition (Active Ingredients)</label>
                  <input
                    type="text"
                    placeholder="Paracetamol IP 650mg"
                    {...register('composition', { required: 'Composition is required' })}
                    className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                  />
                  {errors.composition && <p className="text-red-500">{errors.composition.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    placeholder="Brief description of usage..."
                    {...register('description')}
                    rows={2}
                    className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Quantity */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Stock Quantity</label>
                    <input
                      type="number"
                      placeholder="100"
                      {...register('quantity', { 
                        required: 'Quantity is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                    />
                    {errors.quantity && <p className="text-red-500">{errors.quantity.message}</p>}
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-500 uppercase tracking-wider">Price per Unit (Rs.)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="35.00"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0, message: 'Cannot be negative' }
                      })}
                      className="w-full rounded-xl border p-3 focus:outline-none dark:bg-slate-900"
                    />
                    {errors.price && <p className="text-red-500">{errors.price.message}</p>}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-500 uppercase tracking-wider">Medicine Image</label>
                  <div className="flex items-center gap-4 pt-1">
                    {imagePreview ? (
                      <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => { setImagePreview(''); setValue('image', ''); }}
                          className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity font-bold text-[10px]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="h-16 w-16 shrink-0 rounded-xl bg-slate-100 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 font-semibold">
                        No Image
                      </div>
                    )}
                    <label className="flex-1 flex flex-col items-center justify-center p-3 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors font-medium">
                      <span className="font-semibold text-indigo-600 hover:text-indigo-500">Upload Image File</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG up to 2MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input type="hidden" {...register('image')} />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={addMutation.isPending || editMutation.isPending}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center text-sm"
                >
                  {editingMed ? 'Save Changes' : 'List Stock Item'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InventoryManager;
