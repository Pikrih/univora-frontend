import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function RatingForm() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(0); // State untuk jumlah bintang
  const [review, setReview] = useState('');
  const [hover, setHover] = useState(0);

const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert("Pilih rating bintang terlebih dahulu ya!");
    
    // Ubah navigasi ke halaman sukses
    navigate('/review-success'); 
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 font-sans antialiased">
      
      {/* 1. TOP NAVBAR */}
      <div className="bg-white px-4 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/detail')} className="text-[#001A41]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-xl font-black text-[#001A41]">Univora</h1>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6">
        {/* CONTAINER FORM PUTIH */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          
          {/* Header Judul */}
          <div className="mb-8">
            <h2 className="text-xl font-black text-[#001A41] flex items-center gap-2">
              Beri Ulasan Kamu <span className="text-lg">🍴</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: INTERACTIVE RATING BINTANG */}
            <div className="text-center">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Berikan Rating</p>
              <div className="flex justify-center gap-1">
                {[...Array(5)].map((star, index) => {
                  index += 1;
                  return (
                    <button
                      type="button"
                      key={index}
                      className={`text-4xl transition-colors duration-200 cursor-pointer ${
                        index <= (hover || rating) ? "text-amber-400" : "text-gray-200"
                      }`}
                      onClick={() => setRating(index)}
                      onMouseEnter={() => setHover(index)}
                      onMouseLeave={() => setHover(rating)}
                    >
                      <span className="drop-shadow-sm">★</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: UPLOAD FOTO (Dashed Box) */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Unggah Foto (Opsional)</p>
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 cursor-pointer hover:bg-gray-100 transition group">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <span className="text-2xl mb-1 opacity-40 group-hover:opacity-100 transition">📷</span>
                  <p className="text-[9px] font-bold text-gray-400 text-center px-2">Tambah Foto Makanan</p>
                </div>
                <input type="file" className="hidden" />
              </label>
            </div>

            {/* SECTION 3: DETAIL ULASAN (Textarea) */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Detail Ulasan</p>
              <textarea
                rows="4"
                placeholder="Tulis ulasan jujur kamu..."
                className="w-full rounded-2xl bg-gray-50 border border-gray-100 p-4 text-xs font-medium text-gray-700 focus:outline-none focus:border-[#001A41] transition"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              ></textarea>
            </div>

            {/* TOMBOL KIRIM ULASAN (Navy Button) */}
            <button
              type="submit"
              className="w-full bg-[#001A41] hover:bg-[#00265F] text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-blue-900/10 text-xs transition cursor-pointer"
            >
              <span>Kirim Ulasan</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 rotate-45">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>

            {/* INFO MODERASI FOOTER */}
            <div className="flex gap-2.5 items-start bg-blue-50/50 p-3 rounded-xl">
              <span className="text-xs">ℹ️</span>
              <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                Setiap ulasan akan melalui proses moderasi admin untuk menjaga kualitas komunitas Univora. Ulasan yang mengandung kata kasar atau promosi akan dihapus.
              </p>
            </div>

          </form>
        </div>
      </div>

      {/* BOTTOM NAV (Stay Visible as per Figma) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 py-3 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-md mx-auto flex justify-around items-center px-4">
          <button onClick={() => navigate('/home')} className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[9px] font-bold">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            <span className="text-[9px] font-bold">Favorite</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer">
            <div className="bg-[#001A41] text-white p-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-[9px] font-bold text-[#001A41]">Add Spot</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[9px] font-bold">Profile</span>
          </button>
        </div>
      </div>

    </div>
  );
}