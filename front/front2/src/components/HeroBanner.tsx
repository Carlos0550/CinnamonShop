import React, { useState, useEffect } from 'react';
import type { Banner } from '../types';
import apiService from '../services/api';
import './HeroBanner.css';

const HeroBanner: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await apiService.getBanners();
        console.log(data)
        setBanners(data.filter(banner => banner.isActive));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching banners:', error);
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="hero-banner loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <section className="hero-banner" aria-label="Banners promocionales">
      <div className="banner-container">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`banner-slide ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url(${banner.imageUrl})` }}
          >
            <div className="banner-content">
              <div className="banner-overlay">
                {/* Mostrar título del banner si existe en actionType */}
                {banner.actionType?.title && (
                  <h2 className="banner-title">{banner.actionType.title}</h2>
                )}
                
                {/* Por ahora no tenemos descripción en el modelo, pero podemos mostrar un texto por defecto */}
                {banner.isClickable && (
                  <p className="banner-description">
                    Haz clic para {banner.actionType?.type === 'product' ? 'ver el producto' : 
                                 banner.actionType?.type === 'category' ? 'explorar la categoría' : 
                                 banner.actionType?.type === 'url' ? 'ir al enlace' : 'ver más'}
                  </p>
                )}
                
                {banner.isClickable && (
                  <button 
                    className="banner-cta"
                    onClick={() => {
                      if (banner.actionType) {
                        // Implementar acción del banner
                        console.log('Banner clicked:', banner.actionType);
                      }
                    }}
                  >
                    Ver más
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {banners.length > 1 && (
          <>
            <button 
              className="banner-nav banner-prev" 
              onClick={goToPrevious}
              aria-label="Banner anterior"
            >
              ‹
            </button>
            <button 
              className="banner-nav banner-next" 
              onClick={goToNext}
              aria-label="Banner siguiente"
            >
              ›
            </button>

            <div className="banner-indicators">
              {banners.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Ir al banner ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
