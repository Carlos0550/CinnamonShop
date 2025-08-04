import React from 'react'
import { Spin } from 'antd'

interface AIButtonProps {
  onClick: () => void
  loading?: boolean
  loadingText?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

const AIButton: React.FC<AIButtonProps> = ({
  onClick,
  loading = false,
  loadingText = 'Generando...',
  children,
  disabled = false,
  className = 'btn-ai-description'
}) => {
  return (
    <button 
      type="button" 
      className={className}
      onClick={onClick}
      disabled={loading || disabled}
    >
      {loading ? (
        <>
          <Spin size="small" /> {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default AIButton 