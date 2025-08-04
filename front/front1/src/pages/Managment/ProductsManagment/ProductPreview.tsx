import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Card, Descriptions, Tag, Button, Image, message, Spin, Row, Col, Switch } from "antd"
import { EditOutlined, ArrowLeftOutlined, DeleteOutlined } from "@ant-design/icons"
import { productApi, type Product } from "@/services/productApi"
import { Popconfirm } from "antd"
import "./css/ProductPreview.css"

function ProductPreview() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState("")
  const [statusLoading, setStatusLoading] = useState(false)

  const loadProduct = async () => {
    if (!id) return
    
    try {
      setLoading(true)
      const productData = await productApi.getProductById(id)
      setProduct(productData)
    } catch (error) {
      console.error("Error al cargar producto:", error)
      message.error("Error al cargar el producto")
      navigate("/managment/products")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!product) return
    
    try {
      await productApi.deleteProduct(product.id)
      message.success("Producto eliminado exitosamente")
      navigate("/managment/products")
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      message.error("Error al eliminar el producto")
    }
  }

  const handleToggleStatus = async (currentStatus: boolean) => {
    if (!product) return
    
    try {
      setStatusLoading(true)
      await productApi.toggleProductStatus(product.id)
      const statusMessage = currentStatus ? "Producto desactivado exitosamente" : "Producto activado exitosamente"
      message.success(statusMessage)
      loadProduct()
    } catch (error) {
      console.error("Error al cambiar estado del producto:", error)
      message.error("Error al cambiar el estado del producto")
    } finally {
      setStatusLoading(false)
    }
  }

  const handlePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewOpen(true)
  }

  useEffect(() => {
    loadProduct()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Producto no encontrado</h2>
        <Link to="/managment/products">Volver a la lista</Link>
      </div>
    )
  }

  const mainImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
  const additionalImages = product.images?.filter(img => !img.isPrimary) || []

  return (
    <div className="product-preview-container">
      <div className="preview-header">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate("/managment/products")}
          style={{ marginRight: "16px" }}
        >
          Volver
        </Button>
        <div className="header-actions">
          <Link to={`/managment/products/edit/${product.id}`}>
            <Button type="primary" icon={<EditOutlined />}>
              Editar Producto
            </Button>
          </Link>
          <Popconfirm
            title="¿Estás seguro de que quieres eliminar este producto?"
            description="Esta acción no se puede deshacer."
            onConfirm={handleDeleteProduct}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button danger icon={<DeleteOutlined />}>
              Eliminar
            </Button>
          </Popconfirm>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title="Imágenes del Producto" className="image-card">
            {mainImage && (
              <div className="main-image-container">
                <Image
                  src={mainImage.url}
                  alt={mainImage.alt || product.name}
                  width="100%"
                  height={300}
                  style={{ objectFit: "cover", borderRadius: "8px" }}
                  onClick={() => handlePreview(mainImage.url)}
                  preview={false}
                />
                <div className="image-info">
                  <Tag color="blue">Imagen Principal</Tag>
                </div>
              </div>
            )}

            {additionalImages.length > 0 && (
              <div className="additional-images">
                <h4>Imágenes Adicionales</h4>
                <div className="image-grid">
                  {additionalImages.map((image, index) => (
                    <div key={image.id} className="image-item">
                      <Image
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        width={120}
                        height={120}
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                        onClick={() => handlePreview(image.url)}
                        preview={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!mainImage && additionalImages.length === 0 && (
              <div className="no-images">
                <p>No hay imágenes disponibles</p>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Información del Producto" className="info-card">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Nombre">
                <strong>{product.name}</strong>
              </Descriptions.Item>
              
              <Descriptions.Item label="SKU">
                <Tag color="orange">{product.sku}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Categoría">
                <Tag color="blue">{product.category?.name || "Sin categoría"}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Marca">
                <Tag color="purple">{product.brand}</Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Precio">
                <span style={{ fontSize: "18px", fontWeight: "bold", color: "#52c41a" }}>
                  ${Number(product.price).toFixed(2)}
                </span>
              </Descriptions.Item>
              
              <Descriptions.Item label="Stock">
                <Tag color={Number(product.stock) > 10 ? "green" : Number(product.stock) > 0 ? "orange" : "red"}>
                  {Number(product.stock)} unidades
                </Tag>
              </Descriptions.Item>
              
                             <Descriptions.Item label="Estado">
                 <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                   <Switch
                     checked={product.isActive}
                     onChange={() => handleToggleStatus(product.isActive)}
                     size="small"
                     loading={statusLoading}
                     disabled={statusLoading}
                   />
                   <Tag color={product.isActive ? "green" : "red"}>
                     {product.isActive ? "Activo" : "Inactivo"}
                   </Tag>
                 </div>
               </Descriptions.Item>
              
              <Descriptions.Item label="Fecha de Creación">
                {new Date(product.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
              
              <Descriptions.Item label="Última Actualización">
                {new Date(product.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="Descripción" className="description-card" style={{ marginTop: "16px" }}>
            <div 
              className="product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </Card>

          {product.options && product.options.length > 0 && (
            <Card title="Opciones de Compra" className="options-card" style={{ marginTop: "16px" }}>
                                   {product.options.map((option) => (
                       <div key={option.id} className="option-item">
                         <h4>{option.name}</h4>
                         <div className="option-values">
                           {option.values.map((value, index) => (
                             <Tag key={index} color="cyan" style={{ margin: "4px" }}>
                               {value}
                             </Tag>
                           ))}
                         </div>
                       </div>
                     ))}
            </Card>
          )}
        </Col>
      </Row>

      {/* Preview de imagen */}
      <Image
        wrapperStyle={{ display: 'none' }}
        preview={{
          visible: previewOpen,
          onVisibleChange: setPreviewOpen,
          afterOpenChange: (visible) => !visible && setPreviewOpen(false),
        }}
        src={previewImage}
      />
    </div>
  )
}

export default ProductPreview 