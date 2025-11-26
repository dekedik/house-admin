import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProjectById, createProject, updateProject } from '../data/projectsStore'

const ProjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    name: '',
    district: '',
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
      const project = getProjectById(id)
      if (project) {
        setFormData({
          ...project,
          images: project.images || ['', '', ''],
        })
      }
    }
  }, [id, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const projectData = {
      ...formData,
      images: formData.images.filter(img => img.trim() !== ''),
    }

    if (isEdit) {
      updateProject(id, projectData)
    } else {
      createProject(projectData)
    }

    navigate('/')
  }

  const districts = ['Центр', 'Север', 'Юг', 'Восток', 'Запад']
  const statuses = ['Строится', 'Сдан', 'Скоро сдача']

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {isEdit ? 'Редактировать проект' : 'Создать новый проект'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Основная информация */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Основная информация</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название проекта *
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Главное изображение *
              </label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            {formData.images.map((img, index) => (
              <div key={index}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дополнительное изображение {index + 1}
                </label>
                <input
                  type="url"
                  value={img}
                  onChange={(e) => handleImageChange(index, e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Инфраструктура */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Инфраструктура</h3>
          <div className="flex space-x-2 mb-4">
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
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
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
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {isEdit ? 'Сохранить изменения' : 'Создать проект'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm

