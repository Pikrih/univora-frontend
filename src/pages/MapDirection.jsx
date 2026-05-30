import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Perbaikan otomatis untuk bug ikon marker Leaflet di React
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

const customMarker = new L.Icon({
  iconUrl: markerIconPng,
  shadowUrl: markerShadowPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 16);
    }
  }, [coords, map]);
  return null;
}

export default function MapDirection() {
  const navigate = useNavigate();
  
  // Koordinat Target Kuliner: Sekitar UNNES Semarang
  const targetLocation = { lat: -7.0465, lng: 110.3940 }; 
  const [userLocation, setUserLocation] = useState(null);
  const [loadingGps, setLoadingGps] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingGps(false);
        },
        (error) => {
          console.error("GPS dimatikan atau tidak diizinkan:", error);
          // Fallback lokasi default di area UNNES agar peta tidak kosong
          setUserLocation({ lat: -7.0490, lng: 110.3925 });
          setLoadingGps(false);
        }
      );
    } else {
      setLoadingGps(false);
    }
  }, []);

  return (
    // Membatasi kontainer luar agar tetap seukuran layar aplikasi mobile standar
    <div className="w-full max-w-md mx-auto h-screen flex flex-col bg-gray-100 font-sans antialiased relative shadow-lg overflow-hidden">
      
      {/* 1. TOP NAVBAR HEADER */}
      <div className="bg-white px-4 py-3.5 border-b border-gray-100 flex items-center justify-between shadow-xs z-50 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/detail')} 
            className="text-[#001A41] hover:text-orange-500 transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h1 className="text-sm font-black text-[#001A41]">Bakmi Mahasiswa Sentosa</h1>
        </div>
        <div className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
          {loadingGps ? "Mencari GPS..." : "Peta Aktif"}
        </div>
      </div>

      {/* 2. INTERACTIVE MAP BOX (DI SINI KUNCI UTAMANYA: Menggunakan w-full h-full relatif terhadap flex-1) */}
      <div className="flex-1 w-full h-full relative z-10 bg-[#E3ECE9]">
        <MapContainer 
          center={[targetLocation.lat, targetLocation.lng]} 
          zoom={15} 
          className="w-full h-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marker Tempat Makan */}
          <Marker position={[targetLocation.lat, targetLocation.lng]} icon={customMarker}>
            <Popup>
              <div className="font-sans text-xs p-1">
                <p className="font-black text-[#001A41]">Penyetan Pak Otong</p>
                <p className="text-gray-400 mt-0.5">Destinasi Kuliner Anda</p>
              </div>
            </Popup>
          </Marker>

          {/* Marker Lokasi User */}
          {userLocation && (
            <>
              <Marker position={[userLocation.lat, userLocation.lng]} icon={customMarker}>
                <Popup>
                  <p className="font-bold text-xs text-blue-600 p-1">Posisi Kamu Sesuai GPS</p>
                </Popup>
              </Marker>
              <RecenterMap coords={userLocation} />
            </>
          )}
        </MapContainer>

        {/* 3. FLOATING CARD PANEL (5 Menit - 350 Meter) */}
        <div className="absolute bottom-24 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100/80 flex items-center gap-3.5 z-40">
          <div className="w-10 h-10 bg-[#001A41] rounded-xl flex items-center justify-center text-white text-lg shadow-sm">
            🚶
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black text-[#001A41] tracking-tight">5 Menit</span>
            <span className="text-[11px] text-gray-400 font-bold mt-0.5">350 Meter • Berjalan Kaki</span>
          </div>
        </div>

        {/* 4. BUTTON SELESAI NAVIGASI */}
        <div className="absolute bottom-6 left-4 right-4 z-40">
          <button 
            onClick={() => navigate('/detail')}
            className="w-full bg-[#001A41] hover:bg-[#00265F] text-white text-xs font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-blue-950/20 cursor-pointer transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            <span>Selesai Navigasi</span>
          </button>
        </div>

      </div>

    </div>
  );
}