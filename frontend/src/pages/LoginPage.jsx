import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, HeartPulse } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-10">
      <div className="absolute top-1/4 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl"></div>

      <div className="glass-panel w-full max-w-md rounded-3xl p-8 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
            <HeartPulse className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Sign In to MedFinder</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Find and reserve your medicines instantly
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                placeholder="name@company.com"
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
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full rounded-xl border border-slate-200 bg-white/50 py-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs font-medium text-red-500">{errors.password.message}</p>}
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
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          New to MedFinder?{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Create an Account
          </Link>
        </div>




      </div>
    </div>
  );
};

export default LoginPage;
