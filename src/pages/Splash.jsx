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
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
      <h1 className="animate-pulse text-5xl font-extrabold tracking-wider text-orange-500">
        UNIVORA
      </h1>
      <p className="mt-2 text-gray-500 text-sm tracking-wide">Rekomendasi Kuliner Mahasiswa</p>
    </div>
  );
}