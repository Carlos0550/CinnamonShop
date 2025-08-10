import React, { useState, useEffect } from 'react';
import type { Category, ProductFilters as ProductFiltersType } from '../types';
import apiService from '../services/api';
import './ProductFilters.css';

interface ProductFiltersProps {
  filters: ProductFiltersType;
  onFiltersChange: (filters: ProductFiltersType) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data.filter(category => category.isActive));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleFilterChange = (key: keyof ProductFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 12,
    });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="product-filters">
      <div className="filters-header">
        <h3>Filtros</h3>
        <button 
          className="mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle filters menu"
        >
          <span className="toggle-icon">☰</span>
        </button>
      </div>

      <div className={`filters-content ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Búsqueda */}
        <div className="filter-group">
          <label htmlFor="search">Buscar productos</label>
          <input
            id="search"
            type="text"
            placeholder="Nombre del producto..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
        </div>

        {/* Categoría */}
        <div className="filter-group">
          <label htmlFor="category">Categoría</label>
          <select
            id="category"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Marca */}
        <div className="filter-group">
          <label htmlFor="brand">Marca</label>
          <select
            id="brand"
            value={filters.brand || ''}
            onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
            className="filter-select"
          >
            <option value="">Todas las marcas</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Rango de precios */}
        <div className="filter-group">
          <label>Rango de precios</label>
          <div className="price-range">
            <input
              type="number"
              placeholder="Mín"
              value={filters.minPrice || ''}
              onChange={(e) => handleFilterChange('minPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="price-input"
              min="0"
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder="Máx"
              value={filters.maxPrice || ''}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value ? Number(e.target.value) : undefined)}
              className="price-input"
              min="0"
            />
          </div>
        </div>

        {/* Ordenar por */}
        <div className="filter-group">
          <label htmlFor="sortBy">Ordenar por</label>
          <select
            id="sortBy"
            value={filters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="filter-select"
          >
            <option value="createdAt">Más recientes</option>
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
          </select>
        </div>

        {/* Orden */}
        <div className="filter-group">
          <label htmlFor="sortOrder">Orden</label>
          <select
            id="sortOrder"
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="filter-select"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        {/* Botones de acción */}
        <div className="filter-actions">
          <button 
            className="clear-filters-btn"
            onClick={clearFilters}
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
