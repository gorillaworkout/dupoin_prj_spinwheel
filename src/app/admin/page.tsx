"use client";

import React, { useState, useEffect } from "react";
import { useWheel } from "@/context/WheelContext";
import {
  Settings as SettingsIcon, Plus, Trash2, Image as ImageIcon,
  PaintBucket, Volume2, VolumeX, Upload, History, Download,
  Trash, Lock, LogOut, BarChart3, Trophy, User,
} from "lucide-react";

function LoginForm({ onLogin }: { onLogin: (u: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok && data.success) onLogin(data.username);
      else setError(data.error || "Login gagal");
    } catch { setError("Koneksi gagal"); } finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mb-4"><Lock className="w-8 h-8 text-blue-400" /></div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Masukkan username &amp; password</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" autoFocus className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {error && <p className="text-red-400 text-sm text-center -mt-2">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-xl text-sm transition disabled:opacity-50">{loading ? "Masuk..." : "Masuk"}</button>
        </form>
      </div>
    </div>
  );
}

function SettingsTab() {
  const { prizes, addPrize, removePrize, updatePrize, background, setBackground, audioSettings, setAudioSettings } = useWheel();
  const [newName, setNewName] = useState("");
  const [newPct, setNewPct] = useState(10);
  const [newColor, setNewColor] = useState("#ef4444");
  const [newStock, setNewStock] = useState(10);
  const totalPct = prizes.reduce((s, p) => s + p.percentage, 0);
  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault(); if (!newName.trim()) return;
    addPrize({ name: newName, percentage: Number(newPct), color: newColor, stock: Number(newStock) });
    setNewName(""); setNewPct(10); setNewStock(10);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><Volume2 className="w-4 h-4" /> Suara</h3>
          <button onClick={() => setAudioSettings(s => ({ ...s, enabled: !s.enabled }))} className={"flex items-center gap-3 w-full p-4 rounded-xl border transition " + (audioSettings.enabled ? "bg-blue-500/20 border-blue-500/50 text-blue-300" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10")}>
            {audioSettings.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}<span className="font-medium">{audioSettings.enabled ? "Suara Aktif" : "Suara Dimatikan"}</span>
          </button>
        </section>
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><PaintBucket className="w-4 h-4" /> Background</h3>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setBackground(b => ({ ...b, type: "color" as const }))} className={"flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition " + (background.type === "color" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20")}><PaintBucket className="w-4 h-4" /> Warna</button>
            <button onClick={() => setBackground(b => ({ ...b, type: "image" as const }))} className={"flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition " + (background.type === "image" ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300 hover:bg-white/20")}><ImageIcon className="w-4 h-4" /> Gambar</button>
          </div>
          {background.type === "color" ? (
            <input type="color" value={background.value.startsWith("#") ? background.value : "#0f172a"} onChange={e => setBackground({ type: "color", value: e.target.value })} className="w-full h-12 rounded-xl cursor-pointer bg-transparent border border-white/20" />
          ) : (
            <div className="flex flex-col gap-3">
              <input type="text" value={background.value} onChange={e => setBackground({ type: "image", value: e.target.value })} placeholder="Paste URL Gambar" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="relative w-full">
                <input type="file" accept="image/*" onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const fd = new FormData(); fd.append("file", f); const res = await fetch("/api/background", { method: "POST", body: fd }); const data = await res.json(); if (!res.ok || !data?.background) throw new Error(data?.error || "Upload gagal"); setBackground(data.background); } catch (err: any) { alert(err?.message || "Gagal upload gambar."); } finally { e.currentTarget.value = ""; } }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                <div className="w-full bg-slate-800 hover:bg-slate-700 border border-white/20 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition cursor-pointer"><Upload className="w-4 h-4" /> Upload Gambar</div>
              </div>
            </div>
          )}
        </section>
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Total Persentase</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-white/10 rounded-full h-4 overflow-hidden"><div className={"h-full rounded-full transition-all duration-300 " + (totalPct === 100 ? "bg-green-500" : totalPct > 100 ? "bg-red-500" : "bg-yellow-500")} style={{ width: Math.min(totalPct, 100) + "%" }} /></div>
            <span className={"text-lg font-bold min-w-[60px] text-right " + (totalPct === 100 ? "text-green-400" : totalPct > 100 ? "text-red-400" : "text-yellow-400")}>{totalPct}%</span>
          </div>
          {totalPct !== 100 && <p className="text-xs text-slate-500 mt-2">{totalPct > 100 ? "Melebihi 100%! Kurangi " + (totalPct - 100) + "%" : "Kurang " + (100 - totalPct) + "% dari 100%"}</p>}
        </section>
      </div>
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between"><span className="flex items-center gap-2"><Trophy className="w-4 h-4" /> Daftar Hadiah</span><span className="bg-slate-800 text-xs py-1 px-2 rounded-md">{prizes.length}</span></h3>
        <form onSubmit={handleAdd} className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nama Hadiah" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500" required />
          <div className="flex gap-3">
            <div className="flex-1"><label className="text-xs text-slate-500 block mb-1">Persentase (%)</label><input type="number" value={newPct} onChange={e => setNewPct(Number(e.target.value))} min="1" max="100" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" required /></div>
            <div className="flex-1"><label className="text-xs text-slate-500 block mb-1">Stok (999=Unlimited)</label><input type="number" value={newStock} onChange={e => setNewStock(Number(e.target.value))} min="1" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500" required /></div>
            <div><label className="text-xs text-slate-500 block mb-1">Warna</label><input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} className="w-16 h-[38px] rounded-lg cursor-pointer bg-transparent border border-white/10" /></div>
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition"><Plus className="w-4 h-4" /> Tambah Hadiah</button>
        </form>
        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
          {prizes.map(prize => (
            <div key={prize.id} className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <input type="color" value={prize.color} onChange={e => updatePrize(prize.id, { color: e.target.value })} className="w-8 h-8 rounded-full border border-white/20 shrink-0" />
                <input type="text" value={prize.name} onChange={e => updatePrize(prize.id, { name: e.target.value })} className="flex-1 bg-transparent border-b border-transparent focus:border-white/30 text-white text-sm focus:outline-none transition-colors" />
                <button onClick={() => removePrize(prize.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-white/10 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 pl-11">
                <span>%:</span>
                <input type="number" value={prize.percentage} onChange={e => updatePrize(prize.id, { percentage: Number(e.target.value) })} className="w-14 bg-white/10 rounded px-2 py-1 text-white border border-transparent focus:border-blue-500 focus:outline-none" />
                <span className="ml-2">Stok:</span>
                <input type="number" value={prize.stock} onChange={e => updatePrize(prize.id, { stock: Number(e.target.value) })} className="w-14 bg-white/10 rounded px-2 py-1 text-white border border-transparent focus:border-blue-500 focus:outline-none" />
              </div>
            </div>
          ))}
          {prizes.length === 0 && <p className="text-center text-slate-500 text-sm py-4">Belum ada hadiah.</p>}
        </div>
      </section>
    </div>
  );
}

function HistoryTab() {
  const { prizeLogs, clearPrizeLogs } = useWheel();
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount = prizeLogs.filter(l => l.timestamp >= todayStart.getTime()).length;
  const fmtTime = (ts: number) => new Date(ts).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const exportCSV = () => {
    if (!prizeLogs.length) return;
    const rows = prizeLogs.map(l => [new Date(l.timestamp).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }), l.prizeName, l.prizeId].map(v => String(v)).join(","));
    const csv = ["Waktu,Hadiah,ID Hadiah", ...rows].join("\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "spinwheel-logs-" + new Date().toISOString().slice(0, 10) + ".csv"; a.click();
  };
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">Total: {prizeLogs.length} spin | Hari ini: {todayCount}</p>
        <div className="flex gap-2">
          <button onClick={exportCSV} disabled={!prizeLogs.length} className="flex items-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 text-green-400 rounded-lg text-sm transition disabled:opacity-30"><Download className="w-4 h-4" /> Export CSV</button>
          <button onClick={clearPrizeLogs} disabled={!prizeLogs.length} className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 rounded-lg text-sm transition disabled:opacity-30"><Trash className="w-4 h-4" /> Hapus Semua</button>
        </div>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {prizeLogs.length === 0 ? (
          <div className="text-center text-slate-500 py-16"><History className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>Belum ada riwayat spin.</p></div>
        ) : (
          <div className="divide-y divide-white/5">
            {prizeLogs.map((log, i) => (
              <div key={log.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition">
                <span className="text-xs text-slate-500 w-8 text-right">#{prizeLogs.length - i}</span>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: log.prizeColor }} />
                <span className="flex-1 font-medium text-white">{log.prizeName}</span>
                <span className="text-xs text-slate-400">{fmtTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatsTab() {
  const { prizes, prizeLogs } = useWheel();
  const prizeCounts: Record<string, number> = {};
  prizeLogs.forEach(l => { prizeCounts[l.prizeName] = (prizeCounts[l.prizeName] || 0) + 1; });
  const sorted = Object.entries(prizeCounts).sort((a, b) => b[1] - a[1]);
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayCount = prizeLogs.filter(l => l.timestamp >= todayStart.getTime()).length;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-slate-400 text-sm mb-1">Total Spin</p><p className="text-4xl font-bold">{prizeLogs.length}</p></div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-slate-400 text-sm mb-1">Hari Ini</p><p className="text-4xl font-bold">{todayCount}</p></div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6"><p className="text-slate-400 text-sm mb-1">Jenis Hadiah</p><p className="text-4xl font-bold">{Object.keys(prizeCounts).length}</p></div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:col-span-2 lg:col-span-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Hadiah Terbanyak</h3>
        {sorted.length === 0 ? <p className="text-slate-500 text-sm">Belum ada data.</p> : (
          <div className="flex flex-col gap-3">
            {sorted.map(([name, count]) => {
              const pct = prizeLogs.length > 0 ? (count / prizeLogs.length) * 100 : 0;
              const prize = prizes.find(p => p.name === name);
              return (
                <div key={name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: prize?.color || "#6b7280" }} />
                  <span className="w-32 truncate text-sm">{name}</span>
                  <div className="flex-1 bg-white/10 rounded-full h-3 overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: pct + "%" }} /></div>
                  <span className="text-sm text-slate-400 w-16 text-right">{count}x ({pct.toFixed(1)}%)</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminDashboard({ username }: { username: string }) {
  const [tab, setTab] = useState<"settings" | "history" | "stats">("settings");
  const tabs = [["settings", SettingsIcon, "Pengaturan"], ["history", History, "Riwayat"], ["stats", BarChart3, "Statistik"]] as const;
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><SettingsIcon className="w-5 h-5" /></div>
            <div><h1 className="text-xl font-bold">Spinwheel Admin</h1><p className="text-xs text-slate-400">Login: {username}</p></div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> {username}</span>
            <a href="/" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm text-slate-300 hover:text-white transition"><LogOut className="w-4 h-4" /> Kembali</a>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
          {tabs.map(([key, Icon, label]) => (
            <button key={key} onClick={() => setTab(key)} className={"flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition " + (tab === key ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5")}><Icon className="w-4 h-4" /> {label}</button>
          ))}
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-4 py-8">
        {tab === "settings" && <SettingsTab />}
        {tab === "history" && <HistoryTab />}
        {tab === "stats" && <StatsTab />}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.authenticated) { setUsername(data.username); setLoggedIn(true); }
    }).catch(() => {});
  }, []);
  if (!loggedIn) return <LoginForm onLogin={(u) => { setUsername(u); setLoggedIn(true); }} />;
  return <AdminDashboard username={username} />;
}
