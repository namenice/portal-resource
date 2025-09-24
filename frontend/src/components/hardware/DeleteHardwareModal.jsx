// components/shared/DeleteHardwareModal.jsx
import React, { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';

const DeleteHardwareModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        onConfirm(); 
        onClose();
      } else if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onConfirm, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Trash2 className="text-red-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Confirm Deletion</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this hardware? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteHardwareModal;