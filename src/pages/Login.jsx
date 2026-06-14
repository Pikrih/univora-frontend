import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: email,
        password: password
      });

      if (response.data.success) {
        const user = response.data.user;

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('user_role', user.role);
        localStorage.setItem('user_name', user.nama_lengkap);

        alert("Login Berhasil!");

        if (user.role === 'Admin') {
          navigate('/admin/dashboard');
        } else {
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

        {/* LOGO */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/logo_univora.png"
            alt="Univora"
            className="w-44 h-auto object-contain"
          />
          <p className="mt-2 text-sm text-gray-500">Silakan masuk untuk menjelajah kuliner mahasiswa</p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
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
