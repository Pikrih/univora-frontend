import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function LocationSettings() {
  const navigate = useNavigate();

  const nearbyCampuses = [
    { id: 1, nama: "Universitas Diponegoro", kota: "Semarang", img: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=100&auto=format&fit=crop&q=80" },
    { id: 2, nama: "Universitas Semarang", kota: "Semarang", img: "https://images.unsplash.com/photo-1562774053-701939374585?w=100&auto=format&fit=crop&q=80" },
    { id: 3, nama: "BINUS Semarang", kota: "Semarang", img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=100&auto=format&fit=crop&q=80" },
  ];

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
          <h1 className="text-lg font-black text-[#001A41]">Ganti Kampus & Kota Utama</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        
        {/* CURRENT SELECTION */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-gray-400 tracking-wider uppercase px-1">Your Selection</h3>
          <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-2.5">
            {/* Kota Utama */}
            <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl p-2.5 border border-gray-50">
              <div className="flex items-center gap-2.5">
                <span className="text-sm bg-blue-100 p-1.5 rounded-lg">📍</span>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Kota Utama</p>
                  <p className="text-xs font-black text-[#001A41]">Semarang</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#FA5A15] text-white font-black text-[10px] rounded-lg cursor-pointer">Change</button>
            </div>
            {/* Kampus Utama */}
            <div className="flex items-center justify-between bg-[#F8FAFC] rounded-xl p-2.5 border border-gray-50">
              <div className="flex items-center gap-2.5">
                <span className="text-sm bg-blue-100 p-1.5 rounded-lg">🎓</span>
                <div>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">Kampus</p>
                  <p className="text-xs font-black text-[#001A41]">UNNES</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-[#FA5A15] text-white font-black text-[10px] rounded-lg cursor-pointer">Change</button>
            </div>
          </div>
        </div>

        {/* NEARBY CAMPUSES */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-black text-gray-400 tracking-wider uppercase">Nearby Campuses</h3>
            <span className="text-[10px] text-gray-400 font-bold">3 Found</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            {nearbyCampuses.map((cam) => (
              <div key={cam.id} className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                  <img src={cam.img} alt={cam.nama} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#001A41]">{cam.nama}</h4>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5">{cam.kota}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE BUTTON */}
        <button onClick={() => navigate('/profile')} className="w-full bg-[#FA5A15] hover:bg-orange-600 text-white font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer">
          <span>Save Location</span>
          <span className="text-[10px]">💾</span>
        </button>

      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}