import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { packagesApi } from '../services/packagesApi'
import { getImageUrl } from '../utils/imageUtils'

const Packages = () => {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    try {
      setLoading(true)
      const data = await packagesApi.getAll()
      const packagesList = Array.isArray(data) ? data : []
      setPackages(packagesList)
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке пакетов:', err)
      setError('Не удалось загрузить пакеты')
      setPackages([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await packagesApi.delete(id)
      await loadPackages()
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка при удалении пакета:', err)
      alert('Не удалось удалить пакет')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">📦 Пакетные решения</h2>
        <Link
          to="/packages/new"
          className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Добавить пакет</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg">Загрузка пакетов...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadPackages}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      ) : !Array.isArray(packages) || packages.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Пакеты не найдены</p>
          <Link
            to="/packages/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Создать первый пакет
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Grid View */}
          <div className="hidden lg:grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{pkg.title}</h3>
                      <p className="text-sm text-gray-500">ID: {pkg.package_id}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/packages/edit/${pkg.id}`}
                        className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                      >
                        Редактировать
                      </Link>
                      <button
                        onClick={() => setShowDeleteConfirm(pkg.id)}
                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  {pkg.thumbnail && (
                    <div className="mb-4">
                      <img
                        src={getImageUrl(pkg.thumbnail)}
                        alt={pkg.title}
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Характеристики:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Array.isArray(pkg.features) && pkg.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="line-clamp-1">• {feature}</li>
                      ))}
                      {Array.isArray(pkg.features) && pkg.features.length > 3 && (
                        <li className="text-gray-500">... и еще {pkg.features.length - 3}</li>
                      )}
                    </ul>
                  </div>
                  <div className="text-sm text-gray-500">
                    Изображений в галерее: {Array.isArray(pkg.gallery) ? pkg.gallery.length : 0}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{pkg.title}</h3>
                      <p className="text-sm text-gray-500">ID: {pkg.package_id}</p>
                    </div>
                  </div>
                  {pkg.thumbnail && (
                    <div className="mb-4">
                      <img
                        src={getImageUrl(pkg.thumbnail)}
                        alt={pkg.title}
                        className="w-full h-40 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Характеристики:</p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {Array.isArray(pkg.features) && pkg.features.slice(0, 2).map((feature, idx) => (
                        <li key={idx} className="line-clamp-1">• {feature}</li>
                      ))}
                      {Array.isArray(pkg.features) && pkg.features.length > 2 && (
                        <li className="text-gray-500">... и еще {pkg.features.length - 2}</li>
                      )}
                    </ul>
                  </div>
                  <div className="flex space-x-2 pt-4 border-t">
                    <Link
                      to={`/packages/edit/${pkg.id}`}
                      className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(pkg.id)}
                      className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот пакет? Это действие нельзя отменить.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Packages

