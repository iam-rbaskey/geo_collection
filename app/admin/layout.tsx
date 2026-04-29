"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Map as MapIcon, BarChart3, Settings, Package, Menu, X, ShieldAlert } from 'lucide-react';

import { createClient } from '@/utils/supabase/client';

const MENU_ITEMS = [
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Collectibles', href: '/admin/collectibles', icon: Package },
  { label: 'Map Editor', href: '/admin/map', icon: MapIcon },
  { label: 'System Updates', href: '/admin/updates', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function checkAdmin() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      
      // Fetch role from profiles table
      const { data, error } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      
      if (!error && data && data.role === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    }
    
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center text-white">
        <ShieldAlert className="w-16 h-16 text-primary mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold">Verifying Access...</h1>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f14] flex flex-col items-center justify-center text-white">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2">You do not have permission to view this page.</p>
        <Link href="/" className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md font-bold">
          Return to Game
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-200 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Nav */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0b0f14] border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg tracking-wide">ADMIN</span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400 hover:text-white">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[65px] left-0 right-0 bg-[#0b0f14] border-b border-white/5 z-40 p-4 flex flex-col gap-2">
          {MENU_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                  active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 bg-[#0b0f14] border-r border-white/5 sticky top-0 h-screen shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-black text-white tracking-wider leading-none">ADMIN</h1>
            <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Control Panel</p>
          </div>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {MENU_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  active 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(0,255,213,0.1)]' 
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-bold">
            Exit Admin
          </Link>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
