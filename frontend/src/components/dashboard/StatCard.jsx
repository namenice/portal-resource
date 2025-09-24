// src/components/dashboard/StatCard.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function StatCard({ title, value, icon, className }) {
  return (
    <motion.div
      className={`p-6 bg-white rounded-xl shadow-lg flex items-center space-x-4 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex-shrink-0">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-500">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-gray-500 text-sm">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </motion.div>
  );
}