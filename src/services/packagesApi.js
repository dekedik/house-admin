import { config } from '../config'

const apiUrl = config.apiUrl

// Получить токен из localStorage
const getToken = () => {
  return localStorage.getItem('authToken')
}

// Выполнить запрос с авторизацией
const fetchWithAuth = async (url, options = {}) => {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    localStorage.removeItem('authToken')
    window.location.href = '/login'
    throw new Error('Не авторизован')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка запроса')
  }

  return response
}

export const packagesApi = {
  // Получить все пакеты
  async getAll(offset = 0, limit = 10) {
    const queryParams = new URLSearchParams()
    queryParams.append('offset', offset.toString())
    queryParams.append('limit', limit.toString())
    const response = await fetchWithAuth(`${apiUrl}/packages?${queryParams.toString()}`)
    return response.json()
  },

  // Получить пакет по ID
  async getById(id) {
    const response = await fetchWithAuth(`${apiUrl}/packages/${id}`)
    return response.json()
  },

  // Создать пакет
  async create(packageData) {
    const response = await fetchWithAuth(`${apiUrl}/packages`, {
      method: 'POST',
      body: JSON.stringify(packageData),
    })
    return response.json()
  },

  // Обновить пакет
  async update(id, packageData) {
    const response = await fetchWithAuth(`${apiUrl}/packages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(packageData),
    })
    return response.json()
  },

  // Удалить пакет
  async delete(id) {
    const response = await fetchWithAuth(`${apiUrl}/packages/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

