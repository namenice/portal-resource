// src/hooks/d3hardwaretopology/useTopologyData.jsx
import { useQuery } from 'react-query';
import * as d3 from 'd3';
import { authenticatedFetch } from '../../services/api.jsx';

// กำหนดลำดับของ nodes
const nodeOrder = { 'site': 1, 'room': 2, 'rack': 3, 'hardware': 4, 'switch': 5 };

const fetchAndProcessData = async () => {
  const response = await authenticatedFetch('hardwares');
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const responseData = await response.json();
  if (!responseData || !Array.isArray(responseData.data)) {
    throw new Error('API response format is incorrect.');
  }

  const hardwares = responseData.data;
  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  d3.group(hardwares, d => d.location.site_name)
    .forEach((siteData, siteName) => {
      const siteId = `site-${siteName}`;
      nodes.push({ id: siteId, label: siteName, type: "site" });

      d3.group(siteData, d => d.location.room)
        .forEach((roomData, roomName) => {
          const roomId = `room-${siteName}-${roomName}`;
          nodes.push({ id: roomId, label: roomName, type: "room" });
          links.push({ source: siteId, target: roomId, type: "hierarchy" });

          d3.group(roomData, d => d.location.rack)
            .forEach((rackData, rackName) => {
              const rackId = `rack-${siteName}-${roomName}-${rackName}`;
              nodes.push({ id: rackId, label: rackName, type: "rack" });
              links.push({ source: roomId, target: rackId, type: "hierarchy" });

              rackData.forEach(hw => {
                const hardwareId = `hw-${hw.id}`;
                nodes.push({
                  id: hardwareId,
                  label: hw.hostname,
                  type: "hardware",
                  status: hw.status.name,
                  data: hw
                });
                links.push({ source: rackId, target: hardwareId, type: "hierarchy" });

                hw.switches.forEach(sw => {
                  const switchId = `sw-${sw.id}`;
                  if (!nodeMap.has(switchId)) {
                    nodes.push({
                      id: switchId,
                      label: sw.name,
                      type: "switch",
                      data: sw
                    });
                    nodeMap.set(switchId, true);
                  }
                  links.push({ source: hardwareId, target: switchId, type: "network" });
                });
              });
            });
        });
    });

  return { nodes, links };
};

const filterTopologyData = (data, startNode, endNode) => {
  if (!data) return { nodes: [], links: [] };

  const { nodes, links } = data;
  const startOrder = nodeOrder[startNode];
  const endOrder = nodeOrder[endNode];

  const filteredNodes = nodes.filter(node => {
    const nodeTypeOrder = nodeOrder[node.type];
    return nodeTypeOrder >= startOrder && nodeTypeOrder <= endOrder;
  });

  const filteredNodeIds = new Set(filteredNodes.map(node => node.id));

  const filteredLinks = links.filter(link => {
    return filteredNodeIds.has(link.source.id || link.source) && filteredNodeIds.has(link.target.id || link.target);
  });

  return { nodes: filteredNodes, links: filteredLinks };
};

export const useTopologyData = (startNode, endNode) => {
  const { data, isLoading, isError, error } = useQuery('hardwares', fetchAndProcessData, {
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const { nodes, links } = filterTopologyData(data, startNode, endNode);
  
  return { nodes, links, isLoading, isError, error };
};