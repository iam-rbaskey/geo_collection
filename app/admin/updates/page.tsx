"use client";
import React from 'react';
import { Settings } from 'lucide-react';

export default function SystemUpdatesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight text-white">System Updates</h2>
        <p className="text-muted-foreground mt-1">Scope reserved for future feature rollouts and updates.</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center mt-8">
        <Settings size={48} className="text-slate-500 mb-4 animate-[spin_4s_linear_infinite]" />
        <h3 className="text-xl font-bold text-white mb-2">Updates Module Coming Soon</h3>
        <p className="text-slate-400 max-w-md">
          This section is reserved for future administrative tools, including version control, feature toggles, and live event management.
        </p>
      </div>
    </div>
  );
}
