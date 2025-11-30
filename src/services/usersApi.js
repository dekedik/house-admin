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
    window.location.href = '/login'
    throw new Error('Не авторизован')
  }

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка запроса')
  }

  return response
}

export const usersApi = {
  // Получить всех пользователей
  async getAll() {
    const response = await fetchWithAuth(`${API_URL}/api/users`)
    return response.json()
  },

  // Получить пользователя по ID
  async getById(id) {
    const response = await fetchWithAuth(`${API_URL}/api/users/${id}`)
    return response.json()
  },

  // Создать пользователя
  async create(userData) {
    const response = await fetchWithAuth(`${API_URL}/api/users`, {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  // Обновить пользователя
  async update(id, userData) {
    const response = await fetchWithAuth(`${API_URL}/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
    return response.json()
  },

  // Удалить пользователя
  async delete(id) {
    const response = await fetchWithAuth(`${API_URL}/api/users/${id}`, {
      method: 'DELETE',
    })
    return response.json()
  },

  // Сбросить пароль
  async resetPassword(id) {
    const response = await fetchWithAuth(`${API_URL}/api/users/${id}/reset-password`, {
      method: 'POST',
    })
    return response.json()
  },
}


