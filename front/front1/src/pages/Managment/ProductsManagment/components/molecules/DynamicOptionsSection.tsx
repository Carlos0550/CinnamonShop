import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'

interface VariantStock {
  [variantKey: string]: number
}

interface DynamicOptionsSectionProps {
  dynamicOptions: { [key: string]: string[] }
  variantStock?: VariantStock
  onAddDynamicOption: (type: string, value: string) => void
  onRemoveDynamicOption: (type: string, index: number) => void
  onAddNewOptionType: (type: string) => void
  onRemoveOptionType: (type: string) => void
  onUpdateVariantStock?: (variantKey: string, stock: number) => void
  onStockUpdate?: (variantId: string, newStock: number) => void
  variantsLoading?: boolean
  onOptionStockChange?: (optionKey: string, stock: number) => void
  initialOptionStock?: { [optionKey: string]: number }
}

export interface DynamicOptionsSectionRef {
  getOptionStock: () => { [optionKey: string]: number }
  getVariantStockUpdates: () => { [variantId: string]: number }
  getTotalOptionStock: () => number
}

const DynamicOptionsSection = forwardRef<DynamicOptionsSectionRef, DynamicOptionsSectionProps>(({
  dynamicOptions,
  onAddDynamicOption,
  onRemoveDynamicOption,
  onAddNewOptionType,
  onRemoveOptionType,
  onOptionStockChange,
  initialOptionStock
}, ref) => {
  const [newOptionType, setNewOptionType] = useState('')
  const [newOptionValues, setNewOptionValues] = useState<{ [key: string]: string }>({})
  const [stockUpdates] = useState<{ [variantId: string]: number }>({})
  const [optionStockInputs, setOptionStockInputs] = useState<{ [optionKey: string]: number }>({})

  useEffect(() => {
    const newOptionStockInputs: { [optionKey: string]: number } = {}

    Object.entries(dynamicOptions).forEach(([type, values]) => {
      values.forEach(value => {
        const optionKey = `${type}:${value}`
        newOptionStockInputs[optionKey] = initialOptionStock?.[optionKey] || optionStockInputs[optionKey] || 0
      })
    })

    setOptionStockInputs(newOptionStockInputs)
  }, [dynamicOptions, initialOptionStock])

  const handleAddDynamicOption = (type: string) => {
    const value = newOptionValues[type]?.trim()
    if (value) {
      onAddDynamicOption(type, value)
      setNewOptionValues(prev => ({
        ...prev,
        [type]: ''
      }))
    }
  }

  const handleAddNewOptionType = () => {
    const type = newOptionType.trim()
    if (type && !dynamicOptions[type]) {
      onAddNewOptionType(type)
      setNewOptionType('')
      setNewOptionValues(prev => ({
        ...prev,
        [type]: ''
      }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent, type: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddDynamicOption(type)
    }
  }

  const handleRemoveOptionType = (type: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la opción "${type}" y todas sus subopciones?`)) {
      const optionsToRemove = dynamicOptions[type] || []
      optionsToRemove.forEach(value => {
        const optionKey = `${type}:${value}`
        setOptionStockInputs(prev => {
          const newState = { ...prev }
          delete newState[optionKey]
          return newState
        })
        if (onOptionStockChange) {
          onOptionStockChange(optionKey, 0)
        }
      })

      onRemoveOptionType(type)
    }
  }

  const handleOptionStockChange = (type: string, value: string, stock: number) => {
    const optionKey = `${type}:${value}`

    setOptionStockInputs(prev => ({
      ...prev,
      [optionKey]: stock
    }))

    if (onOptionStockChange) {
      onOptionStockChange(optionKey, stock)
    }
  }
  useImperativeHandle(ref, () => ({
    getOptionStock: () => optionStockInputs,
    getVariantStockUpdates: () => stockUpdates,
    getTotalOptionStock: () => {
      return Object.values(optionStockInputs).reduce((total, stock) => total + stock, 0)
    }
  }), [optionStockInputs, stockUpdates])

  return (
    <div className='dynamic-options-section'>
      <h3>Opciones de Compra</h3>

      <div className='add-option-type-section'>
        <h4>Agregar Nueva Opción de Compra</h4>
        <div className='add-option-type'>
          <input
            type="text"
            placeholder="Ej: Color, Talla, Material, etc."
            value={newOptionType}
            onChange={(e) => setNewOptionType(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNewOptionType()}
          />
          <button type="button" onClick={handleAddNewOptionType} className='btn-add-option'>
            Agregar Opción
          </button>
        </div>
      </div>

      {Object.keys(dynamicOptions).length > 0 && (
        <div className='existing-options-section'>
          <h4>Opciones Configuradas</h4>
          {Object.entries(dynamicOptions).map(([type, values]) => (
            <div key={type} className='option-group'>
              <div className='option-header'>
                <label className='option-title'>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                <button
                  type="button"
                  onClick={() => handleRemoveOptionType(type)}
                  className='remove-option-type'
                  title={`Eliminar ${type} y todas sus opciones`}
                >
                  🗑️ Eliminar
                </button>
              </div>

              <div className='option-content'>
                {values.length > 0 && (
                  <div className='existing-values'>
                    <label className='sub-options-label'>Opciones disponibles:</label>
                    <div className='option-values'>
                      {values.map((value, index) => {
                        return (
                          <div key={index} className='option-item'>
                            <div className='option-tag'>
                              <span>{value}</span>
                              <div className='option-stock-control'>
                                <label>Stock:</label>
                                <input
                                  type="number"
                                  min={1}
                                  className='stock-input-small'
                                  placeholder="0"
                                  title={`Stock para ${value}`}
                                  value={optionStockInputs[`${type}:${value}`] || ''}
                                  onChange={(e) => {
                                    const stock = parseInt(e.target.value) || 0
                                    handleOptionStockChange(type, value, stock)
                                  }}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const optionKey = `${type}:${value}`
                                  setOptionStockInputs(prev => {
                                    const newState = { ...prev }
                                    delete newState[optionKey]
                                    return newState
                                  })
                                  if (onOptionStockChange) {
                                    onOptionStockChange(optionKey, 0) 
                                  }
                                  onRemoveDynamicOption(type, index)
                                }}
                                className='remove-option'
                                title={`Eliminar ${value}`}
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className='add-sub-option'>
                  <label className='add-sub-option-label'>Agregar nueva opción de {type}:</label>
                  <div className='add-option-value'>
                    <input
                      type="text"
                      placeholder={`Ej: ${type === 'color' ? 'Rojo' : type === 'talla' ? 'M' : 'Opción'}`}
                      value={newOptionValues[type] || ''}
                      onChange={(e) => setNewOptionValues(prev => ({
                        ...prev,
                        [type]: e.target.value
                      }))}
                      onKeyPress={(e) => handleKeyPress(e, type)}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddDynamicOption(type)}
                      className='btn-add-value'
                      disabled={!newOptionValues[type]?.trim()}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.keys(dynamicOptions).length > 0 && (
        <div className='options-preview-section'>
          <h4>Previsualización de Opciones</h4>
          <div className='options-preview-grid'>
            {Object.entries(dynamicOptions).map(([type, values]) => (
              <div key={type} className='option-preview-group'>
                <h5 className='option-preview-title'>{type.charAt(0).toUpperCase() + type.slice(1)}</h5>
                <div className='option-preview-tags'>
                  {values.map((value, index) => (
                    <span key={index} className='option-preview-tag'>
                      {value}
                      {optionStockInputs[`${type}:${value}`] > 0 && (
                        <span className='option-stock-badge'>
                          Stock: {optionStockInputs[`${type}:${value}`]}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className='stock-summary'>
            <h5>Resumen de Stock</h5>
            <div className='stock-summary-content'>
              <p>
                <strong>Stock total de opciones:</strong> {Object.values(optionStockInputs).reduce((total, stock) => total + stock, 0)} unidades
              </p>
              <p>
                <strong>Opciones con stock:</strong> {Object.values(optionStockInputs).filter(stock => stock > 0).length} de {Object.keys(optionStockInputs).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {Object.keys(dynamicOptions).length === 0 && (
        <div className='no-options-message'>
          <p>No hay opciones de compra configuradas. Agrega una opción arriba para comenzar.</p>
        </div>
      )}
    </div>
  )
})

export default DynamicOptionsSection 