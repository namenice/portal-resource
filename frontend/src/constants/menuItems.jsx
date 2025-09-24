import { Home, Package, Folder, Server, Building, MapPin, Map, HardDrive, Cable, Network, Wifi, Box, Tag, BoxSelect, ListChecks, Shield, Users } from 'lucide-react';

export const menuItems = [
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: <Home className="w-5 h-5" />, 
    badge: null
  },
  { 
    id: 'infrastructure', 
    label: 'Infrastructure', 
    icon: <Building className="w-5 h-5" />,
    badge: null,
    subItems: [
      { id: 'sites', label: 'Sites', icon: <MapPin className="w-4 h-4" /> },
      { id: 'locations', label: 'Locations', icon: <Map className="w-4 h-4" /> },
      { id: 'hardware', label: 'Hardware', icon: <HardDrive className="w-4 h-4" /> },
      { id: 'switches', label: 'Switches', icon: <Cable className="w-4 h-4" /> }
    ]
  },
  { 
    id: 'inventory', 
    label: 'Inventory', 
    icon: <Box className="w-5 h-5" />,
    badge: null,
    subItems: [
      { id: 'vendors', label: 'Vendors', icon: <Tag className="w-4 h-4" /> },
      { id: 'hardwaretypes', label: 'Hardware Types', icon: <HardDrive className="w-4 h-4" /> },
      { id: 'hardwaremodels', label: 'Hardware Models', icon: <BoxSelect className="w-4 h-4" /> },
      { id: 'hardwarestatuses', label: 'Hardware Statuses', icon: <ListChecks className="w-4 h-4" /> },
      { id: 'projects', label: 'Projects', icon: <Folder className="w-4 h-4" /> },
      { id: 'clusters', label: 'Clusters', icon: <Server className="w-4 h-4" /> }
    ]
  },
  { 
    id: 'network', 
    label: 'Network', 
    icon: <Network className="w-5 h-5" />,
    badge: { count: 1, type: 'error' },
    subItems: [
      { id: 'd3hardwaretopology', label: 'Hardware Topology', icon: <Cable className="w-4 h-4" /> },
      { id: 'network_interfaces', label: 'Network Interfaces', icon: <Wifi className="w-4 h-4" /> }
    ]
  },
  { 
    id: 'administration', 
    label: 'Administration', 
    icon: <Shield className="w-5 h-5" />,
    badge: { count: 2, type: 'warning' },
    subItems: [
      { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> }
    ]
  },
];
