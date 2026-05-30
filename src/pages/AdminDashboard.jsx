import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ── Komponen Modal Konfirmasi Hapus ───────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="text-center mb-5">
          <span className="text-3xl">⚠️</span>
          <p className="text-sm font-bold text-[#001A41] mt-3 leading-relaxed">{message}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={onCancel}
            className="py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
          >Batal</button>
          <button onClick={onConfirm}
            className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs transition cursor-pointer"
          >Iya</button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen Modal Tambah ─────────────────────────────────────────────────────
function AddModal({ title, fields, onSubmit, onClose, loading }) {
  const [form, setForm] = useState(() => Object.fromEntries(fields.map(f => [f.name, ''])));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-black text-[#001A41]">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer">✕</button>
        </div>
        <div className="space-y-3">
          {fields.map(f => (
            <div key={f.name}>
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1">{f.label}</label>
              {f.type === 'select' ? (
                <select name={f.name} value={form[f.name]} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                >
                  <option value="">-- Pilih {f.label} --</option>
                  {f.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input type={f.type || 'text'} name={f.name} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder || ''}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300"
                />
              )}
            </div>
          ))}
        </div>
        <button onClick={() => onSubmit(form)} disabled={loading}
          className="w-full mt-5 bg-[#001A41] hover:bg-[#00265F] disabled:bg-gray-300 text-white font-black py-3 rounded-xl text-xs transition cursor-pointer"
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </div>
  );
}

