import React, { useState } from 'react'
import { message } from 'antd'
import type { GetProp, UploadFile, UploadProps } from 'antd'
import ManualProductFormTemplate from './templates/ManualProductFormTemplate'
import { aiService } from '@/services/aiService'
import type { ProductFormData } from '../hooks/useProductForm'
import type { Category } from '@/services/categoryApi'

interface ManualProductFormProps {
  formData: ProductFormData
  mainImageList: UploadFile[]
  additionalImagesList: UploadFile[]
  categories: Category[]
  categoriesLoading: boolean
  onUpdateField: (field: keyof ProductFormData, value: any) => void
  onMainImageChange: UploadProps['onChange']
  onAdditionalImagesChange: UploadProps['onChange']
  onAddDynamicOption: (type: string, value: string) => void
  onRemoveDynamicOption: (type: string, index: number) => void
  onAddNewOptionType: (type: string) => void
  onRemoveOptionType: (type: string) => void
  onUpdateVariantStock?: (variantKey: string, stock: number) => void
  onOptionStockChange?: (optionKey: string, stock: number) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  loading?: boolean
  hasVariants?: boolean
  onStockUpdate?: (variantId: string, newStock: number) => void
  variantsLoading?: boolean
  productId?: string
}

const ManualProductForm: React.FC<ManualProductFormProps> = ({
  formData,
  mainImageList,
  additionalImagesList,
  categories,
  categoriesLoading,
  onUpdateField,
  onMainImageChange,
  onAdditionalImagesChange,
  onAddDynamicOption,
  onRemoveDynamicOption,
  onAddNewOptionType,
  onRemoveOptionType,
  onUpdateVariantStock,
  onOptionStockChange,
  onSubmit,
  onCancel,
  loading = false,
  onStockUpdate,
  variantsLoading = false,
  productId = ''
}) => {
  const [aiLoading, setAiLoading] = useState(false)
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

  const handleAIDescription = async () => {
    if (!formData.name.trim() || !formData.categoryId) {
      message.error("Primero debes ingresar el nombre del producto y seleccionar una categoría")
      return
    }

    setAiLoading(true)
    try {
      const selectedCategory = categories.find(cat => cat.id === formData.categoryId)
      if (!selectedCategory) {
        message.error("Categoría no encontrada")
        return
      }

      const description = await aiService.generateProductDescription(
        formData.name,
        selectedCategory.name
      )
      
      onUpdateField('description', description)
      message.success('Descripción generada con IA exitosamente')
    } catch (error) {
      console.error('Error al generar descripción con IA:', error)
      message.error('Error al generar la descripción con IA. Por favor, intenta de nuevo.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <ManualProductFormTemplate
      formData={formData}
      mainImageList={mainImageList}
      additionalImagesList={additionalImagesList}
      categories={categories}
      categoriesLoading={categoriesLoading}
      onUpdateField={onUpdateField}
      onMainImageChange={onMainImageChange}
      onAdditionalImagesChange={onAdditionalImagesChange}
      onAddDynamicOption={onAddDynamicOption}
      onRemoveDynamicOption={onRemoveDynamicOption}
      onAddNewOptionType={onAddNewOptionType}
      onRemoveOptionType={onRemoveOptionType}
      onUpdateVariantStock={onUpdateVariantStock}
      onOptionStockChange={onOptionStockChange}
      onAIDescription={handleAIDescription}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onPreview={handlePreview}
      loading={loading}
      aiLoading={aiLoading}
      previewOpen={previewOpen}
      previewImage={previewImage}
      setPreviewOpen={setPreviewOpen}
      onStockUpdate={onStockUpdate}
      variantsLoading={variantsLoading}
      productId={productId}
    />
  )
}

export default ManualProductForm 