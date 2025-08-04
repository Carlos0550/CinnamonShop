import React from 'react'
import FormGroup from '@/components/molecules/FormGroup'
import FormLabel from '@/components/molecules/FormLabel'
import ImageUpload from '@/components/organisms/ImageUpload'
import type { UploadFile, UploadProps } from 'antd'

interface ProductImagesProps {
  mainImageList: UploadFile[]
  additionalImagesList: UploadFile[]
  onMainImageChange: UploadProps['onChange']
  onAdditionalImagesChange: UploadProps['onChange']
  onPreview: (file: UploadFile) => void
}

const ProductImages: React.FC<ProductImagesProps> = ({
  mainImageList,
  additionalImagesList,
  onMainImageChange,
  onAdditionalImagesChange,
  onPreview
}) => {
  return (
    <div className='form-section'>
      <FormGroup>
        <FormLabel htmlFor="mainImage">Imagen Principal</FormLabel>
        <ImageUpload
          fileList={mainImageList}
          onPreview={onPreview}
          onChange={onMainImageChange}
          maxCount={1}
          uploadText="Subir Imagen"
          description="Esta será la imagen principal del producto"
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="additionalImages">Imágenes Adicionales (máximo 5)</FormLabel>
        <ImageUpload
          fileList={additionalImagesList}
          onPreview={onPreview}
          onChange={onAdditionalImagesChange}
          maxCount={5}
          uploadText="Subir Imagen"
          
          description="Puedes seleccionar hasta 5 imágenes adicionales"
        />
      </FormGroup>
    </div>
  )
}

export default ProductImages 