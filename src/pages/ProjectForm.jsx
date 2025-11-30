import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    district: '',
    type: '',
    description: '',
    fullDescription: '',
    price: '',
    priceFrom: '',
    completion: '',
    rooms: '',
    parking: '',
    status: '',
    discount: '',
    image: '',
    images: ['', '', ''],
    developer: '',
    floors: '',
    apartments: '',
    area: '',
    features: [],
  })

  const [newFeature, setNewFeature] = useState('')

  useEffect(() => {
    if (isEdit) {
      loadProject()
    }
  }, [id, isEdit])

  const loadProject = async () => {
    try {
      const project = await api.getProjectById(id)
      // Преобразуем images из JSONB если это строка
      const images = Array.isArray(project.images) ? project.images : (project.images ? JSON.parse(project.images) : [])
      const features = Array.isArray(project.features) ? project.features : (project.features ? JSON.parse(project.features) : [])
      
      setFormData({
        name: project.name || '',
        district: project.district || '',
        type: project.type || '',
        description: project.description || '',
        fullDescription: project.full_description || '',
        price: project.price || '',
        priceFrom: project.price_from || '',
        completion: project.completion || '',
        rooms: project.rooms || '',
        parking: project.parking || '',
        status: project.status || '',
        discount: project.discount || '',
        image: project.image || '',
        images: images.length > 0 ? images : ['', '', ''],
        developer: project.developer || '',
        floors: project.floors || '',
        apartments: project.apartments || '',
        area: project.area || '',
        features: features || [],
      })
    } catch (error) {
      console.error('Ошибка при загрузке новостройки:', error)
      alert('Не удалось загрузить новостройку')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleFileUpload = (e, fieldName, index = null) => {
    const file = e.target.files[0]
    if (file) {
      // Проверка типа файла
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения')
        return
      }

      // Проверка размера файла (макс 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result
        if (fieldName === 'image') {
          setFormData(prev => ({ ...prev, image: result }))
        } else if (index !== null) {
          const newImages = [...formData.images]
          newImages[index] = result
          setFormData(prev => ({ ...prev, images: newImages }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }))
      setNewFeature('')
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const projectData = {
      name: formData.name,
      district: formData.district,
      type: formData.type,
      description: formData.description,
      fullDescription: formData.fullDescription,
      price: formData.price,
      priceFrom: formData.priceFrom,
      completion: formData.completion,
      rooms: formData.rooms,
      parking: formData.parking,
      status: formData.status,
      discount: formData.discount || null,
      image: formData.image,
      images: formData.images.filter(img => img.trim() !== ''),
      developer: formData.developer,
      floors: formData.floors,
      apartments: formData.apartments,
      area: formData.area,
      features: formData.features,
    }

    try {
      if (isEdit) {
        await api.updateProject(id, projectData)
      } else {
        await api.createProject(projectData)
      }
      navigate('/')
    } catch (error) {
      console.error('Ошибка при сохранении новостройки:', error)
      alert('Не удалось сохранить новостройку: ' + error.message)
    }
  }

  const districts = [
    'Ленинский район',
    'Кировский район',
    'Первомайский район',
    'Железнодорожный район',
    'Советский район',
    'Октябрьский район',
    'Ворошиловский район',
    'Пролетарский район',
    'Область и другие регионы',
  ]
  const types = ['Монолитный', 'Монолитно-кирпичный', 'Кирпичный', 'Панельный']
  const statuses = ['Сданные', 'Строятся', 'Старт продаж']

  return (
    <div className="max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {isEdit ? 'Редактировать новостройку' : 'Создать новую новостройку'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Основная информация</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название новостройки *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Район *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Выберите район</option>
                {districts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Тип ЖК
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Выберите тип ЖК</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Краткое описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Полное описание *
              </label>
              <textarea
                name="fullDescription"
                value={formData.fullDescription}
                onChange={handleChange}
                required
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Цены */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Цены</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена за м² *
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                placeholder="350 000 ₽"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена от *
              </label>
              <input
                type="text"
                name="priceFrom"
                value={formData.priceFrom}
                onChange={handleChange}
                required
                placeholder="8 500 000 ₽"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Скидка
              </label>
              <input
                type="text"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="-10%"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Характеристики */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Характеристики</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Комнаты *
              </label>
              <input
                type="text"
                name="rooms"
                value={formData.rooms}
                onChange={handleChange}
                required
                placeholder="1-4 комн."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Парковка *
              </label>
              <input
                type="text"
                name="parking"
                value={formData.parking}
                onChange={handleChange}
                required
                placeholder="Подземный"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Срок сдачи *
              </label>
              <input
                type="text"
                name="completion"
                value={formData.completion}
                onChange={handleChange}
                required
                placeholder="Q2 2025"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Статус *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Выберите статус</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Застройщик *
              </label>
              <input
                type="text"
                name="developer"
                value={formData.developer}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Этажность *
              </label>
              <input
                type="text"
                name="floors"
                value={formData.floors}
                onChange={handleChange}
                required
                placeholder="15-25 этажей"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество квартир *
              </label>
              <input
                type="text"
                name="apartments"
                value={formData.apartments}
                onChange={handleChange}
                required
                placeholder="450 квартир"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Площадь *
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                placeholder="от 35 до 120 м²"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Изображения */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Изображения</h3>
          <div className="space-y-4">
            {/* Главное изображение */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Главное изображение *
              </label>
              <div className="space-y-2">
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="Или введите URL изображения"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'image')}
                    className="hidden"
                    id="main-image-upload"
                  />
                  <label
                    htmlFor="main-image-upload"
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
                      src={formData.image}
                      alt="Предпросмотр"
                      className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Дополнительные изображения */}
            {formData.images.map((img, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительное изображение {index + 1}
                </label>
                <div className="space-y-2">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="Или введите URL изображения"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'images', index)}
                      className="hidden"
                      id={`image-upload-${index}`}
                    />
                    <label
                      htmlFor={`image-upload-${index}`}
                      className="inline-flex items-center px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                    >
                      <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Загрузить изображение
                    </label>
                  </div>
                  {img && (
                    <div className="mt-2">
                      <img
                        src={img}
                        alt={`Предпросмотр ${index + 1}`}
                        className="max-w-full h-48 object-cover rounded-lg border border-gray-300"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Инфраструктура */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Инфраструктура</h3>
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
              placeholder="Добавить особенность"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              type="button"
              onClick={handleAddFeature}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition whitespace-nowrap"
            >
              Добавить
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(index)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {isEdit ? 'Сохранить изменения' : 'Создать новостройку'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm

