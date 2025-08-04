import React, { useEffect, useState } from 'react'
import { Select, Switch } from 'antd'
import FormGroup from '@/components/molecules/FormGroup'
import FormLabel from '@/components/molecules/FormLabel'
import FormInput from '@/components/molecules/FormInput'
import FormRow from '@/components/molecules/FormRow'
import RichTextEditor from '@/components/RichTextEditor'
import type { Category } from '@/services/categoryApi'

interface ProductBasicInfoProps {
  formData: {
    name: string
    description: string
    price: number
    stock: number
    sku: string
    brand: string
    categoryId: string
    isActive: boolean
  }
  categories: Category[]
  categoriesLoading: boolean
  onUpdateField: (field: any, value: any) => void
  onAIDescription: () => void
  aiLoading: boolean,
  hasVariants: boolean
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  formData,
  categories,
  categoriesLoading,
  onUpdateField,
  hasVariants
}) => {
  
  return (
    <div className='form-section'>
      <FormGroup>
        <FormLabel htmlFor="name" required>Nombre del Producto</FormLabel>
        <FormInput
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Café Colombiano Premium"
          value={formData.name}
          onChange={(value) => onUpdateField('name', value)}
          required
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description" required>Descripción</FormLabel>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => onUpdateField('description', value)}
          placeholder="Describe tu producto..."
          required
          
        />
        
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel htmlFor="price" required>Precio</FormLabel>
          <FormInput
            id="price"
            name="price"
            type="number"
            placeholder="0.00"
            value={formData.price}
            onChange={(value) => onUpdateField('price', value)}
            required
            step="0.01"
            min={0}
          />
        </FormGroup>

        {!hasVariants && (
          <FormGroup>
          <FormLabel htmlFor="stock" required>Stock</FormLabel>
          <FormInput
            id="stock"
            name="stock"
            type="number"
            placeholder="0"
            value={formData.stock}
            onChange={(value) => onUpdateField('stock', value)}
            required
            min={0}
            
          />
        </FormGroup>
        )}
      </FormRow>

      <FormGroup>
        <FormLabel htmlFor="category" required>Categoría</FormLabel>
        <Select
          id="category"
          placeholder="Selecciona una categoría"
          value={formData.categoryId || undefined}
          onChange={(value) => onUpdateField('categoryId', value)}
          loading={categoriesLoading}
          disabled={categoriesLoading}
          style={{ width: '100%' }}
        >
          {categories.map((category) => (
            <Select.Option key={category.id} value={category.id}>
              {category.name}
            </Select.Option>
          ))}
        </Select>
        {categoriesLoading && <small>Cargando categorías...</small>}
      </FormGroup>

      <FormRow>
        <FormGroup>
          <FormLabel htmlFor="brand" required>Marca</FormLabel>
          <FormInput
            id="brand"
            name="brand"
            type="text"
            placeholder="Ej: CinnamonShop"
            value={formData.brand}
            onChange={(value) => onUpdateField('brand', value)}
            required
          />
        </FormGroup>

        
      </FormRow>

      <FormGroup>
        <FormLabel htmlFor="isActive">Estado del Producto</FormLabel>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Switch
            id="isActive"
            checked={formData.isActive}
            onChange={(checked) => onUpdateField('isActive', checked)}
            size="small"
          />
          <span style={{ color: formData.isActive ? "#52c41a" : "#ff4d4f" }}>
            {formData.isActive ? "Activo" : "Inactivo"}
          </span>
        </div>
        <small>Los productos inactivos no serán visibles para los clientes</small>
      </FormGroup>
    </div>
  )
}

export default ProductBasicInfo 