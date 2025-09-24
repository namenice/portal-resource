// src/components/shared/SitesTable.jsx

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function SitesTable({ data, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Sites List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site Name
                </th>
                {/* 🚨 แก้ไขตรงนี้: เปลี่ยน text-left เป็น text-center */}
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map(site => (
                <tr key={site.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{site.name}</td>
                  {/* 🚨 แก้ไขตรงนี้: เปลี่ยน text-right เป็น text-center */}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button 
                      onClick={() => onEdit(site)} 
                      className="text-gray-600 hover:text-gray-900 p-1 mr-2"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onDelete(site.id)} 
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="py-4 text-center text-gray-500">No sites found.</div>
        )}
      </div>
    </div>
  );
}