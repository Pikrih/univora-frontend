import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set timer selama 3000 ms (3 detik)
    const timer = setTimeout(() => {
      navigate('/login'); // Pindah otomatis ke halaman /login
    }, 3000);

    return () => clearTimeout(timer); // Membersihkan timer jika komponen ditutup
  }, [navigate]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="w-64 max-w-[75%] animate-pulse">
        <img
          src="/logo_univora.png"
          alt="Univora"
          className="w-full h-auto object-contain"
        />
      </div>
      <p className="mt-2 text-gray-500 text-sm tracking-wide">Rekomendasi Kuliner Mahasiswa</p>
    </div>
  );
}