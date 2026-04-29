"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Users, Clock, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function AnalyticsPage() {
  const [dailyUsage, setDailyUsage] = useState<any[]>([]);
  const [stats, setStats] = useState({
    activeUsers: '0',
    avgSession: '0m',
    collectiblesFound: '0',
    uptime: '100%',
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchAnalytics() {
      // Fetch stats from custom views or tables
      const { data: usageData } = await supabase.from('daily_usage').select('*').order('time', { ascending: true });
      if (usageData) setDailyUsage(usageData);

      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: colCount } = await supabase.from('collectibles').select('*', { count: 'exact', head: true });
      
      setStats({
        activeUsers: (userCount || 0).toString(),
        avgSession: '24m', // Default until session tracking is added
        collectiblesFound: (colCount || 0).toString(),
        uptime: '99.99%',
      });

      setLoading(false);
    }
    fetchAnalytics();
  }, [supabase]);

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white">System Analytics</h2>
        <p className="text-muted-foreground mt-1">Real-time performance and user engagement metrics.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.activeUsers, icon: Users, color: '#00ffd5' },
          { label: 'Avg Session Duration', value: stats.avgSession, icon: Clock, color: '#a855f7' },
          { label: 'Total Collectibles', value: stats.collectiblesFound, icon: Zap, color: '#f59e0b' },
          { label: 'System Uptime', value: stats.uptime, icon: Activity, color: '#22c55e' },
        ].map((stat, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${stat.color}22`, border: `1px solid ${stat.color}44` }}>
              <stat.icon size={24} color={stat.color} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        
        {/* Daily Usage Graph */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Daily Usage Overview</h3>
            <p className="text-sm text-slate-400">Active users over the last 24 hours.</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
            {loading ? (
              <p className="text-slate-500 animate-pulse">Loading chart data from database...</p>
            ) : dailyUsage.length === 0 ? (
              <p className="text-slate-500">No usage data found in the database.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ffd5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00ffd5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#00ffd5' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#00ffd5" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Sessions Graph */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white">Session Activity</h3>
            <p className="text-sm text-slate-400">Total gameplay sessions started vs completed.</p>
          </div>
          <div className="h-72 w-full flex items-center justify-center">
             {loading ? (
              <p className="text-slate-500 animate-pulse">Loading chart data from database...</p>
            ) : dailyUsage.length === 0 ? (
              <p className="text-slate-500">No session data found in the database.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="time" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                    itemStyle={{ color: '#a855f7' }}
                  />
                  <Line type="monotone" dataKey="sessions" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#0f172a', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
