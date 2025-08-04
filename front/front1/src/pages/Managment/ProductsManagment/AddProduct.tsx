import "./css/AddProduct.css"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { message } from 'antd'
import { useProductForm } from './hooks/useProductForm'
import ManualProductForm from './components/ManualProductForm'
import AIProductForm from './components/AIProductForm'

function AddProduct() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual')
  const [loading, setLoading] = useState(false)

  const {
    formData,
    mainImageList,
    additionalImagesList,
    aiFormData,
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
    validateForm,
    saveProduct,
    updateAIField,
    handleAIImageChange,

    transferAIDataToForm
  } = useProductForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Formulario enviado, validando...')
    
    const errors = validateForm()
    console.log('Errores de validación:', errors)
    if (errors.length > 0) {
      message.error(errors[0])
      return
    }

    console.log('Validación exitosa, guardando producto...')
    setLoading(true)
    try {
      await saveProduct()
      message.success('Producto agregado exitosamente')
      navigate("/managment/products")
    } catch (error: any) {
      console.error('Error al agregar producto:', error)
      message.error(error.message || 'Error al agregar el producto. Por favor, intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    navigate("/managment/products")
  }

  const handleTransferToManual = (aiGeneratedData: {
    name: string
    description: string
    brand?: string
    price?: number
    stock?: number
  }) => {
    transferAIDataToForm(aiGeneratedData)
    setActiveTab('manual')
  }

  return (
    <div className='add-product-container'>
      <div className='add-product-header'>
        <h1 className='add-product-title'>Agregar Nuevo Producto</h1>
        <p className='add-product-subtitle'>Completa la información del producto que deseas agregar.</p>
        
        <div className='tab-selector'>
          <button 
            type="button"
            className={`tab-button ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            📝 Formulario Manual
          </button>
          <button 
            type="button"
            className={`tab-button ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            🤖 Rellenar con IA
          </button>
        </div>
      </div>
      
      {activeTab === 'manual' ? (
        <ManualProductForm
          formData={formData}
          mainImageList={mainImageList}
          additionalImagesList={additionalImagesList}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onUpdateField={updateField}
          onMainImageChange={handleMainImageChange}
          onAdditionalImagesChange={handleAdditionalImagesChange}
          onAddDynamicOption={addDynamicOption}
          onRemoveDynamicOption={removeDynamicOption}
          onAddNewOptionType={addNewOptionType}
          onRemoveOptionType={removeOptionType}
          onUpdateVariantStock={updateVariantStock}
          onOptionStockChange={updateOptionStock}
          hasVariants={hasVariants}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={loading}
        />
      ) : (
        <AIProductForm
          aiFormData={aiFormData}
          aiImageList={aiImageList}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onUpdateAIField={updateAIField}
          onAIImageChange={handleAIImageChange}
          onTransferToManual={handleTransferToManual}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default AddProduct 