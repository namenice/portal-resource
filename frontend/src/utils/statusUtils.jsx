// // utils/statusUtils.js
// import { AlertTriangle, CheckCircle, Clock, Power } from 'lucide-react';
// import React from 'react';

// export const getStatusColor = (status) => {
//   switch (status) {
//     case 'active': return 'bg-green-100 text-green-800 border-green-200';
//     case 'maintenance': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
//     case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
//     case 'offline': return 'bg-red-100 text-red-800 border-red-200';
//     default: return 'bg-gray-100 text-gray-800 border-gray-200';
//   }
// };

// export const getStatusIcon = (status) => {
//   switch (status) {
//     case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
//     case 'maintenance': return <Clock className="w-4 h-4 text-yellow-600" />;
//     case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-600" />;
//     case 'offline': return <Power className="w-4 h-4 text-red-600" />;
//     default: return <Clock className="w-4 h-4 text-gray-600" />;
//   }
// };

// src/utils/statusUtils.jsx

import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const getStatusColor = (statusId) => {
  switch (statusId) {
    case 1: // Active status ID
      return 'bg-green-100 text-green-800 border-green-200';
    case 2: // Inactive status ID
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
};

export const getStatusIcon = (statusId) => {
  switch (statusId) {
    case 1:
      return <CheckCircle className="w-3 h-3" />;
    case 2:
      return <XCircle className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};