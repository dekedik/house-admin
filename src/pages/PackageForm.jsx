import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { packagesApi } from '../services/packagesApi'
import { getImageUrl } from '../utils/imageUtils'

const PackageForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    package_id: '',
    title: '',
    thumbnail: '',
    image: '',
    gallery: [],
    features: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (isEdit) {
      loadPackage()
    }
  }, [id, isEdit])

  const loadPackage = async () => {
    try {
      setLoading(true)
      const pkg = await packagesApi.getById(id)
      setFormData({
        package_id: pkg.package_id || '',
        title: pkg.title || '',
        thumbnail: pkg.thumbnail || '',
        image: pkg.image || '',
        gallery: Array.isArray(pkg.gallery) ? pkg.gallery : (pkg.gallery ? JSON.parse(pkg.gallery) : []),
        features: Array.isArray(pkg.features) ? pkg.features : (pkg.features ? JSON.parse(pkg.features) : []),
      })
      setLoading(false)
    } catch (err) {
      console.error('Ошибка при загрузке пакета:', err)
      setError('Не удалось загрузить данные пакета.')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData(prev => ({ ...prev, features: newFeatures }))
  }

  const handleAddFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }))
  }

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleFileUpload = async (e, type, index = null) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnail: reader.result }))
      } else if (type === 'image') {
        setFormData(prev => ({ ...prev, image: reader.result }))
      } else if (type === 'gallery' && index !== null) {
        const newGallery = [...formData.gallery]
        newGallery[index] = reader.result
        setFormData(prev => ({ ...prev, gallery: newGallery }))
      } else if (type === 'gallery') {
        setFormData(prev => ({ ...prev, gallery: [...prev.gallery, reader.result] }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveGalleryImage = (index) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const packageData = {
        ...formData,
        features: formData.features.filter(f => f.trim() !== ''),
        gallery: formData.gallery.filter(img => img.trim() !== ''),
      }

      if (isEdit) {
        await packagesApi.update(id, packageData)
        setSuccess('Пакет успешно обновлен!')
      } else {
        await packagesApi.create(packageData)
        setSuccess('Пакет успешно создан!')
        setFormData({
          package_id: '',
          title: '',
          thumbnail: '',
          image: '',
          gallery: [],
          features: [],
        })
      }
      setTimeout(() => {
        navigate('/packages')
      }, 1000)
    } catch (err) {
      console.error('Ошибка при сохранении пакета:', err)
      setError(err.message || 'Не удалось сохранить пакет.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div className="text-center py-8">Загрузка пакета...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? '✏️ Редактировать пакет' : '✨ Создать новый пакет'}
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Ошибка!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Успех!</strong>
          <span className="block sm:inline"> {success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="package_id" className="block text-sm font-medium text-gray-700 mb-2">
              ID пакета * (уникальный идентификатор)
            </label>
            <input
              type="text"
              id="package_id"
              name="package_id"
              value={formData.package_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: start, standard, comfort, premium"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Используется в client-2 для идентификации пакета</p>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Название пакета *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: Старт, Стандарт, Комфорт, Премиум"
              required
            />
          </div>
        </div>

        {/* Изображения */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Изображения</h3>
          <div className="space-y-4">
            {/* Миниатюра */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Миниатюра (для карточки) *
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="hidden"
                    id="thumbnail-upload"
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Загрузить миниатюру
                  </label>
                </div>
                {formData.thumbnail && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(formData.thumbnail)}
                      alt="Предпросмотр миниатюры"
                      className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Главное изображение */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Главное изображение
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  >
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Загрузить изображение
                  </label>
                </div>
                {formData.image && (
                  <div className="mt-2">
                    <img
                      src={getImageUrl(formData.image)}
                      alt="Предпросмотр"
                      className="max-w-full h-48 object-contain rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Галерея */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Галерея изображений
              </label>
              <div className="space-y-3">
                {formData.gallery.map((img, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Изображение {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(index)}
                        className="text-red-600 hover:text-red-800 transition"
                        title="Удалить изображение"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'gallery', index)}
                        className="hidden"
                        id={`gallery-upload-${index}`}
                      />
                      <label
                        htmlFor={`gallery-upload-${index}`}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition"
                      >
                        <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {img ? 'Изменить изображение' : 'Загрузить изображение'}
                      </label>
                      {img && (
                        <div className="mt-2">
                          <img
                            src={getImageUrl(img)}
                            alt={`Предпросмотр ${index + 1}`}
                            className="w-full max-h-48 object-contain rounded-lg border border-gray-300"
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {formData.gallery.length < 20 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newGallery = [...formData.gallery, '']
                      setFormData(prev => ({ ...prev, gallery: newGallery }))
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    + Добавить изображение в галерею
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Характеристики пакета
          </label>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`Характеристика ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              + Добавить характеристику
            </button>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/packages')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать пакет')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PackageForm

