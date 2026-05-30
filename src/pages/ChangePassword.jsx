import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function ChangePassword() {
  const navigate = useNavigate();

  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased relative pb-24 overflow-hidden">
      {/* HEADER */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shrink-0 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/profile')} className="text-[#001A41] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-black text-[#001A41]">Ubah Kata Sandi</h1>
        </div>
        <button className="text-[#001A41]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.07.124c-.073.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.214 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87c-.074-.04-.148-.083-.22-.127a1.124 1.124 0 00-1.074-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03c-.004-.074-.006-.148-.006-.222 0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.041.146-.084.218-.128.333-.183.582-.495.645-.869l.214-1.28z" />
          </svg>
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
          Amankan akun Anda dengan menggunakan kata sandi yang kuat dan unik. Pastikan kata sandi baru tidak sama dengan yang sebelumnya.
        </p>

        {/* BOX INPUT UTAMA */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#001A41] mb-1.5">Kata Sandi Saat Ini</label>
            <div className="relative">
              <input type="password" placeholder="Masukkan kata sandi saat ini" className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none placeholder-gray-300" />
              <span className="absolute right-3 top-3 text-xs text-gray-400">👁️</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#001A41] mb-1.5">Kata Sandi Baru</label>
            <div className="relative">
              <input type="password" placeholder="Minimal 8 karakter" className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none placeholder-gray-300" />
              <span className="absolute right-3 top-3 text-xs text-gray-400">👁️</span>
            </div>
            {/* Indikator Lemah/Kuat */}
            <div className="flex items-center justify-between mt-1 px-1">
              <div className="h-1 flex-1 bg-red-200 rounded-full mr-2"></div>
              <span className="text-[9px] font-black text-red-500 tracking-wider uppercase">Lemah</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#001A41] mb-1.5">Konfirmasi Kata Sandi Baru</label>
            <div className="relative">
              <input type="password" placeholder="Ulangi kata sandi baru" className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none placeholder-gray-300" />
              <span className="absolute right-3 top-3 text-xs text-gray-400">👁️</span>
            </div>
          </div>

          <button onClick={() => { alert('Perubahan kata sandi berhasil disimpan!'); navigate('/profile'); }} className="w-full bg-[#001A41] hover:bg-[#00112c] text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition shadow-sm mt-2">
            <span>Simpan Perubahan</span>
            <span className="text-[10px]">✓</span>
          </button>
        </div>

        {/* TIPS BOX */}
        <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-50 flex gap-2.5">
          <span className="text-xs mt-0.5">💡</span>
          <p className="text-[10px] text-indigo-900 font-medium leading-relaxed">
            <span className="font-bold block mb-0.5">Tips:</span>
            Kata sandi yang kuat mencakup campuran huruf besar, huruf kecil, angka, dan simbol.
          </p>
        </div>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}