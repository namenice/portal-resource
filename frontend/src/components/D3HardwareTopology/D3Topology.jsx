// src/components/D3HardwareTopology/D3Topology.jsx
import React, { useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';
import { useD3 } from './useD3';
import { highlightPath } from './highlightFunctions';
import { getIconSvg } from './iconGenerator';

export default function D3Topology({ nodes, links, searchNodeId, hasInteracted }) {
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const gRef = useRef(null);
  const linkRef = useRef(null);
  const nodeGroupRef = useRef(null);
  const simulationRef = useRef(null);
  
  // ฟังก์ชันสำหรับ zoom และ pan ไปยัง node
  const zoomToNode = useCallback((nodeToHighlight) => {
    if (gRef.current && zoomRef.current && nodeToHighlight) {
      const width = 1200;
      const height = 800;
      const scale = 1.5;
      
      // คำนวณตำแหน่งที่จะ pan ไป
      const x = width / 2 - nodeToHighlight.x * scale;
      const y = height / 2 - nodeToHighlight.y * scale;
      
      // ทำการ transition
      d3.select(svgRef.current)
        .transition()
        .duration(750)
        .call(zoomRef.current.transform, d3.zoomIdentity.translate(x, y).scale(scale));
    }
  }, []);

  // ฟังก์ชันสำหรับจัดการการ highlight และ zoom
  const handleSearchHighlight = useCallback((searchNodeId, hasInteracted) => {
    if (searchNodeId && hasInteracted) {
      const nodeToHighlight = nodes.find(n => n.id === searchNodeId);
      if (nodeToHighlight && linkRef.current && nodeGroupRef.current) {
        // Highlight path
        highlightPath(nodeToHighlight, linkRef.current, nodeGroupRef.current, nodes, links);
        
        // ถ้า node มีตำแหน่งแล้ว ให้ zoom ทันที
        if (nodeToHighlight.x !== undefined && nodeToHighlight.y !== undefined) {
          zoomToNode(nodeToHighlight);
        } else {
          // ถ้ายังไม่มีตำแหน่ง ให้รอ simulation tick
          const checkAndZoom = () => {
            if (nodeToHighlight.x !== undefined && nodeToHighlight.y !== undefined) {
              zoomToNode(nodeToHighlight);
            } else {
              // ลองอีกครั้งใน tick ถัดไป
              requestAnimationFrame(checkAndZoom);
            }
          };
          checkAndZoom();
        }
      }
    } else if (!hasInteracted && linkRef.current && nodeGroupRef.current) {
      // Clear highlight เมื่อไม่มีการ interact
      highlightPath(null, linkRef.current, nodeGroupRef.current);
    }
  }, [nodes, links, zoomToNode]);

  // ใช้ useD3 hook
  useD3({
    svgRef,
    zoomRef,
    gRef,
    linkRef,
    nodeGroupRef,
    nodes,
    links,
    getIconSvg,
    highlightPath,
    hasInteracted,
    simulationRef // ส่ง simulation ref ไปด้วย
  });

  // Effect สำหรับจัดการ search
  useEffect(() => {
    // ใช้ setTimeout เพื่อให้แน่ใจว่า D3 elements ถูกสร้างแล้ว
    const timer = setTimeout(() => {
      handleSearchHighlight(searchNodeId, hasInteracted);
    }, 100);

    return () => clearTimeout(timer);
  }, [searchNodeId, hasInteracted, handleSearchHighlight]);

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomRef.current.scaleBy, 1.2);
  };
  
  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current);
    svg.transition().duration(250).call(zoomRef.current.scaleBy, 0.8);
  };

  return (
    <>
      <div className="flex justify-end space-x-2 mb-4">
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 border rounded-md shadow-sm bg-gray-100 hover:bg-gray-200"
        >
          Zoom In (+)
        </button>
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 border rounded-md shadow-sm bg-gray-100 hover:bg-gray-200"
        >
          Zoom Out (-)
        </button>
      </div>
      <div className="border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <svg
          ref={svgRef}
          width="100%"
          height="800"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid meet"
          className="bg-white"
        ></svg>
      </div>
    </>
  );
}