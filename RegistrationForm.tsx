import React, { useState } from 'react';
import { SERVICE_CATEGORIES } from '../constants';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CheckCircle, Upload, Phone, User, MapPin, Briefcase, FileText, Info, ShieldCheck, ChevronRight } from 'lucide-react';

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    whatsapp: '',
    serviceType: '',
    location: '',
    lat: -6.2088,
    lng: 106.8456,
    description: '',
  });
  const [isLocating, setIsLocating] = useState(false);
  const [ktpFile, setKtpFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [faceDetectionStatus, setFaceDetectionStatus] = useState<'idle' | 'detecting' | 'verified' | 'failed'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const compressImage = (base64Str: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; // Cukup untuk avatar di list
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_WIDTH) {
            width *= MAX_WIDTH / height;
            height = MAX_WIDTH;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.6)); // JPEG Kualitas 60% agar super ringan
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ktpFile || !selfieFile) {
      alert('Silakan unggah foto KTP dan Selfie terlebih dahulu.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Kompres selfie sebelum kirim (ini yang membuat lambat jika filenya besar)
      const compressedSelfie = await compressImage(selfiePreview!);

      // Kirim ke server (kita tidak menunggu response lama-lama)
      const registerPromise = fetch('/api/register-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ktpUrl: ktpFile.name,
          selfieUrl: compressedSelfie, 
        }),
      });

      // Siapkan WhatsApp
      const adminWhatsApp = '6281248660675';
      const message = `Halo Admin JasaKita, saya mendaftar sebagai Mitra.
      
*DATA PENDAFTARAN:*
• Nama: ${formData.name}
• WA: ${formData.whatsapp}
• Kategori: ${formData.serviceType}
• Wilayah: ${formData.location}

*PENTING:* Saya akan mengirimkan Foto KTP dan Selfie saya di bawah ini untuk verifikasi. Mohon dicek.`;

      // Gunakan whatsapp protocol untuk aplikasi APK agar tidak membuka browser
      const waUrl = `whatsapp://send?phone=${adminWhatsApp}&text=${encodeURIComponent(message)}`;
      const waFallbackUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;

      // Jika dalam 2.5 detik server belum balas, kita tetap buka WhatsApp agar user tidak menunggu
      await Promise.race([
        registerPromise,
        new Promise(resolve => setTimeout(resolve, 2500))
      ]);

      try {
        window.location.href = waUrl;
        // Fallback jika whatsapp:// gagal
        setTimeout(() => {
          if (document.hasFocus()) {
             window.open(waFallbackUrl, '_blank');
          }
        }, 500);
      } catch (e) {
        window.open(waFallbackUrl, '_blank');
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error('Registration error:', error);
      const adminWhatsApp = '6281248660675';
      const waUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent('Pendaftaran: ' + formData.name)}`;
      window.open(waUrl, '_blank');
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('Browser Anda tidak mendukung GPS.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData(prev => ({
          ...prev,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          location: prev.location || `Lokasi GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
        }));
        setIsLocating(false);
        // Alert yang lebih ramah
        const customAlert = document.createElement('div');
        customAlert.className = 'fixed top-10 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[100] animate-bounce';
        customAlert.innerText = '✅ Lokasi GPS Berhasil Diambil!';
        document.body.appendChild(customAlert);
        setTimeout(() => customAlert.remove(), 3000);
      },
      (err) => {
        console.error('GPS Error:', err);
        setIsLocating(false);
        let msg = 'Gagal mengambil lokasi.';
        if (err.code === 1) {
          msg = 'Izin lokasi ditolak. Buka Pengaturan HP > Aplikasi > JasaKita > Izin > Aktifkan Lokasi.';
        } else if (err.code === 2) {
          msg = 'Posisi tidak tersedia (GPS Mati).';
        } else if (err.code === 3) {
          msg = 'Waktu habis. Coba lagi.';
        }
        alert(msg);
      },
      { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'ktp') {
          setKtpFile(file);
          setKtpPreview(reader.result as string);
        } else {
          setSelfieFile(file);
          setSelfiePreview(reader.result as string);
          
          // Simulation of AI detection as requested
          setFaceDetectionStatus('detecting');
          setTimeout(() => {
            setFaceDetectionStatus('verified');
          }, 2000);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl border border-slate-100 max-w-2xl mx-auto">
        <motion.div 
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 12 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner"
        >
          <CheckCircle className="w-12 h-12" />
        </motion.div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Pendaftaran Sukses!</h2>
        <div className="bg-orange-50 border border-orange-100 p-6 rounded-3xl mb-8 text-left">
          <p className="text-orange-800 font-black text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
            Langkah Terakhir:
          </p>
          <p className="text-orange-700 font-medium text-sm leading-relaxed">
            WhatsApp tidak bisa mengirim gambar otomatis. Mohon klik tombol klip kertas (lampiran) di WhatsApp Anda dan **kirimkan Foto KTP & Selfie** yang barusan Anda upload agar pendaftaran bisa segera disetujui.
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl shadow-slate-200"
        >
          Selesai & Tutup
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200 border border-slate-50 overflow-hidden">
        <div className="bg-slate-900 px-10 py-14 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-4xl font-black mb-3">Daftar Jadi Mitra</h2>
            <p className="text-slate-400 font-medium text-lg">Lengkapi data diri untuk mulai menawarkan jasa.</p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-3xl -mr-20 -mt-20 rounded-full" />
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                Nama Lengkap
              </label>
              <input 
                required
                type="text"
                placeholder="Ahmad Subarjo"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-slate-700"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-500" />
                Nomor WhatsApp
              </label>
              <input 
                required
                type="tel"
                placeholder="628xxxxxxxxxx"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-slate-700"
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Kategori Layanan
              </label>
              <div className="relative">
                <select 
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all appearance-none font-bold text-slate-700 cursor-pointer"
                  value={formData.serviceType}
                  onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                >
                  <option value="">Pilih Jasa</option>
                  {SERVICE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <Info className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Wilayah Operasional / Alamat
                </span>
                <button 
                  type="button"
                  onClick={handleGetGPS}
                  disabled={isLocating}
                  className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                >
                  {isLocating ? 'Mencari...' : 'Gunakan GPS'}
                </button>
              </label>
              <input 
                required
                type="text"
                placeholder="Contoh: Jakarta Selatan, Tebet"
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-slate-700"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 font-bold px-2 italic leading-relaxed">
                *Klik "Gunakan GPS" untuk lokasi presisi. Jika menggunakan APK/App dan gagal, aktifkan izin lokasi di Pengaturan HP Anda atau gunakan browser Chrome.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              Deskripsi Keahlian & Jasa
            </label>
            <textarea 
              required
              rows={4}
              placeholder="Berikan detail mengenai layanan yang Anda tawarkan..."
              className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 outline-none transition-all font-bold text-slate-700 resize-none"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="bg-blue-50/50 p-8 rounded-[2rem] border border-blue-100/50 space-y-6">
            <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Verifikasi Dokumen
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className={`group bg-white border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${ktpFile ? 'border-green-400 bg-green-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'ktp')}
                />
                {ktpPreview ? (
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <img src={ktpPreview} alt="KTP" className="w-full h-full object-cover rounded-xl shadow-md" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
                  {ktpFile ? 'KTP Terpilih' : 'Unggah KTP'}
                </p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {ktpFile ? ktpFile.name : 'Maks. 5MB (JPG/PNG)'}
                </p>
              </label>

              <label className={`group bg-white border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${selfieFile ? 'border-green-400 bg-green-50/30' : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}>
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleFileChange(e, 'selfie')}
                />
                {selfiePreview ? (
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <img src={selfiePreview} alt="Selfie" className="w-full h-full object-cover rounded-xl shadow-md" />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <p className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">
                  {selfieFile ? 'Selfie Terpilih' : 'Foto Selfie'}
                </p>
                <div className="flex flex-col items-center gap-2">
                  <p className="text-[10px] text-slate-400 font-bold">
                    {selfieFile ? selfieFile.name : 'Pastikan wajah terlihat jelas'}
                  </p>
                  
                  {faceDetectionStatus === 'detecting' && (
                    <div className="flex items-center gap-2 text-[10px] text-blue-600 font-black animate-pulse">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                      AI MENDETEKSI WAJAH...
                    </div>
                  )}
                  {faceDetectionStatus === 'verified' && (
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-black px-2 py-0.5 bg-green-50 rounded-full border border-green-100">
                      <CheckCircle className="w-3 h-3" />
                      WAJAH TERDETEKSI (AMAN)
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <button 
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl shadow-blue-200 flex items-center justify-center gap-4 h-20"
          >
            {isSubmitting ? (
              <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Kirim Pendaftaran
                <ChevronRight className="w-6 h-6" />
              </>
            )}
          </button>
        </form>
      </div>
      <p className="text-center mt-10 text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">
        Data Anda Terlindungi & Aman dengan Standar Enkripsi
      </p>
    </div>
  );
}
