import React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Upload } from 'antd'
import type { UploadFile, UploadProps } from 'antd'

interface ImageUploadProps {
  fileList: UploadFile[]
  onPreview: (file: UploadFile) => void
  onChange: UploadProps['onChange']
  onRemove?: (file: UploadFile) => void
  maxCount?: number
  beforeUpload?: (file: File) => boolean | false
  accept?: string
  uploadText?: string
  description?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  fileList,
  onPreview,
  onChange,
  onRemove,
  maxCount = 1,
  beforeUpload,
  accept = "image/*",
  uploadText = "Subir Imagen",
  description
}) => {
  return (
    <>
      <Upload
        listType="picture-card"
        fileList={fileList}
        onPreview={onPreview}
        onChange={onChange}
        onRemove={onRemove}
        maxCount={maxCount}
        accept={accept}
        beforeUpload={beforeUpload}
        multiple
      >
        {fileList.length >= maxCount ? null : (
          <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{uploadText}</div>
          </button>
        )}
      </Upload>
      {description && <small>{description}</small>}
    </>
  )
}

export default ImageUpload 