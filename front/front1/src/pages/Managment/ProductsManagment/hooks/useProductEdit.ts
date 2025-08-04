import { useState, useCallback, useEffect } from 'react'
import type { UploadFile, UploadProps } from 'antd'
import { categoryApi, type Category } from '@/services/categoryApi'
import { productApi } from '@/services/productApi'
import type { ProductFormData } from './useProductForm'

export interface ProductEditData extends Omit<ProductFormData, 'mainImage' | 'additionalImages'> {
  id: string
  sku: string
  isActive: boolean
  existingImages: Array<{
    id: string
    url: string
    alt: string | null
    isPrimary: boolean
    productId: string
    createdAt: string
  }>
  newMainImage: File | null
  newAdditionalImages: File[]
  deletedImageIds: string[]
}

export const useProductEdit = (productId: string) => {
  const [formData, setFormData] = useState<ProductEditData>({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    brand: '',
    categoryId: '',
    isActive: true,
    existingImages: [],
    newMainImage: null,
    newAdditionalImages: [],
    deletedImageIds: [],
    dynamicOptions: {},
    variantStock: {},
    optionStock: {},
    isAIGenerated: false,
    aiGenerationStep: 'idle'
  })

  const [mainImageList, setMainImageList] = useState<UploadFile[]>([])
  const [additionalImagesList, setAdditionalImagesList] = useState<UploadFile[]>([])
  const [aiImageList, setAiImageList] = useState<UploadFile[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [productLoading, setProductLoading] = useState(true)

  const loadProduct = useCallback(async () => {
    try {
      setProductLoading(true)
      const product = await productApi.getProductById(productId)
      
      const mainImage = product.images.find(img => img.isPrimary)
      const additionalImages = product.images.filter(img => !img.isPrimary)

      const mainImageFile: UploadFile | null = mainImage ? {
        uid: mainImage.id,
        name: mainImage.alt || 'Imagen principal',
        status: 'done',
        url: mainImage.url,
      } : null

      const additionalImageFiles: UploadFile[] = additionalImages.map(img => ({
        uid: img.id,
        name: img.alt || 'Imagen adicional',
        status: 'done',
        url: img.url,
      }))

      setFormData({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        sku: product.sku,
        brand: product.brand,
        categoryId: product.categoryId,
        isActive: product.isActive,
        existingImages: product.images,
        newMainImage: null,
        newAdditionalImages: [],
        deletedImageIds: [],
        dynamicOptions: product.options.reduce((acc, option) => {
          acc[option.name] = option.values
          return acc
        }, {} as { [key: string]: string[] }),
        variantStock: {},
        optionStock: product.optionStock.reduce((acc, stock) => {
          const optionKey = `${stock.optionName}:${stock.optionValue}`
          acc[optionKey] = stock.stock
          return acc
        }, {} as { [key: string]: number }),
        isAIGenerated: false,
        aiGenerationStep: 'idle'
      })

      setMainImageList(mainImageFile ? [mainImageFile] : [])
      setAdditionalImagesList(additionalImageFiles)

    } catch (error) {
      throw error
    } finally {
      setProductLoading(false)
    }
  }, [productId])

  const loadCategories = useCallback(async () => {
    try {
      setCategoriesLoading(true)
      const categoriesData = await categoryApi.getAll()
      setCategories(categoriesData)
    } catch (error) {
      // Silenciar errores de carga de categorías
    } finally {
      setCategoriesLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProduct()
    loadCategories()
  }, [loadProduct, loadCategories])

  const updateField = useCallback((field: keyof ProductEditData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleMainImageChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setMainImageList(newFileList)
    
    if (newFileList.length === 0) {
      const currentMainImage = formData.existingImages.find(img => img.isPrimary)
      if (currentMainImage) {
        updateField('deletedImageIds', [...formData.deletedImageIds, currentMainImage.id])
      }
      updateField('newMainImage', null)
    } else {
      const file = newFileList[0]
      
      if (file.originFileObj) {
        updateField('newMainImage', file.originFileObj)
        
        const currentMainImage = formData.existingImages.find(img => img.isPrimary)
        if (currentMainImage && !formData.deletedImageIds.includes(currentMainImage.id)) {
          updateField('deletedImageIds', [...formData.deletedImageIds, currentMainImage.id])
        }
      } else {
        updateField('newMainImage', null)
      }
    }
  }, [formData.existingImages, formData.deletedImageIds, updateField])

  const handleAdditionalImagesChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setAdditionalImagesList(newFileList)
    
    const currentImageIds = formData.existingImages
      .filter(img => !img.isPrimary)
      .map(img => img.id)
    
    const remainingImageIds = newFileList
      .filter(file => !file.originFileObj) 
      .map(file => file.uid)
    
    const deletedIds = currentImageIds.filter(id => !remainingImageIds.includes(id))
    
    const newDeletedIds = [...formData.deletedImageIds]
    deletedIds.forEach(id => {
      if (!newDeletedIds.includes(id)) {
        newDeletedIds.push(id)
      }
    })
    
    updateField('deletedImageIds', newDeletedIds)
    
    const newImages = newFileList
      .filter(file => file.originFileObj)
      .map(file => file.originFileObj as File)
    
    updateField('newAdditionalImages', newImages)
  }, [formData.existingImages, formData.deletedImageIds, updateField])

  const addDynamicOption = useCallback((type: string, value: string) => {
    if (type && value) {
      setFormData(prev => ({
        ...prev,
        dynamicOptions: {
          ...prev.dynamicOptions,
          [type]: [...(prev.dynamicOptions[type] || []), value]
        }
      }))
    }
  }, [])

  const removeDynamicOption = useCallback((type: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      dynamicOptions: {
        ...prev.dynamicOptions,
        [type]: prev.dynamicOptions[type].filter((_, i) => i !== index)
      }
    }))
  }, [])

  const addNewOptionType = useCallback((type: string) => {
    if (type && !formData.dynamicOptions[type]) {
      setFormData(prev => ({
        ...prev,
        dynamicOptions: {
          ...prev.dynamicOptions,
          [type]: []
        }
      }))
    }
  }, [formData.dynamicOptions])

  const removeOptionType = useCallback((type: string) => {
    setFormData(prev => {
      const newDynamicOptions = { ...prev.dynamicOptions }
      delete newDynamicOptions[type]
      
      const newOptionStock = { ...prev.optionStock }
      Object.keys(newOptionStock).forEach(optionKey => {
        if (optionKey.includes(`${type}:`)) {
          delete newOptionStock[optionKey]
        }
      })
      
      return {
        ...prev,
        dynamicOptions: newDynamicOptions,
        optionStock: newOptionStock
      }
    })
  }, [])

  const updateOptionStock = useCallback((optionKey: string, stock: number) => {
    setFormData(prev => {
      const newOptionStock = {
        ...prev.optionStock,
        [optionKey]: stock
      }
      return {
        ...prev,
        optionStock: newOptionStock
      }
    })
  }, [])

  const validateForm = useCallback(() => {
    const errors: string[] = []
    
    if (!formData.name.trim()) errors.push('El nombre del producto es requerido')
    if (!formData.description.trim()) errors.push('La descripción es requerida')
    if (formData.price <= 0) errors.push('El precio debe ser mayor a 0')
    // El stock se valida automáticamente en el backend basado en optionStock
    if (!formData.brand.trim()) errors.push('La marca es requerida')
    if (!formData.categoryId) errors.push('La categoría es requerida')
    
    const hasMainImage = formData.newMainImage || 
      formData.existingImages.some(img => img.isPrimary && !formData.deletedImageIds.includes(img.id))
    
    if (!hasMainImage) errors.push('La imagen principal es requerida')
    
    return errors
  }, [formData])

  const saveProduct = useCallback(async () => {
    try {
      
      const formDataToSend = new FormData()
      
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append('stock', formData.stock.toString())
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('categoryId', formData.categoryId)
      formDataToSend.append('isActive', formData.isActive.toString())
      
      formDataToSend.append('dynamicOptions', JSON.stringify(formData.dynamicOptions))
      formDataToSend.append('optionStock', JSON.stringify(formData.optionStock))
      
      if (formData.deletedImageIds.length > 0) {
        formDataToSend.append('deletedImageIds', JSON.stringify(formData.deletedImageIds))
      }
      
      if (formData.newMainImage) {
        formDataToSend.append('mainImage', formData.newMainImage)
      }
      
      if (formData.newAdditionalImages.length > 0) {
        formData.newAdditionalImages.forEach((image, _) => {
          formDataToSend.append('additionalImages', image)
        })
      }
      
      const response = await productApi.updateProduct(formData.id, formDataToSend)
      
      return response
    } catch (error) {
      throw error
    }
  }, [formData])

  return {
    formData,
    mainImageList,
    additionalImagesList,
    aiImageList,
    categories,
    categoriesLoading,
    productLoading,
    
    updateField,
    handleMainImageChange,
    handleAdditionalImagesChange,
    addDynamicOption,
    removeDynamicOption,
    addNewOptionType,
    removeOptionType,
    updateOptionStock,
    validateForm,
    saveProduct,
    
    loadProduct,
    loadCategories,
        
    setMainImageList,
    setAdditionalImagesList,
    setAiImageList
  }
} 