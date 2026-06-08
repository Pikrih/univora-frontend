import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

export default function HelpCenter() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { id: 1, q: "Bagaimana cara menambah tempat makan baru?", a: "Anda bisa masuk ke menu 'Add Spot' di bar navigasi bawah, lalu isi detail nama kuliner, alamat, dan deskripsi menu dengan lengkap." },
    { id: 2, q: "Masalah Akun", a: "Jika mengalami kendala login atau lupa kata sandi, silakan ubah melalui menu pengaturan keamanan akun atau hubungi admin via WhatsApp." },
    { id: 3, q: "Keamanan Pembayaran", a: "Univora tidak memungut biaya apapun bagi mahasiswa. Seluruh fitur pencarian dan kontribusi ulasan bersifat gratis." }
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
          <h1 className="text-lg font-black text-[#001A41]">Pusat Bantuan</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
        
        {/* ACCORDION FAQ */}
        <div className="space-y-2">
          <h2 className="text-base font-black text-[#001A41]">Pusat Bantuan</h2>
          <p className="text-[11px] text-gray-400 font-medium">Temukan jawaban cepat untuk pertanyaan umum seputar makan di kampus.</p>
          
          <div className="space-y-2 pt-1">
            {faqs.map((f) => (
              <div key={f.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                <button 
                  onClick={() => setOpenFaq(openFaq === f.id ? null : f.id)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left font-bold text-xs text-[#001A41] cursor-pointer"
                >
                  <span>{f.q}</span>
                  <span className="text-gray-400 text-[10px]">{openFaq === f.id ? '▲' : '▼'}</span>
                </button>
                {openFaq === f.id && (
                  <div className="px-4 pb-3 text-[11px] text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-2 bg-gray-50/40">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* HUBUNGI KAMI FORM */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-3">
          <h3 className="text-sm font-black text-[#001A41]">Hubungi Kami</h3>
          
          <div>
            <label className="block text-[10px] text-gray-400 font-bold mb-1">Subjek</label>
            <select className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none">
              <option>Pertanyaan Umum</option>
              <option>Kendala Bug Aplikasi</option>
              <option>Kritik & Saran</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-gray-400 font-bold mb-1">Pesan</label>
            <textarea placeholder="Jelaskan masalah Anda secara detail..." rows={3} className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none placeholder-gray-300 resize-none"></textarea>
          </div>

          <button onClick={() => alert('Pesan Anda berhasil dikirim ke tim Univora!')} className="w-full bg-[#FA5A15] hover:bg-orange-600 text-white font-black py-3 rounded-xl text-xs shadow-sm cursor-pointer transition">
            Kirim Pesan
          </button>
        </div>

        {/* DIRECT SOCIAL CHANNEL */}
        <div className="space-y-2">
          <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3">
              <span className="text-base bg-orange-50 p-2 rounded-xl">💬</span>
              <div>
                <h4 className="text-xs font-black text-[#001A41]">Dukungan WhatsApp</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Tersedia 09:00 - 18:00</p>
              </div>
            </div>
            <span className="text-gray-300 text-xs">▶</span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
            <div className="flex items-center gap-3">
              <span className="text-base bg-blue-50 p-2 rounded-xl">✉️</span>
              <div>
                <h4 className="text-xs font-black text-[#001A41]">Email Kami</h4>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Balasan dalam 24 jam</p>
              </div>
            </div>
            <span className="text-gray-300 text-xs">▶</span>
          </div>
        </div>

      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}