import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Плагин для обработки SPA маршрутов - все запросы возвращают index.html
const spaFallback = () => {
  return {
    name: 'spa-fallback',
    configureServer(server) {
      // Устанавливаем middleware, который будет обрабатывать все маршруты
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0] || ''
        
        // Список путей, которые нужно пропустить (статические файлы и внутренние пути Vite)
        const staticPaths = [
          '/@vite',
          '/@fs',
          '/@id',
          '/@react-refresh',
          '/node_modules',
          '/src',
          '/api',
        ]
        
        // Проверяем, является ли запрос статическим файлом
        const isStaticFile = /\.\w+$/.test(url) && !url.endsWith('.html')
        
        // Проверяем, является ли запрос внутренним путем Vite
        const isViteInternal = staticPaths.some(path => url.startsWith(path))
        
        // Если это статический файл или внутренний путь Vite - пропускаем
        if (isStaticFile || isViteInternal) {
          return next()
        }
        
        // Для всех остальных запросов (включая /login, / и другие SPA маршруты)
        // перенаправляем на index.html
        if (url !== '/index.html' && !url.endsWith('.html')) {
          req.url = '/index.html'
        }
        
        next()
      })
    },
  }
}

export default defineConfig({
  appType: 'spa', // Указываем Vite, что это SPA приложение - автоматически обрабатывает все маршруты
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

