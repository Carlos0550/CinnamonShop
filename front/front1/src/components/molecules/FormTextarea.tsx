import React from 'react'

interface FormTextareaProps {
  id: string
  name: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  rows?: number
  maxLength?: number
  disabled?: boolean
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  name,
  placeholder,
  value,
  onChange,
  required = false,
  rows = 4,
  maxLength,
  disabled = false
}) => {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      rows={rows}
      maxLength={maxLength}
      disabled={disabled}
    />
  )
}

export default FormTextarea 