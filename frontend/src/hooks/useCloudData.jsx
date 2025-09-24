// hooks/useCloudData.js
import { useState, useMemo } from 'react';
import { hardwareData as mockHardwareData } from '../data/mockData';

export const useCloudData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredData = useMemo(() => {
    return mockHardwareData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return {
    hardwareData: mockHardwareData,
    filteredData,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory
  };
};