// ── Komponen Modal Koordinat + Peta Leaflet interaktif ───────────────────────
function CoordModal({ place, onClose, onSaved }) {
  const [lat, setLat]             = useState(place.has_coords ? String(place.latitude)  : '');
  const [lng, setLng]             = useState(place.has_coords ? String(place.longitude) : '');
  const [saving, setSaving]       = useState(false);
  const [mapReady, setMapReady]   = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(place.alamat || '');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [toast, setToast]         = useState(null);
  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3500);
  };

  const placeMarker = useCallback((L, map, cLat, cLng) => {
    const pinIcon = L.divIcon({
      html: `<div style="font-size:32px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.45))">📍</div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 32],
    });
    if (markerRef.current) {
      markerRef.current.setLatLng([cLat, cLng]);
    } else {
      markerRef.current = L.marker([cLat, cLng], { icon: pinIcon, draggable: true }).addTo(map);
      markerRef.current.bindPopup(`<b style="font-size:12px">${place.nama}</b>`);
      markerRef.current.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        setLat(pos.lat.toFixed(7));
        setLng(pos.lng.toFixed(7));
        markerRef.current.openPopup();
      });
    }
    markerRef.current.openPopup();
  }, [place.nama]);

  useEffect(() => {
    let isMounted = true;
    const initMap = () => {
      if (!isMounted || !mapRef.current || mapInstance.current) return;
      const L = window.L;
      const initLat = parseFloat(lat) || -7.0465;
      const initLng = parseFloat(lng) || 110.394;
      const initZoom = (parseFloat(lat) && parseFloat(lng)) ? 16 : 13;
      const map = L.map(mapRef.current, { zoomControl: true });
      mapInstance.current = map;
      map.setView([initLat, initLng], initZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19,
      }).addTo(map);
      if (parseFloat(lat) && parseFloat(lng)) {
        placeMarker(L, map, parseFloat(lat), parseFloat(lng));
      }
      map.on('click', (e) => {
        const { lat: cLat, lng: cLng } = e.latlng;
        setLat(cLat.toFixed(7));
        setLng(cLng.toFixed(7));
        placeMarker(L, map, cLat, cLng);
      });
      if (isMounted) setMapReady(true);
    };
    const loadLeaflet = () => {
      if (!document.getElementById('leaflet-css-admin')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css-admin'; link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }
      if (window.L) { setTimeout(initMap, 50); return; }
      if (!document.getElementById('leaflet-js-admin')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js-admin';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setTimeout(initMap, 50);
        document.head.appendChild(script);
      } else {
        setTimeout(initMap, 200);
      }
    };
    const timer = setTimeout(loadLeaflet, 80);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
      markerRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleManualCoord = (field, val) => {
    if (field === 'lat') setLat(val); else setLng(val);
    const L = window.L;
    if (!L || !mapInstance.current) return;
    const newLat = field === 'lat' ? parseFloat(val) : parseFloat(lat);
    const newLng = field === 'lng' ? parseFloat(val) : parseFloat(lng);
    if (isNaN(newLat) || isNaN(newLng)) return;
    mapInstance.current.setView([newLat, newLng], 16);
    placeMarker(L, mapInstance.current, newLat, newLng);
  };

  const handleUseGPS = () => {
    if (!navigator.geolocation) { showToast('error', 'Browser Anda tidak mendukung GPS.'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const gLat = pos.coords.latitude.toFixed(7);
        const gLng = pos.coords.longitude.toFixed(7);
        setLat(gLat); setLng(gLng);
        const L = window.L;
        if (L && mapInstance.current) {
          mapInstance.current.setView([parseFloat(gLat), parseFloat(gLng)], 17);
          placeMarker(L, mapInstance.current, parseFloat(gLat), parseFloat(gLng));
        }
        setGpsLoading(false);
        showToast('success', `GPS berhasil! Akurasi ±${Math.round(pos.coords.accuracy)}m`);
      },
      (err) => {
        setGpsLoading(false);
        const msgs = { 1: 'Izin lokasi ditolak. Aktifkan izin lokasi di browser.', 2: 'Posisi tidak tersedia.', 3: 'Waktu habis. Coba lagi.' };
        showToast('error', msgs[err.code] || 'GPS gagal.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSearchAddress = async () => {
    if (!searchQuery.trim()) return;
    setSearchLoading(true); setSearchResults([]);
    try {
      const q = encodeURIComponent(searchQuery + ', Indonesia');
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=5`, { headers: { 'Accept-Language': 'id' } });
      const data = await res.json();
      if (data.length === 0) showToast('info', 'Alamat tidak ditemukan. Coba kata kunci lain.');
      setSearchResults(data);
    } catch { showToast('error', 'Gagal mencari alamat.'); }
    finally { setSearchLoading(false); }
  };

  const handleSelectResult = (r) => {
    const rLat = parseFloat(r.lat).toFixed(7);
    const rLng = parseFloat(r.lon).toFixed(7);
    setLat(rLat); setLng(rLng); setSearchResults([]);
    const L = window.L;
    if (L && mapInstance.current) {
      mapInstance.current.setView([parseFloat(rLat), parseFloat(rLng)], 17);
      placeMarker(L, mapInstance.current, parseFloat(rLat), parseFloat(rLng));
    }
    showToast('success', 'Lokasi ditemukan & ditandai di peta!');
  };

  const handlePasteCoord = (e) => {
    const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const match = text.match(/(-?\d+\.?\d*)[,\s]+(-?\d+\.?\d*)/);
    if (match) {
      e.preventDefault();
      const pLat = parseFloat(match[1]).toFixed(7);
      const pLng = parseFloat(match[2]).toFixed(7);
      setLat(pLat); setLng(pLng);
      const L = window.L;
      if (L && mapInstance.current) {
        mapInstance.current.setView([parseFloat(pLat), parseFloat(pLng)], 17);
        placeMarker(L, mapInstance.current, parseFloat(pLat), parseFloat(pLng));
      }
      showToast('success', '📋 Koordinat dari clipboard berhasil dipaste!');
    }
  };

  const handleSave = async () => {
    if (!lat || !lng || isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      showToast('error', 'Klik peta / cari alamat / isi koordinat terlebih dahulu.');
      return;
    }
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/places/${place.id}/location`, {
        latitude: parseFloat(lat), longitude: parseFloat(lng),
      });
      if (res.data.success) {
        showToast('success', `Koordinat "${place.nama}" berhasil disimpan!`);
        setTimeout(onSaved, 1200);
      } else { showToast('error', res.data.message || 'Gagal menyimpan.'); }
    } catch (err) { showToast('error', err.response?.data?.message || 'Gagal terhubung ke server.'); }
    finally { setSaving(false); }
  };

  const hasCoord = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative">

        {/* Toast */}
        {toast && (
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-60 px-5 py-2.5 rounded-2xl text-xs font-bold shadow-xl ${
            toast.type === 'success' ? 'bg-emerald-500 text-white' :
            toast.type === 'error'   ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
          }`}>{toast.msg}</div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-black text-[#001A41]">Set Koordinat Lokasi</h3>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{place.nama}</p>
            <p className="text-[11px] text-gray-300 mt-0.5 truncate max-w-md">{place.alamat}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold ml-4 shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition cursor-pointer">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">

          {/* Tombol aksi cepat */}
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={handleUseGPS} disabled={gpsLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold text-xs transition cursor-pointer shadow-sm"
            >
              {gpsLoading
                ? <><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></span>Mendapatkan GPS...</>
                : <>Gunakan Lokasi Saya (GPS)</>}
            </button>
            <a href={`https://www.google.com/maps/search/${encodeURIComponent(place.alamat || place.nama)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-[#FA5A15] font-bold text-xs hover:bg-orange-100 transition"
            >Buka di Google Maps</a>
          </div>

          {/* Pencarian alamat */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">🔍 Cari Alamat Otomatis</label>
            <div className="flex gap-2">
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearchAddress()}
                placeholder="Ketik nama tempat / alamat lalu tekan Enter..."
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-blue-400 placeholder-gray-300"
              />
              <button type="button" onClick={handleSearchAddress} disabled={searchLoading}
                className="px-4 py-2.5 rounded-xl bg-[#001A41] hover:bg-[#00265F] disabled:bg-gray-300 text-white font-bold text-xs transition cursor-pointer shrink-0"
              >{searchLoading ? '....' : 'Cari'}</button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden shadow-lg bg-white">
                {searchResults.map((r, i) => (
                  <button key={i} type="button" onClick={() => handleSelectResult(r)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b border-gray-100 last:border-0 transition cursor-pointer"
                  >
                    <p className="text-xs font-bold text-[#001A41] leading-tight">{r.display_name}</p>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">{parseFloat(r.lat).toFixed(6)}, {parseFloat(r.lon).toFixed(6)}</p>
                  </button>
                ))}
                <button type="button" onClick={() => setSearchResults([])}
                  className="w-full text-center py-2 text-[11px] text-gray-400 hover:text-gray-600 font-bold bg-gray-50 cursor-pointer"
                >✕ Tutup</button>
              </div>
            )}
          </div>

          {/* Peta */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative" style={{height:'300px'}}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
            {!mapReady && (
              <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center gap-2">
                <div className="w-6 h-6 rounded-full border-t-transparent animate-spin" style={{border:'3px solid #001A41', borderTopColor:'transparent'}}></div>
                <p className="text-xs font-bold text-gray-400">Memuat peta...</p>
              </div>
            )}
            {mapReady && (
              <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1 text-[10px] font-bold text-gray-500 shadow-sm pointer-events-none">
                💡 Klik peta untuk pin · Drag pin untuk presisi
              </div>
            )}
          </div>

          {/* Input manual */}
          <div>
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">✏️ Input Manual Koordinat</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-1">Latitude</label>
                <input type="number" step="any" value={lat}
                  onChange={e => handleManualCoord('lat', e.target.value)}
                  onPaste={handlePasteCoord}
                  placeholder="-7.0465000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 block mb-1">Longitude</label>
                <input type="number" step="any" value={lng}
                  onChange={e => handleManualCoord('lng', e.target.value)}
                  onPaste={handlePasteCoord}
                  placeholder="110.3940000"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300 font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5">
              💡 Paste koordinat format <span className="font-mono bg-gray-100 px-1 rounded">-7.0465, 110.3940</span> langsung dari Google Maps ke kotak Latitude
            </p>
          </div>

          {/* Preview */}
          {hasCoord ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">📍 Koordinat Terpilih</span>
                <p className="text-xs font-black text-emerald-800 font-mono mt-0.5">{parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}</p>
              </div>
              <a href={`https://www.google.com/maps?q=${lat},${lng}`} target="_blank" rel="noopener noreferrer"
                className="text-[11px] font-bold text-emerald-600 hover:underline shrink-0">Verifikasi →</a>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <p className="text-xs font-bold text-amber-700">⚠️ Koordinat belum diset — klik peta, gunakan GPS, atau cari alamat di atas.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
          >Batal</button>
          <button type="button" onClick={handleSave} disabled={saving || !hasCoord}
            className="py-3 px-8 rounded-xl bg-[#001A41] hover:bg-[#00265F] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs transition cursor-pointer"
            style={{flexGrow:2}}
          >
            {saving
              ? <span className="flex items-center justify-center gap-2"><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Menyimpan...</span>
              : 'Simpan Koordinat'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Komponen utama AdminDashboard ─────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Data state
  const [pendingPlaces, setPendingPlaces]   = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [cities, setCities]                 = useState([]);
  const [universities, setUniversities]     = useState([]);
  const [allPlaces, setAllPlaces]           = useState([]);
  const [loading, setLoading]               = useState(false);
  const [allUsers, setAllUsers]             = useState([]);
  const [stats, setStats]                   = useState(null);
  const [statsLoading, setStatsLoading]     = useState(false);
  const [lastRefresh, setLastRefresh]       = useState(null);

  // Filter state untuk tab users
  const [filterUserRole, setFilterUserRole]     = useState(''); // '' | 'Mahasiswa'
  const [filterUserStatus, setFilterUserStatus] = useState(''); // '' | 'Aktif' | 'Diblokir'
  const [filterUserSearch, setFilterUserSearch] = useState('');

  // Modal state
  const [confirmModal, setConfirmModal] = useState(null);
  const [addModal, setAddModal]         = useState(null);
  const [addLoading, setAddLoading]     = useState(false);
  const [coordModal, setCoordModal]     = useState(null);

  // ── State untuk tab Kelola Tempat Makan ──────────────────────────────────────
  const [editModal, setEditModal]           = useState(null);  // { place } objek yang sedang diedit
  const [editForm, setEditForm]             = useState({});
  const [editLoading, setEditLoading]       = useState(false);
  const [filterManageStatus, setFilterManageStatus] = useState(''); // '' | 'Disetujui' | 'Diproses' | 'Ditolak'
  const [filterManageSearch, setFilterManageSearch] = useState('');


  // Filter
  const [filterKota, setFilterKota]         = useState('');
  const [filterCoordKampus, setFilterCoordKampus] = useState('');
  const [filterCoordStatus, setFilterCoordStatus] = useState(''); // '' | 'belum' | 'sudah' 

  // ── Guard: hanya admin ──────────────────────────────────────────────────────
  useEffect(() => {
    const role = localStorage.getItem('user_role');
    if (!role || role !== 'Admin') {
      alert('Akses Ditolak! Halaman ini hanya untuk Administrator Univora.');
      navigate('/login');
    } else {
      fetchAll();
    }
  }, []);

  // ── Fetch semua data ────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rPlaces, rReviews, rCities, rUnis, rAllPlaces, rUsers] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/places/pending'),
        axios.get('http://localhost:5000/api/admin/reviews/pending'),
        axios.get('http://localhost:5000/api/admin/cities'),
        axios.get('http://localhost:5000/api/admin/universities'),
        axios.get('http://localhost:5000/api/admin/places/all'),
        axios.get('http://localhost:5000/api/admin/users'),
      ]);
      if (rPlaces.data.success)    setPendingPlaces(rPlaces.data.data);
      if (rReviews.data.success)   setPendingReviews(rReviews.data.data);
      if (rCities.data.success)    setCities(rCities.data.data);
      if (rUnis.data.success)      setUniversities(rUnis.data.data);
      if (rAllPlaces.data.success) setAllPlaces(rAllPlaces.data.data);
      if (rUsers.data.success)    setAllUsers(rUsers.data.data);
    } catch (err) {
      console.error('Gagal memuat data admin:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch statistik ────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
        setLastRefresh(new Date());
      }
    } catch (err) {
      console.error('Gagal memuat statistik:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Fetch stats saat pertama load & saat tab overview aktif
  useEffect(() => {
    if (activeTab === 'overview') fetchStats();
  }, [activeTab]);

  // ── Moderasi tempat makan ───────────────────────────────────────────────────
  const handlePlaceAction = async (id, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/places/${id}/status`, { status });
      if (res.data.success) { alert(res.data.message); fetchAll(); }
    } catch { alert('Gagal memproses verifikasi tempat makan.'); }
  };

  // ── Moderasi ulasan ─────────────────────────────────────────────────────────
  const handleReviewAction = async (id, status) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/reviews/${id}/status`, { status });
      if (res.data.success) { alert(res.data.message); fetchAll(); }
    } catch { alert('Gagal memproses moderasi ulasan.'); }
  };

  // ── KOTA: Tambah ────────────────────────────────────────────────────────────
  const openAddCity = () => {
    setAddModal({
      title: 'Tambah Kota Baru',
      fields: [{ name: 'nama_kota', label: 'Nama Kota', placeholder: 'Contoh: Surabaya' }],
      onSubmit: async (form) => {
        if (!form.nama_kota.trim()) { alert('Nama kota wajib diisi.'); return; }
        setAddLoading(true);
        try {
          const res = await axios.post('http://localhost:5000/api/admin/cities', { nama_kota: form.nama_kota });
          if (res.data.success) { alert(res.data.message); setAddModal(null); fetchAll(); }
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal menambah kota.');
        } finally { setAddLoading(false); }
      }
    });
  };

  // ── KOTA: Hapus ─────────────────────────────────────────────────────────────
  const confirmDeleteCity = (city) => {
    setConfirmModal({
      message: `Hapus kota "${city.nama_kota}"? Pastikan tidak ada kampus yang terdaftar di kota ini.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await axios.delete(`http://localhost:5000/api/admin/cities/${city.id}`);
          if (res.data.success) { alert(res.data.message); fetchAll(); }
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal menghapus kota.');
        }
      }
    });
  };

  // ── KAMPUS: Tambah ──────────────────────────────────────────────────────────
  const openAddUniversity = () => {
    setAddModal({
      title: 'Tambah Kampus Baru',
      fields: [
        {
          name: 'city_id', label: 'Kota', type: 'select',
          options: cities.map(c => ({ value: c.id, label: c.nama_kota }))
        },
        { name: 'nama_universitas', label: 'Nama Universitas / Kampus', placeholder: 'Contoh: Universitas Brawijaya (UB)' },
        { name: 'latitude',  label: 'Latitude (opsional)',  type: 'number', placeholder: '-7.046' },
        { name: 'longitude', label: 'Longitude (opsional)', type: 'number', placeholder: '110.394' },
      ],
      onSubmit: async (form) => {
        if (!form.city_id)           { alert('Pilih kota terlebih dahulu.'); return; }
        if (!form.nama_universitas.trim()) { alert('Nama universitas wajib diisi.'); return; }
        setAddLoading(true);
        try {
          const res = await axios.post('http://localhost:5000/api/admin/universities', {
            city_id:          form.city_id,
            nama_universitas: form.nama_universitas,
            latitude:         form.latitude  || 0,
            longitude:        form.longitude || 0,
          });
          if (res.data.success) { alert(res.data.message); setAddModal(null); fetchAll(); }
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal menambah kampus.');
        } finally { setAddLoading(false); }
      }
    });
  };

  // ── KAMPUS: Hapus ───────────────────────────────────────────────────────────
  const confirmDeleteUniversity = (uni) => {
    setConfirmModal({
      message: `Hapus kampus "${uni.nama_universitas}"? Pastikan tidak ada tempat makan yang terdaftar di kampus ini.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await axios.delete(`http://localhost:5000/api/admin/universities/${uni.id}`);
          if (res.data.success) { alert(res.data.message); fetchAll(); }
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal menghapus kampus.');
        }
      }
    });
  };

  // ── Filtered universities ───────────────────────────────────────────────────
  const filteredUnis = filterKota
    ? universities.filter(u => String(u.city_id) === String(filterKota))
    : universities;

  // ── KELOLA TEMPAT MAKAN: Buka modal edit ─────────────────────────────────────
  const openEditPlace = (place) => {
    setEditForm({
      nama:              place.nama              || '',
      alamat:            place.alamat            || '',
      kategori:          place.kategori          || '',
      harga_min:         String(place.harga_min  || 0),
      harga_max:         String(place.harga_max  || 0),
      deskripsi:         place.deskripsi         || '',
      jam_buka:          place.jam_buka          || '08:00',
      jam_tutup:         place.jam_tutup         || '21:00',
      status_verifikasi: place.status_verifikasi || 'Disetujui',
    });
    setEditModal(place);
  };

  const handleEditSave = async () => {
    if (!editModal) return;
    if (!editForm.nama.trim() || !editForm.alamat.trim()) {
      alert('Nama dan alamat wajib diisi.'); return;
    }
    setEditLoading(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/places/${editModal.id}`, editForm);
      if (res.data.success) {
        alert(res.data.message);
        setEditModal(null);
        fetchAll();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan perubahan.');
    } finally { setEditLoading(false); }
  };

  // ── KELOLA TEMPAT MAKAN: Hapus permanen ──────────────────────────────────────
  const confirmDeletePlace = (place) => {
    setConfirmModal({
      message: `Hapus permanen "${place.nama}"?\n\nSemua ulasan, foto, dan data terkait akan ikut terhapus. Tindakan ini tidak bisa dibatalkan.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await axios.delete(`http://localhost:5000/api/admin/places/${place.id}`);
          if (res.data.success) { alert(res.data.message); fetchAll(); }
        } catch (err) {
          alert(err.response?.data?.message || 'Gagal menghapus tempat makan.');
        }
      }
    });
  };

  // ── Filter data kelola ────────────────────────────────────────────────────────
  const filteredManagePlaces = allPlaces.filter(p => {
    const matchStatus = !filterManageStatus || p.status_verifikasi === filterManageStatus;
    const matchSearch = !filterManageSearch || p.nama.toLowerCase().includes(filterManageSearch.toLowerCase()) || p.alamat.toLowerCase().includes(filterManageSearch.toLowerCase());
    return matchStatus && matchSearch;
  });

  // ── USER: Blokir / Aktifkan ────────────────────────────────────────────────
  const handleUserStatus = async (user, newStatus) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/admin/users/${user.id}/status`, { status: newStatus });
      if (res.data.success) { alert(res.data.message); fetchAll(); }
      else alert(res.data.message);
    } catch (err) { alert(err.response?.data?.message || 'Gagal mengubah status user.'); }
  };

  // ── USER: Reset kontribusi ──────────────────────────────────────────────────
  const handleUserReset = (user) => {
    setConfirmModal({
      message: `Reset kontribusi "${user.nama_lengkap}"? Semua tempat makan yang sudah disetujui akan dikembalikan ke status Diproses untuk direview ulang.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await axios.put(`http://localhost:5000/api/admin/users/${user.id}/reset`);
          if (res.data.success) { alert(res.data.message); fetchAll(); }
          else alert(res.data.message);
        } catch (err) { alert(err.response?.data?.message || 'Gagal mereset kontribusi.'); }
      }
    });
  };

  // ── USER: Hapus akun ────────────────────────────────────────────────────────
  const confirmDeleteUser = (user) => {
    setConfirmModal({
      message: `Hapus permanen akun "${user.nama_lengkap}" (${user.email})? Seluruh tempat makan dan ulasan user ini akan ikut terhapus. Tindakan ini tidak dapat dibatalkan.`,
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          const res = await axios.delete(`http://localhost:5000/api/admin/users/${user.id}`);
          if (res.data.success) { alert(res.data.message); fetchAll(); }
          else alert(res.data.message);
        } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus user.'); }
      }
    });
  };

  // ── Filter data user ────────────────────────────────────────────────────────
  const filteredUsers = allUsers.filter(u => {
    const matchRole   = !filterUserRole   || u.role   === filterUserRole;
    const matchStatus = !filterUserStatus || u.status === filterUserStatus;
    const matchSearch = !filterUserSearch
      || u.nama_lengkap.toLowerCase().includes(filterUserSearch.toLowerCase())
      || u.email.toLowerCase().includes(filterUserSearch.toLowerCase());
    return matchRole && matchStatus && matchSearch;
  });

  // ── Navigasi sidebar ────────────────────────────────────────────────────────

  const navItems = [
    { id: 'overview',     label: 'Overview & Statistik', badge: 0 },
    { id: 'places',       label: 'Verifikasi Warung',   badge: pendingPlaces.length },
    { id: 'reviews',      label: 'Moderasi Testimoni',  badge: pendingReviews.length },
    { id: 'manage',       label: 'Kelola Tempat Makan', badge: allPlaces.length },
    { id: 'cities',       label: 'Kelola Kota',          badge: cities.length },
    { id: 'universities', label: 'Kelola Kampus',        badge: universities.length },
    { id: 'coordinates',  label: 'Kelola Koordinat',     badge: allPlaces.filter(p => !p.has_coords).length },
    { id: 'users',         label: 'Kelola Data User',      badge: allUsers.filter(u => u.status === 'Diblokir').length },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans antialiased">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <div className="w-64 bg-[#001A41] text-white flex flex-col justify-between p-6 shrink-0">
        <div>
          <div className="mb-8 flex items-center gap-2">
            <span className="text-2xl"></span>
            <div>
              <h1 className="text-base font-black tracking-tight text-white">UNIVORA PANEL</h1>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Super Administrator</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {navItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === item.id ? 'bg-[#FA5A15] text-white' : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    activeTab === item.id ? 'bg-white text-[#FA5A15]' : 'bg-white/20 text-white'
                  }`}>{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <button onClick={() => window.location.href = '/login'}
          className="w-full text-center bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white py-3 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
        >Keluar Sesi Admin</button>
      </div>

      {/* ── CONTENT AREA ────────────────────────────────────────────────────── */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-[#001A41]">
              {activeTab === 'overview'     && 'Overview & Statistik Aplikasi'}
              {activeTab === 'places'       && 'Persetujuan Tempat Makan Baru'}
              {activeTab === 'reviews'      && 'Moderasi Ulasan Mahasiswa'}
              {activeTab === 'cities'       && 'Kelola Data Kota'}
              {activeTab === 'universities' && 'Kelola Data Kampus / Universitas'}
              {activeTab === 'coordinates'  && 'Kelola Koordinat Tempat Makan'}
              {activeTab === 'manage'       && 'Kelola & Override Data Tempat Makan'}
              {activeTab === 'users'        && 'Kelola Data Akun Mahasiswa'}
            </h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {activeTab === 'overview'     && 'Pantau performa & kesehatan aplikasi Univora secara menyeluruh.'}
              {activeTab === 'places'       && 'Saring & verifikasi kiriman tempat makan baru dari mahasiswa.'}
              {activeTab === 'reviews'      && 'Moderasi ulasan untuk menjaga kualitas konten Univora.'}
              {activeTab === 'cities'       && 'Tambah atau hapus kota yang tersedia di Univora.'}
              {activeTab === 'universities' && 'Tambah atau hapus kampus dalam database Univora.'}
              {activeTab === 'coordinates'  && 'Set atau perbarui koordinat GPS setiap tempat makan agar peta bekerja.'}
              {activeTab === 'manage'       && 'Edit, ubah status, atau hapus permanen tempat makan yang sudah ada.'}
              {activeTab === 'users'        && 'Lihat semua akun mahasiswa, blokir jika ada penyalahgunaan, atau hapus akun bermasalah.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Tombol Tambah kontekstual */}
            {activeTab === 'cities' && (
              <button onClick={openAddCity}
                className="px-4 py-2 bg-[#FA5A15] hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition"
              >Tambah Kota</button>
            )}
            {activeTab === 'universities' && (
              <button onClick={openAddUniversity}
                className="px-4 py-2 bg-[#FA5A15] hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer transition"
              >Tambah Kampus</button>
            )}
            <button onClick={fetchAll}
              className="px-4 py-2 bg-white border border-gray-200 text-[#001A41] font-bold text-xs rounded-xl hover:bg-gray-50 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >Refresh</button>
          </div>
        </div>

        {/* ── TAB: OVERVIEW & STATISTIK ──────────────────────────────────── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Refresh bar */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400 font-medium">
                {lastRefresh ? `Diperbarui ${lastRefresh.toLocaleTimeString('id-ID')}` : 'Memuat data...'}
              </p>
              <button onClick={fetchStats} disabled={statsLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-[#001A41] font-bold text-xs rounded-xl hover:bg-gray-50 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <span className={statsLoading ? 'animate-spin inline-block' : ''}></span>
                {statsLoading ? 'Memuat...' : 'Refresh Statistik'}
              </button>
            </div>

            {statsLoading && !stats ? (
              <div className="grid grid-cols-4 gap-4">
                {[1,2,3,4].map(i => <div key={i} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />)}
              </div>
            ) : stats ? (<>

              {/* ── ROW 1: KPI Cards utama ── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Terverifikasi */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">LIVE</span>
                  </div>
                  <p className="text-3xl font-black text-[#001A41]">{stats.tempat_makan?.terverifikasi || 0}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">Tempat Makan Aktif</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">dari {stats.tempat_makan?.total_tempat_makan || 0} total</p>
                </div>

                {/* Pending verifikasi */}
                <div className={`bg-white rounded-2xl p-5 border shadow-sm ${stats.tempat_makan?.pending > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-3">
                    {stats.tempat_makan?.pending > 0 && (
                      <span className="text-[10px] font-black bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full animate-pulse">PERLU AKSI</span>
                    )}
                  </div>
                  <p className={`text-3xl font-black ${stats.tempat_makan?.pending > 0 ? 'text-amber-600' : 'text-[#001A41]'}`}>{stats.tempat_makan?.pending || 0}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">Menunggu Verifikasi</p>
                  <button onClick={() => setActiveTab('places')} className="text-[10px] text-amber-600 font-bold hover:underline mt-0.5 cursor-pointer">Proses sekarang →</button>
                </div>

                {/* Total ulasan */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">⭐ {stats.ulasan?.rata_rata}</span>
                  </div>
                  <p className="text-3xl font-black text-[#001A41]">{stats.ulasan?.total || 0}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">Total Ulasan</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">rata-rata {stats.ulasan?.rata_rata} bintang</p>
                </div>

                {/* Mahasiswa aktif */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    {stats.users?.diblokir > 0 && (
                      <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{stats.users?.diblokir} diblokir</span>
                    )}
                  </div>
                  <p className="text-3xl font-black text-[#001A41]">{stats.users?.aktif || 0}</p>
                  <p className="text-[11px] font-bold text-gray-400 mt-1">Mahasiswa Aktif</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">dari {stats.users?.total || 0} terdaftar</p>
                </div>
              </div>

              {/* ── ROW 2: Aktivitas minggu ini ── */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-black text-[#001A41]">Aktivitas 7 Hari Terakhir</h3>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">Kontribusi baru yang masuk ke platform</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {label:'Tempat Baru',value:stats.aktivitas_minggu?.tempat_baru||0,color:'text-indigo-600 bg-indigo-50'},
                    {label:'Ulasan Baru',value:stats.aktivitas_minggu?.ulasan_baru||0,color:'text-emerald-600 bg-emerald-50'},
                    {label:'User Baru',value:stats.aktivitas_minggu?.user_baru||0,color:'text-blue-600 bg-blue-50'},
                    {label:'Foto Baru',value:stats.aktivitas_minggu?.foto_baru||0,color:'text-orange-600 bg-orange-50'},
                  ].map(item => (
                    <div key={item.label} className={`rounded-xl px-4 py-3 ${item.color.split(' ')[1]}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base">{item.icon}</span>
                        <span className={`text-xs font-black ${item.color.split(' ')[0]}`}>{item.label}</span>
                      </div>
                      <p className={`text-2xl font-black ${item.color.split(' ')[0]}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── ROW 3: Status verifikasi ringkas ── */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-[#001A41] mb-4">Status Verifikasi Tempat Makan</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Disetujui',  value: stats.tempat_makan?.terverifikasi || 0, color: 'bg-emerald-500', text: 'text-emerald-700' },
                    { label: 'Menunggu',   value: stats.tempat_makan?.pending       || 0, color: 'bg-amber-400',   text: 'text-amber-700' },
                    { label: 'Ditolak',    value: stats.tempat_makan?.ditolak       || 0, color: 'bg-red-400',     text: 'text-red-700' },
                  ].map(item => {
                    const total = parseInt(stats.tempat_makan?.total_tempat_makan || 1);
                    const pct   = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-gray-600">{item.label}</span>
                          <span className={`text-xs font-black ${item.text}`}>{item.value} <span className="font-medium text-gray-400">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── ROW 4: Top Kota & Top Kampus ── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Top Kota */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-[#001A41] mb-4">Kota Paling Aktif</h3>
                  {stats.top_kota?.length === 0 ? (
                    <p className="text-xs text-gray-400 font-bold text-center py-4">Belum ada data.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.top_kota?.map((kota, i) => (
                        <div key={kota.nama_kota} className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-orange-200 text-orange-700'
                          }`}>{i+1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#001A41] truncate">{kota.nama_kota}</p>
                              <p className="text-xs font-black text-[#FA5A15] shrink-0 ml-2">{kota.jumlah_tempat} spot</p>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <p className="text-[10px] text-gray-400">{kota.jumlah_kampus} kampus · {kota.jumlah_ulasan} ulasan</p>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                              <div className="bg-[#FA5A15] h-1.5 rounded-full" style={{
                                width: `${Math.round((kota.jumlah_tempat / Math.max(...(stats.top_kota?.map(k=>k.jumlah_tempat)||[1]))) * 100)}%`
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Kampus */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-black text-[#001A41] mb-4">Kampus Paling Aktif</h3>
                  {stats.top_universitas?.length === 0 ? (
                    <p className="text-xs text-gray-400 font-bold text-center py-4">Belum ada data.</p>
                  ) : (
                    <div className="space-y-3">
                      {stats.top_universitas?.map((uni, i) => (
                        <div key={uni.nama_universitas} className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                            i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-300 text-white' : 'bg-blue-200 text-blue-700'
                          }`}>{i+1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#001A41] truncate">{uni.nama_universitas}</p>
                              <p className="text-xs font-black text-[#FA5A15] shrink-0 ml-2">{uni.jumlah_tempat} spot</p>
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5">{uni.nama_kota} · {uni.jumlah_ulasan} ulasan</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1.5">
                              <div className="bg-[#001A41] h-1.5 rounded-full" style={{
                                width: `${Math.round((uni.jumlah_tempat / Math.max(...(stats.top_universitas?.map(u=>u.jumlah_tempat)||[1]))) * 100)}%`
                              }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── ROW 5: Deteksi masalah ── */}
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="text-sm font-black text-[#001A41] mb-1">Deteksi Masalah</h3>
                <p className="text-[10px] text-gray-400 mb-4">Item yang perlu perhatian admin segera.</p>
                <div className="space-y-2.5">
                  {[
                    {
                      kondisi: stats.tempat_makan?.pending > 0,
                      icon: '⏳', level: 'warning',
                      pesan: `${stats.tempat_makan?.pending} tempat makan menunggu verifikasi`,
                      aksi: 'Verifikasi', tab: 'places',
                    },
                    {
                      kondisi: stats.users?.diblokir > 0,
                      icon: '🚫', level: 'danger',
                      pesan: `${stats.users?.diblokir} akun mahasiswa saat ini diblokir`,
                      aksi: 'Lihat User', tab: 'users',
                    },
                    {
                      kondisi: allPlaces.filter(p => !p.has_coords).length > 0,
                      icon: '📍', level: 'info',
                      pesan: `${allPlaces.filter(p => !p.has_coords).length} tempat makan belum punya koordinat GPS`,
                      aksi: 'Set Koordinat', tab: 'coordinates',
                    },
                    {
                      kondisi: stats.tempat_makan?.ditolak > 0,
                      icon: '❌', level: 'info',
                      pesan: `${stats.tempat_makan?.ditolak} tempat makan berstatus Ditolak`,
                      aksi: 'Kelola', tab: 'manage',
                    },
                  ].filter(item => item.kondisi).map((item, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      item.level === 'warning' ? 'bg-amber-50 border-amber-200' :
                      item.level === 'danger'  ? 'bg-red-50 border-red-200' :
                      'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{item.icon}</span>
                        <p className={`text-xs font-bold ${
                          item.level === 'warning' ? 'text-amber-700' :
                          item.level === 'danger'  ? 'text-red-700' :
                          'text-blue-700'
                        }`}>{item.pesan}</p>
                      </div>
                      <button onClick={() => setActiveTab(item.tab)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg cursor-pointer shrink-0 ml-3 ${
                          item.level === 'warning' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                          item.level === 'danger'  ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                          'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } transition`}
                      >{item.aksi} →</button>
                    </div>
                  ))}
                  {[stats.tempat_makan?.pending, stats.users?.diblokir, allPlaces.filter(p => !p.has_coords).length, stats.tempat_makan?.ditolak].every(v => !v) && (
                    <div className="flex items-center gap-3 px-4 py-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-2xl">✅</span>
                      <p className="text-sm font-black text-emerald-700">Semua bersih! Tidak ada masalah yang terdeteksi.</p>
                    </div>
                  )}
                </div>
              </div>

            </>) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400">
                <p className="text-2xl mb-2">📊</p>
                Gagal memuat statistik. Coba refresh.
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64 text-xs font-bold text-gray-400">
            <div className="text-center">
              <div className="animate-spin text-2xl mb-2">⏳</div>
              <p>Memuat data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── TAB: VERIFIKASI TEMPAT MAKAN ────────────────────────────── */}
            {activeTab === 'places' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingPlaces.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400">
                    Tidak ada pengajuan tempat makan baru
                  </div>
                ) : (
                  pendingPlaces.map((warung) => (
                    <div key={warung.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] px-2.5 py-1 bg-orange-50 text-[#FA5A15] rounded-md font-bold">{warung.kategori}</span>
                          <span className="text-[10px] px-2 py-0.5 bg-yellow-100 text-yellow-700 font-black rounded-md">Pending</span>
                        </div>
                        <h3 className="text-sm font-black text-[#001A41] mt-3">{warung.nama}</h3>
                        <p className="text-xs text-gray-400 mt-1">{warung.alamat}</p>
                        {warung.jam_buka && warung.jam_tutup && (
                          <p className="text-[11px] text-blue-500 font-bold mt-1">🕐 {warung.jam_buka} – {warung.jam_tutup} WIB</p>
                        )}
                        <p className="text-xs text-gray-600 mt-2.5 line-clamp-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100/60 leading-relaxed font-medium">
                          {warung.deskripsi || 'Tidak ada deskripsi.'}
                        </p>
                        <p className="text-[11px] font-black text-[#B35300] mt-3">
                          Rp {warung.harga_min?.toLocaleString()} – Rp {warung.harga_max?.toLocaleString()}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={() => handlePlaceAction(warung.id, 'Ditolak')}
                          className="py-2.5 rounded-xl border border-red-200 text-red-600 font-bold text-xs bg-red-50/50 hover:bg-red-50 cursor-pointer transition"
                        >Tolak</button>
                        <button onClick={() => handlePlaceAction(warung.id, 'Disetujui')}
                          className="py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white font-black text-xs cursor-pointer shadow-md transition"
                        >Setujui & Publikasikan</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: MODERASI ULASAN ────────────────────────────────────── */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {pendingReviews.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400">
                    Seluruh ulasan mahasiswa bersih terverifikasi
                  </div>
                ) : (
                  pendingReviews.map((rev) => (
                    <div key={rev.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-[#001A41]">User ID: {rev.user_id}</span>
                          <span className="text-xs text-gray-400 font-medium">menulis di</span>
                          <span className="text-xs font-bold text-[#FA5A15]">{rev.nama_warung}</span>
                        </div>
                        <div className="flex text-amber-400 text-xs">
                          {Array.from({ length: rev.rating }).map((_, i) => <span key={i}>★</span>)}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed font-medium bg-gray-50/50 p-3 rounded-xl border border-dashed border-gray-200">
                          "{rev.komentar}"
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5 shrink-0">
                        <button onClick={() => handleReviewAction(rev.id, 'Ditolak')}
                          className="px-5 py-3 rounded-xl border border-gray-200 text-red-500 font-bold text-xs hover:bg-red-50 transition cursor-pointer"
                        >Hapus / Blokir</button>
                        <button onClick={() => handleReviewAction(rev.id, 'Disetujui')}
                          className="px-5 py-3 rounded-xl bg-[#001A41] hover:bg-[#00265F] text-white font-black text-xs shadow-md transition cursor-pointer"
                        >Loloskan Testimoni</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── TAB: KELOLA KOTA ────────────────────────────────────────── */}
            {activeTab === 'cities' && (
              <div>
                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-[#001A41]">{cities.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total Kota</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-[#001A41]">{universities.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total Kampus</p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                    <p className="text-2xl font-black text-[#001A41]">
                      {cities.reduce((s, c) => s + (c.jumlah_tempat_makan || 0), 0)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total Tempat Makan</p>
                  </div>
                </div>

                {/* Tabel kota */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Nama Kota</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Jumlah Kampus</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Tempat Makan</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {cities.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-gray-400 font-bold">Belum ada data kota.</td></tr>
                      ) : (
                        cities.map(city => (
                          <tr key={city.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-base"></span>
                                <span className="font-black text-[#001A41]">{city.nama_kota}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                                {city.jumlah_kampus || 0} kampus
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="bg-orange-50 text-[#FA5A15] font-bold px-2.5 py-1 rounded-lg text-[11px]">
                                {city.jumlah_tempat_makan || 0} spot
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => confirmDeleteCity(city)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 font-bold text-[11px] transition cursor-pointer"
                              >🗑 Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB: KELOLA KAMPUS ──────────────────────────────────────── */}
            {activeTab === 'universities' && (
              <div>
                {/* Filter kota */}
                <div className="flex items-center gap-3 mb-5">
                  <label className="text-xs font-black text-gray-500 shrink-0">Filter Kota:</label>
                  <select value={filterKota} onChange={e => setFilterKota(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] bg-white"
                  >
                    <option value="">Semua Kota ({universities.length})</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nama_kota} ({universities.filter(u => String(u.city_id) === String(c.id)).length})
                      </option>
                    ))}
                  </select>
                  {filterKota && (
                    <button onClick={() => setFilterKota('')} className="text-[11px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer">✕ Reset</button>
                  )}
                </div>

                {/* Tabel kampus */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-5 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Nama Kampus</th>
                        <th className="text-left px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Kota</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Tempat Makan</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Koordinat</th>
                        <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredUnis.length === 0 ? (
                        <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-bold">Belum ada data kampus.</td></tr>
                      ) : (
                        filteredUnis.map(uni => (
                          <tr key={uni.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2.5">
                                <span className="text-base"></span>
                                <span className="font-black text-[#001A41]">{uni.nama_universitas}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg text-[11px]">
                                {uni.nama_kota}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="bg-orange-50 text-[#FA5A15] font-bold px-2.5 py-1 rounded-lg text-[11px]">
                                {uni.jumlah_tempat_makan || 0} spot
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              {(parseFloat(uni.latitude) !== 0 || parseFloat(uni.longitude) !== 0) ? (
                                <span className="text-emerald-600 font-bold text-[10px]">
                                  {parseFloat(uni.latitude).toFixed(4)}, {parseFloat(uni.longitude).toFixed(4)}
                                </span>
                              ) : (
                                <span className="text-gray-300 font-bold text-[10px]">Belum diset</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => confirmDeleteUniversity(uni)}
                                className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 font-bold text-[11px] transition cursor-pointer"
                              >🗑 Hapus</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {/* ── TAB: KELOLA & OVERRIDE TEMPAT MAKAN ─────────────────── */}
            {activeTab === 'manage' && (
              <div className="space-y-4">

                {/* Filter bar */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    placeholder="🔍 Cari nama / alamat..."
                    value={filterManageSearch}
                    onChange={e => setFilterManageSearch(e.target.value)}
                    className="flex-1 min-w-45 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300"
                  />
                  <select
                    value={filterManageStatus}
                    onChange={e => setFilterManageStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15] cursor-pointer"
                  >
                    <option value="">Semua Status</option>
                    <option value="Disetujui">Disetujui</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                  <span className="text-[11px] font-bold text-gray-400 shrink-0">
                    {filteredManagePlaces.length} tempat makan
                  </span>
                </div>

                {/* Tabel */}
                {filteredManagePlaces.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 text-xs font-bold text-gray-400">
                    Tidak ada data tempat makan yang cocok.
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider">Tempat Makan</th>
                          <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider">Harga</th>
                          <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider">Jam</th>
                          <th className="text-left px-4 py-3 font-black text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="text-center px-4 py-3 font-black text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredManagePlaces.map(place => (
                          <tr key={place.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {place.banner_img && place.banner_img !== 'default_warung.jpg' ? (
                                  <img src={place.banner_img} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-100" />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">🍽️</div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-black text-[#001A41] truncate max-w-45">{place.nama}</p>
                                  <p className="text-gray-400 font-medium truncate max-w-45">{place.alamat}</p>
                                  <p className="text-[10px] text-orange-500 font-bold mt-0.5">{place.kategori}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-[#001A41] font-bold whitespace-nowrap">
                              Rp {Number(place.harga_min).toLocaleString('id-ID')}<br/>
                              <span className="text-gray-400 font-medium">– Rp {Number(place.harga_max).toLocaleString('id-ID')}</span>
                            </td>
                            <td className="px-4 py-3 font-bold text-[#001A41] whitespace-nowrap">
                              {place.jam_buka || '–'} <span className="text-gray-400">–</span> {place.jam_tutup || '–'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-block px-2.5 py-1 rounded-lg font-black text-[10px] uppercase tracking-wider ${
                                place.status_verifikasi === 'Disetujui' ? 'bg-emerald-50 text-emerald-700' :
                                place.status_verifikasi === 'Diproses'  ? 'bg-amber-50 text-amber-700' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {place.status_verifikasi === 'Disetujui' ? '' : place.status_verifikasi === 'Diproses' ? '' : ''} {place.status_verifikasi}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => openEditPlace(place)}
                                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition cursor-pointer whitespace-nowrap"
                                >Edit</button>
                                <button
                                  onClick={() => confirmDeletePlace(place)}
                                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-bold text-[11px] transition cursor-pointer whitespace-nowrap"
                                >Hapus</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB: KELOLA KOORDINAT ───────────────────────────────── */}

            {activeTab === 'coordinates' && (() => {
              const filtered = allPlaces.filter(p => {
                const matchKampus = !filterCoordKampus || String(p.university_id) === String(filterCoordKampus);
                const matchStatus = !filterCoordStatus
                  || (filterCoordStatus === 'belum' && !p.has_coords)
                  || (filterCoordStatus === 'sudah' && p.has_coords);
                return matchKampus && matchStatus;
              });
              const belumCount = allPlaces.filter(p => !p.has_coords).length;
              const sudahCount = allPlaces.filter(p => p.has_coords).length;
              return (
                <div>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-[#001A41]">{allPlaces.length}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total Tempat Makan</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-emerald-600">{sudahCount}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Koordinat Lengkap</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-red-500">{belumCount}</p>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-0.5">Belum Ada Koordinat</p>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <select value={filterCoordKampus} onChange={e => setFilterCoordKampus(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] bg-white"
                    >
                      <option value="">Semua Kampus</option>
                      {universities.map(u => (
                        <option key={u.id} value={u.id}>{u.nama_universitas}</option>
                      ))}
                    </select>
                    <div className="flex gap-1.5">
                      {[{v:'',l:'Semua'},{v:'belum',l:'Belum Diset'},{v:'sudah',l:'Sudah Diset'}].map(({v,l}) => (
                        <button key={v} type="button" onClick={() => setFilterCoordStatus(v)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            filterCoordStatus === v
                              ? 'bg-[#001A41] text-white border-[#001A41]'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >{l}</button>
                      ))}
                    </div>
                    {(filterCoordKampus || filterCoordStatus) && (
                      <button onClick={() => { setFilterCoordKampus(''); setFilterCoordStatus(''); }}
                        className="text-[11px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                      >✕ Reset Filter</button>
                    )}
                    <span className="text-[11px] text-gray-400 font-medium ml-auto">{filtered.length} tempat makan</span>
                  </div>

                  {/* Tabel */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-5 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Tempat Makan</th>
                          <th className="text-left px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Kampus</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Status</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Koordinat</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                          <tr><td colSpan={5} className="text-center py-10 text-gray-400 font-bold">Tidak ada data.</td></tr>
                        ) : filtered.map(place => (
                          <tr key={place.id} className="hover:bg-gray-50/50 transition">
                            <td className="px-5 py-3.5">
                              <p className="font-black text-[#001A41] leading-tight">{place.nama}</p>
                              <p className="text-[10px] text-gray-400 font-medium mt-0.5 max-w-50 truncate">{place.alamat}</p>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-lg text-[11px]">
                                {universities.find(u => u.id === place.university_id)?.nama_universitas?.split('(')[0]?.trim() || '-'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {place.has_coords ? (
                                <span className="bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-lg text-[11px]">Lengkap</span>
                              ) : (
                                <span className="bg-red-50 text-red-500 font-bold px-2.5 py-1 rounded-lg text-[11px]">Belum diset</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              {place.has_coords ? (
                                <span className="text-[10px] font-bold text-emerald-600 font-mono">
                                  {parseFloat(place.latitude).toFixed(5)},<br/>{parseFloat(place.longitude).toFixed(5)}
                                </span>
                              ) : (
                                <span className="text-[10px] text-gray-300 font-bold">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <button
                                onClick={() => setCoordModal({ place })}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                                  place.has_coords
                                    ? 'bg-blue-50 border border-blue-100 text-blue-500 hover:bg-blue-100'
                                    : 'bg-[#FA5A15] text-white hover:bg-orange-600 shadow-sm'
                                }`}
                              >{place.has_coords ? 'Edit' : 'Set Koordinat'}</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* ── TAB: KELOLA DATA USER / MAHASISWA ──────────────────────── */}
            {activeTab === 'users' && (() => {
              const blockedCount  = allUsers.filter(u => u.status === 'Diblokir').length;
              const activeCount   = allUsers.filter(u => u.status !== 'Diblokir').length;
              const mahasiswaCount = allUsers.filter(u => u.role === 'Mahasiswa').length;
              return (
                <div>
                  {/* Summary cards */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-[#001A41]">{allUsers.length}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Total Akun</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-blue-600">{mahasiswaCount}</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mt-0.5">Mahasiswa</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Akun Aktif</p>
                    </div>
                    <div className="bg-red-50 rounded-2xl p-4 border border-red-100 shadow-sm text-center">
                      <p className="text-2xl font-black text-red-500">{blockedCount}</p>
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mt-0.5">Diblokir</p>
                    </div>
                  </div>

                  {/* Filter bar */}
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <input
                      type="text"
                      value={filterUserSearch}
                      onChange={e => setFilterUserSearch(e.target.value)}
                      placeholder="Cari nama atau email..."
                      className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] w-56 placeholder-gray-300"
                    />
                    <div className="flex gap-1.5">
                      {[{v:'',l:'Semua Role'},{v:'Mahasiswa',l:'Mahasiswa'},{v:'Admin',l:'Admin'}].map(({v,l}) => (
                        <button key={v} type="button" onClick={() => setFilterUserRole(v)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${filterUserRole === v ? 'bg-[#001A41] text-white border-[#001A41]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >{l}</button>
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      {[{v:'',l:'Semua Status'},{v:'Aktif',l:'Aktif'},{v:'Diblokir',l:'Diblokir'}].map(({v,l}) => (
                        <button key={v} type="button" onClick={() => setFilterUserStatus(v)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${filterUserStatus === v ? 'bg-[#001A41] text-white border-[#001A41]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >{l}</button>
                      ))}
                    </div>
                    {(filterUserSearch || filterUserRole || filterUserStatus) && (
                      <button onClick={() => { setFilterUserSearch(''); setFilterUserRole(''); setFilterUserStatus(''); }}
                        className="text-[11px] text-gray-400 hover:text-gray-600 font-bold cursor-pointer"
                      >✕ Reset</button>
                    )}
                    <span className="text-[11px] text-gray-400 font-medium ml-auto">{filteredUsers.length} akun</span>
                  </div>

                  {/* Tabel user */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="text-left px-5 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">User</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Role</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Status</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Kontribusi</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Bergabung</th>
                          <th className="text-center px-4 py-3.5 font-black text-[#001A41] uppercase tracking-wider text-[10px]">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={6} className="text-center py-10 text-gray-400 font-bold">Tidak ada data user.</td></tr>
                        ) : filteredUsers.map(user => {
                          const isAdmin   = user.role === 'Admin';
                          const isBlocked = user.status === 'Diblokir';
                          return (
                            <tr key={user.id} className={`hover:bg-gray-50/50 transition ${isBlocked ? 'opacity-60' : ''}`}>

                              {/* User info */}
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-black shrink-0 ${isAdmin ? 'bg-[#001A41] text-white' : 'bg-orange-100 text-[#FA5A15]'}`}>
                                    {user.foto_profil ? (
                                      <img src={user.foto_profil} alt={user.nama_lengkap} className="w-full h-full object-cover" />
                                    ) : (
                                      <span>{user.nama_lengkap?.charAt(0)?.toUpperCase() || '?'}</span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-black text-[#001A41] leading-tight">{user.nama_lengkap}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">{user.email}</p>
                                    {user.nomor_telepon && (
                                      <p className="text-[10px] text-gray-300 font-medium">{user.nomor_telepon}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Role */}
                              <td className="px-4 py-3.5 text-center">
                                <span className={`font-bold px-2.5 py-1 rounded-lg text-[11px] ${isAdmin ? 'bg-[#001A41] text-white' : 'bg-blue-50 text-blue-700'}`}>
                                  {isAdmin ? 'Admin' : 'Mahasiswa'}
                                </span>
                              </td>

                              {/* Status */}
                              <td className="px-4 py-3.5 text-center">
                                {isBlocked ? (
                                  <span className="bg-red-50 text-red-500 font-bold px-2.5 py-1 rounded-lg text-[11px]">Diblokir</span>
                                ) : (
                                  <span className="bg-emerald-50 text-emerald-600 font-bold px-2.5 py-1 rounded-lg text-[11px]">Aktif</span>
                                )}
                              </td>

                              {/* Kontribusi */}
                              <td className="px-4 py-3.5 text-center">
                                <div className="flex items-center justify-center gap-3">
                                  <div className="text-center">
                                    <p className="font-black text-[#001A41]">{user.jumlah_tempat_diajukan}</p>
                                    <p className="text-[9px] text-gray-400 font-bold">Warung</p>
                                  </div>
                                  <div className="w-px h-6 bg-gray-100"></div>
                                  <div className="text-center">
                                    <p className="font-black text-[#001A41]">{user.jumlah_ulasan}</p>
                                    <p className="text-[9px] text-gray-400 font-bold">Ulasan</p>
                                  </div>
                                </div>
                              </td>

                              {/* Tanggal bergabung */}
                              <td className="px-4 py-3.5 text-center">
                                <span className="text-[11px] text-gray-400 font-medium">
                                  {new Date(user.created_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                                </span>
                              </td>

                              {/* Aksi */}
                              <td className="px-4 py-3.5">
                                {isAdmin ? (
                                  <span className="text-[10px] text-gray-300 font-bold text-center block">—</span>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    {/* Blokir / Aktifkan */}
                                    {isBlocked ? (
                                      <button
                                        onClick={() => handleUserStatus(user, 'Aktif')}
                                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold text-[11px] hover:bg-emerald-100 transition cursor-pointer"
                                      >Aktifkan</button>
                                    ) : (
                                      <button
                                        onClick={() => setConfirmModal({
                                          message: `Blokir akun "${user.nama_lengkap}"? User tidak akan bisa login hingga diaktifkan kembali.`,
                                          onConfirm: () => { setConfirmModal(null); handleUserStatus(user, 'Diblokir'); }
                                        })}
                                        className="px-2.5 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-500 font-bold text-[11px] hover:bg-orange-100 transition cursor-pointer"
                                      >Blokir</button>
                                    )}
                                    {/* Reset kontribusi */}
                                    {user.jumlah_tempat_diajukan > 0 && (
                                      <button
                                        onClick={() => handleUserReset(user)}
                                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-500 font-bold text-[11px] hover:bg-blue-100 transition cursor-pointer"
                                      >Reset</button>
                                    )}
                                    {/* Hapus akun */}
                                    <button
                                      onClick={() => confirmDeleteUser(user)}
                                      className="px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-500 font-bold text-[11px] hover:bg-red-100 transition cursor-pointer"
                                    >Hapus</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Info blokir */}
                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[11px] text-amber-700 font-medium">
                    <span className="font-black">Catatan:</span> Memblokir akun mencegah login user. Tombol <strong>Reset</strong> mengembalikan semua warung yang disetujui ke status <em>Diproses</em> untuk direview ulang — berguna jika user terdeteksi spam. Hapus akun bersifat permanen dan menghapus seluruh data terkait.
                  </div>
                </div>
              );
            })()}


          </>
        )}
      </div>

      {/* ── MODAL KONFIRMASI HAPUS ───────────────────────────────────────────── */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      {/* ── MODAL TAMBAH ────────────────────────────────────────────────────── */}
      {addModal && (
        <AddModal
          title={addModal.title}
          fields={addModal.fields}
          onSubmit={addModal.onSubmit}
          onClose={() => setAddModal(null)}
          loading={addLoading}
        />
      )}

      {/* ── MODAL KOORDINAT ─────────────────────────────────────────────────── */}
      {coordModal && (
        <CoordModal
          place={coordModal.place}
          onClose={() => setCoordModal(null)}
          onSaved={() => { setCoordModal(null); fetchAll(); }}
        />
      )}

      {/* ── MODAL EDIT TEMPAT MAKAN ──────────────────────────────────────────── */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="text-sm font-black text-[#001A41]">Edit Tempat Makan</h3>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">ID #{editModal.id} — {editModal.nama}</p>
              </div>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-gray-600 font-bold text-sm cursor-pointer">✕</button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

              {/* Nama */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Nama Tempat Makan *</label>
                <input type="text" value={editForm.nama}
                  onChange={e => setEditForm(f => ({...f, nama: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                />
              </div>

              {/* Alamat */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Alamat *</label>
                <textarea value={editForm.alamat} rows={2}
                  onChange={e => setEditForm(f => ({...f, alamat: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] resize-none"
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Kategori</label>
                <input type="text" value={editForm.kategori}
                  onChange={e => setEditForm(f => ({...f, kategori: e.target.value}))}
                  placeholder="Contoh: Warteg/Warung Makan"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                />
              </div>

              {/* Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Harga Min (Rp)</label>
                  <input type="number" value={editForm.harga_min}
                    onChange={e => setEditForm(f => ({...f, harga_min: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Harga Max (Rp)</label>
                  <input type="number" value={editForm.harga_max}
                    onChange={e => setEditForm(f => ({...f, harga_max: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                  />
                </div>
              </div>

              {/* Jam Operasional */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Jam Buka</label>
                  <input type="time" value={editForm.jam_buka}
                    onChange={e => setEditForm(f => ({...f, jam_buka: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Jam Tutup</label>
                  <input type="time" value={editForm.jam_tutup}
                    onChange={e => setEditForm(f => ({...f, jam_tutup: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15]"
                  />
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Deskripsi</label>
                <textarea value={editForm.deskripsi} rows={3}
                  onChange={e => setEditForm(f => ({...f, deskripsi: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-medium text-[#001A41] focus:outline-none focus:border-[#FA5A15] resize-none"
                />
              </div>

              {/* Status Verifikasi */}
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">Status Verifikasi</label>
                <select value={editForm.status_verifikasi}
                  onChange={e => setEditForm(f => ({...f, status_verifikasi: e.target.value}))}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15] cursor-pointer"
                >
                  <option value="Disetujui">Disetujui — tampil di Home</option>
                  <option value="Diproses">Diproses — menunggu verifikasi</option>
                  <option value="Ditolak">Ditolak — disembunyikan dari publik</option>
                </select>
                <p className="text-[10px] text-gray-400 mt-1.5">
                  💡 Ubah ke <strong>Ditolak</strong> untuk menyembunyikan tanpa menghapus permanen, atau <strong>Hapus</strong> jika sudah tutup permanen.
                </p>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 shrink-0">
              <button onClick={() => setEditModal(null)}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition cursor-pointer"
              >Batal</button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="py-3 rounded-xl bg-[#001A41] hover:bg-[#00265F] disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs transition cursor-pointer"
                style={{flexGrow: 2}}
              >
                {editLoading
                  ? <span className="flex items-center justify-center gap-2"><span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Menyimpan...</span>
                  : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
