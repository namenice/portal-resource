// src/components/hardware/HardwareTable.jsx
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    X, Server, HardDrive, Cpu, Layers, MapPin, Network, Info, Plus, Trash2, Tag, Calendar, Usb, ArrowLeft, ArrowRight,
    // เพิ่มการ import component ที่จำเป็นตรงนี้
    Search, Edit, MoreVertical, ArrowDown, ArrowUp
} from 'lucide-react';
import { getStatusColor, getStatusIcon } from '../../utils/statusUtils';
import HardwareDetailRow from './HardwareDetailRow';

export default function HardwareTable({ hardwares, onEdit, onDelete, onRowExpand, expandedRowId }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTags, setActiveTags] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const searchInputRef = useRef(null);
    const suggestionRefs = useRef([]);
    const searchBoxRef = useRef(null);

    // State สำหรับการจัดเรียง
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    // Hook สำหรับเลื่อน scroll ตาม suggestion ที่ active
    useEffect(() => {
        if (
            activeSuggestionIndex >= 0 &&
            activeSuggestionIndex < suggestionRefs.current.length
        ) {
            suggestionRefs.current[activeSuggestionIndex]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }
    }, [activeSuggestionIndex]);

    // Hook สำหรับปิด dropdown เมื่อคลิกนอก search box
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                searchBoxRef.current &&
                !searchBoxRef.current.contains(event.target)
            ) {
                setSuggestions([]);
                setActiveSuggestionIndex(-1);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Memoized list of all searchable fields for suggestions
    const searchFields = useMemo(() => {
        const fields = new Set();
        hardwares.forEach(hardware => {
            if (hardware.hostname) fields.add(hardware.hostname);
            if (hardware.ipmi) fields.add(hardware.ipmi);
            if (hardware.serial) fields.add(hardware.serial);
            if (hardware.owner) fields.add(hardware.owner);
            if (hardware.unit_range) fields.add(hardware.unit_range);
            if (hardware.specifications) fields.add(hardware.specifications);
            if (hardware.note) fields.add(hardware.note);
            
            if (hardware.status?.name) fields.add(hardware.status.name);
            if (hardware.type?.name) fields.add(hardware.type.name);
            if (hardware.model?.brand) fields.add(hardware.model.brand);
            if (hardware.model?.model) fields.add(hardware.model.model);
            if (hardware.vendor?.name) fields.add(hardware.vendor.name);
            if (hardware.location?.site_name) fields.add(hardware.location.site_name);
            if (hardware.location?.room) fields.add(hardware.location.room);
            if (hardware.location?.rack) fields.add(hardware.location.rack);
            if (hardware.cluster?.name) fields.add(hardware.cluster.name);
            if (hardware.cluster?.project?.name) fields.add(hardware.cluster.project.name);

            if (hardware.switches && hardware.switches.length > 0) {
                hardware.switches.forEach(sw => {
                    if (sw.name) fields.add(sw.name);
                    if (sw.ip_mgmt) fields.add(sw.ip_mgmt);
                    if (sw.port) fields.add(sw.port);
                });
            }
            if (hardware.network_interfaces && hardware.network_interfaces.length > 0) {
                hardware.network_interfaces.forEach(ni => {
                    if (ni.interface_name) fields.add(ni.interface_name);
                    if (ni.ip_address) fields.add(ni.ip_address);
                    if (ni.mac_address) fields.add(ni.mac_address);
                    if (ni.vlan) fields.add(ni.vlan);
                });
            }
        });
        return Array.from(fields);
    }, [hardwares]);

    // Handle search input change
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

    // Handle keydown events in search input for navigation
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

    // Add a search tag
    const addTag = (tag) => {
        if (!activeTags.includes(tag)) {
            setActiveTags([...activeTags, tag]);
            setCurrentPage(1);
        }
    };

    // Remove a search tag
    const removeTag = (tagToRemove) => {
        setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
        setCurrentPage(1);
    };

    // Function to handle sort request
    const requestSort = (key) => {
        let direction = 'ascending';
        if (
            sortConfig.key === key &&
            sortConfig.direction === 'ascending'
        ) {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Helper function to get nested values for sorting
    // ⚠️ This function MUST be defined BEFORE sortedHardwares useMemo
    const getSortValue = (hardware, key) => {
        switch (key) {
            case 'hostname':
                return hardware.hostname || '';
            case 'model':
                return hardware.model?.model || '';
            case 'status':
                return hardware.status?.name || '';
            case 'site_name':
                return hardware.location?.site_name || '';
            case 'rack_unit':
                return `${hardware.location?.rack || ''}${hardware.unit_range || ''}`;
            case 'serial':
                return hardware.serial || '';
            case 'updated_at':
                return new Date(hardware.updated_at).getTime() || 0;
            default:
                return '';
        }
    };

    // Memoized and sorted list of hardwares based on filters and sort config
    const sortedHardwares = useMemo(() => {
        const filtered = hardwares.filter(hardware => {
            if (activeTags.length === 0) {
                return true;
            }
            return activeTags.every(tag => {
                const lowerCaseTag = tag.toLowerCase();
                const searchables = [
                    hardware.hostname,
                    hardware.ipmi,
                    hardware.serial,
                    hardware.owner,
                    hardware.specifications,
                    hardware.note,
                    hardware.unit_range,
                    hardware.status?.name,
                    hardware.type?.name,
                    hardware.model?.brand,
                    hardware.model?.model,
                    hardware.vendor?.name,
                    hardware.location?.site_name,
                    hardware.location?.room,
                    hardware.location?.rack,
                    hardware.cluster?.name,
                    hardware.cluster?.project?.name,
                ].filter(Boolean).map(val => String(val).toLowerCase());

                if (hardware.switches && hardware.switches.length > 0) {
                    hardware.switches.forEach(sw => {
                        searchables.push(sw.name?.toLowerCase(), sw.ip_mgmt?.toLowerCase(), sw.port?.toLowerCase());
                    });
                }
                if (hardware.network_interfaces && hardware.network_interfaces.length > 0) {
                    hardware.network_interfaces.forEach(ni => {
                        searchables.push(ni.interface_name?.toLowerCase(), ni.ip_address?.toLowerCase(), ni.mac_address?.toLowerCase(), ni.vlan?.toLowerCase());
                    });
                }
                
                return searchables.some(searchable => searchable.includes(lowerCaseTag));
            });
        });

        if (sortConfig.key !== null) {
            filtered.sort((a, b) => {
                const aValue = getSortValue(a, sortConfig.key);
                const bValue = getSortValue(b, sortConfig.key);

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
    }, [hardwares, activeTags, sortConfig]);

    // Pagination logic
    const indexOfLastHardware = currentPage * rowsPerPage;
    const indexOfFirstHardware = indexOfLastHardware - rowsPerPage;
    const currentHardwares = sortedHardwares.slice(indexOfFirstHardware, indexOfLastHardware);
    const totalPages = Math.ceil(sortedHardwares.length / rowsPerPage);
    const totalResults = sortedHardwares.length;

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

    // Render sort arrow based on current sort config
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

    if (!hardwares || hardwares.length === 0) {
        return (
            <div className="flex justify-center items-center h-40 bg-gray-100 rounded-lg shadow-inner">
                <p className="text-gray-500 font-medium text-lg">No hardware found.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md">
            {/* Search Bar and Tags Section */}
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
                            placeholder="Search hardware..."
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
                                onClick={() => requestSort('hostname')}
                            >
                                Name
                                {renderSortArrow('hostname')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('model')}
                            >
                                Model
                                {renderSortArrow('model')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('status')}
                            >
                                Status
                                {renderSortArrow('status')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('site_name')}
                            >
                                IDC
                                {renderSortArrow('site_name')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('rack_unit')}
                            >
                                Location
                                {renderSortArrow('rack_unit')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('serial')}
                            >
                                Serial
                                {renderSortArrow('serial')}
                            </th>
                            <th
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                                onClick={() => requestSort('updated_at')}
                            >
                                Last Update
                                {renderSortArrow('updated_at')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {currentHardwares.length > 0 ? (
                            currentHardwares.map((hardware) => (
                                <React.Fragment key={hardware.id}>
                                    <tr
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => onRowExpand(hardware.id)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-gray-100 rounded-lg mr-3">
                                                    <Server className="w-4 h-4 text-gray-600" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{hardware.hostname}</div>
                                                    <div className="text-sm text-gray-500">{hardware.ipmi}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{hardware.model?.brand}</div>
                                            <div className="text-sm text-gray-500">{hardware.model?.model}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(hardware.status?.id)}`}>
                                                <span className="mr-1">{getStatusIcon(hardware.status?.id)}</span>
                                                {hardware.status?.name || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="text-sm font-medium text-gray-900">Site: {hardware.location?.site_name}</div>
                                            <div className="text-sm text-gray-500">Room: {hardware.location?.room}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="text-sm font-medium text-gray-900">Rack: {hardware.location?.rack}</div>
                                            <div className="text-sm text-gray-500">U: {hardware.unit_range}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-900">
                                                <div>{hardware.serial}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(hardware.updated_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onEdit(hardware); }}
                                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDelete(hardware.id); }}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onRowExpand(hardware.id); }}
                                                    className={`text-gray-400 hover:text-gray-600 transition-colors transform ${expandedRowId === hardware.id ? 'rotate-180' : ''}`}
                                                >
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedRowId === hardware.id && (
                                        <tr>
                                            <td colSpan="8" className="p-0">
                                                <HardwareDetailRow hardware={hardware} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                                    No hardware found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
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
                    Showing {indexOfFirstHardware + 1} to {Math.min(indexOfLastHardware, totalResults)} of {totalResults} results
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