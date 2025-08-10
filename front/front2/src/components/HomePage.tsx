
import React, { useState } from 'react';
import HeroBanner from './HeroBanner';
import CategoryGrid from './CategoryGrid';
import ProductFilters from './ProductFilters';
import ProductGrid from './ProductGrid';
import type { ProductFilters as ProductFiltersType } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<ProductFiltersType>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleFiltersChange = (newFilters: ProductFiltersType) => {
    setFilters(newFilters);
  };

  return (
    <div className="home-page">
      <HeroBanner />

      <CategoryGrid />

      <section className="products-section">
        <div className="container">
          <div className="products-header">
            <h2 className="section-title">Nuestros Productos</h2>
            <p className="section-subtitle">
              Descubre nuestra amplia selección de productos de calidad
            </p>
          </div>

          <div className="products-layout">
            {/* Sidebar con filtros */}
            <aside className="filters-sidebar">
              <ProductFilters 
                filters={filters} 
                onFiltersChange={handleFiltersChange} 
              />
            </aside>

            {/* Grid de productos */}
            <main className="products-main">
              <ProductGrid filters={filters} />
            </main>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h3>¡Mantente informado!</h3>
            <p>Suscríbete para recibir las últimas ofertas y novedades</p>
            <div className="newsletter-form">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="newsletter-input"
              />
              <button className="newsletter-btn">Suscribirse</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
