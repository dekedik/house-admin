import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { housesApi } from '../services/housesApi'
import { getImageUrl } from '../utils/imageUtils'

const HouseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [formData, setFormData] = useState({
    number: '',
    name: '',
    floor: '',
    area: '',
    rooms: '',
    price: '',
    price_from: '',
    status: 'available',
    description: '',
    full_description: '',
    image: '',
    floorPlan: '',
    images: [],
    characteristics: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    if (isEdit) {
      loadHouse()
    }
  }, [id, isEdit])

  const loadHouse = async () => {
    try {
      setLoading(true)
      const house = await housesApi.getById(id)
      setFormData({
        number: house.number || '',
        name: house.name || '',
        floor: house.floor || '',
        area: house.area || '',
        rooms: house.rooms || '',
        price: house.price || '',
        price_from: house.price_from || '',
        status: house.status || 'available',
        description: house.description || '',
        full_description: house.full_description || '',
        image: house.image || '',
        floorPlan: house.floor_plan || '',
        images: Array.isArray(house.images) ? house.images : (house.images ? JSON.parse(house.images) : []),
        characteristics: Array.isArray(house.characteristics) ? house.characteristics : (house.characteristics ? JSON.parse(house.characteristics) : []),
      })
      setLoading(false)
    } catch (err) {
      console.error('Ошибка при загрузке дома:', err)
      setError('Не удалось загрузить данные дома.')
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCharacteristicChange = (index, value) => {
    const newCharacteristics = [...formData.characteristics]
    newCharacteristics[index] = value
    setFormData(prev => ({ ...prev, characteristics: newCharacteristics }))
  }

  const handleAddCharacteristic = () => {
    setFormData(prev => ({ ...prev, characteristics: [...prev.characteristics, ''] }))
  }

  const handleRemoveCharacteristic = (index) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index)
    }))
  }

  const handleFileUpload = async (e, type, index = null) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      if (type === 'image') {
        setFormData(prev => ({ ...prev, image: reader.result }))
      } else if (type === 'floorPlan') {
        setFormData(prev => ({ ...prev, floorPlan: reader.result }))
      } else if (type === 'images' && index !== null) {
        const newImages = [...formData.images]
        newImages[index] = reader.result
        setFormData(prev => ({ ...prev, images: newImages }))
      } else if (type === 'images') {
        setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const houseData = {
        ...formData,
        characteristics: formData.characteristics.filter(c => c.trim() !== ''),
        images: formData.images.filter(img => img.trim() !== ''),
      }

      if (isEdit) {
        await housesApi.update(id, houseData)
        setSuccess('Дом успешно обновлен!')
      } else {
        await housesApi.create(houseData)
        setSuccess('Дом успешно создан!')
        setFormData({
          number: '',
          name: '',
          floor: '',
          area: '',
          rooms: '',
          price: '',
          price_from: '',
          status: 'available',
          description: '',
          full_description: '',
          image: '',
          floorPlan: '',
          images: [],
          characteristics: [],
        })
      }
      setTimeout(() => {
        navigate('/houses')
      }, 1000)
    } catch (err) {
      console.error('Ошибка при сохранении дома:', err)
      setError(err.message || 'Не удалось сохранить дом.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEdit) {
    return <div className="text-center py-8">Загрузка дома...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? '✏️ Редактировать дом' : '✨ Создать новый дом'}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Название дома * (для client-2)
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: Коттедж 'Премиум'"
            />
          </div>
          <div>
            <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-2">
              Номер дома
            </label>
            <input
              type="text"
              id="number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Статус *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              required
            >
              <option value="available">Доступен</option>
              <option value="reserved">Забронирован</option>
              <option value="sold">Продан</option>
            </select>
          </div>
          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
              Площадь (для client-2)
            </label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: 180 м²"
            />
          </div>
          <div>
            <label htmlFor="rooms" className="block text-sm font-medium text-gray-700 mb-2">
              Комнаты (для client-2)
            </label>
            <input
              type="text"
              id="rooms"
              name="rooms"
              value={formData.rooms}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: 4 комн."
            />
          </div>
          <div>
            <label htmlFor="floor" className="block text-sm font-medium text-gray-700 mb-2">
              Этаж
            </label>
            <input
              type="number"
              id="floor"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Цена
            </label>
            <input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: 8500000"
            />
          </div>
          <div>
            <label htmlFor="price_from" className="block text-sm font-medium text-gray-700 mb-2">
              Цена от (для client-2) *
            </label>
            <input
              type="text"
              id="price_from"
              name="price_from"
              value={formData.price_from}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Например: 8 500 000 ₽"
              required
            />
          </div>
        </div>

        {/* Описания */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Краткое описание (для client-2)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Краткое описание дома"
          ></textarea>
        </div>
        <div>
          <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-2">
            Полное описание (для client-2)
          </label>
          <textarea
            id="full_description"
            name="full_description"
            value={formData.full_description}
            onChange={handleChange}
            rows="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Полное описание дома"
          ></textarea>
        </div>

        {/* Характеристики */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Характеристики (для client-2)
          </label>
          <div className="space-y-2">
            {formData.characteristics.map((char, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={char}
                  onChange={(e) => handleCharacteristicChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder={`Характеристика ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCharacteristic(index)}
                  className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Удалить
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddCharacteristic}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
            >
              + Добавить характеристику
            </button>
          </div>
        </div>

        {/* Изображения */}
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Изображения</h3>
          <div className="space-y-4">
            {/* Главное изображение */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Главное изображение (для client-2) *
              </label>
              <div className="space-y-2">
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

            {/* Планировка дома */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Планировка дома
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'floorPlan')}
                    className="hidden"
                    id="floor-plan-upload"
                  />
                  <label
                    htmlFor="floor-plan-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition"
                  >
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {formData.floorPlan ? 'Изменить планировку' : 'Загрузить планировку'}
                  </label>
                  {formData.floorPlan && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, floorPlan: '' }))}
                      className="ml-2 inline-flex items-center px-3 py-2 bg-red-50 border border-red-300 text-red-700 rounded-lg hover:bg-red-100 transition"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Удалить
                    </button>
                  )}
                </div>
                {formData.floorPlan && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600 mb-2 font-medium">Предпросмотр планировки:</p>
                    <img
                      src={getImageUrl(formData.floorPlan)}
                      alt="Предпросмотр планировки"
                      className="max-w-full max-h-64 object-contain rounded-lg border border-blue-300 bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <p className="text-xs text-gray-500">
                  💡 Загрузите изображение планировки дома. Максимальный размер: 10MB. Форматы: JPEG, PNG, GIF, WebP, SVG
                </p>
              </div>
            </div>

            {/* Дополнительные изображения */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Дополнительные изображения (для client-2)
              </label>
              <div className="space-y-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">
                        Изображение {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
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
                        onChange={(e) => handleFileUpload(e, 'images', index)}
                        className="hidden"
                        id={`image-upload-${index}`}
                      />
                      <label
                        htmlFor={`image-upload-${index}`}
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
                {formData.images.length < 14 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = [...formData.images, '']
                      setFormData(prev => ({ ...prev, images: newImages }))
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                  >
                    + Добавить изображение
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate('/houses')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            {loading ? 'Сохранение...' : (isEdit ? 'Сохранить изменения' : 'Создать дом')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HouseForm

