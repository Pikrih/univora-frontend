import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CampusSelection() {
  const navigate = useNavigate();

  // State utama
  const [cities, setCities] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState('');
  const [selectedCityName, setSelectedCityName] = useState('');
  const [campusList, setCampusList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampus, setSelectedCampus] = useState(null); // { university_id, nama_universitas }
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingCampus, setLoadingCampus] = useState(false);

  // 1. Ambil daftar kota dari API saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/cities');
        if (res.data.success && res.data.data.length > 0) {
          setCities(res.data.data);

          // Cek apakah ada kota yang sudah dipilih sebelumnya dari CitySelection
          const savedCityId = localStorage.getItem('selected_city_id');
          const savedCityName = localStorage.getItem('selected_city_name');

          if (savedCityId && savedCityName) {
            // Gunakan kota yang sudah dipilih user dari halaman sebelumnya
            setSelectedCityId(savedCityId);
            setSelectedCityName(savedCityName);
          } else {
            // Default ke kota pertama
            setSelectedCityId(String(res.data.data[0].id));
            setSelectedCityName(res.data.data[0].nama_kota);
          }
        }
      } catch (error) {
        console.error('Gagal memuat daftar kota:', error);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, []);

  // 2. Setiap kali kota dipilih berubah, fetch kampus dari API
  useEffect(() => {
    if (!selectedCityId) return;

    const fetchCampus = async () => {
      setLoadingCampus(true);
      setCampusList([]);
      setSelectedCampus(null);
      setSearchQuery('');
      try {
        const res = await axios.get(`http://localhost:5000/api/campus/by-city?city_id=${selectedCityId}`);
        if (res.data.success) {
          setCampusList(res.data.data);
        }
      } catch (error) {
        console.error('Gagal memuat daftar kampus:', error);
      } finally {
        setLoadingCampus(false);
      }
    };
    fetchCampus();
  }, [selectedCityId]);

  // Fungsi ketika kota di dropdown diganti
  const handleCityChange = (e) => {
    const cityId = e.target.value;
    const cityName = cities.find(c => String(c.id) === cityId)?.nama_kota || '';
    setSelectedCityId(cityId);
    setSelectedCityName(cityName);
    localStorage.setItem('selected_city_id', cityId);
    localStorage.setItem('selected_city_name', cityName);
  };

  // Filter daftar kampus berdasarkan search query
  const daftarKampusTersaring = campusList.filter((kampus) =>
    kampus.nama_universitas.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = () => {
    if (selectedCampus) {
      localStorage.setItem('selected_university_name', selectedCampus.nama_universitas);
      localStorage.setItem('selected_university_id', String(selectedCampus.university_id));
      navigate('/home');
    }
  };

  return (
    /* ─── PEMBUNGKUS UTAMA ─── */
    <div className="w-full max-w-md mx-auto min-h-screen bg-white px-6 py-6 font-sans flex flex-col justify-between relative shadow-sm">

      {/* TOP BAR & TOMBOL BACK */}
      <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => navigate('/login')}
          className="text-[#001A41] hover:text-orange-500 p-1 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          title="Kembali ke Login"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#001A41] tracking-tight">Univora</h1>
      </div>

      {/* BODY CONTENT */}
      <div className="my-6 w-full flex-1 flex flex-col justify-center">

        {/* Judul & Deskripsi */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-[#001A41] tracking-tight leading-tight">
            Temukan Kuliner Kampusmu
          </h2>
          <p className="mt-1.5 text-xs text-gray-400 font-medium px-2 leading-relaxed">
            Pilih lokasi kampusmu untuk mulai menjelajahi spot makan terbaik di sekitarmu.
          </p>
        </div>

        {loadingCities ? (
          <div className="text-center py-10 text-xs font-bold text-gray-400">Memuat data wilayah...</div>
        ) : (
          <div className="space-y-4">

            {/* Dropdown Pilih Kota — dari API */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Pilih Kota</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </span>
                <select
                  value={selectedCityId}
                  onChange={handleCityChange}
                  className="w-full appearance-none rounded-2xl border border-gray-100 bg-[#F8FAFC] pl-11 pr-10 py-4 text-xs font-bold text-[#001A41] focus:border-[#001A41] focus:outline-none cursor-pointer transition shadow-sm"
                >
                  {cities.map((city) => (
                    <option key={city.id} value={String(city.id)}>{city.nama_kota}</option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Input & List Kampus dari API */}
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5">Pilih Universitas/Kampus</label>
              <div className="relative mb-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.174L10.721 6.8a.75.75 0 01.707 0l6.45 3.374a.75.75 0 010 1.348l-6.45 3.375a.75.75 0 01-.707 0l-6.45-3.375a.75.75 0 010-1.348z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cari atau pilih kampus di bawah..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-gray-100 pl-11 pr-4 py-4 text-xs font-bold text-[#001A41] placeholder-gray-400 focus:border-[#001A41] focus:outline-none bg-white shadow-sm transition"
                />
              </div>

              {/* SCROLLABLE LIST */}
              <div className="max-h-40 overflow-y-auto rounded-2xl border border-gray-100 bg-[#F8FAFC] p-2 space-y-1 shadow-inner">
                {loadingCampus ? (
                  <p className="text-center text-xs font-bold text-gray-400 py-6">Memuat kampus...</p>
                ) : daftarKampusTersaring.length > 0 ? (
                  daftarKampusTersaring.map((kampus) => {
                    const isSelected = selectedCampus?.university_id === kampus.university_id;
                    return (
                      <button
                        key={kampus.university_id}
                        type="button"
                        onClick={() => {
                          setSelectedCampus(kampus);
                          setSearchQuery(kampus.nama_universitas);
                        }}
                        className={`w-full text-left text-xs px-3.5 py-3 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#001A41] text-white font-black shadow-md shadow-blue-900/10'
                            : 'text-[#001A41] font-bold hover:bg-gray-100'
                        }`}
                      >
                        <span>{kampus.nama_universitas}</span>
                        {isSelected && <span className="text-white text-xs font-black">✓</span>}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-center text-xs font-bold text-gray-400 py-6">
                    {campusList.length === 0
                      ? 'Belum ada kampus terdaftar di kota ini'
                      : 'Kampus tidak ditemukan'}
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* FOOTER BUTTON ACTION */}
      <div className="w-full mb-2">
        <button
          type="button"
          disabled={!selectedCampus}
          onClick={handleSearch}
          className={`w-full rounded-2xl py-4 font-bold text-xs text-white transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            selectedCampus
              ? 'bg-[#001A41] hover:bg-[#00265F] active:scale-[0.99] cursor-pointer shadow-blue-900/10'
              : 'bg-gray-300 text-gray-400 shadow-none cursor-not-allowed'
          }`}
        >
          <span>Telusuri Kuliner Kampus</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </div>

    </div>
  );
}
