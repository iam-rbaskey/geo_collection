"use client";
import React, { useState, useEffect } from 'react';
import { Package, Plus, Upload, Trash2, MapPin, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AdminCollectible {
  id: string;
  character: string;
  imagePath: string;
  lat: number;
  lng: number;
  rarity: string;
  zone: string;
  addedAt: string;
}

export default function CollectiblesPage() {
  const [items, setItems] = useState<AdminCollectible[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newChar, setNewChar] = useState('batman');
  const [newLat, setNewLat] = useState(28.6139);
  const [newLng, setNewLng] = useState(77.2090);
  const [newRarity, setNewRarity] = useState('basic');
  const [newZone, setNewZone] = useState('none');

  const supabase = createClient();

  useEffect(() => {
    async function fetchCollectibles() {
      const { data, error } = await supabase.from('collectibles').select('*');
      if (data) setItems(data as AdminCollectible[]);
      setLoading(false);
    }
    fetchCollectibles();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this collectible? It will be removed for all users immediately.")) {
      setItems(items.filter(i => i.id !== id));
      await supabase.from('collectibles').delete().eq('id', id);
    }
  };

  const handleSpawnManual = async () => {
    const newId = `col_${Date.now()}`;
    const newItem = {
      id: newId,
      character: newChar,
      imagePath: `/characters/${newChar}.png`,
      lat: newLat,
      lng: newLng,
      rarity: newRarity,
      zone: newZone,
      addedAt: new Date().toISOString()
    };
    
    // Optimistic UI update
    setItems(prev => [...prev, newItem]);
    setShowAddModal(false);

    // DB insert
    const { error } = await supabase.from('collectibles').insert([newItem]);
    if (error) {
      alert("Error saving to database: " + error.message);
      // rollback UI
      setItems(prev => prev.filter(i => i.id !== newId));
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white">Collectible Management</h2>
          <p className="text-muted-foreground mt-1">Spawn new characters and powers onto the map globally.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowBulkModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-bold transition-colors text-sm border border-white/5"
          >
            <Upload size={16} /> Bulk Add
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold transition-colors text-sm"
          >
            <Plus size={16} /> Spawn Manual
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 font-bold">Asset</th>
              <th className="px-6 py-4 font-bold">Location</th>
              <th className="px-6 py-4 font-bold">Rarity</th>
              <th className="px-6 py-4 font-bold">Zone</th>
              <th className="px-6 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500 animate-pulse">
                  Loading collectibles from database...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  No active collectibles on the map.
                </td>
              </tr>
            ) : items.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-1 shrink-0">
                      <img src={item.imagePath || '/characters/man.png'} alt={item.character || 'Unknown'} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{item.character || 'Unknown'}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{item.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-sm text-slate-300">
                    <MapPin size={14} className="text-primary" />
                    {(item.lat || 0).toFixed(4)}, {(item.lng || 0).toFixed(4)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest bg-white/10 text-white border border-white/20">
                    {item.rarity || 'basic'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-400">
                  {item.zone || 'Global'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-[#0b0f14] border border-white/10 rounded-2xl w-full max-w-2xl flex flex-col max-h-[90vh] relative z-10 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Spawn Collectible</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Select Asset</label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {['batman', 'superman', 'spiderman', 'gundam', 'wizard', 'knight'].map(char => (
                    <div 
                      key={char} 
                      onClick={() => setNewChar(char)}
                      className={`aspect-square bg-white/5 border rounded-lg flex items-center justify-center p-2 cursor-pointer transition-colors ${newChar === char ? 'border-primary bg-primary/10' : 'border-white/10 hover:border-primary/50 hover:bg-primary/5'}`}
                    >
                      <img src={`/characters/${char}.png`} alt={char} className="w-full h-full object-contain" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Latitude</label>
                  <input 
                    type="number" 
                    value={newLat} 
                    onChange={e => setNewLat(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Longitude</label>
                  <input 
                    type="number" 
                    value={newLng} 
                    onChange={e => setNewLng(parseFloat(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Rarity</label>
                  <select 
                    value={newRarity}
                    onChange={e => setNewRarity(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary appearance-none"
                  >
                    <option value="basic">Basic</option>
                    <option value="rare">Rare</option>
                    <option value="epic">Epic</option>
                    <option value="legendary">Legendary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-300 mb-2">Assign Zone (Optional)</label>
                  <select 
                    value={newZone}
                    onChange={e => setNewZone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white outline-none focus:border-primary appearance-none"
                  >
                    <option value="none">Global (No Zone)</option>
                    <option value="civic_hub">Civic Hub</option>
                    <option value="financial_quarter">Financial Quarter</option>
                  </select>
                </div>
              </div>

              <div className="h-48 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'url("https://a.basemaps.cartocdn.com/dark_all/15/23046/13670.png")', backgroundSize: 'cover' }} />
                <div className="relative z-10 flex flex-col items-center gap-2">
                   <div className="w-8 h-8 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center animate-pulse">
                     <MapPin size={16} className="text-primary" />
                   </div>
                   <span className="text-xs font-bold text-primary bg-black/50 px-2 py-1 rounded">Live Preview Enabled in Engine</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-[#070b12] rounded-b-2xl">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-300 hover:text-white font-bold">Cancel</button>
              <button onClick={handleSpawnManual} className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-bold">
                Spawn to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {showBulkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowBulkModal(false)} />
          <div className="bg-[#0b0f14] border border-white/10 rounded-2xl w-full max-w-md relative z-10 shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-2">Bulk Upload</h3>
            <p className="text-sm text-slate-400 mb-6">Upload a CSV or JSON file containing collectible coordinates.</p>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-colors cursor-pointer bg-white/5">
              <Upload size={32} className="text-slate-400" />
              <div className="text-center">
                <p className="text-white font-bold">Click to browse or drag file</p>
                <p className="text-xs text-slate-500 mt-1">Accepts .csv, .json (Max 5MB)</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowBulkModal(false)} className="px-4 py-2 text-slate-300 hover:text-white font-bold">Cancel</button>
              <button className="px-6 py-2 bg-primary/50 text-primary-foreground rounded-lg font-bold cursor-not-allowed">
                Process File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
