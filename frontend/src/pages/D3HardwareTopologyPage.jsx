// src/pages/D3HardwareTopologyPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import D3Topology from '../components/D3HardwareTopology/D3Topology.jsx';
import { useTopologyData } from '../hooks/d3hardwaretopology/useTopologyData.jsx';
import '../components/D3HardwareTopology/D3Topology.css';

export default function D3HardwareTopologyPage() {
  const [startNode, setStartNode] = useState('site');
  const [endNode, setEndNode] = useState('hardware');
  const [searchTerm, setSearchTerm] = useState('');
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const { nodes, links, isLoading, isError, error } = useTopologyData(startNode, endNode);

  // Filter nodes based on search term
  const filteredNodes = nodes.filter(node => 
    node.label.toLowerCase().includes(searchTerm.toLowerCase()) && searchTerm.length > 0
  );

  const getEndNodeOptions = () => {
    const nodeOrder = { 'site': 1, 'room': 2, 'rack': 3, 'hardware': 4, 'switch': 5 };
    const allOptions = ['room', 'rack', 'hardware', 'switch'];
    const filteredOptions = allOptions.filter(option => nodeOrder[option] > nodeOrder[startNode]);
    
    return filteredOptions.map(option => (
      <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
    ));
  };

  useEffect(() => {
    const validEndNodes = getEndNodeOptions().map(opt => opt.props.value);
    if (!validEndNodes.includes(endNode) && validEndNodes.length > 0) {
      setEndNode(validEndNodes[0]);
    }
  }, [startNode, endNode]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find the matching node ID based on the search term
  const filteredNode = nodes.find(node => 
    node.label.toLowerCase() === searchTerm.toLowerCase()
  );
  const searchNodeId = searchTerm.length > 0 ? (filteredNode ? filteredNode.id : null) : null;

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setHasInteracted(true);
    setShowDropdown(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleSearchFocus = () => {
    if (searchTerm.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredNodes.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredNodes.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredNodes.length) {
          selectNode(filteredNodes[selectedIndex]);
        } else if (filteredNodes.length === 1) {
          selectNode(filteredNodes[0]);
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        searchInputRef.current?.blur();
        break;
    }
  };

  const selectNode = (node) => {
    setSearchTerm(node.label);
    setShowDropdown(false);
    setSelectedIndex(-1);
    setHasInteracted(true);
  };

  const getNodeTypeIcon = (type) => {
    const iconMap = {
      site: '🏢',
      room: '🚪',
      rack: '🖥️',
      hardware: '💽',
      switch: '🔌'
    };
    return iconMap[type] || '📦';
  };

  const getStatusColor = (node) => {
    if (node.type === 'hardware' && node.status) {
      switch (node.status) {
        case 'Active': return 'text-green-600';
        case 'Inactive': return 'text-red-600';
        case 'Maintenance': return 'text-yellow-600';
        default: return 'text-gray-600';
      }
    }
    return 'text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Site Topology</h1>
        <div className="flex space-x-2 items-center">
          {/* Search Input with Dropdown */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by hostname..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleKeyDown}
              className="px-4 py-2 border rounded-md shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoComplete="off"
            />
            
            {/* Dropdown */}
            {showDropdown && filteredNodes.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {filteredNodes.slice(0, 10).map((node, index) => (
                  <div
                    key={node.id}
                    onClick={() => selectNode(node)}
                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-2 ${
                      index === selectedIndex ? 'bg-blue-100' : ''
                    }`}
                  >
                    <span className="text-lg">{getNodeTypeIcon(node.type)}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {node.label}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center space-x-2">
                        <span className="capitalize">{node.type}</span>
                        {node.type === 'hardware' && node.status && (
                          <>
                            <span>•</span>
                            <span className={getStatusColor(node)}>{node.status}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredNodes.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-t">
                    And {filteredNodes.length - 10} more results...
                  </div>
                )}
              </div>
            )}
            
            {/* No results message */}
            {showDropdown && searchTerm.length > 0 && filteredNodes.length === 0 && (
              <div 
                ref={dropdownRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
              >
                <div className="px-4 py-2 text-gray-500 text-sm">
                  No results found for "{searchTerm}"
                </div>
              </div>
            )}
          </div>
          
          <span className="text-gray-600">Start from:</span>
          <select
            onChange={(e) => setStartNode(e.target.value)}
            value={startNode}
            className="px-4 py-2 border rounded-md shadow-sm bg-gray-100 hover:bg-gray-200"
          >
            <option value="site">Site</option>
            <option value="room">Room</option>
            <option value="rack">Rack</option>
            <option value="hardware">Hardware</option>
            <option value="switch">Switch</option>
          </select>
          <span className="text-gray-600">to:</span>
          <select
            onChange={(e) => setEndNode(e.target.value)}
            value={endNode}
            className="px-4 py-2 border rounded-md shadow-sm bg-gray-100 hover:bg-gray-200"
          >
              {getEndNodeOptions()}
          </select>
        </div>
      </div>

      {isLoading && <div className="text-gray-500">Loading topology data...</div>}
      {isError && <div className="text-red-500">Error: {error.message}</div>}

      {!isLoading && !isError && (
        <>
          {/* Search Results Info */}
          {searchTerm && (
            <div className="mb-4 text-sm text-gray-600">
              {filteredNode ? (
                <span className="text-green-600">✓ Found: {filteredNode.label} ({filteredNode.type})</span>
              ) : (
                <span className="text-red-600">✗ No exact match found for "{searchTerm}"</span>
              )}
            </div>
          )}
          
          <D3Topology 
            nodes={nodes} 
            links={links} 
            searchNodeId={searchNodeId} 
            hasInteracted={hasInteracted} 
          />
        </>
      )}
    </div>
  );
}