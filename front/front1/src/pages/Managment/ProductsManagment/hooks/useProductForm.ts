import { useState, useCallback, useEffect } from 'react'
import type { UploadFile, UploadProps } from 'antd'
import { categoryApi, type Category } from '@/services/categoryApi'
import { productApi } from '@/services/productApi'

export interface ProductFormData {
  name: string
  description: string
  price: number
  stock: number
  sku: string
  brand: string
  categoryId: string
  isActive: boolean
  
  mainImage: File | null
  additionalImages: File[]
  
  dynamicOptions: { [key: string]: string[] }
  
  variantStock: { [variantKey: string]: number }
  
  optionStock: { [optionKey: string]: number }
  
  isAIGenerated: boolean
  aiGenerationStep: 'idle' | 'generating' | 'completed' | 'error'
}

export interface AIFormData {
  image: File | null
  categoryId: string
  additionalDetails?: string
}

export const useProductForm = () => {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sku: '',
    brand: '',
    categoryId: '',
    isActive: true,
    mainImage: null,
    additionalImages: [],
    dynamicOptions: {},
    variantStock: {},
    optionStock: {},
    isAIGenerated: false,
    aiGenerationStep: 'idle'
  })

  const [aiFormData, setAiFormData] = useState<AIFormData>({
    image: null,
    categoryId: '',
    additionalDetails: ''
  })

  const [mainImageList, setMainImageList] = useState<UploadFile[]>([])
  const [additionalImagesList, setAdditionalImagesList] = useState<UploadFile[]>([])
  const [aiImageList, setAiImageList] = useState<UploadFile[]>([])

  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const updateField = useCallback((field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const updateAIField = useCallback((field: keyof AIFormData, value: any) => {
    setAiFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])

  const handleMainImageChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setMainImageList(newFileList)
    
    const file = newFileList[0]?.originFileObj || null
    updateField('mainImage', file)
  }, [updateField])

  const handleAdditionalImagesChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setAdditionalImagesList(newFileList)
    
    const files = newFileList
      .map((file: UploadFile) => file.originFileObj)
      .filter((file) => file !== undefined && file !== null) as File[]
    
    updateField('additionalImages', files)
  }, [updateField])

  const handleAIImageChange: UploadProps['onChange'] = useCallback(({ fileList: newFileList }: { fileList: UploadFile[] }) => {
    setAiImageList(newFileList)
    
    const file = newFileList[0]?.originFileObj || null
    updateAIField('image', file)
  }, [updateAIField])

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
      
      const newVariantStock = { ...prev.variantStock }
      Object.keys(newVariantStock).forEach(variantKey => {
        if (variantKey.includes(`${type}:`)) {
          delete newVariantStock[variantKey]
        }
      })
      
      const newOptionStock = { ...prev.optionStock }
      Object.keys(newOptionStock).forEach(optionKey => {
        if (optionKey.includes(`${type}:`)) {
          delete newOptionStock[optionKey]
        }
      })
      
      return {
        ...prev,
        dynamicOptions: newDynamicOptions,
        variantStock: newVariantStock,
        optionStock: newOptionStock
      }
    })
  }, [])

  const updateVariantStock = useCallback((variantKey: string, stock: number) => {
    setFormData(prev => {
      const newVariantStock = {
        ...prev.variantStock,
        [variantKey]: stock
      }
      return {
        ...prev,
        variantStock: newVariantStock
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

  const hasVariants = Object.keys(formData.dynamicOptions).length > 0

  const transferAIDataToForm = useCallback((aiGeneratedData: {
    name: string
    description: string
    brand?: string
    price?: number
    stock?: number
  }) => {
    setFormData(prev => ({
      ...prev,
      name: aiGeneratedData.name,
      description: aiGeneratedData.description,
      brand: aiGeneratedData.brand || prev.brand,
      price: aiGeneratedData.price || prev.price,
      stock: aiGeneratedData.stock || prev.stock,
      categoryId: aiFormData.categoryId,
      mainImage: aiFormData.image,
      isAIGenerated: true,
      aiGenerationStep: 'completed'
    }))

    if (aiFormData.image) {
      const fileUrl = URL.createObjectURL(aiFormData.image)
      setMainImageList([{
        uid: '-1',
        name: aiFormData.image.name,
        status: 'done',
        url: fileUrl,
      }])
    }
  }, [aiFormData])

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
    loadCategories()
  }, [loadCategories])

  const clearAIForm = useCallback(() => {
    setAiFormData({
      image: null,
      categoryId: '',
      additionalDetails: ''
    })
    setAiImageList([])
  }, [])

  const clearForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      sku: '',
      brand: '',
      categoryId: '',
      isActive: true,
      mainImage: null,
      additionalImages: [],
      dynamicOptions: {},
      variantStock: {},
      optionStock: {},
      isAIGenerated: false,
      aiGenerationStep: 'idle'
    })
    setMainImageList([])
    setAdditionalImagesList([])
  }, [])

  const validateForm = useCallback(() => {
    const errors: string[] = []
    
    if (!formData.name.trim()) errors.push('El nombre del producto es requerido')
    if (!formData.description.trim()) errors.push('La descripción es requerida')
    if (formData.price <= 0) errors.push('El precio debe ser mayor a 0')
    if (Object.keys(formData.dynamicOptions).length === 0 && formData.stock < 0) errors.push('El stock no puede ser negativo')
    if (!formData.brand.trim()) errors.push('La marca es requerida')
    if (!formData.categoryId) errors.push('La categoría es requerida')
    if (!formData.mainImage) errors.push('La imagen principal es requerida')
    
    return errors
  }, [formData])

  const validateAIForm = useCallback(() => {
    const errors: string[] = []
    
    if (!aiFormData.image) errors.push('La imagen es requerida')
    if (!aiFormData.categoryId) errors.push('La categoría es requerida')
    
    return errors
  }, [aiFormData])

  const saveProduct = useCallback(async () => {
    try {
      const formDataToSend = new FormData()
      
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('price', formData.price.toString())
      formDataToSend.append("stock", (formData.stock || 0).toString())
      formDataToSend.append('brand', formData.brand)
      formDataToSend.append('categoryId', formData.categoryId)
      
      formDataToSend.append('dynamicOptions', JSON.stringify(formData.dynamicOptions))
      
      if (Object.keys(formData.variantStock).length > 0) {
        formDataToSend.append('variantStock', JSON.stringify(formData.variantStock))
      }

      if (Object.keys(formData.optionStock).length > 0) {
        formDataToSend.append('optionStock', JSON.stringify(formData.optionStock))
      } 
      
      if (formData.mainImage) {
        formDataToSend.append('mainImage', formData.mainImage)
      }
      
      if (formData.additionalImages.length > 0) {
        formData.additionalImages.forEach((image, _) => {
          formDataToSend.append('additionalImages', image)
        })
      }
      
      const response = await productApi.createProduct(formDataToSend)
      
      return response
    } catch (error) {
      throw error
    }
  }, [formData])

  return {
    formData,
    aiFormData,
    mainImageList,
    additionalImagesList,
    aiImageList,
    categories,
    categoriesLoading,
    
    updateField,
    handleMainImageChange,
    handleAdditionalImagesChange,
    addDynamicOption,
    removeDynamicOption,
    addNewOptionType,
    removeOptionType,
    updateVariantStock,
    updateOptionStock,
    hasVariants,
    clearForm,
    validateForm,
    saveProduct,
    
    updateAIField,
    handleAIImageChange,
    clearAIForm,
    validateAIForm,
    
    transferAIDataToForm,
    
    loadCategories,
    
    setMainImageList,
    setAdditionalImagesList,
    setAiImageList
  }
} 