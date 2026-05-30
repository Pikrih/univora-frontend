import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

export default function Profile() {
  const navigate = useNavigate();

  // Baca user dari localStorage
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Fetch data terbaru dari server setiap kali halaman dibuka
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    axios.get(`https://univora-backend-production.up.railway.app/api/users/${user.id}`)
      .then(res => {
        if (res.data.success) {
          const fresh = res.data.data;
          setUser(fresh);
          // Update localStorage agar halaman lain juga dapat data terbaru
          localStorage.setItem('user', JSON.stringify(fresh));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    if (window.confirm('Apakah kamu yakin ingin keluar dari Univora?')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
      navigate('/login');
    }
  };

  // Avatar: pakai foto_profil dari DB, fallback ke inisial nama
  const avatarUrl = user?.foto_profil || null;
  const inisial   = (user?.nama_lengkap || 'U').charAt(0).toUpperCase();

  if (!user?.id) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center pb-24">
        <span className="text-4xl mb-3">🔒</span>
        <p className="text-sm font-black text-[#001A41] mb-1">Kamu belum login</p>
        <button onClick={() => navigate('/login')} className="mt-4 bg-[#FA5A15] text-white text-xs font-black px-6 py-3 rounded-2xl">Login Sekarang</button>
        <BottomNav activeTab="profile" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased relative pb-24 overflow-hidden">

      {/* HEADER */}
      <div className="bg-white px-4 py-4 flex items-center justify-between shrink-0 z-10 border-b border-gray-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home')} className="text-[#001A41] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-lg font-black text-[#001A41]">Profil</h1>
        </div>
      </div>

      {/* KONTEN */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* PROFILE CARD */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full overflow-hidden bg-orange-100 border-2 border-white shadow-md flex items-center justify-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-[#FA5A15]">{inisial}</span>
            )}
          </div>

          {loading ? (
            <div className="mt-4 h-5 w-32 bg-gray-100 rounded-lg animate-pulse mx-auto" />
          ) : (
            <>
              <h2 className="text-xl font-black text-[#001A41] mt-4 tracking-tight">
                {user.nama_lengkap || '—'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">{user.email}</p>
              {user.nomor_telepon && (
                <p className="text-xs text-gray-400 font-medium mt-0.5">{user.nomor_telepon}</p>
              )}
              {/* Badge role */}
              <span className={`mt-2 px-3 py-0.5 rounded-full text-[10px] font-black ${
                user.role === 'Admin'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-orange-50 text-[#FA5A15]'
              }`}>
                {user.role || 'Mahasiswa'}
              </span>
            </>
          )}

          <button
            onClick={() => navigate('/edit-profile')}
            className="mt-4 px-8 py-2 bg-[#9A4200] hover:bg-[#803700] text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Edit Profil
          </button>
        </div>

        {/* KONTRIBUSI */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-gray-400 tracking-wider uppercase px-1">Kontribusi</h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <button onClick={() => navigate('/my-reviews')} className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">★</div>
                <span className="text-xs font-bold text-[#001A41]">Ulasan & Rating Saya</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => navigate('/submission-status')} className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 text-xs">📋</div>
                <span className="text-xs font-bold text-[#001A41]">Status Pengajuan Tempat</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>

        {/* PENGATURAN */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black text-gray-400 tracking-wider uppercase px-1">Pengaturan & Keamanan</h3>
          <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <button onClick={() => navigate('/change-password')} className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-xs">🔒</div>
                <span className="text-xs font-bold text-[#001A41]">Ubah Kata Sandi</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => navigate('/help-center')} className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-xs">❓</div>
                <span className="text-xs font-bold text-[#001A41]">Pusat Bantuan & Hubungi Kami</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
            <button onClick={() => navigate('/about-privacy')} className="w-full px-4 py-4 flex items-center justify-between text-left cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500 text-xs">📄</div>
                <span className="text-xs font-bold text-[#001A41]">Tentang & Privasi</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-300"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
        </div>

        {/* TOMBOL KELUAR */}
        <button
          onClick={handleLogout}
          className="w-full bg-white hover:bg-red-50/40 text-red-500 font-bold py-3.5 rounded-2xl text-xs transition border border-gray-100 flex items-center justify-center gap-2 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          <span>Keluar Akun</span>
        </button>

      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
