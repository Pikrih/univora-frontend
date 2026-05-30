import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // 1. Import Axios

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: email,
      password: password
    });

    if (response.data.success) {
      const user = response.data.user; // 1. Ambil data user dari backend

      // 2. Simpan token dan data user ke localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // 3. Simpan data role terpisah untuk mempermudah pengecekan halaman admin
      localStorage.setItem('user_role', user.role);
      localStorage.setItem('user_name', user.nama_lengkap);

      alert("Login Berhasil!");
      
      if (user.role === 'Admin') {
        // Jika yang login adalah Admin, arahkan langsung ke Dashboard Admin
        navigate('/admin/dashboard');
      } else {  
        // Jika mahasiswa biasa, arahkan ke seleksi kampus seperti biasa
        navigate('/select-campus'); 
      }

    }  
  } catch (error) {
    alert(error.response?.data?.message || "Email atau password salah!");
  }
};

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-orange-500 tracking-wide">UNIVORA</h2>
          <p className="mt-2 text-sm text-gray-500">Silakan masuk untuk menjelajah kuliner mahasiswa</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleLogin}>
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
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-gray-300 pl-4 pr-12 py-3 text-sm focus:border-orange-500 focus:outline-none"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
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
            Masuk
          </button>

          <p className="mt-4 text-center text-xs text-gray-500">
            Belum punya akun?{' '}
            <button 
              type="button" 
              onClick={() => navigate('/register')} 
              className="font-bold text-orange-500 hover:underline"
            >
              Daftar Sekarang
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}