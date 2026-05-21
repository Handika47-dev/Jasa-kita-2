/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ServiceProvider, AppView } from './types';
import ServiceList from './components/ServiceList';
import RegistrationForm from './components/RegistrationForm';
import { LayoutGrid, UserPlus, ShieldCheck, Home, Star, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [view, setView] = useState<AppView>('home');
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch('/api/providers');
        const data = await res.json();
        if (Array.isArray(data)) {
          setProviders(data);
        } else {
          console.error('API did not return an array:', data);
          setProviders([]);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, []);

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'register', label: 'Gabung Mitra', icon: UserPlus },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Mobile-style Bottom Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass border border-white/40 shadow-2xl rounded-full px-8 py-5 flex items-center gap-10 z-50 md:gap-16">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setView(item.id as AppView)}
            className={`flex flex-col items-center gap-1.5 group relative transition-all duration-300 ${view === item.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <item.icon className={`w-6 h-6 transition-all duration-300 ${view === item.id ? 'scale-110 drop-shadow-[0_0_8px_rgba(37,99,235,0.3)]' : 'group-active:scale-90'}`} />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] leading-none">{item.label}</span>
            {view === item.id && (
              <motion.div 
                layoutId="nav-pill"
                className="absolute -top-1 w-1 h-1 bg-blue-600 rounded-full"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      <header className="pt-12 pb-8 px-6 max-w-7xl mx-auto flex justify-between items-end">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-2"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-blue-200 group overflow-hidden relative">
              <ShieldCheck className="text-white w-7 h-7 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 font-display">JK <span className="text-blue-600">.</span></h1>
          </motion.div>
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em] pl-1">JasaKita Indonesia</p>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-400">
          <span className="text-green-500 flex items-center gap-1.5 ring-1 ring-green-100 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Terhubung
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pb-32">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-[3rem] p-10 md:p-20 overflow-hidden border border-slate-100 shadow-2xl">
                  <div className="relative z-10 max-w-2xl">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8"
                    >
                      <Star className="w-3 h-3 fill-blue-600" />
                      Layanan Terpercaya di Indonesia
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-slate-900 mb-8 font-display">
                      Solusi Jasa <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Terpercaya.</span>
                    </h2>
                    <p className="text-slate-500 text-lg md:text-xl font-medium mb-12 leading-relaxed max-w-lg">
                      Temukan ribuan mitra profesional untuk kebutuhan rumah tangga Anda. Dari perbaikan AC hingga asisten harian.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={() => {
                          const element = document.getElementById('popular-services');
                          element?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-blue-200 active:scale-95"
                      >
                        Cari Jasa Sekarang
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setView('register')}
                        className="bg-slate-50 text-slate-900 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-3 border border-slate-200 active:scale-95"
                      >
                        Gabung Mitra
                      </button>
                    </div>
                  </div>
                  
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block">
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl" />
                    <div className="absolute top-1/4 right-20 w-32 h-32 bg-indigo-100/50 rounded-full blur-2xl animate-pulse-soft" />
                    <div className="absolute bottom-1/4 right-32 w-48 h-48 bg-slate-100 rounded-full blur-3xl" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Kategori Lengkap</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Dari teknisi AC hingga bantuan rumah tangga, semua tersedia dalam satu platform.</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="bg-green-50 w-12 h-12 rounded-2xl flex items-center justify-center text-green-600 mb-6">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Langsung WhatsApp</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Hubungi penyedia jasa tanpa perantara. Chat langsung, nego, dan bereskan!</p>
                </div>
                <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Verifikasi KTP</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">Semua mitra yang terdaftar melalui proses verifikasi dokumen pendaftaran oleh admin.</p>
                </div>
              </div>

              <div className="space-y-6" id="popular-services">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-2xl font-bold">Daftar Layanan</h3>
                </div>
                <ServiceList providers={providers} />
              </div>
            </motion.div>
          )}

          {view === 'register' && (
            <motion.div 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="mb-10 text-center max-w-2xl mx-auto">
                <h2 className="text-4xl font-black mb-4">Mulai Bisnismu Hari Ini</h2>
                <p className="text-gray-500 font-medium">Isi formulir di bawah ini dengan benar. Admin kami akan meninjau data Anda dalam 1x24 jam.</p>
              </div>
              <RegistrationForm />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="bg-white border-t border-gray-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <ShieldCheck className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900">JASAKITA</h1>
            </div>
            <p className="text-gray-400 max-w-sm mb-8 leading-relaxed">
              JasaKita adalah inisiatif untuk menghubungkan penyedia jasa lokal dengan pelanggan melalui teknologi yang sederhana dan mudah digunakan. Terinspirasi dari kebutuhan masyarakat Indonesia.
            </p>
            <div className="flex gap-4">
              {['Twitter', 'Instagram', 'WhatsApp'].map(social => (
                <span key={social} className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors uppercase">{social}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">Navigasi</h4>
              <ul className="space-y-4 text-sm text-gray-400 font-medium">
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => setView('home')}>Beranda</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => {
                  if (view !== 'home') setView('home');
                  setTimeout(() => document.getElementById('popular-services')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}>Cari Jasa</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors" onClick={() => setView('register')}>Gabung Mitra</li>
                <li className="hover:text-blue-600 cursor-pointer transition-colors">Syarat & Ketentuan</li>
              </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Dukungan</h4>
            <div className="text-sm text-gray-400 leading-relaxed font-medium">
              Ada pertanyaan? Hubungi admin kami melalui email atau WhatsApp pendaftaran.<br/><br/>
              <span className="text-blue-600">handikadahland@gmail.com</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-300">
          <p>© 2026 JASAKITA INDONESIA. SEMUA HAK DILINDUNGI.</p>
          <div className="flex gap-8">
            <span>Privasi</span>
            <span>Legalitas</span>
            <span>Kota</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
