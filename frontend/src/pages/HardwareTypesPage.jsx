// src/pages/HardwareTypesPage.jsx
import React, { useState, useEffect } from 'react';
import HardwareTypeTable from '../components/hardware_type/HardwareTypeTable.jsx';
import HardwareTypeFormModal from '../components/hardware_type/HardwareTypeFormModal.jsx';
import HardwareTypeDeleteModal from '../components/hardware_type/HardwareTypeDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function HardwareTypesPage() {
  const [hardwareTypes, setHardwareTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentHardwareType, setCurrentHardwareType] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hardwareTypeToDelete, setHardwareTypeToDelete] = useState(null);

  useEffect(() => {
    fetchHardwareTypes();
  }, []);

  const fetchHardwareTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('hardwaretypes');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setHardwareTypes(responseData.data);
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
    setCurrentHardwareType(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (hardwareType) => {
    setCurrentHardwareType(hardwareType);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (hardwareType) => {
    setHardwareTypeToDelete(hardwareType);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hardwareTypeToDelete) return;
    try {
      const response = await authenticatedFetch(`hardwaretypes/${hardwareTypeToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete hardware type. Status: ${response.status}`);
      await fetchHardwareTypes();
      setIsDeleteModalOpen(false);
      setHardwareTypeToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (hardwareTypeData) => {
    try {
      if (currentHardwareType) {
        // Edit mode
        const response = await authenticatedFetch(`hardwaretypes/${currentHardwareType.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareTypeData)
        });
        if (!response.ok) throw new Error('Failed to update hardware type.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('hardwaretypes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareTypeData)
        });
        if (!response.ok) throw new Error('Failed to create new hardware type.');
      }
      await fetchHardwareTypes();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading hardware types...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hardware Types</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hardware Type
          </button>
        </div>
      </div>

      <HardwareTypeTable
        hardwareTypes={hardwareTypes}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <HardwareTypeFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          hardwareTypeToEdit={currentHardwareType}
        />
      )}
      
      {isDeleteModalOpen && (
        <HardwareTypeDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          hardwareTypeName={hardwareTypeToDelete?.name}
        />
      )}
    </div>
  );
}