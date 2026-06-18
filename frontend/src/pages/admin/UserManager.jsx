import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { ShieldAlert, CheckCircle, Ban, Search, UserCheck, UserX, User } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManager = () => {
  const queryClient = useQueryClient();
  const [searchVal, setSearchVal] = useState('');

  // Fetch users
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/admin/users');
      return data;
    }
  });

  // Toggle user suspension mutation
  const toggleSuspendMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/analytics/admin/users/${id}/status`);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'User status updated successfully.');
      queryClient.invalidateQueries(['admin-users']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    }
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (searchVal.trim()) {
      const term = searchVal.toLowerCase();
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 pt-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">User Administration</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Supervise global user behavior and toggle access suspensions
        </p>
      </div>

      {/* Control bar */}
      <div className="relative max-w-md w-full">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, or role..."
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
        />
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
      ) : filteredUsers.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center space-y-3 border">
          <User className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="font-semibold text-slate-800 dark:text-white">No users found</h3>
          <p className="text-xs text-slate-500">No users match your criteria.</p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/50 border-b dark:bg-slate-900/50 dark:border-slate-800 text-slate-400">
                  <th className="p-4 font-semibold">User Details</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Platform Role</th>
                  <th className="p-4 font-semibold">Account Status</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="p-4 font-bold text-slate-800 dark:text-white">{u.name}</td>
                    <td className="p-4 text-slate-500">{u.email}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                        u.isSuspended 
                          ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      }`}>
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleSuspendMutation.mutate(u._id)}
                        disabled={toggleSuspendMutation.isPending}
                        className={`text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 mx-auto ${
                          u.isSuspended
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm'
                            : 'border border-red-200 bg-red-500/5 text-red-500 hover:bg-red-500/10'
                        }`}
                      >
                        {u.isSuspended ? (
                          <>
                            <UserCheck className="h-4 w-4" /> Activate User
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4" /> Suspend User
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManager;
