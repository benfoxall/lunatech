import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Position } from '../types';

interface TimeOfDayChartProps {
  data: Position[];
  onBrush?: (selection: [number, number] | null) => void;
}

export function TimeOfDayChart({ data, onBrush }: TimeOfDayChartProps) {
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

    // Group by hour
    const dataByHour = d3.rollup(
      data,
      v => v.length,
      d => new Date(d.time * 1000).getHours()
    );
    const timeOfDayData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: dataByHour.get(i) || 0,
    }));

    // Scales
    const numBars = 24;
    let desiredGap = 1;
    const totalAvailableWidth = width;
    let tempBarWidth = totalAvailableWidth / numBars;

    if (totalAvailableWidth - (numBars - 1) * desiredGap < 0) {
      desiredGap = 0;
    }
    
    const barWidth = (totalAvailableWidth - (numBars - 1) * desiredGap) / numBars;
    const step = barWidth + desiredGap;
    const paddingInnerRatio = step > 0 ? desiredGap / step : 0;

    const xScale = d3.scaleBand()
      .domain(d3.range(numBars).map(String))
      .range([0, width])
      .paddingInner(paddingInnerRatio)
      .paddingOuter(0);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(timeOfDayData, d => d.count) || 0])
      .nice()
      .range([height, 0]);

    // Draw bars
    g.append('g')
      .selectAll('rect')
      .data(timeOfDayData)
      .join('rect')
      .attr('x', d => xScale(String(d.hour)) || 0)
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.count))
      .attr('fill', d => {
        if (!selection) return 'steelblue';
        const [x0, x1] = selection;
        const barXStart = xScale(String(d.hour)) || 0;
        const barXEnd = barXStart + xScale.bandwidth();
        return (barXEnd > x0 && barXStart < x1) ? 'steelblue' : 'lightgray';
      })
      .attr('fill-opacity', d => {
        if (!selection) return 1;
        const [x0, x1] = selection;
        const barXStart = xScale(String(d.hour)) || 0;
        const barXEnd = barXStart + xScale.bandwidth();
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
            onBrush(sel);
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
