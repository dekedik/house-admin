import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './store/AuthContext'
import AdminLayout from './components/AdminLayout'
import ProjectsList from './pages/ProjectsList'
import ProjectForm from './pages/ProjectForm'
import Managers from './pages/Managers'
import Houses from './pages/Houses'
import HouseForm from './pages/HouseForm'
import Packages from './pages/Packages'
import PackageForm from './pages/PackageForm'
import Clients from './pages/Clients'
import Applications from './pages/Applications'
import Login from './pages/Login'

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" />
}

// Компонент для публичных маршрутов (логин)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    )
  }

  return !isAuthenticated ? children : <Navigate to="/" />
}

// Компонент для обработки глобальных редиректов из API
const AuthRedirectHandler = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthRedirect = (event) => {
      const { path } = event.detail
      if (path) {
        navigate(path, { replace: true })
      }
    }

    window.addEventListener('auth:redirect', handleAuthRedirect)
    return () => {
      window.removeEventListener('auth:redirect', handleAuthRedirect)
    }
  }, [navigate])

  return null
}

function AppRoutes() {
  return (
    <Router>
      <AuthRedirectHandler />
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<ProjectsList />} />
                  <Route path="/projects/new" element={<ProjectForm />} />
                  <Route path="/projects/edit/:id" element={<ProjectForm />} />
                  <Route path="/houses" element={<Houses />} />
                  <Route path="/houses/new" element={<HouseForm />} />
                  <Route path="/houses/edit/:id" element={<HouseForm />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/packages/new" element={<PackageForm />} />
                  <Route path="/packages/edit/:id" element={<PackageForm />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/applications" element={<Applications />} />
                  <Route path="/managers" element={<Managers />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App



