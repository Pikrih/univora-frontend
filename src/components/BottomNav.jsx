import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation(); // Digunakan untuk mendeteksi halaman mana yang sedang dibuka

  // Mengecek apakah halaman aktif saat ini cocok dengan route tertentu
  const isHomeActive = location.pathname === '/home';
  const isFavoriteActive = location.pathname === '/favorites';
  const isAddSpotActive = location.pathname === '/add-spot';
  const isProfileActive = location.pathname === '/profile';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2.5 flex items-center justify-between z-30 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] rounded-t-3xl">
      <div className="w-full max-w-md mx-auto flex items-center justify-between">
        
        {/* 1. TOMBOL HOME */}
        <button 
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 transition-all duration-200 cursor-pointer ${
            isHomeActive 
              ? 'bg-[#FA5A15] text-white px-4 py-1.5 rounded-2xl font-black text-xs shadow-md shadow-orange-500/20' 
              : 'text-[#001A41] font-bold text-[11px]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          {!isHomeActive && <span>Home</span>}
        </button>

        {/* 2. TOMBOL FAVORITE (Sekarang Otomatis Berubah Oranye Kalau Aktif) */}
        <button 
          onClick={() => navigate('/favorites')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 transition-all duration-200 cursor-pointer ${
            isFavoriteActive 
              ? 'bg-[#FA5A15] text-white px-4 py-1.5 rounded-2xl font-black text-xs shadow-md shadow-orange-500/20' 
              : 'text-[#001A41] font-bold text-[11px]'
          }`}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill={isFavoriteActive ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            strokeWidth={2.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
          {!isFavoriteActive && <span>Favorite</span>}
        </button>

        {/* 3. TOMBOL ADD SPOT */}
        <button 
          onClick={() => navigate('/add-spot')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 transition-all duration-200 cursor-pointer ${
            isAddSpotActive 
              ? 'bg-[#FA5A15] text-white px-4 py-1.5 rounded-2xl font-black text-xs shadow-md shadow-orange-500/20' 
              : 'text-[#001A41] font-bold text-[11px]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {!isAddSpotActive && <span>Add Spot</span>}
        </button>

        {/* 4. TOMBOL PROFILE */}
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1 min-w-[64px] py-1 transition-all duration-200 cursor-pointer ${
            isProfileActive 
              ? 'bg-[#FA5A15] text-white px-4 py-1.5 rounded-2xl font-black text-xs shadow-md shadow-orange-500/20' 
              : 'text-[#001A41] font-bold text-[11px]'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          {!isProfileActive && <span>Profile</span>}
        </button>

      </div>
    </div>
  );
}