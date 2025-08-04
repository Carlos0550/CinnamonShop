import React, { useState } from 'react'
import { Table, Button, Space, Popconfirm, Image, Modal, Tag } from 'antd'
import { EditOutlined, DeleteOutlined, EyeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Category } from '@/services/categoryApi'
import './css/CategoryTable.css'

interface CategoryTableProps {
  categories: Category[]
  loading: boolean
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onReactivate?: (id: string) => void
  onView: (category: Category) => void
  onAdd: () => void
  showInactive?: boolean
}

const CategoryTable: React.FC<CategoryTableProps> = ({
  categories,
  loading,
  onEdit,
  onDelete,
  onReactivate,
  onView,
  onAdd,
  
}) => {
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl)
    setPreviewVisible(true)
  }

  const columns: ColumnsType<Category> = [
    {
      title: 'Imagen',
      key: 'image',
      width: 80,
      render: (_, record) => (
        
        <div className="category-image-cell">
          
          {record.imageUrl ? (
            
            <Image
              width={50}
              height={50}
              src={record.imageUrl}
              alt={record.name}
              style={{ objectFit: 'cover', borderRadius: '4px' }}
              preview={false}
              onClick={() => handleImagePreview(record.imageUrl!)}
            />
          ) : (
            <div className="no-image-placeholder">
              <span>Sin imagen</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text) => <span className="category-name">{text}</span>,
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => (
        <div className="category-description">
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </div>
      ),
    },
    {
      title: 'Estado',
      key: 'status',
      width: 120,
      render: (_, record) => (
        <div className="category-status">
          {record.isActive ? (
            <Tag color="green">Activa</Tag>
          ) : (
            <Tag color="red">Inhabilitada</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Productos',
      key: 'products',
      width: 100,
      render: (_, record) => (
        <div className="category-products">
          <Tag color="blue">{record._count?.products || 0}</Tag>
        </div>
      ),
    },
    {
      title: 'Fecha de Creación',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => (
        <span className="category-date">
          {date ? new Date(date).toLocaleDateString('es-ES') : '-'}
        </span>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => onView(record)}
            title="Ver detalles"
            className="action-button view"
          />
          
          {record.isActive ? (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => onEdit(record)}
                title="Editar"
                className="action-button edit"
              />
              <Popconfirm
                title="¿Estás seguro de que quieres eliminar esta categoría?"
                description={
                  record._count?.products && record._count.products > 0
                    ? `Esta categoría tiene ${record._count.products} producto(s) asociado(s). Se inhabilitará en lugar de eliminar.`
                    : "Esta acción eliminará la categoría permanentemente junto con su imagen."
                }
                onConfirm={() => onDelete(record.id!)}
                okText="Sí, eliminar"
                cancelText="Cancelar"
                placement="topRight"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  title="Eliminar"
                  className="action-button delete"
                  danger
                />
              </Popconfirm>
            </>
          ) : (
            <Button
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => onReactivate?.(record.id!)}
              title="Reactivar"
              className="action-button reactivate"
            />
          )}
        </Space>
      ),
    },
  ]

  return (
    <div className="category-table-container"  style={{
      overflowY: "scroll"
    }}>
      <div className="table-header">
        <h3>Categorías ({categories.length})</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAdd}
          className="add-category-button"
        >
          Agregar Categoría
        </Button>
      </div>

      <Table
        columns={columns}
       
        dataSource={categories}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} de ${total} categorías`,
        }}
        className="category-table"
        scroll={{
          x:800,
        
        }}
      />

      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        title="Vista previa de imagen"
      >
        <Image
          alt="Vista previa"
          style={{ width: '100%' }}
          src={previewImage}
        />
      </Modal>
    </div>
  )
}

export default CategoryTable 