import React from 'react'

interface FormRowProps {
  children: React.ReactNode
  className?: string
}

const FormRow: React.FC<FormRowProps> = ({ children, className = '' }) => {
  return (
    <div className={`form-row ${className}`}>
      {children}
    </div>
  )
}

export default FormRow 