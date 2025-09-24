// data/mockData.js
import { Server, Cpu, HardDrive, Network, Package, Folder, Building, MapPin, Map, Cable, Box, Tag, BoxSelect, ListChecks, Home, Shield, Users, Wifi, CheckCircle } from 'lucide-react';
import React from 'react';

export const hardwareData = [
  {
    id: 'srv-001',
    name: 'Web Server 01',
    type: 'Virtual Machine',
    category: 'compute',
    status: 'active',
    location: 'us-east-1a',
    cpu: '4 vCPU',
    memory: '16 GB RAM',
    storage: '100 GB SSD',
    uptime: '99.9%',
    lastUpdate: '2 hours ago'
  },
  {
    id: 'srv-002',
    name: 'Database Server',
    type: 'RDS Instance',
    category: 'database',
    status: 'active',
    location: 'us-east-1b',
    cpu: '8 vCPU',
    memory: '32 GB RAM',
    storage: '500 GB SSD',
    uptime: '99.8%',
    lastUpdate: '1 hour ago'
  },
  {
    id: 'lb-001',
    name: 'Load Balancer',
    type: 'Application LB',
    category: 'network',
    status: 'active',
    location: 'us-east-1',
    cpu: '2 vCPU',
    memory: '4 GB RAM',
    storage: '20 GB SSD',
    uptime: '100%',
    lastUpdate: '30 minutes ago'
  },
  {
    id: 'srv-003',
    name: 'Backup Server',
    type: 'EC2 Instance',
    category: 'storage',
    status: 'maintenance',
    location: 'us-west-2a',
    cpu: '2 vCPU',
    memory: '8 GB RAM',
    storage: '1 TB HDD',
    uptime: '98.5%',
    lastUpdate: '3 hours ago'
  },
  {
    id: 'srv-004',
    name: 'API Gateway',
    type: 'API Gateway',
    category: 'network',
    status: 'warning',
    location: 'us-east-1',
    cpu: '1 vCPU',
    memory: '2 GB RAM',
    storage: '10 GB SSD',
    uptime: '99.2%',
    lastUpdate: '15 minutes ago'
  }
];

export const stats = [
  {
    title: 'Total Instances',
    value: '24',
    icon: <Server className="w-6 h-6" />,
    change: '+2',
    changeType: 'positive'
  },
  {
    title: 'Active Resources',
    value: '18',
    icon: <CheckCircle className="w-6 h-6" />,
    change: '75%',
    changeType: 'neutral'
  },
  {
    title: 'CPU Usage',
    value: '68%',
    icon: <Cpu className="w-6 h-6" />,
    change: '+5%',
    changeType: 'warning'
  },
  {
    title: 'Storage Used',
    value: '2.1 TB',
    icon: <HardDrive className="w-6 h-6" />,
    change: '+12%',
    changeType: 'positive'
  }
];
