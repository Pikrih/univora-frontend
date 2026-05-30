import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Helpers ───────────────────────────────────────────────
const formatJam = (jam) => jam ? jam.replace(':', '.') : '';
const hitungStatusBuka = (jamBuka, jamTutup) => {
  if (!jamBuka || !jamTutup) return { buka: true, label: 'Buka Sekarang' };
  const now = new Date();
  const wibMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 7 * 60) % (24 * 60);
  const [bH, bM] = jamBuka.split(':').map(Number);
  const [tH, tM] = jamTutup.split(':').map(Number);
  const bukaTotal = bH * 60 + bM, tutupTotal = tH * 60 + tM;
  const buka = bukaTotal <= tutupTotal
    ? wibMinutes >= bukaTotal && wibMinutes < tutupTotal
    : wibMinutes >= bukaTotal || wibMinutes < tutupTotal;
  let sisaMenit = buka
    ? (tutupTotal > wibMinutes ? tutupTotal - wibMinutes : 24 * 60 - wibMinutes + tutupTotal)
    : (bukaTotal  > wibMinutes ? bukaTotal  - wibMinutes : 24 * 60 - wibMinutes + bukaTotal);
  const sisaJam = Math.floor(sisaMenit / 60), sisaMin = sisaMenit % 60;
  const sisaLabel = sisaJam > 0 ? `${sisaJam} jam ${sisaMin} menit lagi` : `${sisaMin} menit lagi`;
  return { buka, label: buka ? 'Buka Sekarang' : 'Tutup', sisa: buka ? `Tutup dalam ${sisaLabel}` : `Buka dalam ${sisaLabel}` };
};

// ── Haversine jarak ─────────────────────────────────────────────────────────
const hitungJarak = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

