import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddEditSiteModal({ isOpen, onClose, onSave, initialData }) {
  const [formData, setFormData] = useState({ name: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '' });
    }
  }, [initialData]);

  // Add a new useEffect hook to handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if the user is not typing in an input field before allowing key presses
      if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        if (event.key === 'Escape') {
          onClose();
        }
      }
    };
    
    // Listen for Enter key press on the form
    const handleEnter = (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default form submission behavior
        handleSubmit(event); // Call the handleSubmit function
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // You can add an event listener to the form itself for a more focused approach
      const form = document.querySelector('form');
      if (form) {
        form.addEventListener('keydown', handleEnter);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const form = document.querySelector('form');
      if (form) {
        form.removeEventListener('keydown', handleEnter);
      }
    };
  }, [isOpen, onClose, onSave, formData]); // Add all dependencies

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');
    
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? 
        `${API_URL}/sites/${initialData.id}` : 
        `${API_URL}/sites`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save site.');
      }
      
      const savedSite = await response.json();
      onSave(savedSite.data);
      onClose(); // Close the modal after a successful save
    } catch (e) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative p-8 bg-white rounded-lg shadow-xl w-96">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Site' : 'Add New Site'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor="name">Site Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}