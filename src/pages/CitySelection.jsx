import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CitySelection() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/cities');
        if (response.data.success) {
          setCities(response.data.data);
        }
      } catch (error) {
        console.error("Gagal memuat kota:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCities();
  }, []);

  const handleSelectCity = (cityId, cityName) => {
    localStorage.setItem('selected_city_id', cityId);
    localStorage.setItem('selected_city_name', cityName);

    // Setelah pilih kota, lanjut ke halaman pilih kampus
    navigate('/select-campus');
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-[#F8FAFC] font-sans antialiased p-6 flex flex-col justify-between">
      <div>
        <div className="mt-8 mb-6">
          <span className="text-3xl">🌆</span>
          <h1 className="text-xl font-black text-[#001A41] mt-3 tracking-tight">Pilih Kota Kamu</h1>
          <p className="text-xs text-gray-400 font-medium mt-1">
            Temukan rekomendasi kuliner mahasiswa terbaik di kotamu.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs font-bold text-gray-400">Memuat daftar kota...</div>
        ) : cities.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-gray-400">Belum ada kota yang tersedia.</div>
        ) : (
          <div className="space-y-3">
            {cities.map((city) => (
              <button
                key={city.id}
                onClick={() => handleSelectCity(city.id, city.nama_kota)}
                className="w-full bg-white border border-gray-100 hover:border-orange-400 p-4 rounded-2xl text-left font-black text-xs text-[#001A41] shadow-sm transition flex items-center justify-between cursor-pointer group"
              >
                <span>🏢 {city.nama_kota}</span>
                <span className="text-gray-300 group-hover:text-[#FA5A15] transition">→</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-300 font-medium text-center mt-6">
        Kota kamu belum terdaftar? Ajukan ke admin Univora.
      </p>
    </div>
  );
}
