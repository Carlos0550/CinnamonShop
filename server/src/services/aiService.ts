const RAPIDAPI_KEY = process.env['RAPIDAPI_KEY'] ?? '962913a7e7mshcd5407df777e1b2p1c8633jsn8f35e8b1b84b'

export interface AIGenerateDescriptionRequest {
  categoryName: string
  additionalDetails?: string
}

export interface AIGenerateProductFromImageRequest {
  imageUrl: string
  categoryName: string
  additionalDetails?: string
}

export interface AIGenerateProductFromImageResponse {
  title: string
  description: string,
  brand: string
}

export interface AIGenerateProductFromImageFileRequest {
  imageFile: Buffer
  imageName: string
  categoryName: string
  additionalDetails?: string
}

export class AIService {
  async generateCategoryDescription(data: AIGenerateDescriptionRequest): Promise<string> {
    const prompt = `Genera una descripción atractiva y profesional para una categoría de productos llamada "${data.categoryName}". 
    ${data.additionalDetails ? `Considera estos detalles adicionales: ${data.additionalDetails}` : ''}
    
    La descripción debe:
    - Ser clara y concisa
    - Explicar qué tipo de productos incluye esta categoría
    - Ser atractiva para los clientes
    - Tener entre 50 y 120 caracteres
    - Usar un tono profesional pero amigable
    - Usar solo texto plano, sin HTML ni formato especial
    
    Responde solo con la descripción en texto plano, sin introducciones ni explicaciones adicionales.`

    const url = 'https://chatgpt-42.p.rapidapi.com/gpt4'
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': "chatgpt-42.p.rapidapi.com",
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        web_access: false
      })
    }

    const attemptGeneration = async (attemptNumber: number): Promise<string> => {
      try {
        
        const response = await fetch(url, options)
        const result = await response.json() as any


        if (!response.ok) {
          throw new Error(result.message || result.error || 'Error en la generación de IA')
        }

        let description = ''

        if (result.result) {
          description = result.result
        }

        if (!description || description.trim() === '') {
          console.error(`No se pudo extraer descripción de la respuesta (Intento ${attemptNumber}):`, result)
          throw new Error('No se pudo generar la descripción')
        }

        return description.trim()
      } catch (error) {
        console.error(`Error en AI Service - Intento ${attemptNumber}:`, error)
        throw error
      }
    }

    try {
      return await attemptGeneration(1)
    } catch (firstError) {
      
      try {
        return await attemptGeneration(2)
      } catch (secondError) {
        
        throw new Error('No se pudo generar la descripción con IA después de dos intentos. Por favor, intenta de nuevo más tarde.')
      }
    }
  }

  async generateProductDescription(productName: string, category: string, additionalDetails?: string): Promise<string> {
    const prompt = `Genera una descripción atractiva y detallada para un producto llamado "${productName}" de la categoría "${category}".
    ${additionalDetails ? `Considera estos detalles adicionales: ${additionalDetails}` : ''}
    
    La descripción debe:
    - Ser persuasiva y atractiva
    - Destacar las características principales del producto
    - Incluir beneficios para el cliente
    - Tener entre 100 y 200 palabras
    - Usar un tono comercial pero profesional
    
    Responde solo con la descripción, sin introducciones ni explicaciones adicionales.`

    const url = 'https://chatgpt-42.p.rapidapi.com/gpt4'
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': "chatgpt-42.p.rapidapi.com",
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        web_access: false
      })
    }

    const attemptGeneration = async (attemptNumber: number): Promise<string> => {
      try {
        
        const response = await fetch(url, options)
        const result = await response.json() as any


        if (!response.ok) {
          throw new Error(result.message || result.error || 'Error en la generación de IA')
        }

        let description = ''

        if (result.result) {
          description = result.result
        } 

        if (!description || description.trim() === '') {
          console.error(`No se pudo extraer descripción de la respuesta (Intento ${attemptNumber}):`, result)
          throw new Error('No se pudo generar la descripción')
        }

        return description.trim()
      } catch (error) {
        console.error(`Error en AI Service - Intento ${attemptNumber}:`, error)
        throw error
      }
    }

    try {
      return await attemptGeneration(1)
    } catch (firstError) {
      
      try {
        return await attemptGeneration(2)
      } catch (secondError) {
        console.error('Ambos intentos fallaron. Primer error:', firstError)
        console.error('Segundo error:', secondError)
        throw new Error('No se pudo generar la descripción con IA después de dos intentos. Por favor, intenta de nuevo más tarde.')
      }
    }
  }


  async generateProductFromImageFile(data: AIGenerateProductFromImageFileRequest): Promise<AIGenerateProductFromImageResponse> {
    const prompt = `Analiza esta imagen de un producto y genera:

1. Un título atractivo y profesional para el producto (máximo 60 caracteres)
2. Una descripción detallada y persuasiva de entre 200 y 700 palabras, en formato **HTML válido**, usando etiquetas como <h2>, <h3>, <ul>, <li>, <strong>, etc.
3. En lo posible, identificar la marca del producto,

Categoría del producto: ${data.categoryName}
${data.additionalDetails ? `Detalles adicionales: ${data.additionalDetails}` : ''}

La descripción debe:
- Ser atractiva y profesional
- Destacar las características visuales del producto
- Incluir beneficios para el cliente
- Usar un tono comercial pero elegante
- Ser específica sobre lo que se ve en la imagen
- Incluye titulos, subtitulos, negritas, listas (ordenadas o desordenadas), emogis donde creas necesarios para que la descripción sea aún mas atractiva
- Debe estar en español

Responde en formato JSON exactamente así:
{
  "title": "Título del producto",
  "description": "Descripción detallada del producto...",
  "brand": 'La marca del producto, si no la puedes identificar solo dejala vacía, por ejemplo, "brand": ""'
}`

    const url = 'https://chatgpt-42.p.rapidapi.com/gpt4'
    const options = {
      method: 'POST',
      headers: {
        'x-rapidapi-key': RAPIDAPI_KEY,
        'x-rapidapi-host': "chatgpt-42.p.rapidapi.com",
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${this.getMimeType(data.imageName)};base64,${data.imageFile.toString('base64')}`
                }
              }
            ]
          }
        ],
        web_access: false
      })
    }

    const attemptGeneration = async (attemptNumber: number): Promise<AIGenerateProductFromImageResponse> => {
      try {
        
        const response = await fetch(url, options)
        const result = await response.json() as any


        if (!response.ok) {
          throw new Error(result.message || result.error || 'Error en la generación de IA')
        }

        let responseText = ''

        if (result.choices && result.choices[0] && result.choices[0].message) {
          responseText = String(result.choices[0].message.content)
        } else if (result.result) {
          if (Array.isArray(result.result)) {
            responseText = result.result.length > 0 ? String(result.result[0]) : ''
          } else {
            responseText = String(result.result)
          }
        } else if (result.content) {
          responseText = String(result.content)
        } else if (result.text) {
          responseText = String(result.text)
        } else if (result.response) {
          responseText = String(result.response)
        } else if (result.message && result.message.content) {
          responseText = String(result.message.content)
        } else if (typeof result === 'string') {
          responseText = result
        }

        if (typeof responseText !== 'string') {
          responseText = String(responseText)
        }

        if (!responseText || responseText.trim() === '') {
          console.error(`No se pudo extraer respuesta de la API (Intento ${attemptNumber}):`, result)
          throw new Error('No se pudo generar la descripción')
        }

        try {
          // Extraer JSON de bloques de código markdown si existe
          let jsonContent = responseText
          if (responseText.includes('```json')) {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/)
            if (jsonMatch) {
              jsonContent = jsonMatch[1]
            }
          }

          const parsedResponse = JSON.parse(jsonContent)
          if (parsedResponse.title && parsedResponse.description) {
            const cleanDescription = parsedResponse.description.trim().replace(/\\n/g, '\n').replace(/\\"/g, '"')
            return {
              title: parsedResponse.title.trim(),
              description: cleanDescription,
              brand: parsedResponse.brand.trim()
            }
          }
        } catch (parseError) {
        }

        const lines = responseText.split('\n')
        let title = ''
        let description = ''

        for (const line of lines) {
          if (line.toLowerCase().includes('título') || line.toLowerCase().includes('title')) {
            title = line.replace(/.*?:/, '').trim()
          } else if (line.toLowerCase().includes('descripción') || line.toLowerCase().includes('description')) {
            description = line.replace(/.*?:/, '').trim()
          }
        }

        if (!title) {
          title = 'Producto Generado por IA'
        }
        if (!description) {
          description = responseText.trim()
        }

        return {
          title: title,
          description: description,
          brand: "Cinnamon"
        }
      } catch (error) {
        console.error(`Error en Product Vision AI Service (File) - Intento ${attemptNumber}:`, error)
        throw error
      }
    }

    try {
      return await attemptGeneration(1)
    } catch (firstError) {
      
      try {
        return await attemptGeneration(2)
      } catch (secondError) {
        
        throw new Error('No se pudo generar el producto con IA después de dos intentos. Por favor, intenta de nuevo más tarde.')
      }
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop()
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg'
      case 'png':
        return 'image/png'
      case 'gif':
        return 'image/gif'
      case 'webp':
        return 'image/webp'
      default:
        return 'image/jpeg'
    }
  }
} 