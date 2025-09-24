// src/components/switch/SwitchFormModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Network, X } from 'lucide-react';
import { authenticatedFetch } from '../../services/api.jsx';

export default function SwitchFormModal({ isOpen, onClose, onSubmit, switchToEdit }) {
  const [switchName, setSwitchName] = useState(''); // New state for switch name
  const [vendorId, setVendorId] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('');
  const [selectedRack, setSelectedRack] = useState('');
  const [ip_mgmt, setIpMgmt] = useState('');
  const [note, setNote] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [vendorOptions, setVendorOptions] = useState([]);
  const [allModels, setAllModels] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [roomOptions, setRoomOptions] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchOptions = async () => {
      try {
        const [vendorsResponse, modelsResponse, locationsResponse] = await Promise.all([
          authenticatedFetch('vendors'),
          authenticatedFetch('hardwaremodels'),
          authenticatedFetch('locations'),
        ]);

        const vendorsData = await vendorsResponse.json();
        if (vendorsData && Array.isArray(vendorsData.data)) {
          setVendorOptions(vendorsData.data.map(v => ({ id: v.id, name: v.name })));
        }

        const modelsData = await modelsResponse.json();
        if (modelsData && Array.isArray(modelsData.data)) {
          setAllModels(modelsData.data);
          const uniqueBrands = [...new Set(modelsData.data.map(m => m.brand))];
          setBrandOptions(uniqueBrands);
        }

        const locationsData = await locationsResponse.json();
        if (locationsData && Array.isArray(locationsData.data)) {
          setAllLocations(locationsData.data);
          const uniqueRooms = [...new Set(locationsData.data.map(l => l.room))];
          setRoomOptions(uniqueRooms);
        }

      } catch (error) {
        console.error("Error fetching form options:", error);
      }
    };
    fetchOptions();

    if (switchToEdit) {
      setSwitchName(switchToEdit.name || ''); // Set initial switch name
      setVendorId(switchToEdit.vendor_id?.id || '');
      setSelectedBrand(switchToEdit.model_id?.brand || '');
      setSelectedModel(switchToEdit.model_id?.id || '');
      setSelectedRoom(switchToEdit.location_id?.room || '');
      setSelectedRack(switchToEdit.location_id?.rack || '');
      setIpMgmt(switchToEdit.ip_mgmt || '');
      setNote(switchToEdit.note || '');
      setSpecifications(switchToEdit.specifications || '');
    } else {
      setSwitchName('');
      setVendorId('');
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedRoom('');
      setSelectedRack('');
      setIpMgmt('');
      setNote('');
      setSpecifications('');
    }
    setErrors({});
  }, [isOpen, switchToEdit]);

  const validate = () => {
    const newErrors = {};
    if (!switchName.trim()) newErrors.switchName = 'Switch Name is required.'; // Validate new field
    if (!vendorId) newErrors.vendorId = 'Vendor is required.';
    if (!selectedBrand) newErrors.selectedBrand = 'Brand is required.';
    if (!selectedModel) newErrors.selectedModel = 'Model is required.';
    if (!selectedRoom) newErrors.selectedRoom = 'Room is required.';
    if (!selectedRack) newErrors.selectedRack = 'Rack is required.';
    if (!ip_mgmt.trim()) newErrors.ip_mgmt = 'IP Management is required.';
    if (!note.trim()) newErrors.note = 'Note is required.';
    if (!specifications.trim()) newErrors.specifications = 'Specifications is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(async (e) => {
    if (e) e.preventDefault();
    if (validate()) {
      setIsLoading(true);
      try {
        const selectedLocation = allLocations.find(loc => loc.room === selectedRoom && loc.rack === selectedRack);
        
        await onSubmit({
          id: switchToEdit?.id,
          name: switchName.trim(), // Send the new name field
          vendor_id: vendorId,
          model_id: selectedModel,
          location_id: selectedLocation?.id || '',
          ip_mgmt: ip_mgmt.trim(),
          note: note.trim(),
          specifications: specifications.trim()
        });
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [switchName, vendorId, selectedModel, selectedRoom, selectedRack, ip_mgmt, note, specifications, allLocations, onSubmit, onClose, switchToEdit]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredModels = allModels.filter(m => m.brand === selectedBrand);
  const filteredRacks = allLocations.filter(loc => loc.room === selectedRoom);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-out" onClick={onClose} aria-hidden="true" />
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 ease-out">
          <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {switchToEdit ? 'Edit Switch' : 'Add New Switch'}
                </h3>
                <p className="mt-1 text-blue-100 text-sm">
                  {switchToEdit ? 'Update your switch information' : 'Create a new switch'}
                </p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-blue-100 hover:bg-blue-500 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Row 1: Vendor, Brand, Model */}
              <div className="col-span-1 group">
                <label htmlFor="vendorId" className="block text-sm font-semibold text-gray-700 mb-2">
                  Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  id="vendorId"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.vendorId ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  disabled={isLoading}
                >
                  <option value="">-- Select a Vendor --</option>
                  {vendorOptions.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                {errors.vendorId && <p className="text-red-600 text-sm mt-2">{errors.vendorId}</p>}
              </div>

              <div className="col-span-1 group">
                <label htmlFor="selectedBrand" className="block text-sm font-semibold text-gray-700 mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectedBrand"
                  id="selectedBrand"
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setSelectedModel('');
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.selectedBrand ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  disabled={isLoading}
                >
                  <option value="">-- Select a Brand --</option>
                  {brandOptions.map((brand, index) => (
                    <option key={index} value={brand}>{brand}</option>
                  ))}
                </select>
                {errors.selectedBrand && <p className="text-red-600 text-sm mt-2">{errors.selectedBrand}</p>}
              </div>

              <div className="col-span-1 group">
                <label htmlFor="selectedModel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Model <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectedModel"
                  id="selectedModel"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.selectedModel ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  disabled={isLoading || !selectedBrand}
                >
                  <option value="">-- Select a Model --</option>
                  {filteredModels.map((model) => (
                    <option key={model.id} value={model.id}>{model.model}</option>
                  ))}
                </select>
                {errors.selectedModel && <p className="text-red-600 text-sm mt-2">{errors.selectedModel}</p>}
              </div>

              {/* Row 2: Room, Rack, Switch Name */}
              <div className="col-span-1 group">
                <label htmlFor="selectedRoom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Room <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectedRoom"
                  id="selectedRoom"
                  value={selectedRoom}
                  onChange={(e) => {
                    setSelectedRoom(e.target.value);
                    setSelectedRack('');
                  }}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.selectedRoom ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  disabled={isLoading}
                >
                  <option value="">-- Select a Room --</option>
                  {roomOptions.map((room, index) => (
                    <option key={index} value={room}>{room}</option>
                  ))}
                </select>
                {errors.selectedRoom && <p className="text-red-600 text-sm mt-2">{errors.selectedRoom}</p>}
              </div>

              <div className="col-span-1 group">
                <label htmlFor="selectedRack" className="block text-sm font-semibold text-gray-700 mb-2">
                  Rack <span className="text-red-500">*</span>
                </label>
                <select
                  name="selectedRack"
                  id="selectedRack"
                  value={selectedRack}
                  onChange={(e) => setSelectedRack(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.selectedRack ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  disabled={isLoading || !selectedRoom}
                >
                  <option value="">-- Select a Rack --</option>
                  {filteredRacks.map((loc) => (
                    <option key={loc.id} value={loc.rack}>{loc.rack}</option>
                  ))}
                </select>
                {errors.selectedRack && <p className="text-red-600 text-sm mt-2">{errors.selectedRack}</p>}
              </div>

              <div className="col-span-1 group">
                <label htmlFor="switchName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Switch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="switchName"
                  id="switchName"
                  value={switchName}
                  onChange={(e) => setSwitchName(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.switchName ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  placeholder="e.g., Core Switch A"
                  disabled={isLoading}
                />
                {errors.switchName && <p className="text-red-600 text-sm mt-2">{errors.switchName}</p>}
              </div>

              {/* Row 3: IP Management, Note, Specifications */}
              <div className="col-span-1 md:col-span-3 group">
                <label htmlFor="ip_mgmt" className="block text-sm font-semibold text-gray-700 mb-2">
                  IP Management <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ip_mgmt"
                  id="ip_mgmt"
                  value={ip_mgmt}
                  onChange={(e) => setIpMgmt(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.ip_mgmt ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  placeholder="Enter IP management address (e.g., 192.168.1.1)"
                  disabled={isLoading}
                />
                {errors.ip_mgmt && <p className="text-red-600 text-sm mt-2">{errors.ip_mgmt}</p>}
              </div>

              <div className="col-span-1 md:col-span-3 group">
                <label htmlFor="note" className="block text-sm font-semibold text-gray-700 mb-2">
                  Note <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="note"
                  id="note"
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.note ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  placeholder="e.g., Main core switch for network A"
                  disabled={isLoading}
                />
                {errors.note && <p className="text-red-600 text-sm mt-2">{errors.note}</p>}
              </div>

              <div className="col-span-1 md:col-span-3 group">
                <label htmlFor="specifications" className="block text-sm font-semibold text-gray-700 mb-2">
                  Specifications <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="specifications"
                  id="specifications"
                  rows="3"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-0 ${errors.specifications ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}
                  placeholder="e.g., 48-port 10G SFP+, 4-port 40G QSFP+"
                  disabled={isLoading}
                />
                {errors.specifications && <p className="text-red-600 text-sm mt-2">{errors.specifications}</p>}
              </div>

            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-end space-y-3 space-y-reverse sm:space-y-0 sm:space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !switchName.trim() || !vendorId || !selectedBrand || !selectedModel || !selectedRoom || !selectedRack || !ip_mgmt.trim()}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Network className="h-4 w-4" />
                    <span>{switchToEdit ? 'Save Changes' : 'Add Switch'}</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}