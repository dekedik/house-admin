import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  appType: 'spa',
  plugins: [
    react(),
    // Плагин для обработки SPA маршрутов
    {
      name: 'spa-fallback',
      configureServer(server) {
        // Устанавливаем middleware напрямую
        server.middlewares.use((req, res, next) => {
          const url = req.url?.split('?')[0] || ''
          
          console.log(`[SPA Fallback] Request: ${req.method} ${url}`)
          
          // Пропускаем запросы к внутренним путям Vite и статическим файлам
          if (
            url.startsWith('/@') ||
            url.startsWith('/node_modules/') ||
            url.startsWith('/src/') ||
            url.startsWith('/api/') ||
            (url.includes('.') && !url.endsWith('.html') && url !== '/')
          ) {
            console.log(`[SPA Fallback] Skipping: ${url}`)
            return next()
          }
          
          // Для всех остальных запросов перенаправляем на index.html
          if (url !== '/index.html' && url !== '/') {
            console.log(`[SPA Fallback] Redirecting ${url} to /index.html`)
            req.url = '/index.html'
          }
          
          next()
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  root: path.resolve(__dirname, './'),
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})

