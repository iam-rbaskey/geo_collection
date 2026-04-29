"use client";
import React, { useState, useEffect } from 'react';
import { Search, Edit2, ShieldAlert, User as UserIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type Role = 'user' | 'admin';

interface UserData {
  id: string;
  username: string;
  role: Role;
  level: number;
  points: number;
  lastActive?: string;
  energy?: number;
  charsUnlocked?: number;
  powersUnlocked?: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState('');
  const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
  const [viewProfileId, setViewProfileId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase.from('profiles').select('*').order('points', { ascending: false });
      if (data) {
        setUsers(data as UserData[]);
      }
      setLoading(false);
    }
    fetchUsers();
  }, [supabase]);

  const filteredUsers = users.filter(u => (u.username || '').toLowerCase().includes(search.toLowerCase()));

  const handleRoleChange = async (id: string, newRole: Role) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`)) {
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
      await supabase.from('profiles').update({ role: newRole }).eq('id', id);
    }
    setEditingRoleFor(null);
  };

  const activeProfile = users.find(u => u.id === viewProfileId);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage accounts, assign roles, and view player profiles.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by username..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0b0f14] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Role</th>
              <th className="px-6 py-4 font-bold">Level / Points</th>
              <th className="px-6 py-4 font-bold">Last Active</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                  Loading users from database...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No users found matching "{search}"
                </td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{user.username || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {editingRoleFor === user.id ? (
                    <select 
                      autoFocus
                      className="bg-[#0b0f14] border border-white/20 rounded px-2 py-1 text-xs text-white outline-none"
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                      onBlur={() => setEditingRoleFor(null)}
                    >
                      <option value="user">USER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                      }`}>
                        {user.role || 'user'}
                      </span>
                      <button onClick={() => setEditingRoleFor(user.id)} className="text-slate-500 hover:text-white p-1" title="Edit Role">
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-white">Lv. {user.level || 1}</div>
                  <div className="text-xs text-primary mt-0.5">{(user.points || 0).toLocaleString()} pts</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {user.lastActive || 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setViewProfileId(user.id)}
                    className="text-xs font-bold text-slate-300 hover:text-primary px-3 py-1.5 rounded border border-white/10 hover:border-primary/30 hover:bg-primary/5 transition-colors"
                  >
                    View Profile
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeProfile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewProfileId(null)} />
          <div className="bg-[#0b0f14] border border-white/10 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{activeProfile.username || 'Unknown'}</h3>
                  <p className="text-sm text-slate-400 font-mono">{activeProfile.id}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest ${
                activeProfile.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-slate-500/10 text-slate-300 border border-slate-500/20'
              }`}>
                {activeProfile.role || 'user'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Level</div>
                <div className="text-lg font-black text-white">{activeProfile.level || 1}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Total Points</div>
                <div className="text-lg font-black text-primary">{(activeProfile.points || 0).toLocaleString()}</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Energy Level</div>
                <div className="text-lg font-bold text-blue-400">{activeProfile.energy || 100}%</div>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-3">
                <div className="text-xs text-slate-400 mb-1">Last Active</div>
                <div className="text-sm font-medium text-slate-200 mt-1">{activeProfile.lastActive || 'N/A'}</div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-bold text-white mb-3">Collection Stats</h4>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg mb-2">
                <span className="text-sm text-slate-400">Characters Unlocked</span>
                <span className="font-bold text-white">{activeProfile.charsUnlocked || 0}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <span className="text-sm text-slate-400">Powers Unlocked</span>
                <span className="font-bold text-white">{activeProfile.powersUnlocked || 0}</span>
              </div>
            </div>

            <button 
              onClick={() => setViewProfileId(null)}
              className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold transition-colors"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
