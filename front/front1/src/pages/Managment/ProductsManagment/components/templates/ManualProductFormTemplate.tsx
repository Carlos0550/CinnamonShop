import React, { useEffect, useState } from 'react'
import { Image, Spin } from 'antd'
import ProductBasicInfo from '../organisms/ProductBasicInfo'
import ProductImages from '../organisms/ProductImages'
import DynamicOptionsSection from '../molecules/DynamicOptionsSection'
import type { ProductFormData } from '../../hooks/useProductForm'
import type { Category } from '@/services/categoryApi'
import type { UploadFile, UploadProps } from 'antd'

interface ManualProductFormTemplateProps {
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
  onAIDescription: () => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  onPreview: (file: UploadFile) => void
  loading?: boolean
  aiLoading: boolean
  previewOpen: boolean
  previewImage: string
  setPreviewOpen: (open: boolean) => void
  hasVariants?: boolean
  onStockUpdate?: (variantId: string, newStock: number) => void
  variantsLoading?: boolean
  productId?: string
}



const ManualProductFormTemplate: React.FC<ManualProductFormTemplateProps> = ({
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
  onAIDescription,
  onSubmit,
  onCancel,
  onPreview,
  loading = false,
  aiLoading,
  previewOpen,
  previewImage,
  setPreviewOpen,
  onStockUpdate,
  variantsLoading = false,
}) => {

  const [hasVariantsForForm, setHasVariantsForForm] = useState<boolean>(false)

  useEffect(()=>{
    setHasVariantsForForm(Object.keys(formData.dynamicOptions).length > 0)
  },[formData.dynamicOptions])

  return (
    <form className='add-product-form' onSubmit={onSubmit}>
      <div className='form-layout'>
        <DynamicOptionsSection
          dynamicOptions={formData.dynamicOptions}
          variantStock={formData.variantStock}
          onAddDynamicOption={onAddDynamicOption}
          onRemoveDynamicOption={onRemoveDynamicOption}
          onAddNewOptionType={onAddNewOptionType}
          onRemoveOptionType={onRemoveOptionType}
          onUpdateVariantStock={onUpdateVariantStock}
          onOptionStockChange={onOptionStockChange}
          onStockUpdate={onStockUpdate}
          variantsLoading={variantsLoading}
          initialOptionStock={formData.optionStock}
        />
        
        <ProductBasicInfo
          formData={formData}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onUpdateField={onUpdateField}
          onAIDescription={onAIDescription}
          aiLoading={aiLoading}
          hasVariants={hasVariantsForForm}
        />

        <ProductImages
          mainImageList={mainImageList}
          additionalImagesList={additionalImagesList}
          onMainImageChange={onMainImageChange}
          onAdditionalImagesChange={onAdditionalImagesChange}
          onPreview={onPreview}
        />
      </div>

     

      <div className='form-actions'>
        <button 
          type="button" 
          className='btn-secondary' 
          onClick={onCancel} 
          disabled={loading}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className='btn-primary' 
          disabled={loading}
        >
          {loading ? (
            <>
              <Spin size="small" /> Agregando...
            </>
          ) : (
            'Agregar Producto'
          )}
        </button>
      </div>

      <Image
        wrapperStyle={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: setPreviewOpen,
          afterOpenChange: (visible) => !visible && setPreviewOpen(false),
        }}
        src={previewImage}
      />
    </form>
  )
}

export default ManualProductFormTemplate 