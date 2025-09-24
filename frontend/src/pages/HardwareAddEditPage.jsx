import React, { useState, useEffect } from 'react';
import { X, Server, HardDrive, Cpu, Layers, MapPin, Network, Info, Plus, Trash2, Tag, Calendar, Usb, ArrowLeft, ArrowRight } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { authenticatedFetch } from '../services/api.jsx';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddEditHardwarePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        hostname: '',
        ipmi: '',
        serial: '',
        owner: '',
        note: '',
        specifications: '',
        unit_range: '',
        status_id: '',
        type_id: '',
        model_id: '',
        vendor_id: '',
        brand_name: '',
        location_id: '',
        site_id: '',
        room_name: '',
        project_id: '',
        cluster_id: '',
        network_interfaces: [],
        switches: [],
    });
    const [isSaving, setIsSaving] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    
    // ลบ state 'popup' ออก เพราะเราจะใช้ React-Toastify แทน
    // const [popup, setPopup] = useState({ message: '', type: '', visible: false }); 
    
    const [dropdownOptions, setDropdownOptions] = useState({
        statuses: [], types: [], vendors: [], models: [], locations: [], projects: [], clusters: [], switches: [], sites: [], brands: []
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const [
                    statusesRes, typesRes, vendorsRes, modelsRes, locationsRes, projectsRes, clustersRes, switchesRes, sitesRes
                ] = await Promise.all([
                    authenticatedFetch('hardwarestatus'),
                    authenticatedFetch('hardwaretypes'),
                    authenticatedFetch('vendors'),
                    authenticatedFetch('hardwaremodels'),
                    authenticatedFetch('locations'),
                    authenticatedFetch('projects'),
                    authenticatedFetch('clusters'),
                    authenticatedFetch('switches'),
                    authenticatedFetch('sites'),
                ]);

                const [
                    statusesData, typesData, vendorsData, modelsData, locationsData, projectsData, clustersData, switchesData, sitesData
                ] = await Promise.all([
                    statusesRes.json(), typesRes.json(), vendorsRes.json(), modelsRes.json(), locationsRes.json(), projectsRes.json(), clustersRes.json(), switchesRes.json(), sitesRes.json()
                ]);

                const uniqueBrands = [...new Set(modelsData.data.map(model => model.brand))].map(brandName => ({ id: brandName, name: brandName }));

                setDropdownOptions({
                    statuses: statusesData.data || [],
                    types: typesData.data || [],
                    vendors: vendorsData.data || [],
                    models: modelsData.data || [],
                    locations: locationsData.data || [],
                    projects: projectsData.data || [],
                    clusters: clustersData.data || [],
                    switches: switchesData.data || [],
                    sites: sitesData.data || [],
                    brands: uniqueBrands
                });

                if (id) {
                    setIsEditMode(true);
                    const hardwareRes = await authenticatedFetch(`hardwares/${id}`);
                    const hardwareData = await hardwareRes.json();
                    
                    if (hardwareData.data) {
                        const currentLocation = locationsData.data.find(
                            loc => loc.id === hardwareData.data.location?.id
                        );
                        
                        setFormData({
                            ...hardwareData.data,
                            status_id: hardwareData.data.status?.id?.toString() || '',
                            type_id: hardwareData.data.type?.id?.toString() || '',
                            model_id: hardwareData.data.model?.id?.toString() || '',
                            vendor_id: hardwareData.data.vendor?.id?.toString() || '',
                            brand_name: hardwareData.data.model?.brand || '',
                            location_id: hardwareData.data.location?.id?.toString() || '',
                            site_id: currentLocation?.site_id?.toString() || '',
                            room_name: currentLocation?.room || '',
                            project_id: hardwareData.data.cluster?.project?.id?.toString() || '',
                            cluster_id: hardwareData.data.cluster?.id?.toString() || '',
                            network_interfaces: hardwareData.data.network_interfaces || [],
                            switches: hardwareData.data.switches || [],
                            specifications: hardwareData.data.specifications || '',
                            note: hardwareData.data.note || '',
                        });
                    }
                }
            } catch (e) {
                // เปลี่ยนไปใช้ toast.error()
                toast.error('Failed to fetch data: ' + e.message);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                if (event.target.tagName !== 'TEXTAREA') {
                    event.preventDefault();
                    document.getElementById('save-button').click();
                }
            } else if (event.key === 'Escape') {
                event.preventDefault();
                navigate('/hardware');
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "location_id") {
            const selectedLocation = dropdownOptions.locations.find(loc => loc.id.toString() === value);
            setFormData(prev => ({
                ...prev,
                location_id: value,
                site_id: selectedLocation ? selectedLocation.site_id.toString() : "",
                room_name: selectedLocation ? selectedLocation.room : ""
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleArrayChange = (index, field, value, arrayName) => {
        setFormData(prev => {
            const newArray = [...prev[arrayName]];
            const currentItem = newArray[index] || {};
            newArray[index] = { 
                ...currentItem, 
                [field]: field === 'is_primary' ? (value ? 1 : 0) : value 
            };
            return { ...prev, [arrayName]: newArray };
        });
    };

    const addItem = (arrayName, defaultItem) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: [...prev[arrayName], defaultItem],
        }));
    };

    const removeItem = (index, arrayName) => {
        setFormData(prev => ({
            ...prev,
            [arrayName]: prev[arrayName].filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const method = isEditMode ? 'PUT' : 'POST';
            const url = isEditMode ? `hardwares/${id}` : 'hardwares';

            const cleanedFormData = {
                ...Object.fromEntries(
                    Object.entries(formData).map(([key, value]) => [
                        key,
                        value === '' ? null : value
                    ])
                ),
                network_interfaces: formData.network_interfaces.map(intf => ({
                    id: intf.id || undefined,
                    interface_name: intf.interface_name || null,
                    ip_address: intf.ip_address || null,
                    netmask: intf.netmask || null,
                    gateway: intf.gateway || null,
                    mac_address: intf.mac_address || null,
                    vlan: intf.vlan || null,
                    description: intf.description || null,
                    is_primary: intf.is_primary ? 1 : 0
                })),
                switches: formData.switches.map(sw => ({
                    id: sw.id || undefined,
                    port: sw.port || null
                }))
            };
            
            const response = await authenticatedFetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cleanedFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save hardware.');
            }

            // เปลี่ยนไปใช้ toast.success()
            toast.success('Hardware saved successfully!');
            
            // ลบ setTimeout ออก เพราะ React-Toastify ไม่บล็อกการทำงาน
            navigate('/hardware');

        } catch (err) {
            // เปลี่ยนไปใช้ toast.error()
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loadingData) {
        return <div className="p-8 text-center text-gray-500">Loading...</div>;
    }

    const filteredClusters = dropdownOptions.clusters.filter(
        cluster => cluster.project_id?.toString() === formData.project_id
    );

    const rooms = [...new Set(dropdownOptions.locations
        .filter(loc => loc.site_id?.toString() === formData.site_id)
        .map(loc => loc.room))]
        .map(room => ({ id: room, name: room }));

    const racks = dropdownOptions.locations
        .filter(loc => 
            loc.site_id?.toString() === formData.site_id &&
            loc.room === formData.room_name
        )
        .map(loc => ({
            id: loc.id,
            name: loc.rack
        }));

    const filteredModels = dropdownOptions.models.filter(
        model => model.brand === formData.brand_name
    ).map(model => ({
        id: model.id,
        name: `${model.brand} - ${model.model}`
    }));

    const breadcrumbItems = [
        { label: 'Hardware', path: '/hardware' },
        { label: isEditMode ? `Edit: ${formData.hostname}` : 'Add New', path: isEditMode ? `/hardware/edit/${id}` : '/hardware/add' }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto font-sans">
            {/* เพิ่ม ToastContainer เข้ามาที่นี่ */}
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <nav className="text-gray-600 mb-6" aria-label="breadcrumb">
                <ol className="list-none p-0 inline-flex">
                    {breadcrumbItems.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <Link to={item.path} className={`hover:text-gray-800 ${index === breadcrumbItems.length - 1 ? 'text-gray-900 font-semibold' : ''}`}>
                                {item.label}
                            </Link>
                            {index < breadcrumbItems.length - 1 && (
                                <span className="mx-2 text-gray-400">/</span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">
                {isEditMode ? 'Edit Hardware' : 'Add New Hardware'}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                        <Info className="w-6 h-6 mr-3 text-blue-500" /> General Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <InputGroup label="Hostname" name="hostname" value={formData.hostname} onChange={handleChange} required />
                        <InputGroup label="Serial" name="serial" value={formData.serial} onChange={handleChange} />
                        <InputGroup label="IPMI" name="ipmi" value={formData.ipmi} onChange={handleChange} />
                        <InputGroup label="Owner" name="owner" value={formData.owner} onChange={handleChange} />
                        <SelectGroup label="Status" name="status_id" value={formData.status_id} onChange={handleChange} options={dropdownOptions.statuses} />
                        <SelectGroup label="Type" name="type_id" value={formData.type_id} onChange={handleChange} options={dropdownOptions.types} />
                        <SelectGroup label="Brand" name="brand_name" value={formData.brand_name} onChange={handleChange} options={dropdownOptions.brands} />
                        <SelectGroup label="Model" name="model_id" value={formData.model_id} onChange={handleChange} options={filteredModels} disabled={!formData.brand_name} />
                        <SelectGroup label="Vendor" name="vendor_id" value={formData.vendor_id} onChange={handleChange} options={dropdownOptions.vendors} />
                        <SelectGroup label="Project" name="project_id" value={formData.project_id} onChange={handleChange} options={dropdownOptions.projects} />
                        <SelectGroup label="Cluster" name="cluster_id" value={formData.cluster_id} onChange={handleChange} options={filteredClusters} />
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                        <MapPin className="w-6 h-6 mr-3 text-green-500" /> Location Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <SelectGroup label="Site" name="site_id" value={formData.site_id} onChange={handleChange} options={dropdownOptions.sites} />
                        <SelectGroup label="Room" name="room_name" value={formData.room_name} onChange={handleChange} options={rooms} disabled={!formData.site_id} />
                        <SelectGroup label="Rack" name="location_id" value={formData.location_id} onChange={handleChange} options={racks} disabled={!formData.room_name} />
                        <InputGroup label="Unit Range" name="unit_range" value={formData.unit_range} onChange={handleChange} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                        <Network className="w-6 h-6 mr-3 text-red-500" /> Network Interfaces
                    </h2>
                    <div className="space-y-4">
                        {formData.network_interfaces.map((intf, index) => (
                            <div key={intf.id || index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm relative">
                                <button type="button" onClick={() => removeItem(index, 'network_interfaces')} className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <p className="text-base font-semibold mb-2 text-gray-700">Interface #{index + 1}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputGroup label="Interface Name" value={intf.interface_name} onChange={(e) => handleArrayChange(index, 'interface_name', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="IP Address" value={intf.ip_address} onChange={(e) => handleArrayChange(index, 'ip_address', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="Netmask" value={intf.netmask || ''} onChange={(e) => handleArrayChange(index, 'netmask', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="Gateway" value={intf.gateway || ''} onChange={(e) => handleArrayChange(index, 'gateway', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="MAC Address" value={intf.mac_address} onChange={(e) => handleArrayChange(index, 'mac_address', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="VLAN" value={intf.vlan} onChange={(e) => handleArrayChange(index, 'vlan', e.target.value, 'network_interfaces')} />
                                    <InputGroup label="Description" value={intf.description} onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'network_interfaces')} />
                                </div>
                                <div className="flex items-center mt-4">
                                    <input type="checkbox" checked={intf.is_primary === 1} onChange={(e) => handleArrayChange(index, 'is_primary', e.target.checked, 'network_interfaces')} className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                                    <label className="text-sm text-gray-600">Primary Interface</label>
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addItem('network_interfaces', { id: null, interface_name: '', ip_address: '', netmask: '', gateway: '', mac_address: '', vlan: '', description: '', is_primary: 0 })} className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors mt-4">
                            <Plus className="w-4 h-4 mr-1" /> Add Network Interface
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                        <Network className="w-6 h-6 mr-3 text-purple-500" /> Connected Switches
                    </h2>
                    <div className="space-y-4">
                        {formData.switches.map((sw, index) => (
                            <div key={sw.id || index} className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-sm relative">
                                <button type="button" onClick={() => removeItem(index, 'switches')} className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                                <p className="text-base font-semibold mb-2 text-gray-700">Switch #{index + 1}</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SelectGroup label="Switch Name" name="switch_id" value={sw.id || ''} onChange={(e) => handleArrayChange(index, 'id', e.target.value, 'switches')} options={dropdownOptions.switches} />
                                    <InputGroup label="Port" value={sw.port} onChange={(e) => handleArrayChange(index, 'port', e.target.value, 'switches')} />
                                </div>
                            </div>
                        ))}
                        <button type="button" onClick={() => addItem('switches', { id: null, port: '' })} className="flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors mt-4">
                            <Plus className="w-4 h-4 mr-1" /> Add Connected Switch
                        </button>
                    </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 flex items-center mb-6">
                        <Info className="w-6 h-6 mr-3 text-yellow-500" /> Specifications & Notes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Specifications</label>
                            <textarea
                                name="specifications"
                                value={formData.specifications}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                rows="6"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">Notes</label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                                rows="6"
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate('/hardware')}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        id="save-button"
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// InputGroup และ SelectGroup component ไม่ต้องแก้ไข
const InputGroup = ({ label, ...props }) => (
    <div>
        <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
        <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            {...props}
        />
    </div>
);

const SelectGroup = ({ label, options, value, ...props }) => {
    const controlledValue = value === null || value === undefined ? '' : value;

    return (
        <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">{label}</label>
            <select
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                value={controlledValue}
                {...props}
            >
                <option value="">Select a {label.toLowerCase()}</option>
                {options.map(option => (
                    <option key={option.id} value={option.id.toString()}>
                        {option.name || option.brand || `${option.room} - ${option.rack}` || ''}
                    </option>
                ))}
            </select>
        </div>
    );
};