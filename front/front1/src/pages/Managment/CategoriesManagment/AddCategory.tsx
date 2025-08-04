import "./css/AddCategory.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { message } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import CategoryFormTemplate from './components/templates/CategoryFormTemplate'
import { categoryApi, type CreateCategoryData } from '@/services/categoryApi'
import { aiService } from '@/services/aiService'

function AddCategory() {
  const navigate = useNavigate()
  const [imageList, setImageList] = useState<UploadFile[]>([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    imageUrl: ''
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

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
    
    message.success('Imagen seleccionada. Se subirá cuando crees la categoría.')
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
    
    if (!formData.name.trim() || !formData.description.trim()) {
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
      
      await categoryApi.createWithImage(formDataToSend)
      message.success('Categoría creada exitosamente')
      navigate("/managment/categories")
    } catch (error) {
      console.error('Error al crear categoría:', error)
      message.error('Error al crear la categoría. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/managment/categories")
  }

  const handleAIGenerate = async () => {
    if (!formData.name.trim()) {
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

  const handleInputChange = (field: keyof CreateCategoryData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className='add-category-container'>
      <div className='add-category-header'>
        <h1 className='add-category-title'>Agregar Nueva Categoría</h1>
        <p className='add-category-subtitle'>Crea una nueva categoría para organizar tus productos.</p>
      </div>
      
      <CategoryFormTemplate
        name={formData.name}
        description={formData.description}
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
        submitText="Crear Categoría"
        loadingText="Creando..."
        imageDescription="Selecciona una imagen para la categoría. Se subirá cuando crees la categoría."
        previewOpen={previewOpen}
        previewImage={previewImage}
        setPreviewOpen={setPreviewOpen}
      />
    </div>
  )
}

export default AddCategory 