import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function MyReviews() {
  const navigate = useNavigate();

  // Data dummy ulasan sesuai dengan gambar mockup figma
  const reviews = [
    {
      id: 1,
      tempat: "KatsuKai",
      tanggal: "20 Oktober 2023",
      rating: 4,
      teks: "Nasi katsu selalu juara! Porsinya pas buat mahasiswa dan harganya sangat bersahabat. Area duduknya sekarang lebih bersih dan nyaman sejak renovasi bulan lalu.",
      images: [
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=150&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=150&auto=format&fit=crop&q=80"
      ]
    },
    {
      id: 2,
      tempat: "Identix",
      tanggal: "15 Oktober 2023",
      rating: 5,
      teks: "Tempat terbaik buat ngerjain tugas sambil ngopi. Hazelnut Latte-nya konsisten rasanya. Baristanya juga ramah-ramah banget!",
      images: [
        "https://images.unsplash.com/photo-1541167760496-1628856ab772?w=150&auto=format&fit=crop&q=80"
      ]
    },
    {
      id: 3,
      tempat: "Kantin Klinik",
      tanggal: "02 Oktober 2023",
      rating: 3,
      teks: "Pelayanan cukup cepat untuk ukuran jam makan siang. Menu sehatnya variatif, cocok buat yang lagi diet. Hanya saja antriannya sering berantakan.",
      images: []
    }
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
          <h1 className="text-lg font-black text-[#001A41]">Ulasan & Rating Saya</h1>
        </div>
        <button className="text-[#001A41]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767a1.123 1.123 0 00-.417 1.03c.004.074.006.148.006.222 0 .074-.002.148-.006.222a1.123 1.123 0 00.417 1.03l1.003.767a1.125 1.125 0 01.26 1.43l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.216-.456a1.125 1.125 0 00-1.07.124c-.073.044-.146.087-.22.128-.332.183-.582.495-.644.869l-.214 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281a1.125 1.125 0 00-.646-.87c-.074-.04-.148-.083-.22-.127a1.124 1.124 0 00-1.074-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.43l1.003-.767a1.122 1.122 0 00.417-1.03c-.004-.074-.006-.148-.006-.222 0-.074.002-.148.006-.222a1.122 1.122 0 00-.417-1.03l-1.003-.767a1.125 1.125 0 01-.26-1.43l1.296-2.247a1.125 1.125 0 011.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.041.146-.084.218-.128.333-.183.582-.495.645-.869l.214-1.28z" />
          </svg>
        </button>
      </div>

      {/* DAFTAR ULASAN */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {reviews.map((rev) => (
          <div key={rev.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-[#001A41]">{rev.tempat}</h2>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">{rev.tanggal}</p>
              </div>
              {/* Render Bintang */}
              <div className="flex gap-0.5 text-xs">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < rev.rating ? "text-amber-500" : "text-gray-200"}>★</span>
                ))}
              </div>
            </div>
            
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              {rev.teks}
            </p>

            {/* Render Foto Makanan Jika Ada */}
            {rev.images.length > 0 && (
              <div className="flex gap-2 pt-1">
                {rev.images.map((img, idx) => (
                  <div key={idx} className="h-14 w-14 rounded-xl overflow-hidden bg-gray-50">
                    <img src={img} alt="review" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}