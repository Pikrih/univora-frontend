import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function SubmissionStatus() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Semua');

  const filters = ['Semua', 'Diproses', 'Disetujui', 'Ditolak'];

  const submissions = [
    {
      id: 1,
      nama: "Kantin Teknik",
      lokasi: "Fakultas Teknik, UNNES",
      tanggal: "12 Oct 2023",
      status: "Disetujui",
      icon: "🏪"
    },
    {
      id: 2,
      nama: "Burjoin",
      lokasi: "Patemon, Gunungpati, Semarang",
      tanggal: "25 Oct 2023",
      status: "Diproses",
      icon: "☕"
    },
    {
      id: 3,
      nama: "Warteg Kharisma",
      lokasi: "Jl. Banaran",
      tanggal: "05 Nov 2023",
      status: "Ditolak",
      icon: "🍴"
    },
    {
      id: 4,
      nama: "Burjo Titik Kumpul",
      lokasi: "Jl. Cempaka Sari",
      tanggal: "10 Nov 2023",
      status: "Disetujui",
      icon: "🧾"
    }
  ];

  // Menyaring data berdasarkan tab yang aktif
  const filteredSubmissions = submissions.filter(sub => 
    activeFilter === 'Semua' ? true : sub.status === activeFilter
  );

  // Helper styling untuk warna badge status
  const getStatusStyle = (status) => {
    if (status === 'Disetujui') return 'bg-green-50 text-green-600 border-green-100';
    if (status === 'Diproses') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-red-50 text-red-600 border-red-100';
  };

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
          <h1 className="text-lg font-black text-[#001A41]">Status Pengajuan Tempat</h1>
        </div>
        <button className="text-[#001A41]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.07.124c-.073.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.214 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87c-.074-.04-.148-.083-.22-.127a1.124 1.124 0 00-1.074-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03c-.004-.074-.006-.148-.006-.222 0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.041.146-.084.218-.128.333-.183.582-.495.645-.869l.214-1.28z" />
          </svg>
        </button>
      </div>

      {/* FILTER BUTTONS HORIZONTAL SLIDER */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto shrink-0 scrollbar-hide">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-1.5 rounded-full font-bold text-xs tracking-wide border transition cursor-pointer shrink-0 ${
              activeFilter === f 
                ? 'bg-[#001A41] text-white border-[#001A41]' 
                : 'bg-[#EAEFF5] text-gray-500 border-transparent'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* DAFTAR SUBMISSION */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {filteredSubmissions.map((sub) => (
          <div key={sub.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-base shrink-0">
                {sub.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-black text-[#001A41] truncate">{sub.nama}</h2>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border ${getStatusStyle(sub.status)}`}>
                    {sub.status}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{sub.lokasi}</p>
              </div>
            </div>

            <div className="border-t border-gray-50 my-3"></div>

            <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold">
              <span className="flex items-center gap-1">📅 {sub.tanggal}</span>
              <button className="text-[#001A41] hover:text-[#FA5A15] flex items-center gap-0.5 transition cursor-pointer">
                Detail <span className="text-[8px]">▶</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}