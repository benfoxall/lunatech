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
      setFilteredData(positions);
      setTimeOfDayData(positions);
    });

    return () => {
      unsubscribe();
    };
  }, [trackerId]);

  // Handle timeline brush
  const handleTimelineBrush = (selection: [Date, Date] | null) => {
    setDateSelection(selection);
    
    let filtered = allData;
    
    // Filter by date range
    if (selection) {
      const [start, end] = selection;
      filtered = allData.filter(d => {
        const date = new Date(d.time * 1000);
        return date >= start && date <= end;
      });
    }
    
    setTimeOfDayData(filtered);
    
    // Apply hour filter if it exists
    if (hourSelection) {
      const [x0, x1] = hourSelection;
      filtered = filtered.filter(d => {
        const hour = new Date(d.time * 1000).getHours();
        // Simplified hour filtering - approximate based on 24-hour scale
        const hourPosition = (hour / 24) * 800;
        return hourPosition >= x0 && hourPosition <= x1;
      });
    }
    
    setFilteredData(filtered);
  };

  // Handle time-of-day brush
  const handleHourBrush = (selection: [number, number] | null) => {
    setHourSelection(selection);
    
    let filtered = timeOfDayData;
    
    if (selection) {
      const [x0, x1] = selection;
      // The TimeOfDayChart uses a band scale with 24 hours
      // Convert pixel positions to hours by determining which bars are within the selection
      filtered = timeOfDayData.filter(d => {
        const hour = new Date(d.time * 1000).getHours();
        // Check if this data point's hour is within the brushed range
        // This is a simplified check - in a production app, you'd want to use
        // the actual scale from TimeOfDayChart
        const hourPosition = (hour / 24) * 800; // Approximate pixel position
        return hourPosition >= x0 && hourPosition <= x1;
      });
    }

    setFilteredData(filtered);
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
