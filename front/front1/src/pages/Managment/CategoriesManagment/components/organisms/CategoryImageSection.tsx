import React from 'react'
import FormGroup from '@/components/molecules/FormGroup'
import FormLabel from '@/components/molecules/FormLabel'
import ImageUpload from '@/components/organisms/ImageUpload'

interface CategoryImageSectionProps {
  imageList: any[]
  onPreview: (file: any) => void
  onChange: any
  onRemove?: (file: any) => void
  beforeUpload?: (file: File) => boolean | false
  description?: string
}

const CategoryImageSection: React.FC<CategoryImageSectionProps> = ({
  imageList,
  onPreview,
  onChange,
  onRemove,
  beforeUpload,
  description
}) => {
  return (
    <div className='form-section'>
      <FormGroup>
        <FormLabel htmlFor="categoryImage">Imagen de la Categoría</FormLabel>
        <ImageUpload
          fileList={imageList}
          onPreview={onPreview}
          onChange={onChange}
          onRemove={onRemove}
          maxCount={1}
          beforeUpload={beforeUpload}
          uploadText="Seleccionar Imagen"
          description={description}
        />
      </FormGroup>
    </div>
  )
}

export default CategoryImageSection 