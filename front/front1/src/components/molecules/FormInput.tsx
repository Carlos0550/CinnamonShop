import React from 'react'

interface FormInputProps {
  id: string
  name: string
  type?: string
  placeholder?: string
  value: string | number
  onChange: (value: string | number) => void
  required?: boolean
  min?: number
  max?: number
  step?: string
  maxLength?: number
  disabled?: boolean
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  min,
  max,
  step,
  maxLength,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const numValue = parseFloat(e.target.value) || 0
      onChange(numValue)
    } else {
      onChange(e.target.value)
    }
  }

  return (
    <input
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
      min={min}
      max={max}
      step={step}
      maxLength={maxLength}
      disabled={disabled}
    />
  )
}

export default FormInput 