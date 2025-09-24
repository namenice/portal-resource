-- Use the database
USE resources;

-- Temporarily disable foreign key checks for the entire import process.
SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO users (username, password_hash) VALUES
('admin', 'DUMMY_PASSWORD');

-- 1. Insert data into vendors table
INSERT INTO vendors (name) VALUES
('Dell'),
('HP'),
('Cisco'),
('Juniper'),
('Supermicro'),
('Quanta'),
('Arista'),
('VMware'),
('Red Hat');

-- 2. Insert data into hardware_types table
INSERT INTO hardware_types (name, description) VALUES
('Server', 'General-purpose computing hardware'),
('Network Switch', 'Hardware for network switching'),
('Storage Array', 'Dedicated storage hardware'),
('Firewall', 'Network security hardware'),
('Load Balancer', 'Hardware for distributing network traffic');

-- 3. Insert data into hardware_statuses table
INSERT INTO hardware_statuses (name, description) VALUES
('Active', 'In production use'),
('Inactive', 'Powered down, but ready for use'),
('Maintenance', 'Undergoing maintenance or repair'),
('Decommissioned', 'Retired from service'),
('Pending', 'Waiting for installation or assignment');

-- 4. Insert data into hardware_models table
INSERT INTO hardware_models (brand, model) VALUES
('Dell', 'PowerEdge R740'),
('Dell', 'PowerEdge R640'),
('Cisco', 'Catalyst 9300'),
('Juniper', 'EX4600'),
('Supermicro', 'SYS-6029P-TR'),
('Quanta', 'S9100-32ON'),
('Arista', '7050S-64');

-- 5. Insert data into sites table
INSERT INTO sites (name) VALUES
('Bangkok Data Center'),
('Chiang Mai Office'),
('Singapore HQ');

-- 6. Insert data into projects table
INSERT INTO projects (name, owner, description) VALUES
('Project Alpha', 'Alice', 'Web application hosting infrastructure'),
('Project Beta', 'Bob', 'Big data processing and analytics cluster'),
('Project Gamma', 'Charlie', 'Database servers for internal services');

-- 7. Insert data into clusters table
INSERT INTO clusters (name, project_id, description) VALUES
('Web Cluster 01', 1, 'Cluster for web servers'),
('DB Cluster 01', 1, 'Cluster for databases'),
('Hadoop Cluster 01', 2, 'Hadoop cluster for analytics');

-- 8. Insert data into locations table
INSERT INTO locations (site_id, room, rack) VALUES
(1, 'Server Room A', 'Rack 1'),
(1, 'Server Room A', 'Rack 2'),
(1, 'Server Room B', 'Rack 5'),
(2, 'IT Room 1', 'Rack 1'),
(3, 'Data Center', 'Rack 10');

-- 9. Insert sample hardware data
INSERT INTO hardware (hostname, status_id, ipmi, serial, type_id, model_id, vendor_id, owner, location_id, unit_range, cluster_id) VALUES
('web-server-01', 1, '10.0.0.1', 'SN001', 1, 1, 1, 'Alice', 1, 'U1-U2', 1),
('web-server-02', 1, '10.0.0.2', 'SN002', 1, 2, 1, 'Alice', 1, 'U3-U4', 1),
('db-server-01', 1, '10.0.0.3', 'SN003', 1, 5, 5, 'Charlie', 2, 'U1-U2', 2),
('analytics-node-01', 1, '10.0.0.4', 'SN004', 1, 5, 5, 'Bob', 3, 'U1-U2', 3),
('analytics-node-02', 1, '10.0.0.5', 'SN005', 1, 5, 5, 'Bob', 3, 'U3-U4', 3),
('core-switch-01', 1, '10.0.1.1', 'SN101', 2, 3, 3, 'Network Team', 1, 'U48', NULL),
('edge-switch-01', 1, '10.0.1.2', 'SN102', 2, 4, 4, 'Network Team', 4, 'U24', NULL);

-- Insert initial data into switches table
INSERT INTO switches (name, model_id, vendor_id, location_id, ip_mgmt, note, specifications) VALUES
('Core-Switch-A', 1, 1, 1, '192.168.10.1', 'Main core switch for Data Center A', '48-port 10G SFP+, 4-port 40G QSFP+'),
('Dist-Switch-Bldg-B', 2, 2, 2, '192.168.20.1', 'Distribution switch for Building B', '24-port 1G RJ45, 2-port 10G SFP+'),
('Access-Switch-Office-C1', 3, 3, 3, '192.168.30.1', 'Access switch for Office C, 1st floor', '48-port 1G PoE+, 4-port 1G SFP'),
('Access-Switch-Office-C2', 3, 3, 3, '192.168.30.2', 'Access switch for Office C, 2nd floor', '48-port 1G PoE+, 4-port 1G SFP'),
('Edge-Switch-SR-D', 4, 4, 4, '192.168.40.1', 'Edge switch in Server Room D', '24-port 1G SFP'),
('Warehouse-Switch-E', 5, 5, 5, '192.168.50.1', 'Core switch for Warehouse E network', '32-port 100G QSFP28'),
('Core-Switch-B', 1, 1, 1, '192.168.10.2', 'Secondary core switch in Data Center A', '48-port 10G SFP+, 4-port 40G QSFP+'),
('Dist-Switch-Bldg-B2', 2, 2, 2, '192.168.20.2', 'Second distribution switch for Building B', '24-port 1G RJ45, 2-port 10G SFP+'),
('Access-Switch-Office-C3', 3, 3, 3, '192.168.30.3', 'Access switch for Office C, 3rd floor', '48-port 1G PoE+, 4-port 1G SFP'),
('Edge-Switch-SR-D2', 4, 4, 4, '192.168.40.2', 'Secondary edge switch in Server Room D', '24-port 1G SFP');

-- 10. Insert sample switch connection data
INSERT INTO switch_connections (hardware_id, switch_id, port) VALUES
(1, 6, 'Gi1/0/1'),
(2, 6, 'Gi1/0/2'),
(3, 7, 'Gi1/0/1'),
(4, 7, 'Gi1/0/2'),
(1, 1, 'Gi1/0/1'),
(2, 2, 'Gi1/0/2'),
(3, 3, 'Gi1/0/1'),
(4, 4, 'Gi1/0/2');

-- 11. Insert sample network interface data
INSERT INTO network_interfaces (hardware_id, interface_name, ip_address, netmask, gateway, mac_address, vlan, is_primary) VALUES
(1, 'eth0', '192.168.1.10', '/24', '192.168.1.1', 'AA:BB:CC:DD:EE:F1', 'VLAN10', TRUE),
(1, 'eth1', '192.168.2.10', '/24', '192.168.2.1', 'AA:BB:CC:DD:EE:F2', 'VLAN20', FALSE),
(2, 'eth0', '192.168.1.11', '/24', '192.168.1.1', 'AA:BB:CC:DD:EE:F3', 'VLAN10', TRUE),
(3, 'eth0', '192.168.3.10', '/24', '192.168.3.1', 'AA:BB:CC:DD:EE:F4', 'VLAN30', TRUE),
(4, 'eth0', '192.168.4.10', '/24', '192.168.4.1', 'AA:BB:CC:DD:EE:F5', 'VLAN40', TRUE),
(5, 'eth0', '192.168.4.11', '/24', '192.168.4.1', 'AA:BB:CC:DD:EE:F6', 'VLAN40', TRUE);

-- Re-enable foreign key checks at the very end of the script.
SET FOREIGN_KEY_CHECKS = 1;