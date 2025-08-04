import React from 'react'

interface FormLabelProps {
  htmlFor: string
  children: React.ReactNode
  required?: boolean
}

const FormLabel: React.FC<FormLabelProps> = ({ htmlFor, children, required = false }) => {
  return (
    <label htmlFor={htmlFor}>
      {children}
      {required && <span style={{ color: 'red' }}> *</span>}
    </label>
  )
}

export default FormLabel 