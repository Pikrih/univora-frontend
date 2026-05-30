import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AddReview() {
  const navigate = useNavigate();
  
  // --- STATE FORM ---
  const [rating, setRating] = useState(5);
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const placeId = localStorage.getItem('selected_place_id');

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!komentar.trim()) {
      setMessage("Komentar ulasan tidak boleh kosong!");
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const response = await axios.post('https://univora-backend-production.up.railway.app/api/reviews', {
        tempat_makan_id: placeId,
        user_id: user?.id,  // ← pakai user yang sedang login
        rating: rating,
        komentar: komentar,
        foto_ulasan: "" // Bisa dikosongkan dulu atau diisi URL dummy string
      });

      if (response.data.success) {
        alert("Terima kasih! Ulasan berhasil dikirim.");
        navigate(-1); // Kembali ke halaman detail tempat makan
      }
    } catch (error) {
      console.error("Gagal mengirim ulasan:", error);
      setMessage("Gagal terhubung ke server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased p-5 pb-24">
      
      {/* HEADER NAVIGASI */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="text-lg font-black text-[#001A41]"
        >
          ←
        </button>
        <h1 className="text-base font-black text-[#001A41]">Tulis Ulasan Kuliner</h1>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <form onSubmit={handleSubmitReview} className="space-y-5">
          
          {/* INFORMASI NOTIFIKASI ERROR */}
          {message && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center">
              ⚠ {message}
            </div>
          )}

          {/* 1. INPUT PILIHAN RATING BINTANG */}
          <div>
            <label className="text-xs font-black text-[#001A41] uppercase tracking-wider block mb-2">
              Berikan Rating Skor
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-2xl transition ${
                    star <= rating ? 'text-amber-400 scale-110' : 'text-gray-200'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 font-bold mt-1.5">Skor terpilih: {rating} dari 5 Bintang</p>
          </div>

          {/* 2. INPUT TEXT AREA KOMENTAR */}
          <div>
            <label className="text-xs font-black text-[#001A41] uppercase tracking-wider block mb-2">
              Tulis Komentar / Pengalaman Makan
            </label>
            <textarea
              rows="5"
              value={komentar}
              onChange={(e) => setKomentar(e.target.value)}
              placeholder="Bagaimana rasa makanannya? Apakah harganya ramah di kantong mahasiswa? Ceritakan di sini..."
              className="w-full border border-gray-100 rounded-2xl p-4 text-xs font-medium focus:outline-none focus:border-orange-400 bg-slate-50/50 resize-none placeholder-gray-400"
            ></textarea>
          </div>

          {/* TOMBOL SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className={`w-full text-center text-xs font-black py-4 text-white rounded-2xl shadow-md transition ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FA5A15] hover:bg-orange-600 cursor-pointer'
            }`}
          >
            {submitting ? 'Sedang Mengirim...' : 'Kirim Ulasan Sekarang'}
          </button>

        </form>
      </div>

    </div>
  );
}