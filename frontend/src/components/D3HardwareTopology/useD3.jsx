// src/components/D3HardwareTopology/useD3.js
import { useEffect } from 'react';
import * as d3 from 'd3';

export const useD3 = ({
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
    simulationRef
}) => {
    useEffect(() => {
        if (!nodes || nodes.length === 0) {
            d3.select(svgRef.current).selectAll("*").remove();
            return;
        }

        const svg = d3.select(svgRef.current);
        const width = 1200;
        const height = 800;
        
        let g = svg.select("g");
        if (g.empty()) {
            g = svg.append("g");
        }
        gRef.current = g;

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(d => d.type === "hierarchy" ? 80 : 150))
            .force("charge", d3.forceManyBody().strength(-300))
            .force("collide", d3.forceCollide().radius(20))
            .force("center", d3.forceCenter(width / 2, height / 2));

        // เก็บ simulation reference
        if (simulationRef) {
            simulationRef.current = simulation;
        }

        const link = g.selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke-width", d => d.type === "network" ? 2 : 1)
            .attr("stroke", d => d.type === "network" ? "#d62728" : "#999");
            
        linkRef.current = link;

        const tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("visibility", "hidden");

        const nodeGroup = g.selectAll(".node-group")
            .data(nodes)
            .join("g")
            .attr("class", d => `node-group node-${d.type}`);
        
        nodeGroup.selectAll("*").remove();

        nodeGroup.append("circle")
            .attr("class", "node-background-circle")
            .attr("r", 15)
            .attr("fill", "white")
            .attr("stroke", "#999")
            .attr("stroke-width", 1);
            
        nodeGroup.append("g")
            .html(d => getIconSvg(d.type, d.status))
            .attr("transform", d => `translate(${- (d.type === 'hardware' ? 20 : 24) / 2}, ${- (d.type === 'hardware' ? 20 : 24) / 2})`);
        
        nodeGroup.append("circle")
            .attr("r", 15)
            .attr("fill", "transparent");
        
        nodeGroup.append("text")
            .text(d => d.label)
            .attr("x", d => (d.type === 'hardware' ? 15 : 18))
            .attr("y", 5)
            .style("font-size", "12px")
            .style("pointer-events", "none");
            
        nodeGroupRef.current = nodeGroup;

        nodeGroup.call(drag(simulation));
        nodeGroup.on("mouseover", function(event, d) {
            let tooltipHtml = `<strong>${d.label}</strong><br/>Type: ${d.type}`;
            
            if (d.type === 'hardware' && d.data) {
              tooltipHtml += `<br/>Status: ${d.data.status?.name || 'N/A'}`;
              tooltipHtml += `<br/>IP: ${d.data.network_interfaces[0]?.ip_address || 'N/A'}`;
            } else if (d.type === 'switch' && d.data) {
              tooltipHtml += `<br/>Name: ${d.data.name}`;
            }
            
            tooltip.style("visibility", "visible").html(tooltipHtml);
        }).on("mousemove", function(event) {
            tooltip
              .style("top", (event.pageY - 10) + "px")
              .style("left", (event.pageX + 10) + "px");
        }).on("mouseout", function() {
            tooltip.style("visibility", "hidden");
        });
        
        nodeGroup.on("click", (event, d) => {
            event.stopPropagation(); 
            highlightPath(d, linkRef.current, nodeGroupRef.current, nodes, links);
        });

        svg.on("click", () => {
            highlightPath(null, linkRef.current, nodeGroupRef.current);
        });

        simulation.on("tick", () => {
            link
              .attr("x1", d => d.source.x)
              .attr("y1", d => d.source.y)
              .attr("x2", d => d.target.x)
              .attr("y2", d => d.target.y);
            
            nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
        });
        
        const zoomBehavior = d3.zoom()
            .extent([[0, 0], [width, height]])
            .scaleExtent([0.5, 4])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });
            
        svg.call(zoomBehavior);
        zoomRef.current = zoomBehavior;

        function drag(simulation) {
            function dragstarted(event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            }
            function dragged(event, d) {
                d.fx = event.x;
                d.fy = event.y;
            }
            function dragended(event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            }
            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }
        
        return () => {
            d3.select("body").selectAll(".d3-tooltip").remove();
            if (simulationRef) {
                simulationRef.current = null;
            }
        };
    }, [nodes, links]);
};