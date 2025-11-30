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

export const applicationsApi = {
  // Получить все заявки
  async getAll(params = {}) {
    const queryParams = new URLSearchParams()
    if (params.status) queryParams.append('status', params.status)
    if (params.client_id) queryParams.append('client_id', params.client_id)
    if (params.house_id) queryParams.append('house_id', params.house_id)
    if (params.project_id) queryParams.append('project_id', params.project_id)
    if (params.manager_id) queryParams.append('manager_id', params.manager_id)

    const queryString = queryParams.toString()
    const url = `${API_URL}/api/applications${queryString ? `?${queryString}` : ''}`
    
    const response = await fetchWithAuth(url)
    return response.json()
  },

  // Получить заявку по ID
  async getById(id) {
    const response = await fetchWithAuth(`${API_URL}/api/applications/${id}`)
    return response.json()
  },

  // Создать заявку
  async create(applicationData) {
    const response = await fetchWithAuth(`${API_URL}/api/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
    return response.json()
  },

  // Обновить заявку
  async update(id, applicationData) {
    const response = await fetchWithAuth(`${API_URL}/api/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(applicationData),
    })
    return response.json()
  },

  // Удалить заявку
  async delete(id) {
    const response = await fetchWithAuth(`${API_URL}/api/applications/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },
}

