import React, { useState } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Image, Upload, message, Spin, Select } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import { aiService } from '@/services/aiService'
import type { AIFormData } from '../hooks/useProductForm'
import type { Category } from '@/services/categoryApi'

interface AIProductFormProps {
  aiFormData: AIFormData
  aiImageList: UploadFile[]
  categories: Category[]
  categoriesLoading: boolean
  onUpdateAIField: (field: keyof AIFormData, value: any) => void
  onAIImageChange: UploadProps['onChange']
  onTransferToManual: (aiGeneratedData: {
    name: string
    description: string
    brand?: string
    price?: number
    stock?: number
  }) => void
  onCancel: () => void
}

const AIProductForm: React.FC<AIProductFormProps> = ({
  aiFormData,
  aiImageList,
  categories,
  categoriesLoading,
  onUpdateAIField,
  onAIImageChange,
  onTransferToManual,
  onCancel
}) => {
  const [loading, setLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]

  const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as FileType)
    }

    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true)
  }

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!aiFormData.image) {
      message.error('Debes subir una imagen del producto')
      return
    }

    if (!aiFormData.categoryId) {
      message.error('Debes seleccionar una categoría')
      return
    }

    setLoading(true)
    try {
      const selectedCategory = categories.find(cat => cat.id === aiFormData.categoryId)
      if (!selectedCategory) {
        throw new Error('Categoría no encontrada')
      }
      
      message.info('Analizando imagen con IA...')
      const aiResult = await aiService.generateProductFromImageFile({
        imageFile: aiFormData.image,
        categoryName: selectedCategory.name,
        additionalDetails: aiFormData.additionalDetails
      })

      const aiGeneratedData = {
        name: aiResult.title,
        description: aiResult.description,
        brand: aiResult.brand || "CinnamonShop",
        price: 29.99,
        stock: 50
      }

      onTransferToManual(aiGeneratedData)
      
      message.success('Producto generado con IA exitosamente. Ahora puedes completar los detalles en el formulario manual.')
    } catch (error) {
      console.error('Error al generar producto con IA:', error)
      message.error('Error al generar el producto con IA. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageRemove = (file: UploadFile) => {
    // Limpiar la imagen seleccionada
    onUpdateAIField('image', null)
    if (onAIImageChange) {
      onAIImageChange({ fileList: [], file: file })
    }
    
    // Revocar la URL temporal para liberar memoria
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
    
    message.success('Imagen removida')
  }

  return (
    <form className='add-product-form' onSubmit={handleAIGenerate}>
      <div className='ai-form-header'>
        <div className='ai-info'>
          <h3>🤖 Generación con Inteligencia Artificial</h3>
          <p>Sube una imagen de tu producto y la IA generará automáticamente toda la información necesaria.</p>
        </div>
      </div>

      <div className='form-group'>
        <label>Imagen Principal *</label>
        <Upload
          listType="picture-card"
          fileList={aiImageList}
          onPreview={handlePreview}
          onChange={onAIImageChange}
          onRemove={handleImageRemove}
          maxCount={1}
          accept="image/*"
          beforeUpload={() => false} // Prevenir subida automática
        >
          {aiImageList.length >= 1 ? null : (
            <button style={{ border: 0, background: 'none' }} type="button">
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Subir Imagen</div>
            </button>
          )}
        </Upload>
        <small>Esta imagen será analizada directamente por la IA para generar el título y descripción del producto.</small>
      </div>

      <div className='form-group'>
        <label htmlFor="aiCategory">Categoría *</label>
        <Select
          id="aiCategory"
          placeholder="Selecciona una categoría"
          value={aiFormData.categoryId || undefined}
          onChange={(value) => onUpdateAIField('categoryId', value)}
          loading={categoriesLoading}
          disabled={categoriesLoading}
          style={{ width: '100%' }}
        >
          {categories.map((category) => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
        {categoriesLoading && <small>Cargando categorías...</small>}
      </div>

      <div className='form-group'>
        <label htmlFor="aiDetails">Detalles Adicionales (Opcional)</label>
        <textarea 
          id="aiDetails" 
          name="aiDetails" 
          placeholder="Información adicional que quieres que la IA considere..."
          rows={3}
          value={aiFormData.additionalDetails || ''}
          onChange={(e) => onUpdateAIField('additionalDetails', e.target.value)}
        />
        <small>Puedes agregar información específica como origen, características especiales, etc.</small>
      </div>

      <div className='ai-actions'>
        <button type="button" className='btn-secondary' onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className='btn-ai-generate' disabled={loading}>
          {loading ? (
            <>
              <Spin size="small" /> Generando con IA...
            </>
          ) : (
            '🤖 Generar con IA'
          )}
        </button>
      </div>

      <Image
        wrapperStyle={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: (visible) => setPreviewOpen(visible),
          afterOpenChange: (visible) => !visible && setPreviewImage(''),
        }}
        src={previewImage}
      />
    </form>
  )
}

export default AIProductForm 