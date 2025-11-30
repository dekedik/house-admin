import React, { useState, useEffect } from 'react'
import { clientsApi } from '../services/clientsApi'
import { applicationsApi } from '../services/applicationsApi'
import { api } from '../services/api'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(null)
  const [clientApplications, setClientApplications] = useState([])
  const [projects, setProjects] = useState([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadClients()
  }, [search])

  const loadClients = async () => {
    try {
      setLoading(true)
      const data = await clientsApi.getAll({ search })
      setClients(data)
      setError(null)
    } catch (err) {
      console.error('Ошибка при загрузке клиентов:', err)
      setError('Не удалось загрузить клиентов')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await clientsApi.delete(id)
      await loadClients()
      setShowDeleteConfirm(null)
    } catch (err) {
      console.error('Ошибка при удалении клиента:', err)
      alert('Не удалось удалить клиента')
    }
  }

  const handleShowDetails = async (client) => {
    setShowDetailsModal(client)
    setLoadingApplications(true)
    try {
      const [applicationsData, projectsData] = await Promise.all([
        applicationsApi.getAll({ client_id: client.id }),
        api.getProjects()
      ])
      setClientApplications(applicationsData)
      setProjects(projectsData)
    } catch (err) {
      console.error('Ошибка при загрузке заявок клиента:', err)
      setClientApplications([])
    } finally {
      setLoadingApplications(false)
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">👥 Клиенты</h2>
        <button
          className="bg-primary-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition font-medium flex items-center justify-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Добавить клиента</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по имени, телефону, email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg">Загрузка клиентов...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={loadClients}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 sm:p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">Клиенты не найдены</p>
          <button
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Создать первого клиента
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Телефон
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Заметки
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{client.notes || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleShowDetails(client)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Показать заявки клиента"
                        >
                          Подробнее
                        </button>
                        <button
                          className="text-primary-600 hover:text-primary-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(client.id)}
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
            {clients.map((client) => (
              <div key={client.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-500">Телефон:</span> <span className="text-gray-900">{client.phone || '-'}</span>
                      </div>
                      {client.notes && (
                        <div>
                          <span className="text-gray-500">Заметки:</span> <span className="text-gray-900">{client.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 pt-4 border-t">
                    <button
                      onClick={() => handleShowDetails(client)}
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
                      onClick={() => setShowDeleteConfirm(client.id)}
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

      {/* Client Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Заявки клиента: {showDetailsModal.name}</h3>
                <div className="mt-2 text-sm text-gray-600">
                  {showDetailsModal.phone && <span>Телефон: {showDetailsModal.phone}</span>}
                  {showDetailsModal.email && <span className="ml-4">Email: {showDetailsModal.email}</span>}
                </div>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(null)
                  setClientApplications([])
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {loadingApplications ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Загрузка заявок...</p>
              </div>
            ) : clientApplications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">У этого клиента пока нет заявок</p>
              </div>
            ) : (
              <div className="space-y-4">
                {clientApplications.map((app) => (
                  <div key={app.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-semibold text-gray-900">Заявка #{app.id}</span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Создана: {new Date(app.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <span className="text-gray-500">Проект:</span> <span className="text-gray-900 font-medium">{getProjectDisplay(app)}</span>
                      </div>
                      {app.house_number && (
                        <div>
                          <span className="text-gray-500">Дом:</span> <span className="text-gray-900 font-medium">{app.house_number}</span>
                        </div>
                      )}
                      {app.source && (
                        <div>
                          <span className="text-gray-500">Источник:</span> <span className="text-gray-900 font-medium">{app.source}</span>
                        </div>
                      )}
                      {app.manager_username && (
                        <div>
                          <span className="text-gray-500">Менеджер:</span> <span className="text-gray-900 font-medium">{app.manager_username}</span>
                        </div>
                      )}
                    </div>

                    {app.notes && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-700 mb-1">Заметки:</div>
                        <div className="text-sm text-gray-900 bg-gray-50 rounded p-2 whitespace-pre-wrap">{app.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDetailsModal(null)
                  setClientApplications([])
                }}
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
              Вы уверены, что хотите удалить этого клиента? Это действие нельзя отменить.
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

export default Clients
