import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

export default function AddSpot() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    namaWarung: '', alamat: '', hargaMin: '', hargaMax: '', deskripsi: '',
    jamBuka: '08:00', jamTutup: '21:00',
  });

  const [selectedKategori, setSelectedKategori] = useState([]);
  const [masterKategori, setMasterKategori]     = useState([]);
  // Cover foto
  const [coverFile, setCoverFile]               = useState(null);
  const [coverPreview, setCoverPreview]         = useState(null);
  // Galeri foto (multi)
  const [galeriFiles, setGaleriFiles]           = useState([]);   // array File
  const [galeriPreviews, setGaleriPreviews]     = useState([]);   // array URL
  const [isSubmitting, setIsSubmitting]         = useState(false);

  useEffect(() => {
    axios.get('https://univora-backend-production.up.railway.app/api/kategori')
      .then(res => { if (res.data.success) setMasterKategori(res.data.data); })
      .catch(() => {});
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) { setCoverFile(file); setCoverPreview(URL.createObjectURL(file)); }
  };

  // Tambah foto galeri (bisa berkali-kali, akumulatif)
  const handleGaleriChange = (e) => {
    const files = Array.from(e.target.files);
    if (galeriFiles.length + files.length > 10) {
      alert('Maksimal 10 foto galeri.'); return;
    }
    setGaleriFiles(prev => [...prev, ...files]);
    setGaleriPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = ''; // reset agar bisa upload file sama lagi
  };

  const removeGaleri = (idx) => {
    setGaleriFiles(prev => prev.filter((_, i) => i !== idx));
    setGaleriPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const toggleKategori = (id) => {
    setSelectedKategori(prev => prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]);
  };

  const hitungDurasi = () => {
    if (!formData.jamBuka || !formData.jamTutup) return '';
    const [bH, bM] = formData.jamBuka.split(':').map(Number);
    const [tH, tM] = formData.jamTutup.split(':').map(Number);
    let dur = (tH * 60 + tM) - (bH * 60 + bM);
    if (dur < 0) dur += 24 * 60;
    const jam = Math.floor(dur / 60), menit = dur % 60;
    return menit > 0 ? `${jam} jam ${menit} menit` : `${jam} jam`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedKategori.length === 0) { alert('Pilih minimal 1 kategori kuliner.'); return; }
    setIsSubmitting(true);

    const userStorage = localStorage.getItem('user');
    const user = userStorage ? JSON.parse(userStorage) : null;
    const univId = localStorage.getItem('university_id') || localStorage.getItem('selected_university_id') || 1;

    const fd = new FormData();
    fd.append('university_id', parseInt(univId));
    fd.append('user_id',       user?.id ?? 1);
    fd.append('nama',          formData.namaWarung);
    fd.append('alamat',        formData.alamat);
    fd.append('deskripsi',     formData.deskripsi);
    fd.append('harga_min',     parseInt(formData.hargaMin) || 0);
    fd.append('harga_max',     parseInt(formData.hargaMax) || 0);
    fd.append('jam_buka',      formData.jamBuka);
    fd.append('jam_tutup',     formData.jamTutup);
    fd.append('kategori_ids',  JSON.stringify(selectedKategori));
    // Cover: field 'foto'
    if (coverFile) fd.append('foto', coverFile);
    // Galeri: field 'galeri' (multiple)
    galeriFiles.forEach(f => fd.append('galeri', f));

    try {
      const res = await axios.post('https://univora-backend-production.up.railway.app/api/places', fd);
      if (res.data.success) { alert('Rekomendasi tempat makan berhasil terkirim! ✨'); navigate('/home'); }
    } catch (err) {
      alert('Gagal: ' + (err.response?.data?.message || 'Terjadi kesalahan jaringan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-gray-50 font-sans antialiased relative pb-20 overflow-hidden">
      <div className="bg-white px-5 py-4 border-b border-gray-100 flex items-center shadow-sm shrink-0 z-10">
        <h1 className="text-xl font-black text-[#001A41]">Tambah Spot Baru</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── FOTO COVER ──────────────────────────────────── */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#001A41]">Foto Utama / Cover</label>
            <div className="relative h-40 w-full border-2 border-dashed border-gray-200 rounded-2xl bg-white flex items-center justify-center overflow-hidden hover:border-[#FA5A15] transition">
              {coverPreview ? (
                <div className="relative w-full h-full">
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  <label className="absolute bottom-2 right-2 bg-white/90 text-[10px] font-bold text-[#001A41] px-2 py-1 rounded-lg cursor-pointer shadow border border-gray-100">
                    Ganti
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-4 text-center">
                  <span className="text-2xl mb-1">📸</span>
                  <span className="text-xs font-bold text-[#001A41]">Upload Foto Cover Warung</span>
                  <span className="text-[10px] text-gray-400 mt-0.5">JPG/PNG, Maks. 5MB</span>
                  <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* ── FOTO GALERI (MULTI) ──────────────────────────── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#001A41]">Foto Galeri / Menu</label>
              <span className="text-[10px] text-gray-400 font-medium">{galeriFiles.length}/10 foto</span>
            </div>

            {/* Grid preview galeri */}
            {galeriPreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {galeriPreviews.map((src, idx) => (
                  <div key={idx} className="relative h-24 rounded-xl overflow-hidden bg-gray-100">
                    <img src={src} alt={`galeri-${idx}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeGaleri(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-[10px] flex items-center justify-center leading-none cursor-pointer"
                    >✕</button>
                  </div>
                ))}
                {/* Tombol tambah lebih */}
                {galeriFiles.length < 10 && (
                  <label className="h-24 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#FA5A15] transition">
                    <span className="text-lg">+</span>
                    <span className="text-[9px] font-bold text-gray-400 mt-0.5">Tambah</span>
                    <input type="file" accept="image/*" multiple onChange={handleGaleriChange} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {galeriPreviews.length === 0 && (
              <label className="w-full h-20 border-2 border-dashed border-gray-200 rounded-2xl bg-white flex items-center justify-center gap-3 cursor-pointer hover:border-[#FA5A15] transition">
                <span className="text-xl">🖼️</span>
                <div>
                  <p className="text-xs font-bold text-[#001A41]">Upload Foto Menu / Galeri</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Boleh pilih beberapa sekaligus, maks 10 foto</p>
                </div>
                <input type="file" accept="image/*" multiple onChange={handleGaleriChange} className="hidden" />
              </label>
            )}
          </div>

          {/* NAMA */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#001A41]">Nama Tempat Makan</label>
            <input type="text" name="namaWarung" value={formData.namaWarung} onChange={handleChange}
              placeholder="Contoh: Nasi Goreng Spesial Kang Jono" required
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-medium placeholder-gray-300 focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
            />
          </div>

          {/* ALAMAT */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#001A41]">Alamat / Lokasi Sekitar Kampus</label>
            <input type="text" name="alamat" value={formData.alamat} onChange={handleChange}
              placeholder="Contoh: Jl. Sekaran Raya (Depan Gerbang Utama)" required
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-medium placeholder-gray-300 focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
            />
          </div>

          {/* JAM OPERASIONAL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#001A41]">Jam Operasional</label>
              {formData.jamBuka && formData.jamTutup && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">⏱ {hitungDurasi()}</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Buka</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs pointer-events-none">🟢</span>
                  <input type="time" name="jamBuka" value={formData.jamBuka} onChange={handleChange} required
                    className="w-full pl-8 pr-3 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tutup</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs pointer-events-none">🔴</span>
                  <input type="time" name="jamTutup" value={formData.jamTutup} onChange={handleChange} required
                    className="w-full pl-8 pr-3 py-3 bg-white border border-gray-100 rounded-xl text-xs font-bold text-[#001A41] focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
                  />
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
              <span className="text-sm">🕐</span>
              <p className="text-[11px] font-bold text-blue-700">
                Buka pukul <span className="text-blue-900">{formData.jamBuka}</span> – Tutup pukul <span className="text-blue-900">{formData.jamTutup}</span> WIB
              </p>
            </div>
          </div>

          {/* KATEGORI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#001A41]">Kategori Kuliner</label>
              <span className="text-[10px] text-gray-400 font-medium">Boleh pilih lebih dari 1</span>
            </div>
            {masterKategori.length === 0 ? (
              <p className="text-[10px] text-gray-400">Memuat kategori...</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {masterKategori.map((kat) => {
                  const isChecked = selectedKategori.includes(kat.id);
                  return (
                    <button key={kat.id} type="button" onClick={() => toggleKategori(kat.id)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition cursor-pointer select-none ${
                        isChecked ? 'bg-[#FA5A15] text-white border-[#FA5A15] shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-[#FA5A15] hover:text-[#FA5A15]'
                      }`}
                    >
                      {isChecked && <span className="mr-1">✓</span>}{kat.nama}
                    </button>
                  );
                })}
              </div>
            )}
            {selectedKategori.length === 0 && <p className="text-[10px] text-red-400 font-medium">* Pilih minimal 1 kategori</p>}
          </div>

          {/* HARGA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#001A41]">Harga Terendah (Rp)</label>
              <input type="number" name="hargaMin" value={formData.hargaMin} onChange={handleChange} placeholder="10000" required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-medium placeholder-gray-300 focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-black text-[#001A41]">Harga Tertinggi (Rp)</label>
              <input type="number" name="hargaMax" value={formData.hargaMax} onChange={handleChange} placeholder="25000" required
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-medium placeholder-gray-300 focus:outline-none focus:border-[#FA5A15] shadow-sm transition"
              />
            </div>
          </div>

          {/* DESKRIPSI */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-[#001A41]">Deskripsi Singkat / Menu Andalan</label>
            <textarea name="deskripsi" value={formData.deskripsi} onChange={handleChange} rows="3" required
              placeholder="Tulis alasan kenapa mahasiswa wajib coba tempat ini..."
              className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-xs font-medium placeholder-gray-300 focus:outline-none focus:border-[#FA5A15] shadow-sm transition resize-none"
            />
          </div>

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-[#FA5A15] hover:bg-[#E04F10] disabled:bg-gray-300 text-white font-black py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Rekomendasi Tempat'}
          </button>
        </form>
      </div>

      <BottomNav activeTab="add-spot" />
    </div>
  );
}
