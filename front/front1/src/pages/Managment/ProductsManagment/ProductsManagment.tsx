import { useState, useEffect } from "react"
import { Table, Pagination, Button, Input, Select, message, Popconfirm, Image, Tag } from "antd"
import { EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { productApi, type Product } from "@/services/productApi"
import { categoryApi, type Category } from "@/services/categoryApi"
import "./css/ProductsManagment.css"

const { Search } = Input
const { Option } = Select

function ProductsManagment() {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalProducts, setTotalProducts] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortField, setSortField] = useState<string>("createdAt")
  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend")

  const loadProducts = async () => {
    try {
      setLoading(true)
      const productsData = await productApi.getAllProducts()
      setProducts(productsData)
      setTotalProducts(productsData.length)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      message.error("Error al cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryApi.getAll()
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error al cargar categorías:", error)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    try {
      await productApi.deleteProduct(productId)
      message.success("Producto eliminado exitosamente")
      loadProducts()
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      message.error("Error al eliminar el producto")
    }
  }



  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory

    return matchesSearch && matchesCategory
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: any = a[sortField as keyof Product]
    let bValue: any = b[sortField as keyof Product]

    if (sortField === "price" || sortField === "stock") {
      aValue = Number(aValue)
      bValue = Number(bValue)
    } else if (sortField === "createdAt" || sortField === "updatedAt") {
      aValue = new Date(aValue).getTime()
      bValue = new Date(bValue).getTime()
    } else {
      aValue = String(aValue).toLowerCase()
      bValue = String(bValue).toLowerCase()
    }

    if (sortOrder === "ascend") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentProducts = sortedProducts.slice(startIndex, endIndex)

  const columns = [
    {
      title: "Imagen",
      dataIndex: "images",
      key: "image",

      render: (images: any[]) => {
        const mainImage = images?.find(img => img.isPrimary) || images?.[0]
        return mainImage ? (
          <Image
            src={mainImage.url}
            alt={mainImage.alt || "Producto"}
            width={50}
            height={50}
            style={{ objectFit: "cover", borderRadius: "4px" }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
          />
        ) : (
          <div style={{ width: 50, height: 50, backgroundColor: "#f0f0f0", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "12px", color: "#999" }}>Sin img</span>
          </div>
        )
      }
    },
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      sorter: true,
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: "bold" }}>{text}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>SKU: {record.sku}</div>
        </div>
      )
    },
    {
      title: "Categoría",
      dataIndex: "category",
      key: "category",
      render: (category: any) => (
        <Tag color="blue">{category?.name || "Sin categoría"}</Tag>
      )
    },

    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Product) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            type="text"
            icon={<EyeOutlined />}
            size="small"
            title="Ver detalles"
            onClick={() => navigate(`/managment/products/${record.id}`)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            title="Editar"
            onClick={() => navigate(`/managment/products/edit/${record.id}`)}
          />
          <Popconfirm
            title="¿Estás seguro de que quieres eliminar este producto?"
            description="Esta acción no se puede deshacer."
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="Sí, eliminar"
            cancelText="Cancelar"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Eliminar"
            />
          </Popconfirm>
        </div>
      )
    }
  ]

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page)
    if (size && size !== pageSize) {
      setPageSize(size)
    }
  }

  const handleTableChange = (pagination: any, filters: any, sorter: any) => {
    if (sorter.field) {
      setSortField(sorter.field)
      setSortOrder(sorter.order)
    }
  }

  useEffect(() => {
    loadProducts()
    loadCategories()
  }, [])

  return (
    <div className='p-managment-container'>
      <div className='managment-header'>
        <div>
          <h1 className='managment-title'>Administración de Productos</h1>
          <p className='managment-subtitle'>Administrá de forma sencilla tu flota de productos.</p>
        </div>
        <Link to="/managment/products/new" className='btn-add-product'>
          + Agregar Producto
        </Link>
      </div>

      <div className="p-managment-content" >
        <div style={{ marginBottom: "16px", padding: "5px", display: "flex", gap: "16px", alignItems: "center", width: "100%" }}>
          <Search
            placeholder="Buscar productos..."
            allowClear
            style={{ width: 300 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={setSearchTerm}
          />
          <Select
            placeholder="Filtrar por categoría"
            allowClear
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={setSelectedCategory}
          >
            {categories.map((category) => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
          <div style={{ marginLeft: "auto" }}>
            <span style={{ color: "#666" }}>
              {filteredProducts.length} productos encontrados
            </span>
          </div>
        </div>

        <div style={{ backgroundColor: "white", borderRadius: "8px", padding: "16px", width: "100%" }}>
          <Table
            columns={columns}
            dataSource={currentProducts}
            rowKey="id"
            loading={loading}
            pagination={false}
            onChange={handleTableChange}

            scroll={{
              x: 500
            }}
          />
        </div>

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "center" }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredProducts.length}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} de ${total} productos`
            }

            pageSizeOptions={["5", "10", "20", "50"]}
          />
        </div>
      </div>
    </div>
  )
}

export default ProductsManagment