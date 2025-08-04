import React from 'react'
import { Spin } from 'antd'

interface FormActionsProps {
  onCancel: () => void
  onSubmit: () => void
  cancelText?: string
  submitText?: string
  loading?: boolean
  loadingText?: string
  disabled?: boolean
}

const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  onSubmit,
  cancelText = 'Cancelar',
  submitText = 'Guardar',
  loading = false,
  loadingText = 'Guardando...',
  disabled = false
}) => {
  return (
    <div className='form-actions'>
      <button 
        type="button" 
        className='btn-secondary' 
        onClick={onCancel} 
        disabled={loading || disabled}
      >
        {cancelText}
      </button>
      <button 
        type="submit" 
        className='btn-primary' 
        onClick={onSubmit}
        disabled={loading || disabled}
      >
        {loading ? (
          <>
            <Spin size="small" /> {loadingText}
          </>
        ) : (
          submitText
        )}
      </button>
    </div>
  )
}

export default FormActions 