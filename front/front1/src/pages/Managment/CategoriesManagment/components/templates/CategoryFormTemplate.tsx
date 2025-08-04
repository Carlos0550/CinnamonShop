import React from 'react'
import { Image } from 'antd'
import CategoryBasicInfo from '../molecules/CategoryBasicInfo'
import CategoryImageSection from '../organisms/CategoryImageSection'
import FormActions from '@/components/molecules/FormActions'

interface CategoryFormTemplateProps {
  name: string
  description: string
  imageList: any[]
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImagePreview: (file: any) => void
  onImageChange: any
  onImageRemove?: (file: any) => void
  onImageUpload?: (file: File) => boolean | false
  onAIGenerate: () => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  aiLoading: boolean
  loading: boolean
  submitText: string
  loadingText: string
  imageDescription?: string
  previewOpen: boolean
  previewImage: string
  setPreviewOpen: (open: boolean) => void
}

const CategoryFormTemplate: React.FC<CategoryFormTemplateProps> = ({
  name,
  description,
  imageList,
  onNameChange,
  onDescriptionChange,
  onImagePreview,
  onImageChange,
  onImageRemove,
  onImageUpload,
  onAIGenerate,
  onSubmit,
  onCancel,
  aiLoading,
  loading,
  submitText,
  loadingText,
  imageDescription,
  previewOpen,
  previewImage,
  setPreviewOpen
}) => {
  return (
    <form className='add-category-form' onSubmit={onSubmit}>
      <div className='form-layout'>
        <CategoryBasicInfo
          name={name}
          description={description}
          onNameChange={onNameChange}
          onDescriptionChange={onDescriptionChange}
          onAIGenerate={onAIGenerate}
          aiLoading={aiLoading}
        />

        <CategoryImageSection
          imageList={imageList}
          onPreview={onImagePreview}
          onChange={onImageChange}
          onRemove={onImageRemove}
          beforeUpload={onImageUpload}
          description={imageDescription}
        />
      </div>

      <FormActions
        onCancel={onCancel}
        onSubmit={() => {}}
        submitText={submitText}
        loading={loading}
        loadingText={loadingText}
        disabled={loading}
      />

      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          preview={{
            visible: previewOpen,
            onVisibleChange: setPreviewOpen,
            afterOpenChange: (visible) => !visible && setPreviewOpen(false),
          }}
          src={previewImage}
        />
      )}
    </form>
  )
}

export default CategoryFormTemplate 