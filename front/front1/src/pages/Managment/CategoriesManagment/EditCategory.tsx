import "./css/AddCategory.css"
import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import { message, Spin, Modal } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import CategoryFormTemplate from './components/templates/CategoryFormTemplate'
import { categoryApi, type UpdateCategoryData } from '@/services/categoryApi'
import { aiService } from '@/services/aiService'

function EditCategory() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [imageList, setImageList] = useState<UploadFile[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [formData, setFormData] = useState<UpdateCategoryData>({
    name: '',
    description: '',
    imageUrl: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('')

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

  const handleUpload = (file: File) => {
    setSelectedImage(file)
    
    const imageUrl = URL.createObjectURL(file)
    
    setImageList([{
      uid: '-1',
      name: file.name,
      status: 'done',
      url: imageUrl,
    }])
    
    message.success('Nueva imagen seleccionada. Se subirá cuando actualices la categoría.')
    return false
  }

  const handleImageChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setImageList(newFileList)
  }

  const handleImageRemove = (file: UploadFile) => {
    setSelectedImage(null)
    setImageList([])
    
    if (file.url && file.url.startsWith('blob:')) {
      URL.revokeObjectURL(file.url)
    }
    
    message.success('Imagen removida')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim() || !formData.description?.trim()) {
      message.error('Por favor, completa todos los campos requeridos')
      return
    }

    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      
      if (selectedImage) {
        formDataToSend.append('image', selectedImage)
      }
      
      await categoryApi.updateWithImage(id!, formDataToSend)
      message.success('Categoría actualizada exitosamente')
      navigate("/managment/categories")
    } catch (error) {
      console.error('Error al actualizar categoría:', error)
      message.error('Error al actualizar la categoría. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/managment/categories")
  }

  const handleAIGenerate = async () => {
    if (!formData.name?.trim()) {
      message.error('Primero debes ingresar el nombre de la categoría')
      return
    }

    setAiLoading(true)
    try {
      const description = await aiService.generateCategoryDescription({
        categoryName: formData.name,
        additionalDetails: ''
      })
      
      setFormData(prev => ({
        ...prev,
        description
      }))
      
      message.success('Descripción generada con IA exitosamente')
    } catch (error) {
      console.error('Error al generar descripción con IA:', error)
      message.error('Error al generar la descripción con IA. Por favor, intenta de nuevo.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleInputChange = (field: keyof UpdateCategoryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  useEffect(() => {
    const loadCategory = async () => {
      if (!id) {
        message.error('ID de categoría no válido')
        navigate("/managment/categories")
        return
      }

      setInitialLoading(true)
      try {
        const category = await categoryApi.getById(id)
        setFormData({
          name: category.name,
          description: category.description,
          imageUrl: category.imageUrl || ''
        })
        
        if (category.imageUrl) {
          setOriginalImageUrl(category.imageUrl)
          setImageList([{
            uid: '-1',
            name: 'imagen-actual.jpg',
            status: 'done',
            url: category.imageUrl,
          }])
        }
      } catch (error) {
        console.error('Error al cargar categoría:', error)
        message.error('Error al cargar la categoría')
        navigate("/managment/categories")
      } finally {
        setInitialLoading(false)
      }
    }

    loadCategory()
  }, [id, navigate])

  if (initialLoading) {
    return (
      <div className='add-category-container'>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Spin size="large" />
          <span style={{ marginLeft: '1rem' }}>Cargando categoría...</span>
        </div>
      </div>
    )
  }

  const getImageDescription = () => {
    if (originalImageUrl && !selectedImage) {
      return 'Imagen actual. Selecciona una nueva imagen para reemplazarla.'
    } else if (selectedImage) {
      return 'Nueva imagen seleccionada. Se subirá cuando actualices la categoría.'
    }
    return 'Selecciona una imagen para la categoría (opcional)'
  }

  return (
    <div className='add-category-container'>
      <div className='add-category-header'>
        <h1 className='add-category-title'>Editar Categoría</h1>
        <p className='add-category-subtitle'>Modifica los datos de la categoría seleccionada.</p>
      </div>
      
      <CategoryFormTemplate
        name={formData.name || ''}
        description={formData.description || ''}
        imageList={imageList}
        onNameChange={(value) => handleInputChange('name', value)}
        onDescriptionChange={(value) => handleInputChange('description', value)}
        onImagePreview={handlePreview}
        onImageChange={handleImageChange}
        onImageRemove={handleImageRemove}
        onImageUpload={handleUpload}
        onAIGenerate={handleAIGenerate}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        aiLoading={aiLoading}
        loading={loading}
        submitText="Actualizar Categoría"
        loadingText="Actualizando..."
        imageDescription={getImageDescription()}
        previewOpen={previewOpen}
        previewImage={previewImage}
        setPreviewOpen={setPreviewOpen}
      />

      <Modal
        open={previewOpen}
        title="Vista previa de imagen"
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="Vista previa" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  )
}

export default EditCategory 