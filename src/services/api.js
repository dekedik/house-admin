import { getAllProjects, getProjectById, createProject, updateProject, deleteProject as deleteProjectFromStore } from '../data/projectsStore'
import { config } from '../config'

// Флаг для переключения между моковыми данными и реальным API
const USE_MOCK_DATA = false // Подключен реальный бекенд

const API_URL = config.apiUrl

// Получить токен из localStorage
const getToken = () => {
  return localStorage.getItem('authToken')
}

// Установить токен в localStorage
export const setToken = (token) => {
  localStorage.setItem('authToken', token)
}

// Удалить токен из localStorage
export const removeToken = () => {
  localStorage.removeItem('authToken')
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
    // Токен недействителен, перенаправляем на страницу входа
    removeToken()
    // Используем событие для уведомления о необходимости редиректа
    // Это позволяет React Router обработать навигацию без перезагрузки страницы
    window.dispatchEvent(new CustomEvent('auth:redirect', { detail: { path: '/login' } }))
    throw new Error('Не авторизован')
  }

  return response
}

// Моковые пользователи для авторизации
const MOCK_USERS = [
  {
    id: 1,
    username: 'main_manager',
    password: '7\\gU%T$fVRt?pqB',
    role: 'super_manager'
  },
  {
    id: 2,
    username: 'manager',
    password: 'password',
    role: 'manager'
  }
]

// Генерация мокового JWT токена
const generateMockToken = (user) => {
  return `mock_token_${user.id}_${Date.now()}`
}

export const api = {
  // Авторизация
  async login(username, password) {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const user = MOCK_USERS.find(u => u.username === username && u.password === password)
      
      if (!user) {
        throw new Error('Неверный логин или пароль')
      }

      const token = generateMockToken(user)
      setToken(token)
      
      return {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        }
      }
    }

    // Реальный API запрос
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка при входе')
    }

    const data = await response.json()
    setToken(data.token)
    return data
  },

  async verifyToken() {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 100))
      
      const token = getToken()
      if (!token || !token.startsWith('mock_token_')) {
        throw new Error('Токен недействителен')
      }

      // Извлекаем user из токена (упрощенная версия)
      const tokenParts = token.split('_')
      const userId = parseInt(tokenParts[2])
      const user = MOCK_USERS.find(u => u.id === userId)
      
      if (!user) {
        throw new Error('Токен недействителен')
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        }
      }
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/auth/verify`)
    if (!response.ok) {
      throw new Error('Токен недействителен')
    }
    const data = await response.json()
    return { user: data.user }
  },

  // Новостройки
  async getProjects() {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return getAllProjects()
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/projects`)
    if (!response.ok) {
      throw new Error('Ошибка при загрузке новостроек')
    }
    return response.json()
  },

  async getProjectById(id) {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 200))
      
      const project = getProjectById(id)
      if (!project) {
        throw new Error('Новостройка не найдена')
      }
      return project
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`)
    if (!response.ok) {
      throw new Error('Новостройка не найдена')
    }
    return response.json()
  },

  async createProject(projectData) {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const newProject = createProject(projectData)
      return newProject
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/projects`, {
      method: 'POST',
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка при создании новостройки')
    }

    return response.json()
  },

  async updateProject(id, projectData) {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 400))
      
      const updatedProject = updateProject(id, projectData)
      if (!updatedProject) {
        throw new Error('Новостройка не найдена')
      }
      return updatedProject
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка при обновлении новостройки')
    }

    return response.json()
  },

  async deleteProject(id) {
    if (USE_MOCK_DATA) {
      // Имитация задержки сети
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const deleted = deleteProjectFromStore(id)
      if (!deleted) {
        throw new Error('Новостройка не найдена')
      }
      return { message: 'Новостройка успешно удалена' }
    }

    // Реальный API запрос
    const response = await fetchWithAuth(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Ошибка при удалении новостройки')
    }

    return response.json()
  },
}

