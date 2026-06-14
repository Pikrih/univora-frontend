import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);
    return () => clearTimeout(timer);
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
      <p className="mt-6 text-gray-400 text-xs font-bold tracking-widest uppercase">
        Rekomendasi Kuliner Mahasiswa
      </p>
    </div>
  );
}
