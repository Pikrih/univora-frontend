import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

// ── Helpers ────────────────────────────────────────────────────────────────
const formatJam = (jam) => jam ? jam.replace(':', '.') : '';

const hitungStatusBuka = (jamBuka, jamTutup) => {
  if (!jamBuka || !jamTutup) return { buka: true, label: 'Buka' };
  const now = new Date();
  const wibMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 7 * 60) % (24 * 60);
  const [bH, bM] = jamBuka.split(':').map(Number);
  const [tH, tM] = jamTutup.split(':').map(Number);
  const bukaTotal = bH * 60 + bM, tutupTotal = tH * 60 + tM;
  const buka = bukaTotal <= tutupTotal
    ? wibMinutes >= bukaTotal && wibMinutes < tutupTotal
    : wibMinutes >= bukaTotal || wibMinutes < tutupTotal;
  return { buka, label: buka ? 'Buka' : 'Tutup' };
};

export default function Favorites() {
  const navigate = useNavigate();
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const [favorites, setFavorites]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [removing, setRemoving]     = useState(null); // id yang sedang dihapus
  const [toast, setToast]           = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchFavorites = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const res = await axios.get(`https://univora-backend-production.up.railway.app/api/favorites?user_id=${user.id}`);
      if (res.data.success) setFavorites(res.data.data);
    } catch { showToast('Gagal memuat favorit. Cek koneksi.', 'error'); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { fetchFavorites(); }, [fetchFavorites]);

  // Guard: harus login
  if (!user?.id) {
    return (
      <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased flex flex-col items-center justify-center p-8 pb-24 text-center">
        <span className="text-4xl mb-3">🔒</span>
        <h2 className="text-sm font-black text-[#001A41] mb-1">Kamu belum login</h2>
        <p className="text-xs text-gray-400 font-medium mb-5">Login dulu untuk menyimpan tempat makan favorit kamu.</p>
        <button onClick={() => navigate('/login')}
          className="bg-[#FA5A15] text-white text-xs font-black px-6 py-3 rounded-2xl shadow-md"
        >Login Sekarang</button>
        <BottomNav activeTab="favorites" />
      </div>
    );
  }

  const handleGoToDetail = (id) => { localStorage.setItem('selected_place_id', id); navigate('/detail'); };

  const handleRemove = async (e, place) => {
    e.stopPropagation();
    setRemoving(place.id);
    try {
      const res = await axios.post('https://univora-backend-production.up.railway.app/api/favorites/toggle', {
        user_id: user.id, tempat_makan_id: place.id,
      });
      if (res.data.success && !res.data.is_favorit) {
        setFavorites(prev => prev.filter(f => f.id !== place.id));
        showToast(`"${place.nama}" dihapus dari favorit.`, 'remove');
      }
    } catch { showToast('Gagal menghapus favorit.', 'error'); }
    finally { setRemoving(null); }
  };

  const filtered = favorites.filter(f =>
    !searchQuery.trim() ||
    f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.alamat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased relative pb-28">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 inset-x-4 z-50 max-w-md mx-auto py-2.5 px-4 rounded-2xl text-xs font-bold text-center shadow-xl transition-all ${
          toast.type === 'remove' ? 'bg-gray-700 text-white' :
          toast.type === 'error'  ? 'bg-red-500 text-white' :
                                    'bg-[#001A41] text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-[#001A41] text-white px-5 pt-10 pb-7 rounded-b-[2.5rem] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Koleksi Kamu</p>
            <h1 className="text-lg font-black tracking-tight leading-tight mt-0.5">
              Tempat Makan<br />Favorit Kamu
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-[#FA5A15]">{favorites.length}</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tersimpan</p>
          </div>
        </div>

        {/* Search dalam favorit */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 text-xs">🔍</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari di favorit kamu..."
            className="w-full bg-white text-[#001A41] placeholder-gray-400 text-xs font-medium rounded-2xl pl-10 pr-10 py-3 focus:outline-none shadow-inner"
          />
          {searchQuery && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 text-xs font-black cursor-pointer"
            >✕</button>
          )}
        </div>
      </div>

      <div className="px-5 mt-5">

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-40 w-full bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>

        ) : favorites.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🤍</span>
            </div>
            <h3 className="text-sm font-black text-[#001A41] mb-1">Belum ada favorit</h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6 max-w-xs">
              Temukan tempat makan yang kamu suka, lalu tekan <strong>❤️</strong> di halaman detailnya untuk menyimpan ke sini.
            </p>
            <button onClick={() => navigate('/home')}
              className="bg-[#FA5A15] text-white text-xs font-black px-6 py-3 rounded-2xl shadow-md hover:bg-orange-600 transition"
            >Jelajahi Tempat Makan</button>
          </div>

        ) : filtered.length === 0 ? (
          /* Tidak ada hasil search */
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
            <span className="text-2xl">🔍</span>
            <p className="text-xs font-bold text-gray-400 mt-2">Tidak ada hasil untuk "{searchQuery}"</p>
          </div>

        ) : (
          <div className="space-y-3.5">
            {/* Header info */}
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-gray-400">
                {searchQuery ? `${filtered.length} hasil ditemukan` : `${favorites.length} tempat makan tersimpan`}
              </p>
              <p className="text-[10px] text-gray-300 font-medium">Terbaru dulu</p>
            </div>

            {/* Kartu favorit */}
            {filtered.map(place => {
              const statusInfo = hitungStatusBuka(place.jam_buka, place.jam_tutup);
              const isRemoving = removing === place.id;
              const rating = place.rating ? parseFloat(place.rating).toFixed(1) : null;

              return (
                <div
                  key={place.id}
                  onClick={() => handleGoToDetail(place.id)}
                  className={`bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:scale-[1.01] transition duration-200 ${isRemoving ? 'opacity-50' : ''}`}
                >
                  {/* Banner */}
                  <div className="h-44 w-full bg-gray-100 relative">
                    <img
                      src={place.banner_img && place.banner_img !== 'default_warung.jpg'
                        ? place.banner_img
                        : 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500'}
                      alt={place.nama}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge Buka/Tutup */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm backdrop-blur-xs ${
                      statusInfo.buka ? 'bg-white/90 text-emerald-600' : 'bg-white/90 text-red-500'
                    }`}>
                      {statusInfo.label}
                    </span>
                    {/* Tombol hapus favorit */}
                    <button
                      onClick={(e) => handleRemove(e, place)}
                      disabled={isRemoving}
                      className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition cursor-pointer"
                      title="Hapus dari favorit"
                    >
                      {isRemoving
                        ? <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        : <span className="text-xs">❤️</span>}
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-[#001A41] tracking-tight">{place.nama}</h4>
                        <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate">{place.alamat}</p>
                      </div>
                      {rating && parseFloat(rating) > 0 && (
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-black text-amber-700 shrink-0">
                          <span>★</span><span>{rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Jam operasional */}
                    {place.jam_buka && place.jam_tutup && (
                      <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                        🕐 {formatJam(place.jam_buka)} – {formatJam(place.jam_tutup)} WIB
                      </p>
                    )}

                    <div className="border-t border-gray-50 my-3" />

                    <div className="flex items-center justify-between text-[10px]">
                      <span className="bg-orange-50 text-[#FA5A15] font-bold px-2 py-0.5 rounded-md">{place.kategori}</span>
                      <span className="font-black text-[#001A41]">
                        Rp {place.harga_min?.toLocaleString('id-ID')} – {place.harga_max?.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {/* Tanggal disimpan */}
                    <p className="text-[10px] text-gray-300 font-medium mt-2">
                      Disimpan {new Date(place.favorit_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav activeTab="favorites" />
    </div>
  );
}
