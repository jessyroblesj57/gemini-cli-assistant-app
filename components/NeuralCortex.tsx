
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: string;
  group: number;
  label: string;
  // Explicitly adding x, y, fx, fy as they are required for the simulation tick and 
  // sometimes the extension of SimulationNodeDatum doesn't properly expose them in certain TS configurations.
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  // Explicitly define source and target to avoid "Object literal may only specify known properties"
  // during initialization of the links array and later property access in the tick function.
  source: string | Node;
  target: string | Node;
  value: number;
}

const NeuralCortex: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = svgRef.current.parentElement?.clientWidth || window.innerWidth;
    const height = svgRef.current.parentElement?.clientHeight || window.innerHeight;

    const nodes: Node[] = [
      { id: '1', group: 1, label: 'AGENT_OMEGA' },
      { id: '2', group: 2, label: 'WATCHTOWER' },
      { id: '3', group: 2, label: 'RECEIPT' },
      { id: '4', group: 3, label: 'FORENSIC' },
      { id: '5', group: 3, label: 'MCP' },
      { id: '6', group: 4, label: 'LOGS' },
      { id: '7', group: 4, label: 'ZOMBIES' },
      { id: '8', group: 5, label: 'GEMINI' },
    ];

    const links: Link[] = [
      { source: '1', target: '2', value: 1 },
      { source: '1', target: '3', value: 1 },
      { source: '2', target: '4', value: 2 },
      { source: '2', target: '5', value: 2 },
      { source: '4', target: '6', value: 3 },
      { source: '5', target: '7', value: 3 },
      { source: '1', target: '8', value: 1 },
    ];

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg.append('g')
      .attr('stroke', 'rgba(255, 255, 255, 0.1)')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', d => Math.sqrt(d.value));

    const node = svg.append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll<SVGGElement, Node>('g')
      .data(nodes)
      .join('g')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);

    node.append('circle')
      .attr('r', 8)
      .attr('fill', d => d.group === 1 ? '#00FFFF' : '#10b981')
      .attr('filter', 'drop-shadow(0 0 5px rgba(0, 255, 255, 0.5))');

    node.append('text')
      .text(d => d.label)
      .attr('x', 12)
      .attr('y', 4)
      .attr('fill', '#94a3b8')
      .style('font-family', 'JetBrains Mono')
      .style('font-size', '10px')
      .style('font-weight', 'bold');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as Node).x!)
        .attr('y1', d => (d.source as Node).y!)
        .attr('x2', d => (d.target as Node).x!)
        .attr('y2', d => (d.target as Node).y!);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    const handleResize = () => {
      const w = svgRef.current?.parentElement?.clientWidth || window.innerWidth;
      const h = svgRef.current?.parentElement?.clientHeight || window.innerHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center', d3.forceCenter(w / 2, h / 2)).restart();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      simulation.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <svg 
      ref={svgRef} 
      className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen"
      style={{ zIndex: 5 }}
    />
  );
};

export default NeuralCortex;
