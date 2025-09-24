// src/pages/VendorsPage.jsx
import React, { useState, useEffect } from 'react';
import VendorTable from '../components/vendor/VendorTable.jsx';
import VendorFormModal from '../components/vendor/VendorFormModal.jsx';
import VendorDeleteModal from '../components/vendor/VendorDeleteModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { Plus } from 'lucide-react';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentVendor, setCurrentVendor] = useState(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch('vendors');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const responseData = await response.json();
      if (responseData && Array.isArray(responseData.data)) {
        setVendors(responseData.data);
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
    setCurrentVendor(null);
    setIsFormModalOpen(true);
  };

  const handleEdit = (vendor) => {
    setCurrentVendor(vendor);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!vendorToDelete) return;
    try {
      const response = await authenticatedFetch(`vendors/${vendorToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete vendor. Status: ${response.status}`);
      await fetchVendors(); // Refresh the list
      setVendorToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleFormSubmit = async (vendorData) => {
    try {
      if (currentVendor) {
        // Edit mode
        const response = await authenticatedFetch(`vendors/${currentVendor.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData)
        });
        if (!response.ok) throw new Error('Failed to update vendor.');
      } else {
        // Add new mode
        const response = await authenticatedFetch('vendors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vendorData)
        });
        if (!response.ok) throw new Error('Failed to create new vendor.');
      }
      await fetchVendors(); // Refresh the list
      setIsFormModalOpen(false);
    } catch (e) {
      setError(e.message);
    }
  };

  if (isLoading) {
    return <div className="p-6">กำลังโหลดข้อมูล Vendor...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">เกิดข้อผิดพลาด: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Vendors</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleAdd}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </button>
        </div>
      </div>

      <VendorTable
        vendors={vendors}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
      />

      {isDeleteModalOpen && (
        <VendorDeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setVendorToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
        />
      )}

      {isFormModalOpen && (
        <VendorFormModal
          isOpen={isFormModalOpen}
          onClose={() => setIsFormModalOpen(false)}
          onSubmit={handleFormSubmit}
          vendorToEdit={currentVendor}
        />
      )}
    </div>
  );
}