// components/shared/HardwareDetailModal.jsx
import React from 'react';
import { X } from 'lucide-react';

export default function HardwareDetailModal({ isOpen, onClose, hardware }) {
  if (!isOpen || !hardware) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity duration-300">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-auto transform transition-transform duration-300 scale-100">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">{hardware.hostname} Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p><strong>Hostname:</strong> {hardware.hostname}</p>
          <p><strong>IPMI:</strong> {hardware.ipmi || 'N/A'}</p>
          <p><strong>Serial:</strong> {hardware.serial || 'N/A'}</p>
          <p><strong>Owner:</strong> {hardware.owner || 'N/A'}</p>
          <p><strong>Unit Range:</strong> {hardware.unit_range || 'N/A'}</p>
          <p><strong>Location ID:</strong> {hardware.location_id || 'N/A'}</p>
          <p><strong>Cluster ID:</strong> {hardware.cluster_id || 'N/A'}</p>
          <p><strong>Note:</strong> {hardware.note || 'N/A'}</p>
          {/* เพิ่ม field อื่นๆ ตามต้องการ */}
        </div>
        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}