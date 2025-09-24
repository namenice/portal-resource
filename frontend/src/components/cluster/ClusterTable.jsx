// src/components/cluster/ClusterTable.jsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X, GitFork, Edit, Trash2, Search, ArrowDown, ArrowUp, ArrowLeft, ArrowRight
} from 'lucide-react';

export default function ClusterTable({ clusters, onEdit, onDelete }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const suggestionRefs = useRef([]);
  const searchBoxRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  useEffect(() => {
    if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestionRefs.current.length) {
      suggestionRefs.current[activeSuggestionIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeSuggestionIndex]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchFields = useMemo(() => {
    const fields = new Set();
    clusters.forEach(cluster => {
      if (cluster.name) fields.add(cluster.name);
      // แก้ไข: ดึงค่าจาก object project
      if (cluster.project?.project_name) fields.add(cluster.project.project_name);
    });
    return Array.from(fields);
  }, [clusters]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setActiveSuggestionIndex(-1);
    if (query.length > 1) {
      const filteredSuggestions = searchFields
        .filter(field => field.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex(prevIndex =>
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setActiveSuggestionIndex(prevIndex =>
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSuggestionIndex >= 0) {
        addTag(suggestions[activeSuggestionIndex]);
      } else if (searchQuery.trim()) {
        addTag(searchQuery.trim());
      }
      setSearchQuery('');
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    } else if (e.key === 'Escape') {
      setSearchQuery('');
      setSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  const addTag = (tag) => {
    if (!activeTags.includes(tag)) {
      setActiveTags([...activeTags, tag]);
      setCurrentPage(1);
    }
  };

  const removeTag = (tagToRemove) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
    setCurrentPage(1);
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortValue = (cluster, key) => {
    switch (key) {
      case 'name':
        return cluster.name || '';
      // แก้ไข: ดึงค่าจาก object project
      case 'project_name':
        return cluster.project?.project_name || '';
      case 'description':
        return cluster.description || '';
      default:
        return '';
    }
  };

  const sortedClusters = useMemo(() => {
    const filtered = clusters.filter(cluster => {
      if (activeTags.length === 0) {
        return true;
      }
      return activeTags.every(tag => {
        const lowerCaseTag = tag.toLowerCase();
        // แก้ไข: เพิ่ม project_name ในการค้นหา
        const searchables = [cluster.name, cluster.project?.project_name, cluster.description].filter(Boolean).map(val => String(val).toLowerCase());
        return searchables.some(searchable => searchable.includes(lowerCaseTag));
      });
    });

    if (sortConfig.key !== null) {
      filtered.sort((a, b) => {
        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return filtered;
  }, [clusters, activeTags, sortConfig]);

  const indexOfLastCluster = currentPage * rowsPerPage;
  const indexOfFirstCluster = indexOfLastCluster - rowsPerPage;
  const currentClusters = sortedClusters.slice(indexOfFirstCluster, indexOfLastCluster);
  const totalPages = Math.ceil(sortedClusters.length / rowsPerPage);
  const totalResults = sortedClusters.length;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const renderSortArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? (
        <ArrowDown className="inline-block ml-1 w-4 h-4 text-gray-500" />
      ) : (
        <ArrowUp className="inline-block ml-1 w-4 h-4 text-gray-500" />
      );
    }
    return null;
  };

  if (!clusters || clusters.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 bg-gray-100 rounded-lg shadow-inner">
        <p className="text-gray-500 font-medium text-lg">No clusters found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 border-b border-gray-200">
        <form
          ref={searchBoxRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (searchQuery.trim()) addTag(searchQuery.trim());
            setSearchQuery('');
          }}
          className="relative mb-4"
        >
          <div className="relative">
            <input
              type="text"
              ref={searchInputRef}
              placeholder="Search clusters..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  ref={(el) => (suggestionRefs.current[index] = el)}
                  onClick={() => {
                    addTag(suggestion);
                    setSearchQuery('');
                    setSuggestions([]);
                    setActiveSuggestionIndex(-1);
                  }}
                  className={`px-4 py-2 cursor-pointer ${activeSuggestionIndex === index ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </form>
        {activeTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {activeTags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                <span>{tag}</span>
                <button onClick={() => removeTag(tag)} className="ml-2 text-blue-500 hover:text-blue-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                onClick={() => requestSort('name')}
              >
                Name {renderSortArrow('name')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                // แก้ไข: เปลี่ยน key เป็น project_name
                onClick={() => requestSort('project_name')}
              >
                Project {renderSortArrow('project_name')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                onClick={() => requestSort('description')}
              >
                Description {renderSortArrow('description')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentClusters.length > 0 ? (
              currentClusters.map((cluster) => (
                <tr key={cluster.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-100 rounded-lg mr-3">
                        <GitFork className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="text-sm font-medium text-gray-900">{cluster.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* แก้ไข: ดึง project_name จาก object project */}
                    {cluster.project?.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cluster.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEdit(cluster); }}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(cluster); }}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No clusters found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="form-select rounded-md border-gray-300">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div className="text-sm text-gray-600">
          Showing {indexOfFirstCluster + 1} to {Math.min(indexOfLastCluster, totalResults)} of {totalResults} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
}