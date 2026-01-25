import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import type { Position } from '../types';

interface HeatmapProps {
  data: Position[];
}

export function Heatmap({ data }: HeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const margin = { top: 20, right: 30, bottom: 40, left: 40 };

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.getBoundingClientRect().width - margin.left - margin.right;
    const height = width * (3 / 5);

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.location[0]) as [number, number])
      .nice()
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.location[1]) as [number, number])
      .nice()
      .range([height, 0]);

    // Hexbin
    const hexbinFn = hexbin<Position>()
      .x(d => xScale(d.location[0]))
      .y(d => yScale(d.location[1]))
      .radius(10)
      .extent([[0, 0], [width, height]]);

    const bins = hexbinFn(data);

    bins.forEach(bin => {
      (bin as any).totalDuration = d3.sum(bin, d => d.duration);
    });

    const colorScale = d3.scaleSequentialLog(d3.interpolateBuPu)
      .domain([1, d3.max(bins, d => (d as any).totalDuration) || 1]);

    // Draw hexagons
    g.append('g')
      .attr('class', 'hexagon-container')
      .selectAll('path')
      .data(bins)
      .join('path')
      .attr('d', hexbinFn.hexagon())
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .attr('fill', d => (d as any).totalDuration ? colorScale((d as any).totalDuration) : 'none')
      .attr('class', 'hexagon');

    // Draw points (sampled if too many)
    let pointsData = data;
    const maxPoints = 2000;
    if (data.length > maxPoints) {
      pointsData = [];
      const step = Math.floor(data.length / maxPoints);
      for (let i = 0; i < data.length; i += step) {
        pointsData.push(data[i]);
      }
    }

    g.append('g')
      .attr('class', 'points-container')
      .selectAll('circle')
      .data(pointsData)
      .join('circle')
      .attr('cx', d => xScale(d.location[0]))
      .attr('cy', d => yScale(d.location[1]))
      .attr('r', 1.5)
      .attr('fill', 'black')
      .attr('fill-opacity', 0.3);

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

  }, [data]);

  return <svg ref={svgRef} style={{ display: 'block', width: '100%', marginBottom: '20px' }} />;
}
