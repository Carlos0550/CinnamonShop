import React, { useState } from 'react';
import { bannerApi, type BannerAction } from '../../../../services/bannerApi';
import './AddBanner.css';

interface AddBannerProps {
  onBannerAdded: () => void;
  onCancel: () => void;
}

const AddBanner: React.FC<AddBannerProps> = ({ onBannerAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    banner: null as File | null,
    isClickable: false,
    actionType: 'none' as 'product' | 'category' | 'url' | 'none',
    target: '',
    title: '',
    from: '',
    to: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, banner: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.banner) {
      setError('Debes seleccionar una imagen');
      return;
    }

    if (formData.isClickable && formData.actionType !== 'none' && !formData.target) {
      setError('Debes especificar un objetivo para la acción');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const actionType: BannerAction | undefined = formData.isClickable && formData.actionType !== 'none' ? {
        type: formData.actionType,
        target: formData.target,
        title: formData.title || undefined
      } : undefined;

      await bannerApi.uploadBanner({
        banner: formData.banner,
        isClickable: formData.isClickable,
        actionType,
        from: formData.from || undefined,
        to: formData.to || undefined
      });

      onBannerAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir el banner');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ 
        ...prev, 
        [name]: checked,
        // Reset action fields if not clickable
        ...(name === 'isClickable' && !checked && {
          actionType: 'none',
          target: '',
          title: ''
        })
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="add-banner-overlay">
      <div className="add-banner-modal">
        <div className="add-banner-header">
          <h2>Añadir Nuevo Banner</h2>
          <button className="btn-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="add-banner-form">
          <div className="form-group">
            <label htmlFor="banner">Imagen del Banner *</label>
            <input
              type="file"
              id="banner"
              name="banner"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            {formData.banner && (
              <div className="file-preview">
                <img 
                  src={URL.createObjectURL(formData.banner)} 
                  alt="Preview" 
                  className="image-preview"
                />
                <span>{formData.banner.name}</span>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="isClickable"
                checked={formData.isClickable}
                onChange={handleInputChange}
              />
              Banner clickeable
            </label>
          </div>

          {formData.isClickable && (
            <>
              <div className="form-group">
                <label htmlFor="actionType">Tipo de Acción</label>
                <select
                  id="actionType"
                  name="actionType"
                  value={formData.actionType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="none">Seleccionar acción</option>
                  <option value="product">Producto</option>
                  <option value="category">Categoría</option>
                  <option value="url">URL externa</option>
                </select>
              </div>

              {formData.actionType !== 'none' && (
                <>
                  <div className="form-group">
                    <label htmlFor="target">
                      {formData.actionType === 'product' ? 'ID del Producto' :
                       formData.actionType === 'category' ? 'ID de la Categoría' :
                       'URL'}
                    </label>
                    <input
                      type="text"
                      id="target"
                      name="target"
                      value={formData.target}
                      onChange={handleInputChange}
                      placeholder={
                        formData.actionType === 'product' ? 'Ej: prod_123' :
                        formData.actionType === 'category' ? 'Ej: cat_456' :
                        'https://ejemplo.com'
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="title">Título de la Acción (opcional)</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Título descriptivo de la acción"
                    />
                  </div>
                </>
              )}
            </>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="from">Fecha de Inicio (opcional)</label>
              <input
                type="date"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="to">Fecha de Fin (opcional)</label>
              <input
                type="date"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading || !formData.banner}
            >
              {loading ? 'Subiendo...' : 'Subir Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBanner;