const formatJarak = (km) => {
  if (km === null) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

// ── Komponen peta Leaflet (OpenStreetMap, tanpa API key) ─────────────────────
function LeafletMap({ placeLat, placeLng, placeName, userLat, userLng }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    // Load Leaflet CSS jika belum ada
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS lalu init peta
    const initMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const L = window.L;

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker tempat makan (oranye)
      const iconTempat = L.divIcon({
        html: `<div style="background:#FA5A15;width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
        className: '', iconSize: [32, 32], iconAnchor: [16, 32],
      });
      const markerTempat = L.marker([placeLat, placeLng], { icon: iconTempat }).addTo(map);
      markerTempat.bindPopup(`<b>${placeName}</b><br><small>Tempat Makan</small>`).openPopup();

      if (userLat && userLng) {
        // Marker posisi user (biru)
        const iconUser = L.divIcon({
          html: `<div style="background:#3B82F6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.5)"></div>`,
          className: '', iconSize: [18, 18], iconAnchor: [9, 9],
        });
        L.marker([userLat, userLng], { icon: iconUser }).addTo(map)
          .bindPopup('<b>Posisi Kamu</b>');

        // Garis rute lurus user → tempat makan
        L.polyline([[userLat, userLng], [placeLat, placeLng]], {
          color: '#3B82F6', weight: 2.5, opacity: 0.7, dashArray: '8 6',
        }).addTo(map);

        // Fit bounds agar kedua marker terlihat
        const bounds = L.latLngBounds([[userLat, userLng], [placeLat, placeLng]]);
        map.fitBounds(bounds, { padding: [48, 48] });
      } else {
        map.setView([placeLat, placeLng], 16);
      }
    };

    if (window.L) {
      initMap();
    } else {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [placeLat, placeLng, userLat, userLng]);

  return <div ref={mapRef} style={{ height: '240px', width: '100%', borderRadius: '16px', zIndex: 0 }} />;
}

export default function FoodDetail() {
  const navigate  = useNavigate();
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // State galeri
  const [fotoGaleri, setFotoGaleri]           = useState([]);  // semua foto dari backend
  const [activeGaleriTab, setActiveGaleriTab] = useState('galeri'); // 'galeri' | 'menu'
  const [lightboxIdx, setLightboxIdx]         = useState(null); // index foto yang dibuka
  const [showUploadModal, setShowUploadModal] = useState(false);

  // State upload modal
  const [uploadFiles, setUploadFiles]     = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploadTipe, setUploadTipe]       = useState('galeri');
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  const placeId    = localStorage.getItem('selected_place_id');
  const placeIdInt = parseInt(placeId); // pre-parse sekali, dipakai di toggle & check
  const user       = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  // State favorit
  const [isFavorit, setIsFavorit]         = useState(false);
  const [favoritLoading, setFavoritLoading] = useState(false);
  const [favToast, setFavToast]           = useState(null); // { msg, type }

  // State GPS user & koordinat tempat makan
  const [userLocation, setUserLocation]       = useState(null); // { lat, lng }
  const [placeLocation, setPlaceLocation]     = useState(null); // { latitude, longitude, has_coords }
  const [gpsLoading, setGpsLoading]           = useState(true);
  const [showMapFull, setShowMapFull]         = useState(false);

  // Fetch detail tempat makan
  const fetchDetail = async () => {
    try {
      const res = await axios.get(`https://univora-backend-production.up.railway.app/api/places/${placeId}`);
      if (res.data.success) setDetailData(res.data.data);
      else setError('Gagal memuat detail tempat makan.');
    } catch { setError('Koneksi ke server gagal.'); }
    finally { setLoading(false); }
  };

  // Fetch galeri foto
  const fetchGaleri = async () => {
    if (!placeId) return;
    try {
      const res = await axios.get(`https://univora-backend-production.up.railway.app/api/places/${placeId}/photos`);
      if (res.data.success) setFotoGaleri(res.data.data);
    } catch { /* silent */ }
  };

  // Fetch koordinat tempat makan
  const fetchLocation = async () => {
    if (!placeId) return;
    try {
      const res = await axios.get(`https://univora-backend-production.up.railway.app/api/places/${placeId}/location`);
      if (res.data.success) setPlaceLocation(res.data.data);
    } catch { /* silent */ }
  };

  // Cek status favorit
  const fetchFavoritStatus = async () => {
    if (!user?.id || !placeIdInt || isNaN(placeIdInt)) return;
    try {
      const res = await axios.get(`https://univora-backend-production.up.railway.app/api/favorites/check?user_id=${user.id}&tempat_makan_id=${placeIdInt}`);
      if (res.data.success) setIsFavorit(res.data.is_favorit);
    } catch { /* silent */ }
  };

  // Toggle favorit
  const handleToggleFavorit = async () => {
    // Guard: harus login
    if (!user?.id) {
      setFavToast({ msg: '🔒 Login dulu untuk menyimpan favorit!', type: 'warn' });
      setTimeout(() => setFavToast(null), 2500);
      return;
    }
    // Guard: placeId harus valid
    if (!placeIdInt || isNaN(placeIdInt)) {
      setFavToast({ msg: 'ID tempat makan tidak valid.', type: 'warn' });
      setTimeout(() => setFavToast(null), 2500);
      return;
    }
    setFavoritLoading(true);
    try {
      const res = await axios.post('https://univora-backend-production.up.railway.app/api/favorites/toggle', {
        user_id:         user.id,
        tempat_makan_id: placeIdInt,
      });
      if (res.data.success) {
        setIsFavorit(res.data.is_favorit);
        setFavToast({
          msg:  res.data.is_favorit ? '❤️ Ditambahkan ke favorit!' : '💔 Dihapus dari favorit.',
          type: res.data.is_favorit ? 'add' : 'remove',
        });
      } else {
        // Backend berhasil dipanggil tapi mengembalikan success: false
        setFavToast({ msg: res.data.message || 'Gagal memperbarui favorit.', type: 'warn' });
      }
    } catch (err) {
      // Network error atau server error — tampilkan pesan asli
      const serverMsg = err.response?.data?.message;
      setFavToast({
        msg:  serverMsg || 'Gagal terhubung ke server. Cek koneksimu.',
        type: 'warn',
      });
    } finally {
      setFavoritLoading(false);
      setTimeout(() => setFavToast(null), 3000);
    }
  };

  useEffect(() => {
    if (!placeIdInt || isNaN(placeIdInt)) {
      setError('ID tempat makan tidak valid atau tidak ditemukan.');
      setLoading(false);
      return;
    }
    fetchDetail();
    fetchGaleri();
    fetchLocation();
    fetchFavoritStatus(); // aman: sudah ada guard user?.id di dalam fungsinya
  }, []);

  // Minta izin GPS user
  useEffect(() => {
    if (!navigator.geolocation) { setGpsLoading(false); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { timeout: 8000 }
    );
  }, []);

  // ── Upload handler ────────────────────────────────────────
  const handlePickFiles = (e) => {
    const files = Array.from(e.target.files);
    if (uploadFiles.length + files.length > 10) { alert('Maks 10 foto sekaligus.'); return; }
    setUploadFiles(prev => [...prev, ...files]);
    setUploadPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeUploadFile = (idx) => {
    setUploadFiles(prev  => prev.filter((_,i) => i !== idx));
    setUploadPreviews(prev => prev.filter((_,i) => i !== idx));
  };

  const handleUploadSubmit = async () => {
    if (!uploadFiles.length) { alert('Pilih minimal 1 foto.'); return; }
    setUploadLoading(true);
    const fd = new FormData();
    uploadFiles.forEach(f => fd.append('foto', f));
    fd.append('tipe',    uploadTipe);
    fd.append('user_id', user?.id ?? 1);
    try {
      const res = await axios.post(`https://univora-backend-production.up.railway.app/api/places/${placeId}/photos`, fd);
      if (res.data.success) {
        alert(res.data.message);
        setShowUploadModal(false);
        setUploadFiles([]); setUploadPreviews([]);
        fetchGaleri(); // refresh galeri
      }
    } catch (err) {
      alert('Gagal upload: ' + (err.response?.data?.message || 'Cek koneksi server.'));
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Filter foto berdasarkan tab ───────────────────────────
  const fotoFiltered = fotoGaleri.filter(f => f.tipe === activeGaleriTab);
  // Untuk lightbox: semua foto tab aktif
  const openLightbox = (idx) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);
  const prevPhoto = () => setLightboxIdx(i => (i - 1 + fotoFiltered.length) % fotoFiltered.length);
  const nextPhoto = () => setLightboxIdx(i => (i + 1) % fotoFiltered.length);

  // ── Render states ─────────────────────────────────────────
  if (loading) return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white flex items-center justify-center">
      <div className="text-center"><div className="animate-spin text-3xl mb-2">⏳</div>
      <p className="text-xs font-bold text-gray-400">Memuat...</p></div>
    </div>
  );
  if (error || !detailData) return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="text-3xl mb-2">❌</div>
      <p className="text-xs font-bold text-red-500 mb-4">{error}</p>
      <button onClick={() => navigate('/home')} className="bg-[#001A41] text-white text-xs font-bold px-4 py-2 rounded-xl">Kembali</button>
    </div>
  );

  const daftarUlasan = detailData.ulasan || [];
  const kategoriList = detailData.kategori_list?.length ? detailData.kategori_list : [detailData.kategori || '-'];
  const statusInfo   = hitungStatusBuka(detailData.jam_buka, detailData.jam_tutup);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased relative pb-24">

      {/* NAVIGASI */}
      <div className="absolute top-4 inset-x-4 z-10 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-[#001A41] font-bold text-sm cursor-pointer">←</button>
        <button
          onClick={handleToggleFavorit}
          disabled={favoritLoading}
          className={`w-9 h-9 rounded-full backdrop-blur-md shadow-md flex items-center justify-center text-base transition-all cursor-pointer ${
            isFavorit ? 'bg-red-500 text-white scale-110' : 'bg-white/90 text-gray-400 hover:text-red-400'
          } ${favoritLoading ? 'opacity-50' : ''}`}
          title={isFavorit ? 'Hapus dari favorit' : 'Tambah ke favorit'}
        >
          {favoritLoading ? <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : (isFavorit ? '❤️' : '🤍')}
        </button>
      </div>

      {/* TOAST FAVORIT */}
      {favToast && (
        <div className={`fixed top-16 inset-x-4 z-50 max-w-md mx-auto py-2.5 px-4 rounded-2xl text-xs font-bold text-center shadow-xl transition-all ${
          favToast.type === 'add'    ? 'bg-red-500 text-white' :
          favToast.type === 'remove' ? 'bg-gray-700 text-white' :
                                       'bg-amber-500 text-white'
        }`}>
          {favToast.msg}
        </div>
      )}

      {/* BANNER */}
      <div className="h-64 w-full bg-gray-200 relative">
        <img
          src={detailData.banner_img && detailData.banner_img !== 'default_warung.jpg'
            ? detailData.banner_img
            : 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600'}
          alt={detailData.nama} className="w-full h-full object-cover"
        />
      </div>

      <div className="px-5 -mt-6 relative z-20">
        {/* INFO CARD */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex flex-wrap gap-1.5">
              {kategoriList.map((k, i) => (
                <span key={i} className="bg-orange-50 text-[#FA5A15] text-[11px] font-bold px-2.5 py-0.5 rounded-md">{k}</span>
              ))}
            </div>
            {/* Rating real dari database */}
            {detailData.avg_rating && detailData.avg_rating > 0 ? (
              <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                <span>★</span>
                <span className="font-black text-amber-700">{parseFloat(detailData.avg_rating).toFixed(1)}</span>
                <span className="text-amber-400 font-medium text-[9px] ml-0.5">({detailData.review_count})</span>
              </div>
            ) : (
              <div className="flex items-center gap-0.5 bg-gray-50 px-2 py-0.5 rounded-md text-[11px] shrink-0">
                <span className="text-gray-300">★</span>
                <span className="font-medium text-gray-400">Baru</span>
              </div>
            )}
          </div>
          <h1 className="text-base font-black text-[#001A41] tracking-tight leading-snug">{detailData.nama}</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">{detailData.alamat}</p>
          <div className="border-t border-gray-100 my-4"></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rentang Harga</p>
              <p className="text-xs font-black text-[#001A41] mt-0.5">
                Rp {detailData.harga_min?.toLocaleString('id-ID')} – {detailData.harga_max?.toLocaleString('id-ID')}
              </p>
            </div>
            <div className={`rounded-xl p-2.5 ${statusInfo.buka ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${statusInfo.buka ? 'text-emerald-600/70' : 'text-red-400/70'}`}>Status</p>
              <p className={`text-xs font-black mt-0.5 ${statusInfo.buka ? 'text-emerald-700' : 'text-red-600'}`}>
                {statusInfo.label}
              </p>
            </div>
          </div>
          {detailData.jam_buka && detailData.jam_tutup && (
            <div className="mt-3 bg-blue-50 rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🕐</span>
                <div>
                  <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wider">Jam Operasional</p>
                  <p className="text-xs font-black text-blue-900 mt-0.5">{formatJam(detailData.jam_buka)} – {formatJam(detailData.jam_tutup)} WIB</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${statusInfo.buka ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {statusInfo.sisa}
              </span>
            </div>
          )}
        </div>

        {/* DESKRIPSI */}
        <div className="mt-5 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider mb-2">Tentang Tempat Makan</h3>
          <p className="text-xs text-gray-500 font-medium leading-relaxed">{detailData.deskripsi || 'Belum ada deskripsi.'}</p>
        </div>

        {/* ════════════════════════════════════════════════════
            PETA LOKASI
        ════════════════════════════════════════════════════ */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider">Lokasi & Peta</h3>
              {userLocation && placeLocation?.has_coords && (() => {
                const km = hitungJarak(userLocation.lat, userLocation.lng, placeLocation.latitude, placeLocation.longitude);
                return km !== null ? (
                  <p className="text-[11px] font-bold text-blue-500 mt-0.5">
                    📍 {formatJarak(km)} dari lokasimu
                  </p>
                ) : null;
              })()}
            </div>
            {placeLocation?.has_coords && (
              <a
                href={`https://www.google.com/maps/dir/?api=1${userLocation ? `&origin=${userLocation.lat},${userLocation.lng}` : ''}&destination=${placeLocation.latitude},${placeLocation.longitude}&travelmode=walking`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-[#001A41] text-white text-[11px] font-black px-3 py-2 rounded-xl hover:bg-[#00265F] transition cursor-pointer"
              >
                <span>Buka Maps</span>
              </a>
            )}
          </div>

          {placeLocation?.has_coords ? (
            <div className="px-3 pb-4">
              {/* Peta Leaflet */}
              <div className="rounded-2xl overflow-hidden border border-gray-100">
                <LeafletMap
                  placeLat={placeLocation.latitude}
                  placeLng={placeLocation.longitude}
                  placeName={detailData.nama}
                  userLat={userLocation?.lat}
                  userLng={userLocation?.lng}
                />
              </div>

              {/* Info row di bawah peta */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {/* Legenda */}
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">Keterangan</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#FA5A15] inline-block shrink-0"></span>
                      <span className="text-[11px] font-bold text-[#001A41]">{detailData.nama}</span>
                    </div>
                    {userLocation && (
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block shrink-0"></span>
                        <span className="text-[11px] font-bold text-[#001A41]">Posisi Kamu</span>
                      </div>
                    )}
                    {userLocation && (
                      <div className="flex items-center gap-2">
                        <span className="w-6 border-t-2 border-dashed border-blue-400 inline-block shrink-0"></span>
                        <span className="text-[11px] font-bold text-[#001A41]">Garis Rute</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info jarak & estimasi jalan kaki */}
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-black text-blue-400 uppercase tracking-wider mb-2">Estimasi Jarak</p>
                  {userLocation ? (() => {
                    const km = hitungJarak(userLocation.lat, userLocation.lng, placeLocation.latitude, placeLocation.longitude);
                    if (km === null) return <p className="text-[11px] font-bold text-gray-400">-</p>;
                    const menitJalan = Math.round(km / 0.08); // ~80m/menit jalan kaki
                    const menitMotor = Math.round(km / 0.5);   // ~30km/h motor
                    return (
                      <div className="space-y-1">
                        <p className="text-sm font-black text-blue-700">{formatJarak(km)}</p>
                        <p className="text-[10px] font-bold text-blue-500">🚶 ~{menitJalan} menit jalan</p>
                        <p className="text-[10px] font-bold text-blue-500">🛵 ~{menitMotor} menit motor</p>
                      </div>
                    );
                  })() : (
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 leading-relaxed">
                        {gpsLoading ? '⏳ Mendeteksi lokasi...' : '📍 Aktifkan GPS untuk melihat jarak'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Koordinat belum diset */
            <div className="px-4 pb-4">
              <div className="bg-gray-50 rounded-2xl py-8 text-center">
                <span className="text-2xl">🗺️</span>
                <p className="text-xs font-bold text-gray-400 mt-2">Peta belum tersedia</p>
                <p className="text-[10px] text-gray-300 font-medium mt-1">Koordinat lokasi belum diset oleh pemilik.</p>
                <a
                  href={`https://www.google.com/maps/search/${encodeURIComponent(detailData.alamat)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-[11px] font-bold text-[#FA5A15] underline"
                >Cari alamat di Google Maps →</a>
              </div>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════
            GALERI FOTO & MENU
        ════════════════════════════════════════════════════ */}
        <div className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header galeri */}
          <div className="px-4 pt-4 pb-0 flex items-center justify-between">
            <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider">Foto & Menu</h3>
            <button
              onClick={() => { setShowUploadModal(true); setUploadFiles([]); setUploadPreviews([]); }}
              className="flex items-center gap-1 text-[11px] font-black text-[#FA5A15] bg-orange-50 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-orange-100 transition"
            >
              <span>+</span> Tambah Foto
            </button>
          </div>

          {/* Tab: Galeri / Menu */}
          <div className="flex gap-0 px-4 pt-3">
            {['galeri','menu'].map(tab => (
              <button key={tab} type="button" onClick={() => setActiveGaleriTab(tab)}
                className={`flex-1 py-2 text-[11px] font-black border-b-2 transition cursor-pointer capitalize ${
                  activeGaleriTab === tab
                    ? 'border-[#FA5A15] text-[#FA5A15]'
                    : 'border-gray-100 text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'galeri' ? '📸 Galeri' : '📋 Menu'}&nbsp;
                <span className="font-medium text-[10px]">({fotoGaleri.filter(f=>f.tipe===tab).length})</span>
              </button>
            ))}
          </div>

          {/* Grid foto */}
          <div className="p-3">
            {fotoFiltered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-2">{activeGaleriTab === 'galeri' ? '📷' : '📋'}</p>
                <p className="text-[11px] font-bold text-gray-400">Belum ada foto {activeGaleriTab}.</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Jadilah yang pertama menambahkan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {fotoFiltered.map((foto, idx) => (
                  <div key={foto.id} onClick={() => openLightbox(idx)}
                    className="relative h-24 rounded-xl overflow-hidden bg-gray-100 cursor-pointer group"
                  >
                    <img src={foto.url} alt={`foto-${idx}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    {/* Overlay info uploader */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-1.5">
                      <p className="text-[8px] text-white font-bold truncate">👤 {foto.nama_uploader || 'Anonim'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ULASAN */}
        <div className="mt-5">
          <h3 className="text-xs font-black text-[#001A41] uppercase tracking-wider mb-3">Ulasan Mahasiswa ({daftarUlasan.length})</h3>
          {daftarUlasan.length > 0 ? (
            <div className="space-y-3">
              {daftarUlasan.map((review) => (
                <div key={review.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-orange-100 overflow-hidden flex items-center justify-center font-black text-[11px] shrink-0">
                        {review.foto_profil ? (
                          <img src={review.foto_profil} alt={review.nama_lengkap} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[#FA5A15]">{review.nama_lengkap?.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-[#001A41]">{review.nama_lengkap}</h4>
                        <p className="text-[9px] text-gray-300 font-medium mt-0.5">
                          {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-black text-amber-700">
                      <span>★</span><span>{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2.5 pl-9 leading-relaxed">"{review.komentar}"</p>
                  {review.foto_ulasan && (
                    <div className="mt-3 pl-9 h-20 w-32 rounded-xl overflow-hidden bg-gray-50">
                      <img src={review.foto_ulasan} alt="Foto ulasan" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-2xl border border-gray-100 p-4">
              <span className="text-xl">💬</span>
              <p className="text-[11px] font-bold text-gray-400 mt-1.5">Belum ada ulasan.</p>
              <p className="text-[9px] text-gray-300 font-medium mt-0.5">Jadilah yang pertama!</p>
            </div>
          )}
        </div>
      </div>

      {/* TOMBOL TULIS ULASAN */}
      <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md p-4 border-t border-gray-100 flex justify-center z-30">
        <button onClick={() => navigate('/add-review')}
          className="w-full max-w-xs bg-[#FA5A15] hover:bg-orange-600 text-white text-xs font-black py-3.5 px-6 rounded-2xl shadow-md transition cursor-pointer text-center"
        >Tulis Ulasan Kamu</button>
      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX FULLSCREEN
      ════════════════════════════════════════════════════ */}
      {lightboxIdx !== null && fotoFiltered[lightboxIdx] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          {/* Header lightbox */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div>
              <p className="text-white text-xs font-black">{fotoFiltered[lightboxIdx].nama_uploader || 'Anonim'}</p>
              <p className="text-gray-400 text-[10px] font-medium mt-0.5">
                {new Date(fotoFiltered[lightboxIdx].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={closeLightbox} className="text-white text-lg font-black w-8 h-8 flex items-center justify-center cursor-pointer">✕</button>
          </div>

          {/* Foto */}
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <button onClick={prevPhoto} className="absolute left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:bg-white/30 z-10">‹</button>
            <img src={fotoFiltered[lightboxIdx].url} alt="Lightbox" className="max-w-full max-h-full object-contain rounded-xl" />
            <button onClick={nextPhoto} className="absolute right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm cursor-pointer hover:bg-white/30 z-10">›</button>
          </div>

          {/* Counter */}
          <div className="text-center py-3 text-gray-400 text-[11px] font-bold shrink-0">
            {lightboxIdx + 1} / {fotoFiltered.length}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODAL UPLOAD FOTO
      ════════════════════════════════════════════════════ */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#001A41]">Tambah Foto</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 text-xs font-bold cursor-pointer">✕ Batal</button>
            </div>

            {/* Tab tipe foto */}
            <div className="flex gap-2 mb-4">
              {[{v:'galeri',l:'📸 Foto Galeri'},{v:'menu',l:'📋 Foto Menu'}].map(({v,l}) => (
                <button key={v} type="button" onClick={() => setUploadTipe(v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    uploadTipe === v ? 'bg-[#001A41] text-white border-[#001A41]' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >{l}</button>
              ))}
            </div>

            {/* Picker foto */}
            {uploadPreviews.length === 0 ? (
              <label className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FA5A15] transition mb-4">
                <span className="text-2xl mb-1">📁</span>
                <p className="text-xs font-bold text-[#001A41]">Pilih Foto</p>
                <p className="text-[10px] text-gray-400 mt-0.5">JPG/PNG, maks 10 foto</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePickFiles} className="hidden" />
              </label>
            ) : (
              <div className="mb-4">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {uploadPreviews.map((src, idx) => (
                    <div key={idx} className="relative h-16 rounded-xl overflow-hidden bg-gray-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeUploadFile(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer"
                      >✕</button>
                    </div>
                  ))}
                  {uploadFiles.length < 10 && (
                    <label className="h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#FA5A15] transition">
                      <span className="text-lg text-gray-400">+</span>
                      <input type="file" accept="image/*" multiple onChange={handlePickFiles} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 font-medium">{uploadFiles.length} foto dipilih</p>
              </div>
            )}

            <button onClick={handleUploadSubmit} disabled={uploadLoading || uploadFiles.length === 0}
              className="w-full bg-[#FA5A15] hover:bg-[#E04F10] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl text-xs transition cursor-pointer"
            >
              {uploadLoading ? 'Mengunggah...' : `Unggah ${uploadFiles.length || ''} Foto`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
