export class ValidationHelper {
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validateRequired(data: any, fields: string[]): string[] {
    const errors: string[] = []
    
    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`El campo ${field} es requerido`)
      }
    })
    
    return errors
  }

  validateImageFile(file: any): boolean {
    if (!file) return false
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const maxSize = 5 * 1024 * 1024 // 5MB
    
    return allowedTypes.includes(file.mimetype) && file.size <= maxSize
  }

  validatePassword(password: string): string[] {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula')
    }
    
    if (!/\d/.test(password)) {
      errors.push('La contraseña debe contener al menos un número')
    }
    
    return errors
  }

  validateStringLength(value: string, min: number, max: number, fieldName: string): string[] {
    const errors: string[] = []
    
    if (value.length < min) {
      errors.push(`${fieldName} debe tener al menos ${min} caracteres`)
    }
    
    if (value.length > max) {
      errors.push(`${fieldName} debe tener máximo ${max} caracteres`)
    }
    
    return errors
  }

  validateNumberRange(value: number, min: number, max: number, fieldName: string): string[] {
    const errors: string[] = []
    
    if (value < min) {
      errors.push(`${fieldName} debe ser mayor o igual a ${min}`)
    }
    
    if (value > max) {
      errors.push(`${fieldName} debe ser menor o igual a ${max}`)
    }
    
    return errors
  }
} 