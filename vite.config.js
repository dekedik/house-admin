import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
  },
  define: {
    'import.meta.env.API_URL': JSON.stringify(process.env.API_URL || process.env.VITE_API_URL || ''),
  },
})

