import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Position } from '../types';

interface TimelineProps {
  data: Position[];
  onBrush?: (selection: [Date, Date] | null) => void;
}

export function Timeline({ data, onBrush }: TimelineProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selection, setSelection] = useState<[number, number] | null>(null);
  const margin = { top: 10, right: 30, bottom: 30, left: 40 };
  const height = 150 - margin.top - margin.bottom;

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.getBoundingClientRect().width - margin.left - margin.right;

    svg.attr('width', width + margin.left + margin.right)
       .attr('height', height + margin.top + margin.bottom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.time * 1000)) as [Date, Date])
      .range([0, width]);

    // Group by day
    const dataByDay = d3.rollup(
      data,
      v => v.length,
      d => d3.timeDay.floor(new Date(d.time * 1000))
    );
    const timelineData = Array.from(dataByDay, ([key, value]) => ({
      date: key,
      count: value,
    }));

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timelineData, d => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Draw bars
    g.append('g')
      .selectAll('rect')
      .data(timelineData)
      .join('rect')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.count))
      .attr('width', d => {
        const startOfDay = xScale(d.date);
        const endOfCurrentDay = xScale(d3.timeDay.offset(d.date, 1));
        const dayWidth = endOfCurrentDay - startOfDay;
        return Math.max(0, dayWidth - 1);
      })
      .attr('height', d => height - yScale(d.count))
      .attr('fill', d => {
        if (!selection) return 'steelblue';
        const [x0, x1] = selection;
        const barXStart = xScale(d.date);
        const barXEnd = barXStart + 5;
        return (barXEnd > x0 && barXStart < x1) ? 'steelblue' : 'lightgray';
      })
      .attr('fill-opacity', d => {
        if (!selection) return 1;
        const [x0, x1] = selection;
        const barXStart = xScale(d.date);
        const barXEnd = barXStart + 5;
        return (barXEnd > x0 && barXStart < x1) ? 1 : 0.5;
      });

    // Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    // Brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on('brush end', (event) => {
        if (event.selection) {
          const sel = event.selection as [number, number];
          setSelection(sel);
          if (onBrush) {
            const [x0, x1] = sel.map(xScale.invert);
            onBrush([x0, x1]);
          }
        } else if (event.type === 'end' && !event.selection) {
          setSelection(null);
          if (onBrush) {
            onBrush(null);
          }
        }
      });

    g.append('g')
      .attr('class', 'brush')
      .call(brush);

  }, [data, selection, onBrush]);

  return <svg ref={svgRef} style={{ display: 'block', width: '100%', marginBottom: '20px' }} />;
}
