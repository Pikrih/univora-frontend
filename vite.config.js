import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Kita panggil plugin Tailwind v4 di sini

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Kita pasang di sini biar Vite otomatis memproses Tailwind-mu
  ],
}) 