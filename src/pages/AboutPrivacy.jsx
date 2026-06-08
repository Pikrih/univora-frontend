import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function AboutPrivacy() {
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
          <h1 className="text-lg font-black text-[#001A41]">Tentang & Privasi</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
        
        {/* APP BRAND INTRO BRANDING */}
        <div className="flex flex-col items-center text-center px-2">
          {/* Mock Logo Topi Wisuda Univora Orange-Navy */}
          <div className="h-16 w-16 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center shadow-sm p-2 relative overflow-hidden">
            <div className="w-10 h-6 bg-[#001A41] rounded-sm transform -rotate-12 relative flex items-center justify-center">
              <div className="w-2 h-2 bg-amber-500 rounded-full absolute -bottom-1 right-2"></div>
            </div>
            <div className="w-8 h-4 bg-[#FA5A15] rounded-b-full mt-1"></div>
          </div>
          
          <h3 className="text-xs font-black text-[#001A41] mt-3">Tentang Univora</h3>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mt-1.5">
            Memberdayakan komunitas kampus dengan menjembatani kesenjangan antara mahasiswa yang lapar dan pengalaman kuliner lokal terbaik. Kami membuat kehidupan kampus lebih lezat, satu demi satu hidangan.
          </p>
        </div>

        {/* PRIVACY POLICY SUB CONTAINER */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
          <h4 className="text-xs font-black text-[#001A41] flex items-center gap-1.5 border-b border-gray-50 pb-2">
            <span>📜</span> Kebijakan Privasi
          </h4>
          
          <div className="space-y-3 text-[11px] text-gray-500 font-medium leading-relaxed">
            <div>
              <p className="font-bold text-[#001A41]">1. Data yang Kami Kumpulkan</p>
              <p className="mt-0.5">Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat Anda membuat akun, seperti referensi diet Anda. Kami juga mengumpulkan data lokasi untuk menampilkan pilihan tempat makan yang relevan dengan lokasi kampus spesifik Anda.</p>
            </div>

            <div>
              <p className="font-bold text-[#001A41]">2. Cara Kami Menggunakannya</p>
              <p className="mt-0.5">Data Anda digunakan terutama untuk mempersonalisasi pengalaman penemuan makanan Anda. Ini termasuk menyesuaikan rekomendasi, memberi tahu Anda tentang penawaran makan khusus kampus, dan meningkatkan layanan navigasi kami. Kami tidak menjual data pribadi Anda kepada pihak ketiga.</p>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-gray-50">
            <button className="text-xs font-black text-[#FA5A15] hover:underline cursor-pointer flex items-center justify-center mx-auto gap-1">
              <span>Baca Selengkapnya</span>
              <span className="text-[9px]">🔗</span>
            </button>
            
            {/* Share and Web Icons */}
            <div className="flex justify-center gap-4 mt-3 text-gray-400 text-xs">
              <span className="cursor-pointer hover:text-[#001A41]">🌐</span>
              <span className="cursor-pointer hover:text-[#001A41]">🔗</span>
            </div>
          </div>
        </div>

      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}