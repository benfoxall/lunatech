import { useEffect, useState } from 'react';
import { Heatmap } from './Heatmap';
import { Timeline } from './Timeline';
import { TimeOfDayChart } from './TimeOfDayChart';
import { dataStore } from '../store/DataStore';
import type { Position } from '../types';

interface DashboardProps {
  trackerId: string;
}

export function Dashboard({ trackerId }: DashboardProps) {
  const [allData, setAllData] = useState<Position[]>([]);
  const [filteredData, setFilteredData] = useState<Position[]>([]);
  const [timeOfDayData, setTimeOfDayData] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateSelection, setDateSelection] = useState<[Date, Date] | null>(null);
  const [hourSelection, setHourSelection] = useState<[number, number] | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize the data store
        await dataStore.init();
        
        // Load positions (will use cache if available)
        const positions = await dataStore.loadPositions(trackerId);
        
        setAllData(positions);
        setFilteredData(positions);
        setTimeOfDayData(positions);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to data changes
    const unsubscribe = dataStore.subscribe((positions) => {
      setAllData(positions);
      applyFilters(positions, dateSelection, hourSelection);
    });

    return () => {
      unsubscribe();
    };
  }, [trackerId]);

  // Apply filters when selections change
  const applyFilters = (
    data: Position[], 
    dateRange: [Date, Date] | null, 
    hourRange: [number, number] | null
  ) => {
    let filtered = data;

    // Filter by date range for time-of-day chart
    if (dateRange) {
      const [start, end] = dateRange;
      filtered = data.filter(d => {
        const date = new Date(d.time * 1000);
        return date >= start && date <= end;
      });
    }
    setTimeOfDayData(filtered);

    // Further filter by hour range for heatmap
    if (hourRange) {
      const [startHour, endHour] = hourRange;
      filtered = filtered.filter(d => {
        const hour = new Date(d.time * 1000).getHours();
        
        // Find which hours are selected based on pixel positions
        // This is simplified - in production would need exact mapping
        const minHour = Math.floor(startHour * 24 / 800); // Approximate
        const maxHour = Math.ceil(endHour * 24 / 800);
        
        return hour >= minHour && hour <= maxHour;
      });
    }

    setFilteredData(filtered);
  };

  // Handle timeline brush
  const handleTimelineBrush = (selection: [Date, Date] | null) => {
    setDateSelection(selection);
    applyFilters(allData, selection, hourSelection);
  };

  // Handle time-of-day brush
  const handleHourBrush = (selection: [number, number] | null) => {
    setHourSelection(selection);
    applyFilters(allData, dateSelection, selection);
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
        <h1>Loading data...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', color: '#e4e4e7', fontFamily: 'sans-serif' }}>
        <h1>Error</h1>
        <p style={{ color: '#ef4444' }}>{error}</p>
      </div>
    );
  }

  return (
    <div id="dashboard-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Heatmap data={filteredData} />
      <Timeline data={allData} onBrush={handleTimelineBrush} />
      <TimeOfDayChart data={timeOfDayData} onBrush={handleHourBrush} />
    </div>
  );
}
