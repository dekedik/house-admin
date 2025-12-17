import React, { useState, useEffect } from 'react'
import { applicationsApi } from '../services/applicationsApi'
import { api } from '../services/api'

const Applications = () => {
  const [applications, setApplications] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  const loadData = async () => {
    try {
      setLoading(true)
      const params = statusFilter ? { status: statusFilter } : {}
      const [applicationsData, projectsData] = await Promise.all([
        applicationsApi.getAll(params),
        api.getProjects()
      ])
      setApplications(applicationsData)
      setProjects(projectsData)
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке данных:', err)
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await applicationsApi.delete(id)
      await loadData()
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка при удалении заявки:', err)
      alert('Не удалось удалить заявку')
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      'new': 'Новая',
      'in_progress': 'В работе',
      'completed': 'Завершена',
      'cancelled': 'Отменена',
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      'new': 'bg-blue-100 text-blue-800',
      'in_progress': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
    }
    return classMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getProjectDisplay = (app) => {
    // Новая структура: app.project - это объект
    if (app.project && app.project.name) {
      return app.project.name
    }
    // Старая структура (для обратной совместимости)
    if (app.project_id) {
      const project = projects.find(p => p.id === app.project_id)
      if (project && project.name) {
        return project.name
      }
      if (app.project_name && app.project_name.trim() !== '' && app.project_name !== String(app.project_id)) {
        return app.project_name
      }
      return `Проект #${app.project_id}`
    }
    if (app.project_name && app.project_name.trim() !== '') {
      return app.project_name
    }
    return '-'
  }

  const getHouseDisplay = (app) => {
    if (app.house_number && app.house_number.trim() !== '') {
      return app.house_number
    }
    if (app.house_id) {
      return `Дом #${app.house_id}`
    }
    return '-'
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">📄 Заявки</h2>
        <div className="flex items-center space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            <option value="">Все статусы</option>
            <option value="new">Новые</option>
            <option value="in_progress">В работе</option>
            <option value="completed">Завершенные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg">Загрузка заявок...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadData}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Заявки не найдены</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Проект
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата создания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">#{app.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.client?.name || app.client_name || '-'}</div>
                      {(app.client?.phone || app.client_phone) && (
                        <div className="text-sm text-gray-500">{app.client?.phone || app.client_phone}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-900">{getProjectDisplay(app)}</div>
                        {(app.project?.id || app.project_id) && (
                          <a
                            href={`https://house-client-iota.vercel.app/project/${app.project?.id || app.project_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium underline"
                          >
                            Перейти
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(app.status)}`}>
                        {getStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('ru-RU')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setShowDetailsModal(app)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Подробнее"
                        >
                          Подробнее
                        </button>
                        <button
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(app.id)}
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
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Заявка #{app.id}</h3>
                      <p className="text-sm text-gray-500">{app.client?.name || app.client_name || 'Без клиента'}</p>
                      {(app.client?.phone || app.client_phone) && (
                        <p className="text-sm text-gray-400">{app.client?.phone || app.client_phone}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(app.status)}`}>
                      {getStatusLabel(app.status)}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4 text-sm">
                    {(app.project?.id || app.project_id || app.project_name) && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Проект:</span>
                        <span className="text-gray-900">{getProjectDisplay(app)}</span>
                        {(app.project?.id || app.project_id) && (
                          <a
                            href={`https://house-client-iota.vercel.app/project/${app.project?.id || app.project_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium underline"
                          >
                            Перейти
                          </a>
                        )}
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Создана:</span> <span className="text-gray-900">{new Date(app.created_at).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-4 border-t">
                    <button
                      onClick={() => setShowDetailsModal(app)}
                      className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium text-sm"
                    >
                      Подробнее
                    </button>
                    <button
                      className="flex-1 text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium text-sm"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(app.id)}
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

      {/* Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Детали заявки #{showDetailsModal.id}</h3>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Клиент</label>
                  <div className="text-sm text-gray-900">{showDetailsModal.client?.name || showDetailsModal.client_name || '-'}</div>
                  {(showDetailsModal.client?.phone || showDetailsModal.client_phone) && (
                    <div className="text-sm text-gray-500">{showDetailsModal.client?.phone || showDetailsModal.client_phone}</div>
                  )}
                  {(showDetailsModal.client?.email || showDetailsModal.client_email) && (
                    <div className="text-sm text-gray-500">{showDetailsModal.client?.email || showDetailsModal.client_email}</div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(showDetailsModal.status)}`}>
                    {getStatusLabel(showDetailsModal.status)}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Проект</label>
                  <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm text-gray-900">{getProjectDisplay(showDetailsModal)}</div>
                    {(showDetailsModal.project?.id || showDetailsModal.project_id) && (
                      <a
                        href={`https://house-client-iota.vercel.app/project/${showDetailsModal.project?.id || showDetailsModal.project_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 text-xs font-medium underline"
                      >
                        Перейти
                      </a>
                    )}
                  </div>
                  {showDetailsModal.project && (
                    <div className="text-xs text-gray-500 mt-1">
                      {showDetailsModal.project.district && <div>Район: {showDetailsModal.project.district}</div>}
                      {showDetailsModal.project.type && <div>Тип: {showDetailsModal.project.type}</div>}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дом</label>
                  <div className="text-sm text-gray-900">{getHouseDisplay(showDetailsModal)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Менеджер</label>
                  <div className="text-sm text-gray-900">{showDetailsModal.manager?.username || showDetailsModal.manager_username || '-'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Источник</label>
                  <div className="text-sm text-gray-900">{showDetailsModal.source || '-'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата создания</label>
                  <div className="text-sm text-gray-900">
                    {new Date(showDetailsModal.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                
                {showDetailsModal.updated_at && showDetailsModal.updated_at !== showDetailsModal.created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата обновления</label>
                    <div className="text-sm text-gray-900">
                      {new Date(showDetailsModal.updated_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                )}
              </div>
              
              {showDetailsModal.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Заметки</label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">{showDetailsModal.notes}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Подтверждение удаления</h3>
            <p className="text-gray-600 mb-6">
              Вы уверены, что хотите удалить эту заявку? Это действие нельзя отменить.
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

export default Applications
