const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

export const housesApi = {
  // Получить все дома
  async getAll(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.project_id) queryParams.append('project_id', params.project_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.search) queryParams.append('search', params.search)

    const queryString = queryParams.toString()
    const url = `${API_URL}/api/houses${queryString ? `?${queryString}` : ''}`
    
    const response = await fetchWithAuth(url)
    return response.json()
  },

  // Получить дом по ID
  async getById(id) {
    const response = await fetchWithAuth(`${API_URL}/api/houses/${id}`)
    return response.json()
  },

  // Создать дом
  async create(houseData) {
    const response = await fetchWithAuth(`${API_URL}/api/houses`, {
      method: 'POST',
      body: JSON.stringify(houseData),
    })
    return response.json()
  },

  // Обновить дом
  async update(id, houseData) {
    const response = await fetchWithAuth(`${API_URL}/api/houses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(houseData),
    })
    return response.json()
  },

  // Удалить дом
  async delete(id) {
    const response = await fetchWithAuth(`${API_URL}/api/houses/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}


