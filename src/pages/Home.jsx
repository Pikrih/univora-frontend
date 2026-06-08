import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import axios from 'axios';

// ── Haversine distance (km) ───────────────────────────────────
const haversine = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
};

// ── Helper: format jam "08:00" → "08.00" (lebih rapi untuk display) ──
const formatJam = (jam) => jam ? jam.replace(':', '.') : '';

// ── Helper: Haversine — hitung jarak (km) antara dua koordinat ──
const hitungJarak = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// ── Helper: format jarak ke label singkat ──
const formatJarak = (km) => {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// ── Helper: hitung status buka/tutup dari jam di sisi klien ──
const hitungStatusBuka = (jamBuka, jamTutup) => {
  if (!jamBuka || !jamTutup) return { buka: true, label: 'Buka' };

  const now = new Date();
  const wibMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 7 * 60) % (24 * 60);

  const [bH, bM] = jamBuka.split(':').map(Number);
  const [tH, tM] = jamTutup.split(':').map(Number);
  const bukaTotal  = bH * 60 + bM;
  const tutupTotal = tH * 60 + tM;

  let buka;
  if (bukaTotal <= tutupTotal) {
    buka = wibMinutes >= bukaTotal && wibMinutes < tutupTotal;
  } else {
    // Lintas tengah malam
    buka = wibMinutes >= bukaTotal || wibMinutes < tutupTotal;
  }

  return { buka, label: buka ? 'Buka' : 'Tutup' };
};

