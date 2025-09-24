// src/pages/HardwarePage.jsx
import React, { useState, useEffect } from 'react';
import HardwareTable from '../components/hardware/HardwareTable.jsx';
import { Plus, FileText } from 'lucide-react';
import DeleteHardwareModal from '../components/hardware/DeleteHardwareModal.jsx';
import { authenticatedFetch } from '../services/api.jsx';
import { useNavigate } from 'react-router-dom';

export default function HardwarePage() {
  const [hardwares, setHardwares] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [hardwareToDelete, setHardwareToDelete] = useState(null);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHardwares = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authenticatedFetch('hardwares'); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const responseData = await response.json();
        if (responseData && Array.isArray(responseData.data)) {
          setHardwares(responseData.data);
        } else {
          throw new Error('API response format is incorrect.');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHardwares();
  }, []);

  const handleAdd = () => {
    navigate('/hardware/add'); 
  };

  const handleEdit = (hardware) => {
    navigate(`/hardware/edit/${hardware.id}`);
  };

  const handleDeleteClick = (hardwareId) => {
    setHardwareToDelete(hardwareId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!hardwareToDelete) return;
    try {
      const response = await authenticatedFetch(`hardwares/${hardwareToDelete}`, { method: 'DELETE' });
      if (!response.ok) throw new Error(`Failed to delete hardware. Status: ${response.status}`);
      setHardwares(hardwares.filter(hardware => hardware.id !== hardwareToDelete));
      setHardwareToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (e) {
      setError(e.message);
      setIsDeleteModalOpen(false);
    }
  };

  const handleRowExpand = (hardwareId) => {
    setExpandedRowId(expandedRowId === hardwareId ? null : hardwareId);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);
    try {
        const response = await authenticatedFetch('hardwares/export', { method: 'GET' });
        if (!response.ok) {
            throw new Error(`Failed to export data. Status: ${response.status}`);
        }
        
        // Create a blob from the response
        const blob = await response.blob();
        
        // Create a temporary link element
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hardware-report-${Date.now()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (e) {
        console.error('Export Error:', e);
        setError(`Failed to export file: ${e.message}`);
    } finally {
        setIsExporting(false);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading hardwares...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Hardwares</h1>
        <div className="flex space-x-2">
            <button 
                onClick={handleExport}
                className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors 
                ${isExporting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={isExporting}
            >
                <FileText className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export to Excel'}
            </button>
            <button 
              onClick={handleAdd}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hardware
            </button>
        </div>
      </div>

      <HardwareTable 
        hardwares={hardwares} 
        onEdit={handleEdit} 
        onDelete={handleDeleteClick} 
        expandedRowId={expandedRowId}
        onRowExpand={handleRowExpand}
      />

      {isDeleteModalOpen && (
        <DeleteHardwareModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setHardwareToDelete(null);
          }}
         onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
