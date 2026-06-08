import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Import Axios di bagian atas

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [namaLengkap, setNamaLengkap] = useState(''); // State baru untuk input
  const [email, setEmail] = useState('');             // State baru untuk input
  const [password, setPassword] = useState('');       // State baru untuk input
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 2. Tembak API Backend Node.js port 5000 kamu
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        nama_lengkap: namaLengkap,
        email: email,
        password: password
      });

      if (response.data.success) {
        alert(response.data.message); // Muncul pesan "Akun berhasil dibuat! Silakan masuk."
        navigate('/login');
      }
    } catch (error) {
      // Mengambil pesan error dari backend jika email sudah terdaftar
      alert(error.response?.data?.message || "Pendaftaran gagal!");
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">

        {/* LOGO */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo_univora.png"
            alt="Univora"
            className="w-44 h-auto object-contain"
          />
          <p className="mt-2 text-sm text-gray-500">Buat akun barumu untuk mulai menjelajah</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
            <input 
              type="text" 
              placeholder="Masukkan nama lengkap" 
              value={namaLengkap}
              onChange={(e) => setNamaLengkap(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              placeholder="Masukkan email kamu" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Buat password minimal 6 karakter" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 pl-4 pr-12 py-3 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-orange-500 text-sm font-medium"
              >
                {showPassword ? "Sembunyikan" : "Lihat"}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            className="mt-6 w-full rounded-xl bg-orange-500 py-3 font-semibold text-white transition hover:bg-orange-600 shadow-lg shadow-orange-500/20"
          >
            Daftar Sekarang
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Sudah punya akun?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/login')} 
              className="font-bold text-orange-500 hover:underline"
            >
              Masuk
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}