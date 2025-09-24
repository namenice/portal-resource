// src/pages/SitePage.jsx
import React, { useState, useEffect } from 'react';
import SiteTable from '../components/site/SiteTable.jsx';
import { Plus } from 'lucide-react';
import SiteFormModal from '../components/site/SiteFormModal.jsx';
import SiteDeleteModel from '../components/site/SiteDeleteModel.jsx';
import { authenticatedFetch } from '../services/api.jsx';

export default function SitePage() {
  const [sites, setSites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState(null);
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('sites');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setSites(responseData.data);
      } else {
        throw new Error('API response format is incorrect.');
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setCurrentSite(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (site) => {
    setCurrentSite(site);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (siteId) => {
    setSiteToDelete(siteId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!siteToDelete) return;
    try {
      const response = await authenticatedFetch(`sites/${siteToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete site. Status: ${response.status}`);
      await fetchSites();
      setSiteToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (siteData) => {
    try {
      if (currentSite) {
        // โหมดแก้ไข
        const response = await authenticatedFetch(`sites/${currentSite.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!response.ok) throw new Error('Failed to update site.');
      } else {
        // โหมดเพิ่มใหม่
        const response = await authenticatedFetch('sites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteData)
        });
        if (!response.ok) throw new Error('Failed to create new site.');
      }
      await fetchSites();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading sites...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sites</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Site
          </button>
        </div>
      </div>

      <SiteTable
        sites={sites}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isDeleteModalOpen && (
        <SiteDeleteModel
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSiteToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isFormModalOpen && (
        <SiteFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          siteToEdit={currentSite}
        />
      )}
    </div>
  );
}
