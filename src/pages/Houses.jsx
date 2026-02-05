import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { housesApi } from '../services/housesApi'
import { api } from '../services/api'
import { packagesApi } from '../services/packagesApi'
import { getImageUrl } from '../utils/imageUtils'

const Houses = () => {
  const [houses, setHouses] = useState([])
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [activeTab, setActiveTab] = useState('houses') // 'houses' или 'packages'
  
  // Пагинация для houses
  const [housesPagination, setHousesPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  // Пагинация для packages
  const [packagesPagination, setPackagesPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  
  const housesObserverTarget = useRef(null)
  const packagesObserverTarget = useRef(null)

  useEffect(() => {
    if (activeTab === 'houses') {
      loadHouses(0, true)
    } else {
      loadPackages(0, true)
    }
  }, [])


  // Загрузка домов
  const loadHouses = async (offset = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      const limit = 10
      const result = await housesApi.getAll(filters, offset, limit)
      
      if (result.data && result.pagination) {
        if (reset) {
          setHouses(result.data)
        } else {
          setHouses(prev => [...prev, ...result.data])
        }
        setHousesPagination({
          ...result.pagination,
          offset: result.pagination.offset
        })
      } else if (Array.isArray(result)) {
        if (reset) {
          setHouses(result)
        } else {
          setHouses(prev => [...prev, ...result])
        }
        setHousesPagination({
          offset: result.length,
          limit: result.length,
          total: result.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      } else {
        if (reset) {
          setHouses([])
        }
      }
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке домов:', err)
      setError('Не удалось загрузить дома')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Загрузка пакетов
  const loadPackages = async (offset = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      const limit = 10
      const result = await packagesApi.getAll(offset, limit)
      
      if (result.data && result.pagination) {
        if (reset) {
          setPackages(result.data)
        } else {
          setPackages(prev => [...prev, ...result.data])
        }
        setPackagesPagination({
          ...result.pagination,
          offset: result.pagination.offset
        })
      } else if (Array.isArray(result)) {
        if (reset) {
          setPackages(result)
        } else {
          setPackages(prev => [...prev, ...result])
        }
        setPackagesPagination({
          offset: result.length,
          limit: result.length,
          total: result.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      } else {
        if (reset) {
          setPackages([])
        }
      }
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке пакетов:', err)
      setError('Не удалось загрузить пакеты')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Infinite scroll для houses
  useEffect(() => {
    if (activeTab !== 'houses') return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && housesPagination.hasNextPage && !loadingMore && !loading) {
          loadMoreHouses()
        }
      },
      { threshold: 0.1 }
    )

    if (housesObserverTarget.current) {
      observer.observe(housesObserverTarget.current)
    }

    return () => {
      if (housesObserverTarget.current) {
        observer.unobserve(housesObserverTarget.current)
      }
    }
  }, [housesPagination.hasNextPage, loadingMore, loading, activeTab])

  // Infinite scroll для packages
  useEffect(() => {
    if (activeTab !== 'packages') return
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && packagesPagination.hasNextPage && !loadingMore && !loading) {
          loadMorePackages()
        }
      },
      { threshold: 0.1 }
    )

    if (packagesObserverTarget.current) {
      observer.observe(packagesObserverTarget.current)
    }

    return () => {
      if (packagesObserverTarget.current) {
        observer.unobserve(packagesObserverTarget.current)
      }
    }
  }, [packagesPagination.hasNextPage, loadingMore, loading, activeTab])

  const loadMoreHouses = useCallback(() => {
    if (housesPagination.hasNextPage && !loadingMore && !loading) {
      const currentOffset = housesPagination.offset || houses.length || 0
      const nextOffset = currentOffset + (housesPagination.limit || 10)
      if (!isNaN(nextOffset) && nextOffset >= 0) {
        loadHouses(nextOffset, false)
      }
    }
  }, [housesPagination, loadingMore, loading, houses.length])

  const loadMorePackages = useCallback(() => {
    if (packagesPagination.hasNextPage && !loadingMore && !loading) {
      const currentOffset = packagesPagination.offset || packages.length || 0
      const nextOffset = currentOffset + (packagesPagination.limit || 10)
      if (!isNaN(nextOffset) && nextOffset >= 0) {
        loadPackages(nextOffset, false)
      }
    }
  }, [packagesPagination, loadingMore, loading, packages.length])

  // Перезагрузка при изменении фильтров или вкладки
  useEffect(() => {
    if (activeTab === 'houses') {
      loadHouses(0, true)
    } else {
      loadPackages(0, true)
    }
  }, [filters, activeTab])

  const handleDelete = async (deleteInfo) => {
    try {
      if (deleteInfo.type === 'package') {
        await packagesApi.delete(deleteInfo.id)
        await loadPackages(0, true)
      } else {
        await housesApi.delete(deleteInfo.id)
        await loadHouses(0, true)
      }
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка при удалении:', err)
      alert(`Не удалось удалить ${deleteInfo.type === 'package' ? 'пакет' : 'дом'}`)
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'available': 'Доступен',
      'reserved': 'Забронирован',
      'sold': 'Продан',
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      'available': 'bg-green-100 text-green-800',
      'reserved': 'bg-yellow-100 text-yellow-800',
      'sold': 'bg-red-100 text-red-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">🏠 Дома и пакеты</h2>
        {activeTab === 'houses' ? (
          <Link
            to="/houses/new"
            className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Добавить дом</span>
          </Link>
        ) : (
          <Link
            to="/packages/new"
            className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Добавить пакет</span>
          </Link>
        )}
      </div>

      {/* Toggle для переключения между пакетами и домами */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Показать:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('houses')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'houses'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              🏠 Дома
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'packages'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              📦 Пакетные решения
            </button>
          </div>
        </div>
      </div>

      {/* Filters - показываются только для домов */}
      {activeTab === 'houses' && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Все статусы</option>
                <option value="available">Доступен</option>
                <option value="reserved">Забронирован</option>
                <option value="sold">Продан</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Поиск</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Номер дома, название, описание..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg">Загрузка {activeTab === 'houses' ? 'домов' : 'пакетов'}...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => activeTab === 'houses' ? loadHouses(0, true) : loadPackages(0, true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      ) : activeTab === 'packages' ? (
        /* Пакетные решения - стиль client-2 */
        <>
          {!Array.isArray(packages) || packages.length === 0 ? (
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
              {/* Grid View для пакетов в стиле client-2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                {packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col h-full">
                      {/* Изображение */}
                      <div className="w-full h-40 sm:h-48 md:h-56 overflow-hidden bg-gray-100">
                        <img 
                          src={pkg.thumbnail ? getImageUrl(pkg.thumbnail) : '/images/houses/placeholder.svg'} 
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = '/images/houses/placeholder.svg'
                          }}
                        />
                      </div>
                      {/* Контент */}
                      <div className="p-3 sm:p-4 flex flex-col flex-grow">
                        <div className="flex-1 mb-3">
                          <h3 className="text-base sm:text-lg font-semibold mb-2 text-gray-900">
                            {pkg.title}
                          </h3>
                          {pkg.package_id && (
                            <p className="text-xs text-gray-500 mb-2">ID: {pkg.package_id}</p>
                          )}
                          {Array.isArray(pkg.features) && pkg.features.length > 0 && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium mb-1">Характеристики:</p>
                              <ul className="space-y-1">
                                {pkg.features.slice(0, 2).map((feature, idx) => (
                                  <li key={idx} className="line-clamp-1 text-xs">• {feature}</li>
                                ))}
                                {pkg.features.length > 2 && (
                                  <li className="text-gray-500 text-xs">... и еще {pkg.features.length - 2}</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                        {/* Кнопки действий */}
                        <div className="flex space-x-2 pt-3 border-t border-gray-200">
                          <Link
                            to={`/packages/edit/${pkg.id}`}
                            className="flex-1 text-center px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-xs sm:text-sm"
                          >
                            Редактировать
                          </Link>
                          <button
                            onClick={() => setShowDeleteConfirm({ type: 'package', id: pkg.id })}
                            className="flex-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-xs sm:text-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Индикатор загрузки при infinite scroll */}
              {loadingMore && (
                <div className="mt-4 text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="text-gray-600 mt-2">Загрузка...</p>
                </div>
              )}

              {/* Элемент для отслеживания прокрутки (infinite scroll) */}
              {packagesPagination.hasNextPage && !loadingMore && (
                <div ref={packagesObserverTarget} className="h-10"></div>
              )}

              {/* Информация о количестве загруженных пакетов */}
              {packages.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
                  Показано {packages.length} из {packagesPagination.total} пакетов
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Дома */
        <>
          {!Array.isArray(houses) || houses.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">Дома не найдены</p>
              <Link
                to="/houses/new"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Создать первый дом
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Номер
                      </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Этаж
                  </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Площадь
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Комнаты
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цена
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(houses) && houses.map((house) => (
                      <tr key={house.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{house.number}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{house.floor || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{house.area || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{house.rooms || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{house.price || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(house.status)}`}>
                            {getStatusLabel(house.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/houses/edit/${house.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              Редактировать
                            </Link>
                            <button
                              onClick={() => setShowDeleteConfirm({ type: 'house', id: house.id })}
                              className="text-red-600 hover:text-red-900"
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {Array.isArray(houses) && houses.map((house) => (
                  <div key={house.id} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{house.name || `Дом №${house.number}`}</h3>
                          <p className="text-sm text-gray-500">{house.number}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(house.status)}`}>
                          {getStatusLabel(house.status)}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div>
                          <span className="text-gray-500">Этаж:</span> <span className="text-gray-900">{house.floor || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Площадь:</span> <span className="text-gray-900">{house.area || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Комнаты:</span> <span className="text-gray-900">{house.rooms || '-'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Цена:</span> <span className="text-gray-900 font-medium">{house.price || '-'}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2 pt-4 border-t">
                        <Link
                          to={`/houses/edit/${house.id}`}
                          className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                        >
                          Редактировать
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'house', id: house.id })}
                          className="flex-1 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition font-medium text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Индикатор загрузки при infinite scroll */}
              {loadingMore && (
                <div className="mt-4 text-center py-4">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  <p className="text-gray-600 mt-2">Загрузка...</p>
                </div>
              )}

              {/* Элемент для отслеживания прокрутки (infinite scroll) */}
              {housesPagination.hasNextPage && !loadingMore && (
                <div ref={housesObserverTarget} className="h-10"></div>
              )}

              {/* Информация о количестве загруженных домов */}
              {houses.length > 0 && (
                <div className="mt-4 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
                  Показано {houses.length} из {housesPagination.total} домов
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить этот {showDeleteConfirm?.type === 'package' ? 'пакет' : 'дом'}? Это действие нельзя отменить.
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
                Удалить {showDeleteConfirm?.type === 'package' ? 'пакет' : 'дом'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Houses
