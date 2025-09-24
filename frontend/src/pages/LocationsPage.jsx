// src/pages/LocationsPage.jsx
import React, { useState, useEffect } from 'react';
import LocationTable from '../components/location/LocationTable.jsx';
import LocationFormModal from '../components/location/LocationFormModel.jsx';


import LocationDeleteModel from '../components/location/LocationDeleteModel.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function LocationPage() {
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch locations from the API
      const response = await authenticatedFetch('locations?includeSiteNames=true');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setLocations(responseData.data);
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
    setCurrentLocation(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (location) => {
    setCurrentLocation(location);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (location) => {
    setLocationToDelete(location);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!locationToDelete) return;
    try {
      // Delete location via API
      const response = await authenticatedFetch(`locations/${locationToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete location. Status: ${response.status}`);
      await fetchLocations(); // Refresh the list
      setLocationToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (locationData) => {
    try {
      if (currentLocation) {
        // Edit mode
        const response = await authenticatedFetch(`locations/${currentLocation.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationData)
        });
        if (!response.ok) throw new Error('Failed to update location.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('locations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(locationData)
        });
        if (!response.ok) throw new Error('Failed to create new location.');
      }
      await fetchLocations(); // Refresh the list
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">กำลังโหลดข้อมูล Location...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Locations</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </button>
        </div>
      </div>

      <LocationTable
        locations={locations}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isDeleteModalOpen && (
        <LocationDeleteModel
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setLocationToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isFormModalOpen && (
        <LocationFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          locationToEdit={currentLocation}
        />
      )}
    </div>
  );
}
