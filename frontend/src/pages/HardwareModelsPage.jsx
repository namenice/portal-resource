// src/pages/HardwareModelsPage.jsx
import React, { useState, useEffect } from 'react';
import HardwareModelTable from '../components/hardware_model/HardwareModelTable.jsx';
import HardwareModelFormModal from '../components/hardware_model/HardwareModelFormModal.jsx';
import HardwareModelDeleteModal from '../components/hardware_model/HardwareModelDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function HardwareModelsPage() {
  const [hardwareModels, setHardwareModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentHardwareModel, setCurrentHardwareModel] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hardwareModelToDelete, setHardwareModelToDelete] = useState(null);

  useEffect(() => {
    fetchHardwareModels();
  }, []);

  const fetchHardwareModels = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('hardwaremodels');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setHardwareModels(responseData.data);
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
    setCurrentHardwareModel(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (hardwareModel) => {
    setCurrentHardwareModel(hardwareModel);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (hardwareModel) => {
    setHardwareModelToDelete(hardwareModel);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hardwareModelToDelete) return;
    try {
      const response = await authenticatedFetch(`hardwaremodels/${hardwareModelToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete hardware model. Status: ${response.status}`);
      await fetchHardwareModels();
      setIsDeleteModalOpen(false);
      setHardwareModelToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (hardwareModelData) => {
    try {
      if (currentHardwareModel) {
        // Edit mode
        const response = await authenticatedFetch(`hardwaremodels/${currentHardwareModel.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareModelData)
        });
        if (!response.ok) throw new Error('Failed to update hardware model.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('hardwaremodels', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareModelData)
        });
        if (!response.ok) throw new Error('Failed to create new hardware model.');
      }
      await fetchHardwareModels();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading hardware models...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hardware Models</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hardware Model
          </button>
        </div>
      </div>

      <HardwareModelTable
        hardwareModels={hardwareModels}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <HardwareModelFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          hardwareModelToEdit={currentHardwareModel}
        />
      )}
      
      {isDeleteModalOpen && (
        <HardwareModelDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          hardwareModelName={hardwareModelToDelete?.model}
        />
      )}
    </div>
  );
}