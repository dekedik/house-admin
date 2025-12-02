import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Плагин для обработки SPA маршрутов - все запросы возвращают index.html
const spaFallback = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        
        // Пропускаем запросы к статическим файлам (с расширениями, кроме .html)
        const hasFileExtension = /\.\w+$/.test(url)
        if (hasFileExtension && !url.endsWith('.html')) {
          return next()
        }
        
        // Пропускаем запросы к внутренним путям Vite
        if (url.startsWith('/@') || url.startsWith('/src/') || url.startsWith('/node_modules/')) {
          return next()
        }
        
        // Пропускаем запросы к API (если они проксируются)
        if (url.startsWith('/api/')) {
          return next()
        }
        
        // Для всех остальных запросов (включая /login, / и другие SPA маршруты)
        // возвращаем index.html
        if (url !== '/index.html' && !url.endsWith('.html')) {
          req.url = '/index.html'
        }
        
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true, // Не использовать другой порт, если 5174 занят
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  root: path.resolve(__dirname, './'), // Явно указываем корневую директорию
  // Настройка для production build
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
    },
  },
})

