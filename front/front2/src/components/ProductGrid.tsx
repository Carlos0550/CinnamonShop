import React, { useState, useEffect } from 'react';
import type { Product, ProductFilters } from '../types';
import apiService from '../services/api';
import './ProductGrid.css';

interface ProductGridProps {
  filters: ProductFilters;
}

const ProductGrid: React.FC<ProductGridProps> = ({ filters }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0,
    limit: 12,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await apiService.getProducts({
          ...filters,
          page: pagination.page,
          limit: pagination.limit,
        });
        
        setProducts(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages,
        }));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters, pagination.page]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const getPrimaryImage = (product: Product) => {
    const primaryImage = product.images.find(img => img.isPrimary);
    return primaryImage?.url || product.images[0]?.url || '/placeholder-product.jpg';
  };

  if (loading && products.length === 0) {
    return (
      <div className="product-grid loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="product-grid empty">
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar los filtros o buscar con otros términos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      <div className="products-container">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img
                src={getPrimaryImage(product)}
                alt={product.name}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-product.jpg';
                }}
              />
              <div className="product-overlay">
                <button className="quick-view-btn">Vista rápida</button>
                <button className="add-to-cart-btn">Agregar al carrito</button>
              </div>
            </div>
            
            <div className="product-info">
              <div className="product-category">
                {product.category.name}
              </div>
              <h3 className="product-name">{product.name}</h3>
              <div className="product-brand">{product.brand}</div>
              <div className="product-price">
                {formatPrice(product.price)}
              </div>
              <div className="product-stock">
                {product.stock > 0 ? (
                  <span className="in-stock">En stock ({product.stock})</span>
                ) : (
                  <span className="out-of-stock">Sin stock</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ‹ Anterior
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(page => {
                const start = Math.max(1, pagination.page - 2);
                const end = Math.min(pagination.totalPages, pagination.page + 2);
                return page >= start && page <= end;
              })
              .map(page => (
                <button
                  key={page}
                  className={`page-btn ${page === pagination.page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              ))}
          </div>
          
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
