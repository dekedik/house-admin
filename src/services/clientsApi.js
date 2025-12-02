import { config } from '../config'

const API_URL = config.apiUrl

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

export const clientsApi = {
  // Получить всех клиентов
  async getAll(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = `${API_URL}/api/clients${queryString ? `?${queryString}` : ''}`
    
    const response = await fetchWithAuth(url)
    return response.json()
  },

  // Получить клиента по ID
  async getById(id) {
    const response = await fetchWithAuth(`${API_URL}/api/clients/${id}`)
    return response.json()
  },

  // Создать клиента
  async create(clientData) {
    const response = await fetchWithAuth(`${API_URL}/api/clients`, {
      method: 'POST',
      body: JSON.stringify(clientData),
    })
    return response.json()
  },

  // Обновить клиента
  async update(id, clientData) {
    const response = await fetchWithAuth(`${API_URL}/api/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clientData),
    })
    return response.json()
  },

  // Удалить клиента
  async delete(id) {
    const response = await fetchWithAuth(`${API_URL}/api/clients/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}


