// src/components/location/LocationFormModel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, X } from 'lucide-react';
import { authenticatedFetch } from '../../services/api.jsx';

export default function LocationFormModal({ isOpen, onClose, onSubmit, locationToEdit }) {
  const [siteId, setSiteId] = useState(''); // เปลี่ยนเป็น siteId
  const [room, setRoom] = useState('');
  const [rack, setRack] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [siteOptions, setSiteOptions] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const fetchSites = async () => {
        try {
          const response = await authenticatedFetch('sites');
          if (!response.ok) throw new Error('Failed to fetch sites.');
          const data = await response.json();
          if (data && Array.isArray(data.data)) {
            // ดึงทั้ง id และ name มาเก็บไว้
            setSiteOptions(data.data.map(site => ({ id: site.id, name: site.name })));
          }
        } catch (error) {
          console.error("Error fetching sites:", error);
        }
      };
      fetchSites();

      if (locationToEdit) {
        // ใช้ site_id จาก locationToEdit ในการตั้งค่า state
        setSiteId(locationToEdit.site_id || '');
        setRoom(locationToEdit.room || '');
        setRack(locationToEdit.rack || '');
      } else {
        setSiteId('');
        setRoom('');
        setRack('');
      }
      setErrors({});
    }
  }, [locationToEdit, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!siteId) { // ตรวจสอบ siteId แทน siteName
      newErrors.siteId = 'Site Name is required.';
    }
    if (!room.trim()) {
      newErrors.room = 'Room is required.';
    }
    if (!rack.trim()) {
      newErrors.rack = 'Rack is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        await onSubmit({
          id: locationToEdit?.id,
          site_id: siteId, // ส่ง site_id แทน site_name
          room: room.trim(),
          rack: rack.trim(),
        });
        setSiteId('');
        setRoom('');
        setRack('');
        setErrors({});
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [siteId, room, rack, onSubmit, onClose, locationToEdit, validate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        handleSubmit(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out">

          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {locationToEdit ? 'Edit Location' : 'Add New Location'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm">
                  {locationToEdit ? 'Update your location information' : 'Create a new location'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-6">
              {/* Site Name Input (Dropdown) */}
              <div className="group">
                <label htmlFor="siteId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Site Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="siteId"
                    id="siteId"
                    value={siteId}
                    onChange={(e) => setSiteId(e.target.value)}
                    className={`
                      w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                      focus:outline-none focus:ring-0
                      ${errors.siteId
                        ? 'border-red-300 focus:border-red-500 bg-red-50'
                        : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                      }
                      placeholder-gray-400
                    `}
                    disabled={isLoading || siteOptions.length === 0}
                  >
                    <option value="">-- Select a Site --</option>
                    {siteOptions.map((site) => (
                      <option key={site.id} value={site.id}>{site.name}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <MapPin className={`h-5 w-5 transition-colors duration-200 ${
                      errors.siteId ? 'text-red-400' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                {errors.siteId && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{errors.siteId}</p>
                  </div>
                )}
              </div>

              {/* Room Input */}
              <div className="group">
                <label htmlFor="room" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="room"
                  id="room"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                    focus:outline-none focus:ring-0
                    ${errors.room
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                    }
                    placeholder-gray-400
                  `}
                  placeholder="Enter room number (e.g., 201)"
                  disabled={isLoading}
                />
                {errors.room && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{errors.room}</p>
                  </div>
                )}
              </div>

              {/* Rack Input */}
              <div className="group">
                <label htmlFor="rack" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rack <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="rack"
                  id="rack"
                  value={rack}
                  onChange={(e) => setRack(e.target.value)}
                  className={`
                    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
                    focus:outline-none focus:ring-0
                    ${errors.rack
                      ? 'border-red-300 focus:border-red-500 bg-red-50'
                      : 'border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white'
                    }
                    placeholder-gray-400
                  `}
                  placeholder="Enter rack number (e.g., A-12)"
                  disabled={isLoading}
                />
                {errors.rack && (
                  <div className="mt-2 flex items-center space-x-2 text-red-600 animate-fadeIn">
                    <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{errors.rack}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading || !siteId || !room.trim() || !rack.trim()} // ตรวจสอบ siteId แทน siteName
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <>
                    {locationToEdit ? (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Save Changes</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span>Add Location</span>
                      </div>
                    )}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}