import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { getImageUrl } from '../utils/imageUtils'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  })
  const observerTarget = useRef(null)

  useEffect(() => {
    loadProjects(0, true)
  }, [])

  // Infinite scroll: отслеживание прокрутки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasNextPage && !loadingMore && !loading) {
          loadMoreProjects()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [pagination.hasNextPage, loadingMore, loading])

  const loadProjects = async (offset = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      const limit = 10 // Фиксированный лимит
      const result = await api.getProjects({ offset, limit })
      
      // Поддержка как нового формата (с пагинацией), так и старого (массив)
      if (result.data && result.pagination) {
        if (reset) {
          setProjects(result.data)
        } else {
          setProjects(prev => [...prev, ...result.data])
        }
        // Убеждаемся, что offset всегда число
        const paginationOffset = typeof result.pagination.offset === 'number' && !isNaN(result.pagination.offset)
          ? result.pagination.offset
          : (reset ? 0 : (projects.length || 0))
        setPagination({
          ...result.pagination,
          offset: paginationOffset
        })
      } else if (Array.isArray(result)) {
        if (reset) {
          setProjects(result)
        } else {
          setProjects(prev => [...prev, ...result])
        }
        setPagination({
          offset: result.length,
          limit: result.length,
          total: result.length,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false
        })
      } else {
        if (reset) {
          setProjects([])
        }
      }
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке новостроек:', err)
      setError('Не удалось загрузить новостройки')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreProjects = useCallback(() => {
    if (pagination.hasNextPage && !loadingMore && !loading) {
      // Используем offset из pagination или вычисляем из количества загруженных проектов
      const currentOffset = (typeof pagination.offset === 'number' && !isNaN(pagination.offset))
        ? pagination.offset
        : projects.length || 0
      const nextOffset = currentOffset + (pagination.limit || 10)
      if (!isNaN(nextOffset) && nextOffset >= 0) {
        loadProjects(nextOffset, false)
      }
    }
  }, [pagination, loadingMore, loading, projects.length])


  const handleDelete = async (id) => {
    try {
      await api.deleteProject(id)
      // Перезагружаем с начала (reset)
      await loadProjects(0, true)
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка при удалении новостройки:', err)
      alert('Не удалось удалить новостройку')
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">📋 Список новостроек</h2>
        <Link
          to="/projects/new"
          className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Добавить новостройку</span>
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg">Загрузка новостроек...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => loadProjects(0, true)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Новостройки не найдены</p>
          <Link
            to="/projects/new"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Создать первую новостройку
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
                    Изображение
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Район
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
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={getImageUrl(project.image)}
                        alt={project.name}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-1">{project.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{project.district}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">{project.price}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Сдан' ? 'bg-green-100 text-green-800' :
                        project.status === 'Скоро сдача' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`/projects/edit/${project.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Редактировать
                        </Link>
                        <button
                          onClick={() => setShowDeleteConfirm(project.id)}
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
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start space-x-4 mb-4">
                    <img
                      src={getImageUrl(project.image)}
                      alt={project.name}
                      className="h-20 w-28 object-cover rounded flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{project.description}</p>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-gray-600">{project.district}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm font-medium text-gray-900">{project.price}</span>
                      </div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'Сдан' ? 'bg-green-100 text-green-800' :
                        project.status === 'Скоро сдача' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-4 border-t">
                    <Link
                      to={`/projects/edit/${project.id}`}
                      className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                    >
                      Редактировать
                    </Link>
                    <button
                      onClick={() => setShowDeleteConfirm(project.id)}
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
          {pagination.hasNextPage && !loadingMore && (
            <div ref={observerTarget} className="h-10"></div>
          )}

          {/* Информация о количестве загруженных проектов */}
          {projects.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600 bg-white rounded-lg shadow p-4">
              Показано {projects.length} из {pagination.total} новостроек
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить эту новостройку? Это действие нельзя отменить.
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

export default ProjectsList


