import { config } from '../config'

/**
 * Формирует полный URL для изображения
 * @param {string} imagePath - Путь к изображению (например, "image_image_70_1766145603226.webp")
 * @returns {string} - Полный URL изображения
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return ''
  }

  // Если уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Если начинается с /, убираем его
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath

  // Формируем полный URL через API
  // API URL имеет формат https://admin-doman-horizont.ru/api
  // Изображения доступны по https://admin-doman-horizont.ru/uploads/...
  const apiUrl = config.apiUrl || 'http://localhost:3001/api'
  const baseUrl = apiUrl.replace('/api', '')
  
  return `${baseUrl}/uploads/${cleanPath}`
}

