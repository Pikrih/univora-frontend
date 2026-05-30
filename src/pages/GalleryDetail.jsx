import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

export default function GalleryDetail() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const defaultTab = location.state?.activeTab || 'galeri';
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [fotoData, setFotoData]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [namaWarung, setNamaWarung] = useState('');

  // State modal upload
  const [showUpload, setShowUpload]       = useState(false);
  const [uploadFiles, setUploadFiles]     = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);
  const [uploadTipe, setUploadTipe]       = useState('galeri');
  const [uploading, setUploading]         = useState(false);

  // Lightbox
  const [lightboxIdx, setLightboxIdx] = useState(null);

  const placeId = localStorage.getItem('selected_place_id');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const fetchFoto = async () => {
    if (!placeId) return;
    setLoading(true);
    try {
      const [resFoto, resDetail] = await Promise.all([
        axios.get(`https://univora-backend-production.up.railway.app/api/places/${placeId}/photos`),
        axios.get(`https://univora-backend-production.up.railway.app/api/places/${placeId}`),
      ]);
      if (resFoto.data.success)   setFotoData(resFoto.data.data);
      if (resDetail.data.success) setNamaWarung(resDetail.data.data.nama || '');
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFoto(); }, []);

  const handlePickFiles = (e) => {
    const files = Array.from(e.target.files);
    if (uploadFiles.length + files.length > 10) { alert('Maks 10 foto.'); return; }
    setUploadFiles(prev => [...prev, ...files]);
    setUploadPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeFile = (idx) => {
    setUploadFiles(prev => prev.filter((_,i) => i !== idx));
    setUploadPreviews(prev => prev.filter((_,i) => i !== idx));
  };

  const handleUpload = async () => {
    if (!uploadFiles.length) { alert('Pilih minimal 1 foto.'); return; }
    setUploading(true);
    const fd = new FormData();
    uploadFiles.forEach(f => fd.append('foto', f));
    fd.append('tipe',    uploadTipe);
    fd.append('user_id', user?.id ?? 1);
    try {
      const res = await axios.post(`https://univora-backend-production.up.railway.app/api/places/${placeId}/photos`, fd);
      if (res.data.success) {
        alert(res.data.message);
        setShowUpload(false); setUploadFiles([]); setUploadPreviews([]);
        fetchFoto();
      }
    } catch (err) {
      alert('Gagal upload: ' + (err.response?.data?.message || 'Cek server.'));
    } finally { setUploading(false); }
  };

  const filtered = fotoData.filter(f => f.tipe === activeTab);

  return (
    <div className="min-h-screen bg-white pb-12 font-sans antialiased">

      {/* HEADER */}
      <div className="sticky top-0 z-20 bg-white px-4 py-3.5 border-b border-gray-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/detail')} className="text-[#001A41] cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-base font-black text-[#001A41] truncate max-w-45">
            {namaWarung || 'Menu & Galeri'}
          </h1>
        </div>
        <button
          onClick={() => { setShowUpload(true); setUploadFiles([]); setUploadPreviews([]); }}
          className="flex items-center gap-1 text-[11px] font-black text-white bg-[#FA5A15] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-orange-600 transition"
        >
          <span>+</span> Foto
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 mt-4">
        {/* TAB */}
        <div className="flex bg-gray-100 p-1 rounded-xl mb-5">
          {[
            { v: 'galeri', l: `📸 Galeri (${fotoData.filter(f=>f.tipe==='galeri').length})` },
            { v: 'menu',   l: `📋 Menu (${fotoData.filter(f=>f.tipe==='menu').length})` },
          ].map(({v,l}) => (
            <button key={v} onClick={() => setActiveTab(v)}
              className={`flex-1 text-center py-2.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === v ? 'bg-white text-[#001A41] shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >{l}</button>
          ))}
        </div>

        {/* KONTEN */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-2xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-3">{activeTab === 'galeri' ? '📷' : '📋'}</p>
            <p className="text-sm font-bold text-gray-400">Belum ada foto {activeTab}.</p>
            <p className="text-xs text-gray-300 mt-1">Klik tombol "+ Foto" untuk menambahkan!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((foto, idx) => (
              <div key={foto.id} onClick={() => setLightboxIdx(idx)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm group relative cursor-pointer"
              >
                <div className="h-36 w-full bg-gray-50 overflow-hidden">
                  <img src={foto.url} alt="Foto" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-2 bg-linear-to-t from-gray-950/70 to-transparent absolute bottom-0 left-0 right-0 text-white">
                  <p className="text-[9px] font-black truncate">👤 {foto.nama_uploader || 'Anonim'}</p>
                  <p className="text-[7px] text-gray-300 mt-0.5">
                    {new Date(foto.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[10px] text-center text-gray-400 font-medium mt-8 px-6 leading-relaxed">
          Foto merupakan kontribusi langsung dari mahasiswa. Tambahkan foto untuk membantu teman lainnya!
        </p>
      </div>

      {/* LIGHTBOX */}
      {lightboxIdx !== null && filtered[lightboxIdx] && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 shrink-0">
            <div>
              <p className="text-white text-xs font-black">{filtered[lightboxIdx].nama_uploader || 'Anonim'}</p>
              <p className="text-gray-400 text-[10px] mt-0.5">
                {new Date(filtered[lightboxIdx].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <button onClick={() => setLightboxIdx(null)} className="text-white text-lg font-black w-8 h-8 flex items-center justify-center cursor-pointer">✕</button>
          </div>
          <div className="flex-1 flex items-center justify-center px-4 relative">
            <button onClick={() => setLightboxIdx(i => (i - 1 + filtered.length) % filtered.length)}
              className="absolute left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/30 z-10">‹</button>
            <img src={filtered[lightboxIdx].url} alt="Lightbox" className="max-w-full max-h-full object-contain rounded-xl" />
            <button onClick={() => setLightboxIdx(i => (i + 1) % filtered.length)}
              className="absolute right-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-white/30 z-10">›</button>
          </div>
          <div className="text-center py-3 text-gray-400 text-[11px] font-bold shrink-0">
            {lightboxIdx + 1} / {filtered.length}
          </div>
        </div>
      )}

      {/* MODAL UPLOAD */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-[#001A41]">Tambah Foto</h3>
              <button onClick={() => setShowUpload(false)} className="text-gray-400 text-xs font-bold cursor-pointer">✕ Batal</button>
            </div>

            <div className="flex gap-2 mb-4">
              {[{v:'galeri',l:'📸 Galeri'},{v:'menu',l:'📋 Menu'}].map(({v,l}) => (
                <button key={v} onClick={() => setUploadTipe(v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    uploadTipe === v ? 'bg-[#001A41] text-white border-[#001A41]' : 'bg-white text-gray-500 border-gray-200'
                  }`}
                >{l}</button>
              ))}
            </div>

            {uploadPreviews.length === 0 ? (
              <label className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#FA5A15] transition mb-4">
                <span className="text-2xl mb-1">📁</span>
                <p className="text-xs font-bold text-[#001A41]">Pilih Foto</p>
                <p className="text-[10px] text-gray-400 mt-0.5">JPG/PNG, maks 10 foto</p>
                <input type="file" accept="image/*" multiple onChange={handlePickFiles} className="hidden" />
              </label>
            ) : (
              <div className="mb-4">
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {uploadPreviews.map((src, idx) => (
                    <div key={idx} className="relative h-16 rounded-xl overflow-hidden bg-gray-100">
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeFile(idx)}
                        className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full text-[9px] flex items-center justify-center cursor-pointer">✕</button>
                    </div>
                  ))}
                  {uploadFiles.length < 10 && (
                    <label className="h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-[#FA5A15] transition">
                      <span className="text-lg text-gray-400">+</span>
                      <input type="file" accept="image/*" multiple onChange={handlePickFiles} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-[10px] text-gray-400">{uploadFiles.length} foto dipilih</p>
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading || !uploadFiles.length}
              className="w-full bg-[#FA5A15] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl text-xs transition cursor-pointer"
            >
              {uploading ? 'Mengunggah...' : `Unggah ${uploadFiles.length || ''} Foto`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