export default function Home() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]           = useState('');
  const [isCategoryOpen, setIsCategoryOpen]     = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Semua Kategori');
  const [activeFilter, setActiveFilter]         = useState(null); // null = tidak ada filter aktif
  const [dataKuliner, setDataKuliner]           = useState([]);
  const [isSearching, setIsSearching]           = useState(false);
  const [masterKategori, setMasterKategori]     = useState([]);

  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const [favoritIds, setFavoritIds] = useState(new Set()); // set of tempat_makan id yang difavoritkan
  const [favTogglingId, setFavTogglingId] = useState(null);

  const campusName = localStorage.getItem('selected_university_name') || 'Kampus Kamu';
  const debounceTimer = useRef(null);
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }

  useEffect(() => {
    axios.get('http://localhost:5000/api/kategori')
      .then(res => { if (res.data.success) setMasterKategori(res.data.data); })
      .catch(() => {});
  }, []);

  // ── Minta izin GPS sekali saat halaman dimuat ──
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {} // silent jika ditolak
    );
  }, []);

  const fetchPlacesData = useCallback(async (currentSearch, currentCategory) => {
    const universityId = localStorage.getItem('selected_university_id');
    if (!universityId) return;

    let url = `http://localhost:5000/api/places?university_id=${universityId}`;
    if (currentCategory && currentCategory !== 'Semua Kategori') {
      url += `&category=${encodeURIComponent(currentCategory)}`;
    }
    if (currentSearch && currentSearch.trim() !== '') {
      url += `&search=${encodeURIComponent(currentSearch.trim())}`;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(url);
      if (response.data.success) setDataKuliner(response.data.data);
    } catch (err) {
      console.error('Gagal mengambil data kuliner:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Fetch semua id favorit user (untuk render icon hati)
  const fetchFavoritIds = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/favorites?user_id=${user.id}`);
      if (res.data.success) setFavoritIds(new Set(res.data.data.map(f => f.id)));
    } catch { /* silent */ }
  }, [user?.id]);

  useEffect(() => { fetchFavoritIds(); }, [fetchFavoritIds]);

  const handleToggleFavorit = async (e, placeId) => {
    e.stopPropagation();
    if (!user?.id) { navigate('/login'); return; }
    setFavTogglingId(placeId);
    try {
      const res = await axios.post('http://localhost:5000/api/favorites/toggle', { user_id: user.id, tempat_makan_id: placeId });
      if (res.data.success) {
        setFavoritIds(prev => {
          const next = new Set(prev);
          res.data.is_favorit ? next.add(placeId) : next.delete(placeId);
          return next;
        });
      }
    } catch { /* silent */ }
    finally { setFavTogglingId(null); }
  };

  // Debounce 400ms untuk search
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPlacesData(searchQuery, selectedCategory), 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  // Langsung fetch saat kategori berubah
  useEffect(() => { fetchPlacesData(searchQuery, selectedCategory); }, [selectedCategory]);

  const handleGoToDetail = (id) => { localStorage.setItem('selected_place_id', id); navigate('/detail'); };

  const categories = ['Semua Kategori', ...masterKategori.map(k => k.nama)];

  // ── Sort & hitung jarak berdasarkan activeFilter ──────────────────────────
  const sortedKuliner = [...dataKuliner].map(spot => {
    const km = userLocation && spot.latitude && spot.longitude
      ? haversine(userLocation.lat, userLocation.lng, spot.latitude, spot.longitude)
      : null;
    return { ...spot, jarak_km: km };
  }).sort((a, b) => {
    if (activeFilter === 'Rating Tertinggi') {
      return (b.avg_rating || 0) - (a.avg_rating || 0) || (b.review_count || 0) - (a.review_count || 0);
    }
    if (activeFilter === 'Terdekat') {
      if (a.jarak_km !== null && b.jarak_km !== null) {
        return parseFloat(a.jarak_km) - parseFloat(b.jarak_km);
      }
      // Tempat tanpa koordinat ditaruh paling bawah
      if (a.jarak_km !== null) return -1;
      if (b.jarak_km !== null) return 1;
    }
    return 0; // null = urutan dari backend (terbaru)
  });

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased relative pb-24">

      {/* TOP BANNER */}
      <div className="bg-[#001A41] text-white px-5 pt-8 pb-6 rounded-b-[2.5rem] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Lokasi Kamu</p>
            <h2 className="text-xs font-black flex items-center gap-1 mt-0.5 cursor-pointer" onClick={() => navigate('/select-campus')}>
              <span>{campusName}</span>
              <span className="text-[10px] text-orange-400 underline ml-1">(Ganti)</span>
            </h2>
          </div>
          <div
            className="h-8 w-8 rounded-full bg-orange-100 overflow-hidden border-2 border-white/20 cursor-pointer flex items-center justify-center shrink-0"
            onClick={() => navigate('/profile')}
          >
            {user?.foto_profil ? (
              <img src={user.foto_profil} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-[#FA5A15]">
                {(user?.nama_lengkap || 'U').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <h1 className="text-lg font-black leading-tight tracking-tight mb-4">Mau makan <br />di mana hari ini?</h1>

        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 text-xs">
            {isSearching ? '⏳' : '🔍'}
          </span>
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ayam bakar, burjo, kafe..."
            className="w-full bg-white text-[#001A41] placeholder-gray-400 text-xs font-medium rounded-2xl pl-10 pr-10 py-3.5 focus:outline-none shadow-inner"
          />
          {searchQuery.length > 0 && (
            <button type="button" onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 text-xs font-black cursor-pointer"
            >✕</button>
          )}
        </div>
      </div>

      {/* PILIHAN KATEGORI */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider">Kategori Kuliner</h3>
          <button type="button" onClick={() => setIsCategoryOpen(true)} className="text-[11px] font-black text-[#FA5A15] hover:underline cursor-pointer">
            Lihat Semua
          </button>
        </div>
        <button type="button" onClick={() => setIsCategoryOpen(true)}
          className="w-full bg-white border border-gray-100 rounded-xl p-3.5 flex items-center justify-between shadow-sm cursor-pointer text-left"
        >
          <div className="flex items-center gap-2.5">
            <span className="text-sm bg-orange-50 p-1.5 rounded-lg">🍱</span>
            <span className="text-xs font-black text-[#001A41]">{selectedCategory}</span>
          </div>
          <span className="text-xs text-gray-400">▼</span>
        </button>
      </div>

      {/* DAFTAR TEMPAT MAKAN */}
      <div className="px-5 mt-6 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider">
            {searchQuery.trim() !== '' ? `Hasil: "${searchQuery}"` : 'Rekomendasi Untukmu'}
          </h3>
          <div className="flex gap-1.5 text-[10px] font-bold">
            {['Terdekat', 'Rating Tertinggi'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(isActive ? null : filter)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border transition cursor-pointer ${
                    isActive
                      ? 'bg-[#001A41] text-white border-[#001A41]'
                      : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                  }`}
                >
                  <span>{filter}</span>
                  {isActive && (
                    <span className="ml-0.5 text-white/70 hover:text-white font-black leading-none">✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading skeleton */}
        {isSearching ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                <div className="h-44 w-full bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-2/3" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedKuliner.length > 0 ? (
          sortedKuliner.map((spot) => {
            // Hitung status buka di sisi klien sebagai fallback
            const statusInfo = spot.jam_buka
              ? hitungStatusBuka(spot.jam_buka, spot.jam_tutup)
              : { buka: spot.status_buka !== false, label: spot.status_label || 'Buka' };

            // Rating real dari database
            const ratingDisplay = spot.avg_rating && spot.avg_rating > 0
              ? spot.avg_rating.toFixed(1)
              : null; // null = belum ada ulasan

            return (
              <div key={spot.id} onClick={() => handleGoToDetail(spot.id)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col cursor-pointer hover:scale-[1.01] transition duration-200"
              >
                {/* Gambar + Badge Status */}
                <div className="h-44 w-full bg-gray-100 relative">
                  <img
                    src={spot.banner_img && spot.banner_img !== 'default_warung.jpg'
                      ? spot.banner_img
                      : 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=500'}
                    alt={spot.nama} className="w-full h-full object-cover"
                  />
                  {/* Badge Buka / Tutup */}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm backdrop-blur-xs ${
                    statusInfo.buka
                      ? 'bg-white/90 text-emerald-600'
                      : 'bg-white/90 text-red-500'
                  }`}>
                    {statusInfo.label}
                  </span>
                  {/* Tombol Favorit */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleFavorit(e, spot.id)}
                    disabled={favTogglingId === spot.id}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                      favoritIds.has(spot.id) ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-400 hover:text-red-400'
                    }`}
                    title={favoritIds.has(spot.id) ? 'Hapus dari favorit' : 'Tambah ke favorit'}
                  >
                    {favTogglingId === spot.id
                      ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      : <span className="text-xs">{favoritIds.has(spot.id) ? '❤️' : '🤍'}</span>
                    }
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black text-[#001A41] tracking-tight">{spot.nama}</h4>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">{spot.alamat}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {/* Rating real — hanya tampil jika ada ulasan */}
                      {ratingDisplay ? (
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] font-black text-amber-700">
                          <span>★</span>
                          <span>{ratingDisplay}</span>
                          <span className="font-medium text-amber-500 text-[9px] ml-0.5">({spot.review_count})</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-0.5 rounded-md text-[11px] font-medium text-gray-400">
                          <span>★</span>
                          <span>Baru</span>
                        </div>
                      )}
                      {/* Jarak dari user — tampil jika GPS aktif & koordinat ada */}
                      {spot.jarak_km !== null && (
                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">
                          📍 {formatJarak(spot.jarak_km)}
                        </span>
                      )}

                    </div>
                  </div>

                  {/* Jam Operasional */}
                  {spot.jam_buka && spot.jam_tutup && (
                    <p className="text-[10px] text-gray-400 font-medium mt-1.5">
                      🕐 {formatJam(spot.jam_buka)} – {formatJam(spot.jam_tutup)} WIB
                    </p>
                  )}

                  <div className="border-t border-gray-50 my-3"></div>

                  <div className="flex items-center justify-between text-[10px]">
                    {/* Chips kategori */}
                    <div className="flex flex-wrap gap-1">
                      {(spot.kategori_list && spot.kategori_list.length > 0
                        ? spot.kategori_list
                        : [spot.kategori]
                      ).map((k, i) => (
                        <span key={i} className="bg-orange-50 text-[#FA5A15] font-bold px-2 py-0.5 rounded-md">{k}</span>
                      ))}
                    </div>
                    <span className="text-gray-400 font-bold shrink-0 ml-2">
                      <strong className="text-[#001A41] font-black">
                        Rp {spot.harga_min?.toLocaleString('id-ID') || '10k'} – {spot.harga_max?.toLocaleString('id-ID') || '25k'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-6">
            <span className="text-2xl">🍽️</span>
            <p className="text-xs font-bold text-gray-400 mt-2">
              {searchQuery.trim() !== '' ? `Tidak ada hasil untuk "${searchQuery}"` : 'Tidak ada kuliner di sekitar kampus ini.'}
            </p>
            <p className="text-[10px] text-gray-300 font-medium mt-1">
              {searchQuery.trim() !== '' ? 'Coba kata kunci lain atau hapus filter kategori.' : 'Coba sesuaikan kata kunci atau kategori filter Anda.'}
            </p>
          </div>
        )}
      </div>

      {/* MODAL KATEGORI */}
      {isCategoryOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-[#001A41]">Pilih Kategori Kuliner</h3>
              <button type="button" onClick={() => setIsCategoryOpen(false)} className="text-gray-400 text-xs font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button key={cat} type="button"
                    onClick={() => { setSelectedCategory(cat); setIsCategoryOpen(false); }}
                    className={`w-full text-left px-5 py-3.5 text-xs font-bold flex items-center justify-between transition-all ${
                      isSelected ? 'text-[#FA5A15] bg-orange-50/30' : 'text-[#001A41] hover:bg-gray-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {isSelected && <span className="text-[#FA5A15] font-black">✓</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-4 border-t border-gray-50 bg-gray-50/50">
              <button type="button" onClick={() => setIsCategoryOpen(false)}
                className="w-full text-center text-xs font-bold py-3 text-gray-500 bg-gray-100 rounded-xl"
              >Kembali</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeTab="home" />
    </div>
  );
}
