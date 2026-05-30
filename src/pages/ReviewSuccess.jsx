import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ReviewSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased">
      
      {/* 1. TOP NAVBAR (Senada dengan Home & Detail) */}
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <h1 className="text-xl font-black text-[#001A41]">Univora</h1>
        <button className="text-[#001A41]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
          </svg>
        </button>
      </div>

      {/* 2. KONTEN UTAMA (Kartu Sukses) */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-md bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          
          {/* Ilustrasi Badge Bintang (Persis Figma) */}
          <div className="relative mb-8">
            {/* Lingkaran Background Besar */}
            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <span className="text-white text-4xl">★</span>
                </div>
            </div>
            {/* Floating Icon Jempol */}
            <div className="absolute -bottom-1 -left-2 bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white">
                <span className="text-sm">👍</span>
            </div>
            {/* Floating Icon Hati */}
            <div className="absolute top-0 -right-2 bg-[#001A41] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white">
                <span className="text-sm">🤍</span>
            </div>
          </div>

          {/* Teks Keberhasilan */}
          <h2 className="text-2xl font-black text-[#001A41] mb-3">
            Ulasan Berhasil Terkirim!
          </h2>
          <p className="text-sm text-gray-400 font-medium leading-relaxed px-2 mb-8">
            Terima kasih! Kontribusi Anda membantu mahasiswa lain menemukan tempat makan terbaik.
          </p>

          {/* Grid Foto Konten (Placeholder) */}
          <div className="grid grid-cols-2 gap-4 w-full mb-8">
            <div className="h-28 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50">
                <img src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200" alt="Kuliner" className="w-full h-full object-cover" />
            </div>
            <div className="h-28 bg-gray-100 rounded-2xl overflow-hidden border border-gray-50">
                <img src="https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=200" alt="Kuliner" className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Tombol Kembali ke Beranda */}
          <button 
            onClick={() => navigate('/home')}
            className="w-full bg-[#FA5A15] hover:bg-[#E04F10] text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-500/20 text-xs transition cursor-pointer"
          >
            Kembali ke Beranda
          </button>

        </div>

        {/* 3. SOCIAL PROOF FOOTER (Avatars Mahasiswa) */}
        <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-3">
                <img src="https://i.pravatar.cc/150?u=1" className="w-10 h-10 rounded-full border-4 border-gray-50" alt="user" />
                <img src="https://i.pravatar.cc/150?u=2" className="w-10 h-10 rounded-full border-4 border-gray-50" alt="user" />
                <img src="https://i.pravatar.cc/150?u=3" className="w-10 h-10 rounded-full border-4 border-gray-50" alt="user" />
                <div className="w-10 h-10 rounded-full bg-[#001A41] border-4 border-gray-50 flex items-center justify-center text-[10px] font-bold text-white">
                    +12
                </div>
            </div>
            <p className="text-xs font-bold text-gray-500">12 mahasiswa terbantu hari ini</p>
        </div>
      </div>
    </div>
  );
}