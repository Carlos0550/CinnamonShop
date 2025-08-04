import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message, Spin } from 'antd'
import ManualProductForm from './components/ManualProductForm'
import { useProductEdit } from './hooks/useProductEdit'
import type { ProductFormData } from './hooks/useProductForm'
import './css/AddProduct.css'

const EditProduct: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    formData: editFormData,
    mainImageList,
    additionalImagesList,
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
    
  } = useProductEdit(id || '')

  const formData = {
    ...editFormData,
    mainImage: editFormData.newMainImage,
    additionalImages: editFormData.newAdditionalImages
  }
  const adaptedUpdateField = (field: keyof ProductFormData, value: any) => {
    if (field === 'mainImage') {
      updateField('newMainImage', value)
    } else if (field === 'additionalImages') {
      updateField('newAdditionalImages', value)
    } else {
      updateField(field as any, value)
    }
  }

  useEffect(() => {
    if (!id) {
      message.error('ID del producto no encontrado')
      navigate('/managment/products')
    }
  }, [id, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      message.error(errors[0])
      return
    }

    setLoading(true)
    try {
      await saveProduct()
      message.success('Producto actualizado exitosamente')
      navigate("/managment/products")
    } catch (error: any) {
      console.error('Error al actualizar producto:', error)
      message.error(error.message || 'Error al actualizar el producto. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/managment/products")
  }

  if (!id) {
    return (
      <div className='add-product-container'>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Spin size="large" />
          <p>Redirigiendo...</p>
        </div>
      </div>
    )
  }

  if (productLoading) {
    return (
      <div className='add-product-container'>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <Spin size="large" />
          <p>Cargando producto...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='add-product-container'>
      <div className='add-product-header'>
        <h1 className='add-product-title'>Editar Producto</h1>
        <p className='add-product-subtitle'>
          Modifica la información del producto y sus opciones de compra
        </p>
      </div>

      <ManualProductForm
        formData={formData}
        mainImageList={mainImageList}
        additionalImagesList={additionalImagesList}
        categories={categories}
        categoriesLoading={categoriesLoading}
        onUpdateField={adaptedUpdateField}
        onMainImageChange={handleMainImageChange}
        onAdditionalImagesChange={handleAdditionalImagesChange}
        onAddDynamicOption={addDynamicOption}
        onRemoveDynamicOption={removeDynamicOption}
        onAddNewOptionType={addNewOptionType}
        onRemoveOptionType={removeOptionType}
        onOptionStockChange={updateOptionStock}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
        productId={id || ''}
      />
    </div>
  )
}

export default EditProduct 