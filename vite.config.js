import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  appType: 'spa', // Указываем Vite, что это SPA приложение - автоматически обрабатывает все маршруты
  plugins: [
    react(),
    // Простой плагин для обработки SPA маршрутов
    {
      name: 'spa-fallback',
      configureServer(server) {
        // Используем return функцию для установки middleware после инициализации
        return () => {
          // Устанавливаем middleware, который будет обрабатывать все маршруты
          server.middlewares.use((req, res, next) => {
            const url = req.url?.split('?')[0] || ''
            
            // Пропускаем запросы к статическим файлам и внутренним путям Vite
            if (
              // Внутренние пути Vite
              url.startsWith('/@') ||
              url.startsWith('/node_modules/') ||
              url.startsWith('/src/') ||
              // API запросы
              url.startsWith('/api/') ||
              // Статические файлы (с расширениями, кроме .html)
              (url.includes('.') && !url.endsWith('.html') && url !== '/')
            ) {
              return next()
            }
            
            // Для всех остальных запросов (включая /login, /houses, /clients и т.д.)
            // перенаправляем на index.html
            if (url !== '/index.html' && url !== '/') {
              console.log(`[SPA Fallback] Redirecting ${url} to /index.html`)
              req.url = '/index.html'
            }
            
            next()
          })
        }
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

