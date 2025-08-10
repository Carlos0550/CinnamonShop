import React, { useState, useEffect } from 'react';
import { bannerApi, type Banner } from '../../../../services/bannerApi';
import './banner_table.css';

interface BannerTableProps {
  onRefresh: () => void;
}

const BannerTable: React.FC<BannerTableProps> = ({ onRefresh }) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);
  console.log(banners)

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const bannersData = await bannerApi.getBanners();
      setBanners(bannersData);
    } catch (err) {
      setError('Error al cargar los banners');
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este banner?')) {
      return;
    }

    try {
      await bannerApi.deleteBanner(bannerId);
      onRefresh();
      fetchBanners();
    } catch (err) {
      alert('Error al eliminar el banner');
      console.error('Error deleting banner:', err);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getActionTypeText = (actionType: any) => {
    if (!actionType) return 'Sin acción';
    
    switch (actionType.type) {
      case 'product':
        return `Producto: ${actionType.title || actionType.target}`;
      case 'category':
        return `Categoría: ${actionType.title || actionType.target}`;
      case 'url':
        return `URL: ${actionType.title || actionType.target}`;
      default:
        return 'Sin acción';
    }
  };

  if (loading) {
    return <div className="banner-table-loading">Cargando banners...</div>;
  }

  if (error) {
    return <div className="banner-table-error">{error}</div>;
  }

  if (banners.length === 0) {
    return <div className="banner-table-empty">No hay banners disponibles</div>;
  }

  return (
    <div className="banner-table-container">
      <table className="banner-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Estado</th>
            <th>Clickable</th>
            <th>Acción</th>
            <th>Vigencia</th>
            <th>Creado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {banners.map((banner) => (
            <tr key={banner.id}>
              <td className="banner-image-cell">
                <img 
                  src={banner.imageUrl} 
                  alt="Banner" 
                  className="banner-thumbnail"
                />
              </td>
              <td>
                <span className={`banner-status ${banner.isActive ? 'active' : 'inactive'}`}>
                  {banner.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td>
                <span className={`banner-clickable ${banner.isClickable ? 'yes' : 'no'}`}>
                  {banner.isClickable ? 'Sí' : 'No'}
                </span>
              </td>
              <td className="banner-action">
                {getActionTypeText(banner.actionType)}
              </td>
              <td className="banner-dates">
                <div>Desde: {formatDate(banner.from)}</div>
                <div>Hasta: {formatDate(banner.to)}</div>
              </td>
              <td>{formatDate(banner.createdAt)}</td>
              <td className="banner-actions">
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteBanner(banner.id)}
                  title="Eliminar banner"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BannerTable;
