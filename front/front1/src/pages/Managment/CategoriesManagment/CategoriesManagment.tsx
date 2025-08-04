import "./css/CategoriesManagment.css"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { message, Modal } from "antd"
import CategoryTable from "@/components/CategoryTable"
import type { Category } from "@/services/categoryApi"
import { categoryApi } from "@/services/categoryApi"

function CategoriesManagment() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await categoryApi.getAll(showInactive)
      setCategories(data)
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      message.error('Error al cargar las categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [showInactive])

  const handleEdit = (category: Category) => {
    navigate(`/managment/categories/edit/${category.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await categoryApi.delete(id)
      message.success(result.message)
      loadCategories() // Recargar la lista
    } catch (error) {
      console.error('Error al eliminar categoría:', error)
      message.error('Error al eliminar la categoría')
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await categoryApi.reactivate(id)
      message.success('Categoría reactivada exitosamente')
      loadCategories() // Recargar la lista
    } catch (error) {
      console.error('Error al reactivar categoría:', error)
      message.error('Error al reactivar la categoría')
    }
  }

  const handleView = (category: Category) => {
    setSelectedCategory(category)
  }

  const handleAdd = () => {
    navigate("/managment/categories/new")
  }

  return (
    <div className='c-managment-container'>
      <div className='managment-header'>
        <div>
          <h1 className='managment-title'>Administración de Categorías</h1>
          <p className='managment-subtitle'>Gestiona las categorías de tus productos de forma organizada.</p>
        </div>
      </div>
      
      <div className="managment-controls">
        <div className="filter-controls">
          <label>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar categorías inhabilitadas
          </label>
        </div>
      </div>

      <CategoryTable
        categories={categories}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReactivate={handleReactivate}
        onView={handleView}
        onAdd={handleAdd}
        showInactive={showInactive}
      />

      {/* Modal para ver detalles de categoría */}
      <Modal
        open={!!selectedCategory}
        onCancel={() => setSelectedCategory(null)}
        footer={null}
        title="Detalles de la Categoría"
        width={600}
      >
        {selectedCategory && (
          <div className="category-details">
            <div className="detail-row">
              <strong>Nombre:</strong>
              <span>{selectedCategory.name}</span>
            </div>
            <div className="detail-row">
              <strong>Descripción:</strong>
              <div className="description-content">
                {selectedCategory.description}
              </div>
            </div>
            {selectedCategory.imageUrl && (
              <div className="detail-row">
                <strong>Imagen:</strong>
                <img 
                  src={selectedCategory.imageUrl} 
                  alt={selectedCategory.name}
                  style={{ maxWidth: '200px', borderRadius: '8px' }}
                />
              </div>
            )}
            <div className="detail-row">
              <strong>Fecha de Creación:</strong>
              <span>
                {selectedCategory.createdAt 
                  ? new Date(selectedCategory.createdAt).toLocaleDateString('es-ES')
                  : 'No disponible'
                }
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CategoriesManagment 