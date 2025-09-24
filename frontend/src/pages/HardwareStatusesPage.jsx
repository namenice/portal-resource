// src/pages/HardwareStatusesPage.jsx
import React, { useState, useEffect } from 'react';
import HardwareStatusTable from '../components/hardware_status/HardwareStatusTable.jsx';
import HardwareStatusFormModal from '../components/hardware_status/HardwareStatusFormModal.jsx';
import HardwareStatusDeleteModal from '../components/hardware_status/HardwareStatusDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function HardwareStatusesPage() {
  const [hardwareStatuses, setHardwareStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentHardwareStatus, setCurrentHardwareStatus] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hardwareStatusToDelete, setHardwareStatusToDelete] = useState(null);

  useEffect(() => {
    fetchHardwareStatuses();
  }, []);

  const fetchHardwareStatuses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('hardwarestatus');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setHardwareStatuses(responseData.data);
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
    setCurrentHardwareStatus(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (hardwareStatus) => {
    setCurrentHardwareStatus(hardwareStatus);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (hardwareStatus) => {
    setHardwareStatusToDelete(hardwareStatus);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hardwareStatusToDelete) return;
    try {
      const response = await authenticatedFetch(`hardwarestatus/${hardwareStatusToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete hardware status. Status: ${response.status}`);
      await fetchHardwareStatuses();
      setIsDeleteModalOpen(false);
      setHardwareStatusToDelete(null);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (hardwareStatusData) => {
    try {
      if (currentHardwareStatus) {
        // Edit mode
        const response = await authenticatedFetch(`hardwarestatus/${currentHardwareStatus.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareStatusData)
        });
        if (!response.ok) throw new Error('Failed to update hardware status.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('hardwarestatus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(hardwareStatusData)
        });
        if (!response.ok) throw new Error('Failed to create new hardware status.');
      }
      await fetchHardwareStatuses();
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading hardware statuses...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hardware Statuses</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hardware Status
          </button>
        </div>
      </div>

      <HardwareStatusTable
        hardwareStatuses={hardwareStatuses}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isFormModalOpen && (
        <HardwareStatusFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          hardwareStatusToEdit={currentHardwareStatus}
        />
      )}
      
      {isDeleteModalOpen && (
        <HardwareStatusDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          hardwareStatusName={hardwareStatusToDelete?.name}
        />
      )}
    </div>
  );
}