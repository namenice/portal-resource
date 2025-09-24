// src/components/D3HardwareTopology/iconGenerator.js
import ReactDOMServer from 'react-dom/server';
import {
  Building,
  DoorOpen,
  Server,
  HardDrive,
  Cable
} from 'lucide-react';

const iconMap = {
  site: Building,
  room: DoorOpen,
  rack: Server,
  hardware: HardDrive,
  switch: Cable,
};

export const getIconSvg = (type, status = null) => {
  const IconComponent = iconMap[type];
  if (!IconComponent) return null;

  let color = '#7f7f7f';
  if (type === 'site') color = '#1f77b4';
  if (type === 'room') color = '#2ca02c';
  if (type === 'rack') color = '#ff7f0e';
  if (type === 'switch') color = '#9467bd';
  if (type === 'hardware') {
    if (status === 'Active') color = '#11c471';
    else if (status === 'Inactive') color = '#d62728';
    else if (status === 'Maintenance') color = '#e377c2';
  }

  return ReactDOMServer.renderToStaticMarkup(
    <IconComponent size={24} color={color} />
  );
};