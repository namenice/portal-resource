// components/shared/StatsCard.js
import React from 'react';

export default function StatsCard({ title, value, icon, change, changeType }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            {icon}
          </div>
        </div>
        <div className={`text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600' : 
          changeType === 'warning' ? 'text-orange-600' : 'text-gray-600'
        }`}>
          {change}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm text-gray-600 mt-1">{title}</p>
      </div>
    </div>
  );
}