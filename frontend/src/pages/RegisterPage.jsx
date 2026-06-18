import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, HeartPulse, ShieldAlert } from 'lucide-react';

const RegisterPage = () => {
  const { register: signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') || 'customer';

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      role: defaultRole
    }
  });

  useEffect(() => {
    if (defaultRole) {
      setValue('role', defaultRole);
    }
  }, [defaultRole, setValue]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await signup(data.name, data.email, data.password, data.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 pt-10">
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Your Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join MedFinder to search and reserve medicines
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                {...register('name', { required: 'Name is required' })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
            {errors.name && <p className="text-xs font-medium text-red-500">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="john@example.com"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Please write a valid email' }
                })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
            {errors.email && <p className="text-xs font-medium text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
              />
            </div>
            {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
          </div>

          {/* Role Choice */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-1">I want to...</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="relative flex flex-col items-center justify-center border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <input
                  type="radio"
                  value="customer"
                  {...register('role')}
                  className="absolute right-2.5 top-2.5 text-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">Search Meds</span>
                <span className="text-[10px] text-slate-400 text-center">Reserve & locate</span>
              </label>

              <label className="relative flex flex-col items-center justify-center border border-slate-200 rounded-xl p-3 cursor-pointer hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
                <input
                  type="radio"
                  value="owner"
                  {...register('role')}
                  className="absolute right-2.5 top-2.5 text-indigo-600"
                />
                <span className="text-sm font-semibold text-slate-800 dark:text-white">List Pharmacy</span>
                <span className="text-[10px] text-slate-400 text-center">Manage stocks</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
