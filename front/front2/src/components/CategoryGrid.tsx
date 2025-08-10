import React, { useState, useEffect } from 'react';
import type { Category } from '../types';
import apiService from '../services/api';
import './CategoryGrid.css';

const CategoryGrid: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await apiService.getCategories();
        setCategories(data.filter(category => category.isActive));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <section className="category-grid loading">
        <div className="loading-spinner"></div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="category-grid" aria-label="Categorías de productos">
      <div className="container">
        <h2 className="section-title">Explora nuestras categorías</h2>
        <div className="categories-container">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-image">
                {category.imageUrl ? (
                  <img 
                    src={category.imageUrl} 
                    alt={category.name}
                    loading="lazy"
                  />
                ) : (
                  <div className="category-placeholder">
                    <span className="placeholder-icon">📁</span>
                  </div>
                )}
                <div className="category-overlay">
                  <button className="category-btn">
                    Ver productos
                  </button>
                </div>
              </div>
              <div className="category-info">
                <h3 className="category-name">{category.name}</h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
                {category.productsCount !== undefined && (
                  <span className="products-count">
                    {category.productsCount} productos
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
