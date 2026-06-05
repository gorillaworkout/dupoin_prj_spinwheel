"use client";

import React, { useState } from "react";
import { useWheel } from "@/context/WheelContext";
import { Settings as SettingsIcon, X, Plus, Trash2, Image as ImageIcon, PaintBucket, Volume2, VolumeX, Upload } from "lucide-react";

export default function Settings() {
  const { 
    prizes, addPrize, removePrize, updatePrize, 
    background, setBackground,
    audioSettings, setAudioSettings
  } = useWheel();
  
  const [isOpen, setIsOpen] = useState(false);
  const [newPrizeName, setNewPrizeName] = useState("");
  const [newPrizeWeight, setNewPrizeWeight] = useState(10);
  const [newPrizeColor, setNewPrizeColor] = useState("#ef4444");
  const [newPrizeStock, setNewPrizeStock] = useState(10);

  const handleAddPrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeName.trim()) return;
    addPrize({
      name: newPrizeName,
      weight: Number(newPrizeWeight),
      color: newPrizeColor,
      stock: Number(newPrizeStock)
    });
    setNewPrizeName("");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 z-40 p-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition shadow-lg"
      >
        <SettingsIcon className="w-6 h-6" />
      </button>

      {/* Slide-over Panel */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out overflow-y-auto flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-400" />
            Pengaturan
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 flex-1 flex flex-col gap-8">
          
          {/* Audio Settings */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Suara</h3>
            <button
              onClick={() => setAudioSettings(s => ({ ...s, enabled: !s.enabled }))}
              className={`flex items-center gap-3 w-full p-4 rounded-xl border transition ${audioSettings.enabled ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
            >
              {audioSettings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              <span className="font-medium">{audioSettings.enabled ? 'Suara Aktif' : 'Suara Dimatikan'}</span>
            </button>
          </section>

          {/* Background Settings */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Background</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setBackground(b => ({ ...b, type: 'color' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${background.type === 'color' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              >
                <PaintBucket className="w-4 h-4" /> Warna
              </button>
              <button
                onClick={() => setBackground(b => ({ ...b, type: 'image' }))}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${background.type === 'image' ? 'bg-blue-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
              >
                <ImageIcon className="w-4 h-4" /> Gambar
              </button>
            </div>
            
            {background.type === 'color' ? (
              <input 
                type="color" 
                value={background.value.startsWith('#') ? background.value : '#0f172a'}
                onChange={(e) => setBackground({ type: 'color', value: e.target.value })}
                className="w-full h-12 rounded-xl cursor-pointer bg-transparent border border-white/20"
              />
            ) : (
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={background.value}
                  onChange={(e) => setBackground({ type: 'image', value: e.target.value })}
                  placeholder="Atau Paste URL Gambar (https://...)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          try {
                            setBackground({ type: 'image', value: reader.result as string });
                          } catch (err) {
                            alert("Gambar terlalu besar untuk disimpan di browser. Silakan gunakan gambar dengan ukuran lebih kecil (di bawah 2MB).");
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer">
                    <Upload className="w-4 h-4" /> Upload Gambar Lokal
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Prizes Settings */}
          <section>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              Daftar Hadiah
              <span className="bg-slate-800 text-xs py-1 px-2 rounded-md">{prizes.length}</span>
            </h3>
            
            {/* Add New */}
            <form onSubmit={handleAddPrize} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col gap-3">
              <input 
                type="text" 
                value={newPrizeName}
                onChange={e => setNewPrizeName(e.target.value)}
                placeholder="Nama Hadiah"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                required
              />
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Bobot / Peluang (1-100)</label>
                  <input 
                    type="number" 
                    value={newPrizeWeight}
                    onChange={e => setNewPrizeWeight(Number(e.target.value))}
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-slate-500 block mb-1">Stok (999=Unlimited)</label>
                  <input 
                    type="number" 
                    value={newPrizeStock}
                    onChange={e => setNewPrizeStock(Number(e.target.value))}
                    min="1"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Warna</label>
                  <input 
                    type="color" 
                    value={newPrizeColor}
                    onChange={e => setNewPrizeColor(e.target.value)}
                    className="w-16 h-[38px] rounded-lg cursor-pointer bg-transparent border border-white/10"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> Tambah Hadiah
              </button>
            </form>

            {/* List */}
            <div className="flex flex-col gap-3">
              {prizes.map((prize) => (
                <div key={prize.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2 relative group">
                  <div className="flex items-center gap-3">
                    <input 
                      type="color"
                      value={prize.color}
                      onChange={e => updatePrize(prize.id, { color: e.target.value })}
                      className="w-8 h-8 rounded-full border border-white/20 shrink-0"
                    />
                    <input 
                      type="text"
                      value={prize.name}
                      onChange={e => updatePrize(prize.id, { name: e.target.value })}
                      className="flex-1 bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors"
                    />
                    <button 
                      onClick={() => removePrize(prize.id)}
                      className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                    <span>Bobot:</span>
                    <input 
                      type="number"
                      value={prize.weight}
                      onChange={e => updatePrize(prize.id, { weight: Number(e.target.value) })}
                      className="w-14 bg-white/10 rounded px-2 py-1 text-white border border-transparent focus:border-blue-500 focus:outline-none"
                    />
                    <span className="ml-2">Stok:</span>
                    <input 
                      type="number"
                      value={prize.stock}
                      onChange={e => updatePrize(prize.id, { stock: Number(e.target.value) })}
                      className="w-14 bg-white/10 rounded px-2 py-1 text-white border border-transparent focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              ))}
              {prizes.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-4">Belum ada hadiah.</p>
              )}
            </div>
          </section>

        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}
    </>
  );
}
