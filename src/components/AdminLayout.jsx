import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const AdminLayout = ({ children }) => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">А</span>
            </div>
            <span className="text-xl font-bold">Админ-панель</span>
          </div>
          
          <nav className="space-y-2">
            <Link
              to="/"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                location.pathname === '/' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Проекты</span>
            </Link>
            <Link
              to="/projects/new"
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                location.pathname === '/projects/new' 
                  ? 'bg-primary-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Добавить проект</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Управление проектами</h1>
            <div className="flex items-center space-x-4">
              <a 
                href="http://localhost:5173" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Открыть сайт
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

