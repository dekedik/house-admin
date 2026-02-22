import { config } from '../config'

/**
 * Формирует полный URL для изображения
 * @param {string} imagePath - Путь к изображению (например, "image_image_70_1766145603226.webp")
 * @returns {string} - Полный URL изображения или placeholder
 */
export const getImageUrl = (imagePath) => {
  // Если изображение отсутствует, возвращаем null (чтобы не отображать img элемент)
  if (!imagePath || imagePath.trim() === '') {
    return null
  }

  // Если это base64 изображение (data:image/...), возвращаем как есть
  if (imagePath.startsWith('data:image/')) {
    return imagePath
  }

  // Если уже полный URL (начинается с http:// или https://), возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // Если начинается с /uploads/, формируем полный URL
  if (imagePath.startsWith('/uploads/')) {
    const apiUrl = config.apiUrl || 'https://admin-doman-horizont.ru/api'
    const baseUrl = apiUrl.replace('/api', '')
    return `${baseUrl}${imagePath}`
  }

  // Если начинается с /, убираем его
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath

  // Формируем полный URL через API
  // API URL имеет формат https://admin-doman-horizont.ru/api
  // Изображения доступны по https://admin-doman-horizont.ru/uploads/...
  const apiUrl = config.apiUrl || 'https://admin-doman-horizont.ru/api'
  const baseUrl = apiUrl.replace('/api', '')
  
  return `${baseUrl}/uploads/${cleanPath}`
}

