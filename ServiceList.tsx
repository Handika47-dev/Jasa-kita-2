import { ServiceProvider } from '../types';
import { Star, MessageCircle, MapPin, Search, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

export default function ServiceList({ providers }: { providers: ServiceProvider[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredProviders = providers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="relative max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input 
          type="text"
          placeholder="Cari jasa (AC, Ledeng, Tukang...)"
          className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white shadow-xl shadow-slate-200/50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all placeholder:text-slate-400 font-medium"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-3 inset-y-3">
          <button className="bg-blue-600 text-white px-6 rounded-[1.25rem] font-bold text-sm h-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            Cari
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProviders.map((p, idx) => (
          <motion.div 
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.05, duration: 0.5 }}
            className="group relative bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-blue-200/40 border border-slate-100 transition-all duration-500 hover:-translate-y-2"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 font-bold text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden">
                  {p.imageUrl ? (
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    p.name.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-2xl text-xs font-black">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {p.rating}
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</h3>
              <p className="text-blue-600/70 text-xs font-black uppercase tracking-[0.15em]">{p.serviceType}</p>
            </div>
            
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-medium leading-relaxed">{p.description}</p>
            
            <a 
              href={`https://www.google.com/maps?q=${p.location.lat},${p.location.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-slate-400 text-xs font-bold mb-8 hover:text-blue-600 transition-colors w-fit group/loc"
            >
              <div className="p-1.5 bg-slate-50 rounded-lg group-hover/loc:bg-blue-50 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <span className="underline decoration-slate-200 underline-offset-4 group-hover/loc:decoration-blue-200">{p.location.address}</span>
            </a>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  const message = encodeURIComponent(`Halo, saya melihat profil Anda di JasaKita. Bisa bantu saya?`);
                  const protocolUrl = `whatsapp://send?phone=${p.whatsapp}&text=${message}`;
                  const webUrl = `https://wa.me/${p.whatsapp}?text=${message}`;
                  
                  // Try protocol first
                  window.location.href = protocolUrl;
                  
                  // If we're still here after 500ms, fallback to web URL
                  setTimeout(() => {
                    if (document.hasFocus()) {
                      window.open(webUrl, '_blank');
                    }
                  }, 500);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-green-100 active:scale-95 text-xs uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </button>
              <button className="w-14 h-14 flex items-center justify-center bg-slate-50 text-slate-400 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95 border border-slate-100">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredProviders.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200"
        >
          <div className="bg-slate-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-bold text-xl mb-2">Pencarian Tidak Ditemukan</p>
          <p className="text-slate-400 text-sm">Coba kata kunci lain atau cari kategori yang berbeda.</p>
        </motion.div>
      )}
    </div>
  );
}
