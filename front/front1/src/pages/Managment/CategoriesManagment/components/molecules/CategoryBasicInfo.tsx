import React from 'react'
import FormGroup from '@/components/molecules/FormGroup'
import FormLabel from '@/components/molecules/FormLabel'
import FormInput from '@/components/molecules/FormInput'
import FormTextarea from '@/components/molecules/FormTextarea'
import AIButton from '@/components/organisms/AIButton'

interface CategoryBasicInfoProps {
  name: string
  description: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onAIGenerate: () => void
  aiLoading: boolean
}

const CategoryBasicInfo: React.FC<CategoryBasicInfoProps> = ({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onAIGenerate,
  aiLoading
}) => {
  return (
    <div className='form-section'>
      <FormGroup>
        <FormLabel htmlFor="name" required>Nombre de la Categoría</FormLabel>
        <FormInput
          id="name"
          name="name"
          type="text"
          placeholder="Ej: Café Premium"
          value={name}
          onChange={(value) => onNameChange(value as string)}
          required
        />
      </FormGroup>

      <FormGroup>
        <FormLabel htmlFor="description" required>Descripción</FormLabel>
        <FormTextarea
          id="description"
          name="description"
          placeholder="Describe esta categoría..."
          value={description}
          onChange={onDescriptionChange}
          required
          rows={4}
          maxLength={500}
        />
        <div className='ai-button-container'>
          <AIButton onClick={onAIGenerate} loading={aiLoading}>
            🤖 Rellenar con IA
          </AIButton>
        </div>
      </FormGroup>
    </div>
  )
}

export default CategoryBasicInfo 