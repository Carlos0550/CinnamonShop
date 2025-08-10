import React, { useState } from 'react';
import BannerTable from './Components/banner_table';
import AddBanner from './Components/AddBanner';
import "./css/BannersManagment.css";

function BannersManagment() {
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBannerAdded = () => {
    setShowAddBanner(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleCancelAdd = () => {
    setShowAddBanner(false);
  };

  return (
    <div className="banners-management">
      <div className="banners-header">
        <h1>Gestión de Banners</h1>
        <button 
          className="btn-add-banner"
          onClick={() => setShowAddBanner(true)}
        >
          + Añadir Banner
        </button>
      </div>

      <div className="banners-content">
        <BannerTable key={refreshKey} onRefresh={() => setRefreshKey(prev => prev + 1)} />
      </div>

      {showAddBanner && (
        <AddBanner 
          onBannerAdded={handleBannerAdded}
          onCancel={handleCancelAdd}
        />
      )}
    </div>
  );
}

export default BannersManagment;