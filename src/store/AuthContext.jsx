import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, removeToken } from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const response = await api.verifyToken()
      setIsAuthenticated(true)
      setUser(response.user)
    } catch (error) {
      setIsAuthenticated(false)
      setUser(null)
      localStorage.removeItem('authToken')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password)
      setUser(response.user)
      setIsAuthenticated(true)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    setIsAuthenticated(false)
  }

  const isSuperManager = user?.role === 'super_manager'
  const isManager = user?.role === 'manager' || isSuperManager

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth,
    isSuperManager,
    isManager,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

