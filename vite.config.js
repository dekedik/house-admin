import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  appType: 'spa', // Указывает Vite, что это SPA - автоматически обрабатывает все маршруты
  plugins: [react()],
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
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Оптимизация имен файлов для лучшего кеширования
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        // Разделяем vendor и app код для лучшего кеширования
        manualChunks: (id) => {
          // Выделяем node_modules в отдельный чанк
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
    // Убеждаемся, что index.html правильно обрабатывается
    emptyOutDir: true,
    // Минификация
    minify: 'esbuild',
    // Включаем CSS code splitting для параллельной загрузки
    cssCodeSplit: true,
    // Оптимизация размера чанков
    chunkSizeWarningLimit: 600,
    // Отключаем source maps для production чтобы избежать проблем
    sourcemap: false,
    // Оптимизация CSS
    cssMinify: true,
    // Используем более старую версию для лучшей совместимости
    target: 'es2015',
  },
  // Оптимизация зависимостей
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})

