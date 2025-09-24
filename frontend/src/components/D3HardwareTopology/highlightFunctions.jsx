// src/components/D3HardwareTopology/highlightFunctions.js
export const highlightPath = (clickedNode, link, nodeGroup, nodes, links) => {
    if (!link || !nodeGroup) return;

    // Reset all nodes and links first
    link.attr("stroke", l => l.type === "network" ? "#d62728" : "#999").attr("stroke-width", l => l.type === "network" ? 2 : 1).style("opacity", 0.6);
    nodeGroup.selectAll(".node-background-circle").attr("stroke", "#999").attr("stroke-width", 1);
    nodeGroup.style("opacity", 1);
    
    let currentNode = clickedNode;
    if (!currentNode) {
        return;
    }
    
    const pathNodes = new Set();
    const pathLinks = new Set();
    
    pathNodes.add(currentNode.id);
    
    while (currentNode) {
        const parentLink = links.find(l => l.target.id === currentNode.id && l.type === "hierarchy");
        if (parentLink) {
            pathLinks.add(parentLink.source.id + '-' + parentLink.target.id);
            pathNodes.add(parentLink.source.id);
            currentNode = nodes.find(n => n.id === parentLink.source.id);
        } else {
            const networkLinks = links.filter(l => (l.source.id === currentNode.id || l.target.id === currentNode.id) && l.type === "network");
            if (networkLinks.length > 0) {
                networkLinks.forEach(l => {
                    pathLinks.add(l.source.id + '-' + l.target.id);
                    pathNodes.add(l.source.id);
                    pathNodes.add(l.target.id);
                });
            }
            currentNode = null;
        }
    }

    nodeGroup.style("opacity", n => pathNodes.has(n.id) ? 1 : 0.2);
    
    nodeGroup.selectAll(".node-background-circle")
             .attr("stroke", n => pathNodes.has(n.id) ? "blue" : "#999")
             .attr("stroke-width", n => pathNodes.has(n.id) ? 3 : 1);

    link.style("opacity", l => pathLinks.has(l.source.id + '-' + l.target.id) ? 1 : 0.2)
        .attr("stroke-width", l => pathLinks.has(l.source.id + '-' + l.target.id) ? 4 : (l.type === "network" ? 2 : 1))
        .attr("stroke", l => pathLinks.has(l.source.id + '-' + l.target.id) ? "blue" : (l.type === "network" ? "#d62728" : "#999"));
};