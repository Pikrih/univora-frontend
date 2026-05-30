import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNav from '../components/BottomNav';

export default function EditProfile() {
  const navigate  = useNavigate();

  // Baca user dari localStorage — sudah diupdate oleh Profile.jsx sebelumnya
  const storedUser = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();

  const [name,  setName]  = useState(storedUser?.nama_lengkap  || '');
  const [phone, setPhone] = useState(storedUser?.nomor_telepon || '');
  const [avatar, setAvatar] = useState(storedUser?.foto_profil || null); // URL dari server atau null
  const [avatarFile, setAvatarFile] = useState(null); // File baru yang dipilih user
  const [avatarPreview, setAvatarPreview] = useState(storedUser?.foto_profil || null); // Preview lokal

  const [saving,        setSaving]        = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [toast,          setToast]          = useState(null); // { msg, type }

  const fileInputRef = useRef(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Saat user pilih file baru — tampilkan preview, simpan file untuk diupload nanti
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showToast('Ukuran foto maksimal 5MB.', 'error'); return; }
    if (!file.type.startsWith('image/')) { showToast('File harus berupa gambar.', 'error'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const triggerFileInput = () => fileInputRef.current.click();

  // Simpan semua perubahan
  const handleSave = async (e) => {
    e.preventDefault();
    if (!storedUser?.id) { showToast('Sesi kamu sudah habis. Silakan login ulang.', 'error'); return; }
    if (!name.trim()) { showToast('Nama lengkap tidak boleh kosong.', 'error'); return; }

    setSaving(true);
    try {
      // 1. Upload foto profil baru jika ada
      let fotoUrl = avatar;
      if (avatarFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('foto', avatarFile);
        const uploadRes = await axios.post(
          `https://univora-backend-production.up.railway.app/api/users/${storedUser.id}/avatar`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        if (uploadRes.data.success) {
          fotoUrl = uploadRes.data.foto_url;
          setAvatar(fotoUrl);
          setAvatarFile(null);
        } else {
          showToast(uploadRes.data.message || 'Gagal upload foto.', 'error');
          setUploadingPhoto(false);
          setSaving(false);
          return;
        }
        setUploadingPhoto(false);
      }

      // 2. Update nama & nomor telepon
      const updateRes = await axios.put(`https://univora-backend-production.up.railway.app/api/users/${storedUser.id}`, {
        nama_lengkap:  name.trim(),
        nomor_telepon: phone.trim() || null,
      });

      if (updateRes.data.success) {
        // 3. Update localStorage dengan data terbaru dari server
        const updatedUser = {
          ...storedUser,
          nama_lengkap:  name.trim(),
          nomor_telepon: phone.trim() || null,
          foto_profil:   fotoUrl,
          ...(updateRes.data.user || {}),
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        showToast('Profil berhasil diperbarui!', 'success');
        setTimeout(() => navigate('/profile'), 1200);
      } else {
        showToast(updateRes.data.message || 'Gagal memperbarui profil.', 'error');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal terhubung ke server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const inisial = (name || storedUser?.nama_lengkap || 'U').charAt(0).toUpperCase();

  return (
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-[#F8FAFC] font-sans antialiased relative pb-24 overflow-hidden">

      {/* TOAST */}
      {toast && (
        <div className={`fixed top-5 inset-x-4 z-50 max-w-md mx-auto py-2.5 px-4 rounded-2xl text-xs font-bold text-center shadow-xl transition-all ${
          toast.type === 'success' ? 'bg-[#001A41] text-white' :
          toast.type === 'error'   ? 'bg-red-500 text-white'   :
                                     'bg-gray-700 text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white px-4 py-4 flex items-center gap-3 shrink-0 border-b border-gray-50">
        <button onClick={() => navigate('/profile')} className="text-[#001A41] cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-black text-[#001A41] tracking-tight">Edit Profil</h1>
      </div>

      {/* FORM */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <form onSubmit={handleSave} className="space-y-5">

          {/* FOTO PROFIL */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 flex flex-col items-center text-center shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Avatar preview */}
            <div
              onClick={triggerFileInput}
              className="h-24 w-24 rounded-full overflow-hidden bg-orange-100 border-2 border-white shadow-md flex items-center justify-center relative group cursor-pointer"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-[#FA5A15]">{inisial}</span>
              )}
              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-black">📷</span>
                <span className="text-white text-[10px] font-bold mt-0.5">Ganti</span>
              </div>
            </div>

            {avatarFile && (
              <span className="mt-1.5 text-[10px] text-emerald-600 font-bold">Foto baru dipilih</span>
            )}

            <button
              type="button"
              onClick={triggerFileInput}
              className="mt-3 text-xs font-black text-[#FA5A15] hover:underline cursor-pointer"
            >
              {uploadingPhoto ? 'Mengupload...' : 'Ganti Foto Profil'}
            </button>
            <p className="text-[10px] text-gray-300 font-medium mt-0.5">Maks. 5MB · JPG, PNG, WEBP</p>
          </div>

          {/* INPUT DATA */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.01)] space-y-4">

            {/* Email — read only */}
            <div>
              <label className="block text-[10px] font-black text-gray-400 mb-1.5 uppercase tracking-wider">Email (tidak dapat diubah)</label>
              <input
                type="email"
                value={storedUser?.email || ''}
                readOnly
                className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-gray-400 cursor-not-allowed font-medium"
              />
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-[10px] font-black text-[#001A41] mb-1.5 uppercase tracking-wider">Nama Lengkap <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Masukkan nama lengkap kamu"
                className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300 font-bold tracking-tight"
                required
              />
            </div>

            {/* Nomor Telepon */}
            <div>
              <label className="block text-[10px] font-black text-[#001A41] mb-1.5 uppercase tracking-wider">Nomor Telepon</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full bg-[#F8FAFC] border border-gray-100 rounded-xl px-3 py-2.5 text-xs text-[#001A41] focus:outline-none focus:border-[#FA5A15] placeholder-gray-300 font-medium tracking-tight"
              />
            </div>

          </div>

          {/* TOMBOL SIMPAN */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#001A41] hover:bg-[#00112c] disabled:bg-gray-300 text-white font-black py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-sm tracking-wide"
          >
            {saving ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span>Simpan Perubahan</span>
              </>
            )}
          </button>

        </form>
      </div>

      <BottomNav activeTab="profile" />
    </div>
  );
}
