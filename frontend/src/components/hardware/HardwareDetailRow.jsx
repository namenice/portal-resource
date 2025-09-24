// src/components/shared/HardwareDetailRow.jsx
import React from 'react';
import { Tag, MapPin, Server, Network, Layers, Info, Calendar, Usb, GitCommit, HardDrive, Folder, Box } from 'lucide-react';

const DetailCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="flex items-center mb-4">
      {icon}
      <h4 className="text-xl font-semibold text-gray-800 ml-2">{title}</h4>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start text-sm text-gray-600">
    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-gray-500 mr-2">
      {icon}
    </div>
    <div className="flex-1">
      <strong className="text-gray-900">{label}:</strong>
      <span className="ml-2 font-medium text-gray-700 break-words">{value || 'N/A'}</span>
    </div>
  </div>
);

export default function HardwareDetailRow({ hardware }) {
  if (!hardware) return null;

  return (
    <div className="bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* General & Asset Info Card */}
        <DetailCard title="General Info" icon={<Info className="w-6 h-6 text-indigo-600" />}>
          <DetailItem icon={<Tag />} label="Hostname" value={hardware.hostname} />
          <DetailItem icon={<Server />} label="IPMI" value={hardware.ipmi} />
          <DetailItem icon={<Usb />} label="Serial" value={hardware.serial} />
          <DetailItem icon={<GitCommit />} label="Owner" value={hardware.owner} />
          <DetailItem icon={<HardDrive />} label="Type" value={hardware.type?.name} />
          <DetailItem icon={<Box />} label="Model" value={`${hardware.model?.brand} ${hardware.model?.model}`} />
          <DetailItem icon={<Calendar />} label="Last Updated" value={hardware.updated_at ? new Date(hardware.updated_at).toLocaleString() : 'N/A'} />
        </DetailCard>

        {/* Location & Cluster Card */}
        <DetailCard title="Location & Cluster" icon={<MapPin className="w-6 h-6 text-green-600" />}>
          <DetailItem icon={<MapPin />} label="Site" value={hardware.location?.site_name} />
          <DetailItem icon={<MapPin />} label="Room" value={hardware.location?.room} />
          <DetailItem icon={<MapPin />} label="Rack" value={hardware.location?.rack} />
          <DetailItem icon={<MapPin />} label="Unit Range" value={hardware.unit_range} />
          <DetailItem icon={<Layers />} label="Cluster" value={hardware.cluster?.name} />
          <DetailItem icon={<Folder />} label="Project" value={hardware.cluster?.project?.name} />
        </DetailCard>

        {/* Network Interfaces Card */}
        <DetailCard title="Network Interfaces" icon={<Network className="w-6 h-6 text-blue-600" />}>
          {hardware.network_interfaces && hardware.network_interfaces.length > 0 ? (
            hardware.network_interfaces.map((intf) => (
              <div key={intf.id} className="border-l-4 pl-4 border-blue-200">
                <p className="text-sm font-semibold text-gray-800">{intf.interface_name || 'N/A'}</p>
                <p className="text-xs text-gray-600">IP: {intf.ip_address || 'N/A'}{intf.netmask || 'N/A'}</p>
                <p className="text-xs text-gray-600">GW: {intf.gateway || 'N/A'}</p>
                <p className="text-xs text-gray-600">MAC: {intf.mac_address || 'N/A'}</p>
                <p className="text-xs text-gray-600">VLAN: {intf.vlan || 'N/A'}</p>
                {intf.description && <p className="text-xs text-gray-600">Desc: {intf.description}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600">No network interfaces found.</p>
          )}
        </DetailCard>

        <DetailCard title="Switch Connections" icon={<Network className="w-6 h-6 text-blue-600" />}>
          {hardware.switches.length  > 0 ? (
            hardware.switches.map(sw => (
                <li key={sw.id} className="text-sm text-gray-700">
                  <strong>{sw.name || 'N/A'}</strong> - Port: {sw.port || 'N/A'} 
                </li>
            ))
          ) : (
            <p className="text-sm text-gray-600">No Switch found.</p>
          )}
        </DetailCard>

        {/* Specifications Card */}
        <DetailCard title="Specifications" icon={<Box className="w-6 h-6 text-red-600" />}>
        {hardware.specifications?.length ? (

            <p className="text-sm text-gray-700 leading-relaxed">{hardware.specifications}</p>
        ) : (
            <p className="text-sm text-gray-600">Not found.</p>
        )}
        </DetailCard>


        {/* Notes Card */}
        <DetailCard title="Notes" icon={<Info className="w-6 h-6 text-red-600" />}>
        {hardware.note?.length ? (
            <p className="text-sm text-gray-700 leading-relaxed">{hardware.note}</p>
        ) : (
            <p className="text-sm text-gray-600">Not found.</p>
        )}
        </DetailCard>
      </div>
    </div>
  );
}