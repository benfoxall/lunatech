// Dashboard page that displays the tracker visualization
export function dashboardPage(trackerId: string, positionsData: any): string {
  // If positionsData is null, we'll fetch it via API
  const shouldFetchData = positionsData === null;

  const dataJson = shouldFetchData
    ? "null"
    : JSON.stringify(positionsData)
        .replace(/</g, "\\u003c")
        .replace(/>/g, "\\u003e")
        .replace(/&/g, "\\u0026");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>track • ${trackerId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    a {
      display: inline-block;
      padding: 14px 0;
      color: #fff;
      text-decoration: none;
      font-size: 1em;
      font-weight: 400;
      transition: opacity 0.2s, border-bottom-color 0.2s;
      border-bottom: 1px solid #3f3f46;
    }
    
    a:hover {
      opacity: 0.6;
      border-bottom-color: #71717a;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', 'Helvetica Neue', sans-serif;
      line-height: 1.7;
      color: #e4e4e7;
      background: #0a0a0a;
      padding: 40px;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    
    .header {
      max-width: 1200px;
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    h1 {
      font-size: 1.5em;
      color: #fafafa;
      margin: 0;
      font-weight: 300;
      letter-spacing: -0.02em;
    }
    
    .loading {
      margin-left: 16px;
      font-size: 0.85em;
      color: #52525b;
      font-weight: 300;
    }
    
    .nav-links {
      display: flex;
      gap: 24px;
      font-size: 0.9em;
    }
    
    .back-link {
      border: none;
      padding: 0;
    }
    
    #dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    svg {
      display: block;
      width: 100%;
      height: auto;
      margin-bottom: 20px;
    }
    
    .hexagon {
      stroke: none;
    }
    
    .error {
      padding: 40px 0;
      color: #f87171;
    }
    
    /* Tab styles */
    .tabs {
      display: flex;
      gap: 0;
      margin-bottom: 30px;
      border-bottom: 1px solid #27272a;
      align-items: center;
    }
    
    .tabs-left {
      display: flex;
      gap: 0;
      flex: 1;
    }
    
    .tab {
      padding: 12px 24px;
      cursor: pointer;
      color: #71717a;
      font-size: 0.95em;
      border: none;
      background: none;
      transition: color 0.2s, border-color 0.2s;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
    }
    
    .tab:hover {
      color: #a1a1aa;
    }
    
    .tab.active {
      color: #fafafa;
      border-bottom-color: #fafafa;
    }
    
    .tab-content {
      display: none;
    }
    
    .tab-content.active {
      display: block;
    }
    
    .download-btn {
      padding: 6px 12px;
      color: #71717a;
      font-size: 0.8em;
      border: 1px solid #27272a;
      background: none;
      cursor: pointer;
      transition: color 0.2s, border-color 0.2s;
      margin-bottom: 8px;
    }
    
    .download-btn:hover {
      color: #a1a1aa;
      border-color: #3f3f46;
    }
    
    /* Activity tab styles */
    .activity-calendar {
      margin-bottom: 16px;
    }
    
    .calendar-tooltip {
      position: fixed;
      background: #18181b;
      border: 1px solid #3f3f46;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 0.85em;
      color: #e4e4e7;
      pointer-events: none;
      z-index: 1000;
      opacity: 0;
      transition: opacity 0.15s;
      max-width: 200px;
    }
    
    .calendar-tooltip.visible {
      opacity: 1;
    }
    
    .stats-panel {
      margin-bottom: 16px;
    }
    
    .stats-panel h3 {
      color: #71717a;
      font-size: 0.8em;
      font-weight: 400;
      margin-bottom: 8px;
      font-family: monospace;
    }
    
    .stats-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .stat-item {
      display: flex;
      gap: 8px;
      align-items: baseline;
    }
    
    .stat-label {
      color: #52525b;
      font-size: 0.75em;
      font-family: monospace;
    }
    
    .stat-value {
      color: #a1a1aa;
      font-size: 0.85em;
      font-family: monospace;
    }
    
    .path-plot {
      margin-bottom: 16px;
    }
    
    .time-slider-container {
      margin-bottom: 16px;
    }
    
    .time-slider-container label {
      display: block;
      color: #52525b;
      font-size: 0.75em;
      margin-bottom: 8px;
      font-family: monospace;
    }
    
    .activity-timeline {
      margin-bottom: 8px;
      height: 30px;
    }
    
    .time-slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: #27272a;
      border-radius: 2px;
      outline: none;
    }
    
    .time-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 12px;
      height: 12px;
      background: #fafafa;
      border-radius: 50%;
      cursor: pointer;
    }
    
    .time-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: #fafafa;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }
    
    .time-display {
      color: #71717a;
      font-size: 0.75em;
      margin-top: 4px;
      text-align: center;
      font-family: monospace;
    }
    
    .no-data-message {
      color: #52525b;
      text-align: center;
      padding: 20px;
      font-family: monospace;
      font-size: 0.8em;
    }
    
    .select-day-message {
      color: #3f3f46;
      text-align: center;
      padding: 20px;
      font-size: 0.8em;
      font-family: monospace;
    }
  </style>
</head>
<body>
  <div class="header">
    <div style="display: flex; align-items: baseline;">
      <h1>${trackerId}</h1>
      <div class="loading"></div>
    </div>
    <div class="nav-links">
      <a href="/trackers" class="back-link">← trackers</a>
      <a href="/" class="back-link">home</a>
    </div>
  </div>
  
  <div id="dashboard-container">
    <div class="tabs">
      <div class="tabs-left">
        <button class="tab active" data-tab="heatmap">Heatmap</button>
        <button class="tab" data-tab="activity">Activity</button>
      </div>
      <button class="download-btn" id="download-csv">download csv</button>
    </div>
    
    <div id="heatmap-tab" class="tab-content active">
      <svg id="heatmap"></svg>
      <svg id="timeline"></svg>
      <svg id="timeOfDay"></svg>
    </div>
    
    <div id="activity-tab" class="tab-content">
      <div class="activity-calendar">
        <svg id="activity-calendar-svg"></svg>
      </div>
      <div id="day-stats" class="stats-panel" style="display: none;">
        <h3 id="stats-date">select a day</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">dist:</span>
            <span class="stat-value" id="stat-distance">-</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">max_r:</span>
            <span class="stat-value" id="stat-radius">-</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">outside:</span>
            <span class="stat-value" id="stat-outside">-</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">points:</span>
            <span class="stat-value" id="stat-points">-</span>
          </div>
        </div>
      </div>
      <div id="time-slider-section" class="time-slider-container" style="display: none;">
        <svg id="activity-timeline-svg" class="activity-timeline"></svg>
        <input type="range" class="time-slider" id="time-slider" min="0" max="100" value="0">
        <div class="time-display" id="time-display">00:00</div>
      </div>
      <div id="path-plot-container" class="path-plot" style="display: none;">
        <svg id="path-plot-svg"></svg>
      </div>
      <div id="select-day-prompt" class="select-day-message">
        click on a day to see activity details
      </div>
    </div>
  </div>
  
  <div class="calendar-tooltip" id="calendar-tooltip"></div>

  <script type="module">
    import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
    import { hexbin } from "https://cdn.skypack.dev/d3-hexbin";
    import proj from "https://cdn.skypack.dev/proj4";

    const DB_NAME = 'track';
    const DB_VERSION = 1;
    const TRACKER_ID = '${trackerId}';
    const TOTAL_DAYS = 120;

    let data;
    let heatmap, timeline, timeOfDay;
    let filteredData;

    // IndexedDB utilities
    function openDB() {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          
          // Positions store - composite index on [trackerId, timestamp]
          if (!db.objectStoreNames.contains('positions')) {
            const posStore = db.createObjectStore('positions', { autoIncrement: true });
            posStore.createIndex('trackerTime', ['trackerId', 'timestamp'], { unique: false });
            posStore.createIndex('trackerId', 'trackerId', { unique: false });
          }
          
          // Metadata store - tracks fetched ranges
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'trackerId' });
          }
        };
      });
    }

    async function getPositions(db, trackerId, fromTime, toTime) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('positions', 'readonly');
        const store = tx.objectStore('positions');
        const index = store.index('trackerTime');
        
        const range = IDBKeyRange.bound(
          [trackerId, fromTime],
          [trackerId, toTime]
        );
        
        const request = index.getAll(range);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    async function storePositions(db, trackerId, positions) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('positions', 'readwrite');
        const store = tx.objectStore('positions');
        
        for (const pos of positions) {
          store.add({
            trackerId,
            timestamp: pos.time,
            data: pos
          });
        }
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    async function getMetadata(db, trackerId) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('metadata', 'readonly');
        const store = tx.objectStore('metadata');
        const request = store.get(trackerId);
        
        request.onsuccess = () => resolve(request.result || { trackerId, ranges: [] });
        request.onerror = () => reject(request.error);
      });
    }

    async function updateMetadata(db, trackerId, newRange) {
      return new Promise((resolve, reject) => {
        const tx = db.transaction('metadata', 'readwrite');
        const store = tx.objectStore('metadata');
        const request = store.get(trackerId);
        
        request.onsuccess = () => {
          const metadata = request.result || { trackerId, ranges: [] };
          metadata.ranges.push(newRange);
          
          // Merge overlapping ranges
          metadata.ranges.sort((a, b) => a.from - b.from);
          const merged = [];
          for (const range of metadata.ranges) {
            if (merged.length === 0 || merged[merged.length - 1].to < range.from) {
              merged.push(range);
            } else {
              merged[merged.length - 1].to = Math.max(merged[merged.length - 1].to, range.to);
            }
          }
          metadata.ranges = merged;
          
          store.put(metadata);
        };
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    }

    function findMissingRanges(fetchedRanges, targetFrom, targetTo) {
      const missing = [];
      let current = targetFrom;
      
      // Sort fetched ranges
      const sorted = fetchedRanges.sort((a, b) => a.from - b.from);
      
      for (const range of sorted) {
        if (current < range.from) {
          missing.push({ from: current, to: Math.min(range.from, targetTo) });
        }
        current = Math.max(current, range.to);
        if (current >= targetTo) break;
      }
      
      if (current < targetTo) {
        missing.push({ from: current, to: targetTo });
      }
      
      return missing;
    }

    // Localise function (from lib/localise.ts)
    function localise(obj, origin) {
      const { latlong, alt, ...rest } = obj;

      const [x, y] = proj(
        \`+proj=aeqd +lat_0=\${origin.latlong[1]} +lon_0=\${origin.latlong[0]} +datum=WGS84 +units=m +no_defs\`,
        latlong
      );

      return {
        ...rest,
        position: [x, y, alt],
      };
    }

    async function main() {
      try {
        const db = await openDB();
        const now = new Date();
        const targetFrom = Math.floor(new Date(now.getTime() - TOTAL_DAYS * 24 * 60 * 60 * 1000).getTime() / 1000);
        const targetTo = Math.floor(now.getTime() / 1000);
        
        // Load cached data immediately
        document.querySelector('.loading').textContent = 'loading cached data...';
        const cachedRecords = await getPositions(db, TRACKER_ID, targetFrom, targetTo);
        let allData = cachedRecords.map(r => r.data);
        
        // Get metadata to find missing ranges
        const metadata = await getMetadata(db, TRACKER_ID);
        const missingRanges = findMissingRanges(metadata.ranges, targetFrom, targetTo);
        
        console.log(\`Cached: \${allData.length} positions, Missing ranges: \${missingRanges.length}\`);
        
        // Initialize UI with cached data if available
        if (allData.length > 0) {
          const origin = allData[0];
          window.dataOrigin = origin;
          
          const mapped = allData.map(position => localise(position, origin));
          data = mapped.map(d => ({
            ...d,
            location: d.position,
            duration: 60
          })).filter((d) => d.pos_uncertainty < 50);
          
          window.data = data;
          filteredData = data;
          
          heatmap = new Heatmap();
          timeline = new Timeline();
          timeOfDay = new TimeOfDayChart(data);
          
          let resizeTimer;
          window.addEventListener("resize", () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
              heatmap.resize();
              timeline.resize();
              timeOfDay.resize();
            }, 200);
          });
        }
        
        // Fetch missing ranges in chunks
        if (missingRanges.length > 0) {
          const CHUNK_SIZE = 30 * 24 * 60 * 60; // 30 days in seconds
          const chunks = [];
          
          // Break large missing ranges into 30-day chunks
          for (const range of missingRanges) {
            let current = range.from;
            while (current < range.to) {
              const chunkEnd = Math.min(current + CHUNK_SIZE, range.to);
              chunks.push({ from: current, to: chunkEnd });
              current = chunkEnd;
            }
          }
          
          console.log(\`Fetching \${chunks.length} chunks...\`);
          
          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const fromDate = new Date(chunk.from * 1000);
            const toDate = new Date(chunk.to * 1000);
            
            document.querySelector('.loading').textContent = 
              \`\${Math.round(((i + 1) / chunks.length) * 100)}%\`;
            
            const response = await fetch(
              \`/api/tracker/${trackerId}/positions?from=\${fromDate.toISOString()}&to=\${toDate.toISOString()}\`
            );
            
            if (!response.ok) {
              console.error('Failed to fetch chunk:', chunk);
              continue;
            }
            
            const rawData = await response.json();
            const locationsList = rawData[0] || [];
            
            if (locationsList.length > 0) {
              // Store in IndexedDB
              await storePositions(db, TRACKER_ID, locationsList);
              await updateMetadata(db, TRACKER_ID, chunk);
              
              // Add to current data
              const origin = window.dataOrigin || locationsList[0];
              if (!window.dataOrigin) window.dataOrigin = origin;
              
              const mapped = locationsList.map(position => localise(position, origin));
              const transformed = mapped.map(d => ({
                ...d,
                location: d.position,
                duration: 60
              })).filter((d) => d.pos_uncertainty < 50);
              
              allData = allData.concat(locationsList);
              
              // Update UI
              if (!data) {
                // First data chunk - initialize
                data = transformed;
                window.data = data;
                filteredData = data;
                
                heatmap = new Heatmap();
                timeline = new Timeline();
                timeOfDay = new TimeOfDayChart(data);
                
                let resizeTimer;
                window.addEventListener("resize", () => {
                  clearTimeout(resizeTimer);
                  resizeTimer = setTimeout(() => {
                    heatmap.resize();
                    timeline.resize();
                    timeOfDay.resize();
                  }, 200);
                });
              } else {
                // Update existing charts
                const allMapped = allData.map(position => localise(position, window.dataOrigin));
                data = allMapped.map(d => ({
                  ...d,
                  location: d.position,
                  duration: 60
                })).filter((d) => d.pos_uncertainty < 50);
                
                window.data = data;
                filteredData = data;
                
                heatmap.updateData(data);
                timeline.resize();
                timeOfDay.chartData = data;
                timeOfDay.resize();
              }
            }
          }
        }
        
        document.querySelector('.loading').style.display = 'none';
        
        if (!data || data.length === 0) {
          throw new Error('No location data available');
        }
      } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('.loading').innerHTML = 
          '<div class="error">' + error.message + '</div>';
      }
    }

    function updateCharts() {
      heatmap.draw(filteredData);
      timeline.draw(data);
      timeOfDay.draw(timeOfDay.chartData);
    }

    function onBrush(event) {
      if (event.sourceEvent) {
        if (this instanceof Timeline) {
          timeline.selection = event.selection;
        } else if (this instanceof TimeOfDayChart) {
          timeOfDay.selection = event.selection;
        }
      }

      timeOfDay.chartData = data;
      if (timeline.selection) {
        const [x0, x1] = timeline.selection.map(timeline.x.invert);
        timeOfDay.chartData = data.filter((d) => {
          const date = new Date(d.time * 1000);
          return date >= x0 && date <= x1;
        });
      }

      filteredData = timeOfDay.chartData;
      if (timeOfDay.selection) {
        const [x0, x1] = timeOfDay.selection;
        const domain = timeOfDay.x.domain();
        const bandwidth = timeOfDay.x.bandwidth();

        const hour0 = domain.find((h) => timeOfDay.x(h) + bandwidth >= x0);
        const hour1 = domain
          .slice()
          .reverse()
          .find((h) => timeOfDay.x(h) <= x1);

        if (hour0 !== undefined && hour1 !== undefined) {
          filteredData = timeOfDay.chartData.filter((d) => {
            const hour = new Date(d.time * 1000).getHours();
            return hour >= hour0 && hour <= hour1;
          });
        }
      }

      updateCharts();
    }

    // Include all the chart classes from index.html
    ${getChartClasses()}

    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabName + '-tab').classList.add('active');
        
        // Initialize activity calendar when switching to activity tab
        if (tabName === 'activity' && window.data && !window.activityCalendar) {
          window.activityCalendar = new ActivityCalendar(window.data);
        }
        
        // Resize heatmap charts when switching back to heatmap tab
        if (tabName === 'heatmap' && heatmap) {
          setTimeout(() => {
            heatmap.resize();
            timeline.resize();
            timeOfDay.resize();
          }, 10);
        }
      });
    });
    
    // Download CSV functionality
    document.getElementById('download-csv').addEventListener('click', () => {
      if (!window.data || window.data.length === 0) {
        alert('No data available to download');
        return;
      }
      
      // Create CSV content
      const headers = ['timestamp', 'datetime', 'x', 'y', 'duration', 'pos_uncertainty'];
      const rows = window.data.map(d => [
        d.time,
        new Date(d.time * 1000).toISOString(),
        d.location[0],
        d.location[1],
        d.duration || '',
        d.pos_uncertainty || ''
      ]);
      
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = TRACKER_ID + '_locations.csv';
      link.click();
      URL.revokeObjectURL(link.href);
    });

    ${getActivityCalendarClass()}

    main();
  </script>
</body>
</html>`;
}

// Extract chart classes from the original index.html
function getChartClasses(): string {
  return `
    class Heatmap {
      constructor() {
        this.margin = { top: 20, right: 30, bottom: 40, left: 40 };
        this.svgElement = d3.select("#heatmap");

        this.svg = this.svgElement
          .append("g")
          .attr(
            "transform",
            \`translate(\${this.margin.left},\${this.margin.top})\`
          );

        this.xScaleFull = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => d.location[0]))
          .nice();

        this.yScaleFull = d3
          .scaleLinear()
          .domain(d3.extent(data, (d) => d.location[1]))
          .nice();

        const [xMin, xMax] = this.xScaleFull.domain();
        const [yMin, yMax] = this.yScaleFull.domain();
        this.domainAspectRatio = (yMax - yMin) / (xMax - xMin);

        const hexbinFnFull = hexbin()
          .x((d) => this.xScaleFull(d.location[0]))
          .y((d) => this.yScaleFull(d.location[1]))
          .radius(10);

        const binsFull = hexbinFnFull(data);

        binsFull.forEach((bin) => {
          bin.totalDuration = d3.sum(bin, (d) => d.duration);
        });

        this.colorScaleFull = d3
          .scaleSequentialLog(d3.interpolateBuPu)
          .domain([1, d3.max(binsFull, (d) => d.totalDuration)]);

        this.xAxisGroup = this.svg.append("g");
        this.yAxisGroup = this.svg.append("g");

        this.resize();
      }

      resize() {
        this.width =
          this.svgElement.node().getBoundingClientRect().width -
          this.margin.left -
          this.margin.right;
        this.height = this.width * (3 / 5);

        this.svgElement
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.xScaleFull.range([0, this.width]);
        this.yScaleFull.range([this.height, 0]);

        this.xAxisGroup
          .attr("transform", \`translate(0,\${this.height})\`)
          .call(d3.axisBottom(this.xScaleFull));

        this.yAxisGroup.call(d3.axisLeft(this.yScaleFull));

        this.draw(filteredData);
      }

      draw(data) {
        this.svg.selectAll(".hexagon-container").remove();

        const hexbinFn = hexbin()
          .x((d) => this.xScaleFull(d.location[0]))
          .y((d) => this.yScaleFull(d.location[1]))
          .radius(10)
          .extent([
            [0, 0],
            [this.width, this.height],
          ]);

        const bins = hexbinFn(data);

        bins.forEach((bin) => {
          bin.totalDuration = d3.sum(bin, (d) => d.duration);
        });

        this.svg
          .append("g")
          .attr("class", "hexagon-container")
          .selectAll("path")
          .data(bins)
          .join("path")
          .attr("d", hexbinFn.hexagon())
          .attr("transform", (d) => \`translate(\${d.x},\${d.y})\`)
          .attr("fill", (d) =>
            d.totalDuration ? this.colorScaleFull(d.totalDuration) : "none"
          )
          .attr("class", "hexagon");

        let pointsData = data;
        const maxPoints = 2000;
        if (data.length > maxPoints) {
          pointsData = [];
          const step = Math.floor(data.length / maxPoints);
          for (let i = 0; i < data.length; i += step) {
            pointsData.push(data[i]);
          }
        }

        this.svg.selectAll(".points-container").remove();
        this.svg
          .append("g")
          .attr("class", "points-container")
          .selectAll("circle")
          .data(pointsData)
          .join("circle")
          .attr("cx", (d) => this.xScaleFull(d.location[0]))
          .attr("cy", (d) => this.yScaleFull(d.location[1]))
          .attr("r", 1.5)
          .attr("fill", "black")
          .attr("fill-opacity", 0.3);
      }
      
      updateData(newData) {
        // Recalculate scales and color with new data
        this.xScaleFull.domain(d3.extent(newData, (d) => d.location[0])).nice();
        this.yScaleFull.domain(d3.extent(newData, (d) => d.location[1])).nice();
        
        const hexbinFnFull = hexbin()
          .x((d) => this.xScaleFull(d.location[0]))
          .y((d) => this.yScaleFull(d.location[1]))
          .radius(10);

        const binsFull = hexbinFnFull(newData);
        binsFull.forEach((bin) => {
          bin.totalDuration = d3.sum(bin, (d) => d.duration);
        });

        this.colorScaleFull.domain([1, d3.max(binsFull, (d) => d.totalDuration)]);
        
        // Redraw with updated scales
        this.resize();
      }
    }

    class Timeline {
      constructor() {
        this.margin = { top: 10, right: 30, bottom: 30, left: 40 };
        this.svgElement = d3.select("#timeline");
        this.height = 150 - this.margin.top - this.margin.bottom;
        this.selection = null;

        this.svg = this.svgElement
          .append("g")
          .attr(
            "transform",
            \`translate(\${this.margin.left},\${this.margin.top})\`
          );

        this.xAxisGroup = this.svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", \`translate(0,\${this.height})\`);

        this.bars = this.svg.append("g");

        this.brush = d3
          .brushX()
          .extent([
            [0, 0],
            [1, this.height],
          ])
          .on("brush end", onBrush.bind(this));

        this.brushGroup = this.svg
          .append("g")
          .attr("class", "brush")
          .call(this.brush);

        this.resize();
      }

      resize() {
        this.width =
          this.svgElement.node().getBoundingClientRect().width -
          this.margin.left -
          this.margin.right;
        if (this.width < 10) this.width = 10;

        this.svgElement
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom);

        this.x = d3
          .scaleTime()
          .domain(d3.extent(window.data, (d) => new Date(d.time * 1000)))
          .range([0, this.width]);

        this.xAxisGroup
          .attr("transform", \`translate(0,\${this.height})\`)
          .call(d3.axisBottom(this.x));

        this.brushGroup.call(
          this.brush.extent([
            [0, 0],
            [this.width, this.height],
          ])
        );
        this.draw(data);
      }

      draw(data) {
        const dataByDay = d3.rollup(
          data,
          (v) => v.length,
          (d) => d3.timeDay.floor(new Date(d.time * 1000))
        );
        const timelineData = Array.from(dataByDay, ([key, value]) => ({
          date: key,
          count: value,
        }));

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(timelineData, (d) => d.count)])
          .nice()
          .range([this.height, 0]);

        this.bars
          .selectAll("rect")
          .data(timelineData)
          .join("rect")
          .attr("x", (d) => this.x(d.date))
          .attr("y", (d) => y(d.count))
          .attr("width", (d) => {
            const startOfDay = this.x(d.date);
            const endOfCurrentDay = this.x(d3.timeDay.offset(d.date, 1));
            const dayWidth = endOfCurrentDay - startOfDay;
            return Math.max(0, dayWidth - 1);
          })
          .attr("height", (d) => this.height - y(d.count))
          .attr("fill", (d) => {
            if (!this.selection) return "steelblue";
            const [x0_brush, x1_brush] = this.selection;
            const barXStart = this.x(d.date);
            const barXEnd = barXStart + 5;
            if (barXEnd > x0_brush && barXStart < x1_brush) {
              return "steelblue";
            }
            return "lightgray";
          })
          .attr("fill-opacity", (d) => {
            if (!this.selection) return 1;
            const [x0_brush, x1_brush] = this.selection;
            const barXStart = this.x(d.date);
            const barXEnd = barXStart + 5;
            if (barXEnd > x0_brush && barXStart < x1_brush) {
              return 1;
            }
            return 0.5;
          });
      }
    }

    class TimeOfDayChart {
      constructor(initialData) {
        this.chartData = initialData;
        this.margin = { top: 10, right: 30, bottom: 30, left: 40 };
        this.svgElement = d3.select("#timeOfDay");
        this.height = 150 - this.margin.top - this.margin.bottom;
        this.selection = null;

        this.svg = this.svgElement
          .append("g")
          .attr(
            "transform",
            \`translate(\${this.margin.left},\${this.margin.top})\`
          );

        this.xAxisGroup = this.svg
          .append("g")
          .attr("class", "axis")
          .attr("transform", \`translate(0,\${this.height})\`);

        this.bars = this.svg.append("g");

        this.brush = d3
          .brushX()
          .extent([
            [0, 0],
            [1, this.height],
          ])
          .on("brush end", onBrush.bind(this));

        this.brushGroup = this.svg
          .append("g")
          .attr("class", "brush")
          .call(this.brush);

        this.resize();
      }

      resize() {
        this.width =
          this.svgElement.node().getBoundingClientRect().width -
          this.margin.left -
          this.margin.right;
        if (this.width < 10) this.width = 10;

        this.svgElement
          .attr("width", this.width + this.margin.left + this.margin.right)
          .attr("height", this.height + this.margin.top + this.margin.bottom);

        const numBars = 24;
        let desiredGap = 1;
        const totalAvailableWidth = this.width;

        let tempBarWidth = totalAvailableWidth / numBars;

        if (totalAvailableWidth - (numBars - 1) * desiredGap < 0) {
          desiredGap = 0;
        }
        
        const barWidth = (totalAvailableWidth - (numBars - 1) * desiredGap) / numBars;
        const step = barWidth + desiredGap;
        const paddingInnerRatio = step > 0 ? desiredGap / step : 0;

        this.x = d3
          .scaleBand()
          .domain(d3.range(numBars))
          .range([0, this.width])
          .paddingInner(paddingInnerRatio)
          .paddingOuter(0);

        this.xAxisGroup
          .attr("transform", \`translate(0,\${this.height})\`)
          .call(d3.axisBottom(this.x));

        this.brushGroup.call(
          this.brush.extent([
            [0, 0],
            [this.width, this.height]
          ])
        );

        this.draw(this.chartData);
      }

      draw(data) {
        const dataByHour = d3.rollup(
          data,
          (v) => v.length,
          (d) => new Date(d.time * 1000).getHours()
        );
        const timeOfDayData = Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: dataByHour.get(i) || 0,
        }));

        const y = d3
          .scaleLinear()
          .domain([0, d3.max(timeOfDayData, (d) => d.count)])
          .nice()
          .range([this.height, 0]);

        this.bars
          .selectAll("rect")
          .data(timeOfDayData)
          .join("rect")
          .attr("x", (d) => this.x(d.hour))
          .attr("y", (d) => y(d.count))
          .attr("width", this.x.bandwidth())
          .attr("height", (d) => this.height - y(d.count))
          .attr("fill", (d) => {
            if (!this.selection) return "steelblue";
            const [x0_brush, x1_brush] = this.selection;
            const barXStart = this.x(d.hour);
            const barXEnd = barXStart + this.x.bandwidth();
            if (barXEnd > x0_brush && barXStart < x1_brush) {
              return "steelblue";
            }
            return "lightgray";
          })
          .attr("fill-opacity", (d) => {
            if (!this.selection) return 1;
            const [x0_brush, x1_brush] = this.selection;
            const barXStart = this.x(d.hour);
            const barXEnd = barXStart + this.x.bandwidth();
            if (barXEnd > x0_brush && barXStart < x1_brush) {
              return 1;
            }
            return 0.5;
          });
      }
    }
  `;
}

// Activity calendar class for the Activity tab
function getActivityCalendarClass(): string {
  return `
    class ActivityCalendar {
      constructor(data) {
        this.data = data;
        this.selectedDate = null;
        this.hoveredDate = null;
        this.tooltip = document.getElementById('calendar-tooltip');
        this.margin = { top: 20, right: 20, bottom: 20, left: 40 };
        this.cellSize = 12;
        this.cellGap = 2;
        
        // Configuration constants
        // Distance threshold (in meters) for determining if the animal is "at home" or "outside"
        this.HOME_THRESHOLD_METERS = 20;
        // Default duration (in seconds) when a data point doesn't have a duration value
        this.DEFAULT_DURATION_SECONDS = 60;
        
        this.svgElement = d3.select("#activity-calendar-svg");
        this.pathSvg = d3.select("#path-plot-svg");
        
        // Group data by day
        this.dataByDay = d3.rollup(
          data,
          v => v,
          d => d3.timeDay.floor(new Date(d.time * 1000)).toISOString().split('T')[0]
        );
        
        // Calculate activity levels by day (count of points)
        this.activityByDay = new Map();
        this.dataByDay.forEach((points, date) => {
          this.activityByDay.set(date, points.length);
        });
        
        this.draw();
        this.setupSlider();
      }
      
      draw() {
        const svg = this.svgElement;
        svg.selectAll("*").remove();
        
        // Get date range
        const dates = Array.from(this.dataByDay.keys()).map(d => new Date(d));
        const minDate = d3.min(dates);
        const maxDate = d3.max(dates);
        
        // Calculate weeks
        const startWeek = d3.timeWeek.floor(minDate);
        const endWeek = d3.timeWeek.ceil(maxDate);
        const weeks = d3.timeWeeks(startWeek, endWeek);
        
        const width = weeks.length * (this.cellSize + this.cellGap) + this.margin.left + this.margin.right;
        const height = 7 * (this.cellSize + this.cellGap) + this.margin.top + this.margin.bottom + 20;
        
        svg.attr("width", width).attr("height", height);
        
        const g = svg.append("g")
          .attr("transform", \`translate(\${this.margin.left},\${this.margin.top})\`);
        
        // Color scale for activity (GitHub-style greens)
        const maxActivity = d3.max(Array.from(this.activityByDay.values()));
        const colorScale = d3.scaleQuantile()
          .domain([0, maxActivity])
          .range(['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']);
        
        // Day labels
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        g.selectAll(".day-label")
          .data([1, 3, 5]) // Mon, Wed, Fri
          .join("text")
          .attr("class", "day-label")
          .attr("x", -5)
          .attr("y", d => d * (this.cellSize + this.cellGap) + this.cellSize / 2)
          .attr("text-anchor", "end")
          .attr("dominant-baseline", "middle")
          .attr("fill", "#71717a")
          .attr("font-size", "9px")
          .text(d => dayLabels[d]);
        
        // Month labels
        const months = d3.timeMonths(startWeek, endWeek);
        g.selectAll(".month-label")
          .data(months)
          .join("text")
          .attr("class", "month-label")
          .attr("x", d => {
            const weekIndex = d3.timeWeek.count(startWeek, d);
            return weekIndex * (this.cellSize + this.cellGap);
          })
          .attr("y", -5)
          .attr("fill", "#71717a")
          .attr("font-size", "10px")
          .text(d => d3.timeFormat("%b")(d));
        
        // Generate all days
        const allDays = d3.timeDays(startWeek, d3.timeDay.offset(endWeek, 1));
        
        // Draw cells
        const cells = g.selectAll(".day-cell")
          .data(allDays)
          .join("rect")
          .attr("class", "day-cell")
          .attr("x", d => {
            const weekIndex = d3.timeWeek.count(startWeek, d);
            return weekIndex * (this.cellSize + this.cellGap);
          })
          .attr("y", d => d.getDay() * (this.cellSize + this.cellGap))
          .attr("width", this.cellSize)
          .attr("height", this.cellSize)
          .attr("rx", 2)
          .attr("fill", d => {
            const dateStr = d.toISOString().split('T')[0];
            const activity = this.activityByDay.get(dateStr) || 0;
            return activity > 0 ? colorScale(activity) : '#161b22';
          })
          .attr("stroke", d => {
            const dateStr = d.toISOString().split('T')[0];
            if (this.selectedDate === dateStr) {
              return '#fafafa';
            }
            return 'none';
          })
          .attr("stroke-width", 2)
          .style("cursor", d => {
            const dateStr = d.toISOString().split('T')[0];
            return this.activityByDay.get(dateStr) ? 'pointer' : 'default';
          })
          .on("click", (event, d) => this.onDayClick(d))
          .on("mouseenter", (event, d) => this.onDayHover(d))
          .on("mousemove", (event) => this.moveTooltip(event))
          .on("mouseleave", () => this.onDayLeave());
        
        // Legend
        const legendG = g.append("g")
          .attr("transform", \`translate(0, \${7 * (this.cellSize + this.cellGap) + 10})\`);
        
        legendG.append("text")
          .attr("fill", "#71717a")
          .attr("font-size", "10px")
          .attr("dominant-baseline", "middle")
          .text("Less");
        
        const legendColors = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
        legendColors.forEach((color, i) => {
          legendG.append("rect")
            .attr("x", 30 + i * (this.cellSize + 2))
            .attr("y", -this.cellSize / 2)
            .attr("width", this.cellSize)
            .attr("height", this.cellSize)
            .attr("rx", 2)
            .attr("fill", color);
        });
        
        legendG.append("text")
          .attr("x", 30 + 5 * (this.cellSize + 2) + 5)
          .attr("fill", "#71717a")
          .attr("font-size", "10px")
          .attr("dominant-baseline", "middle")
          .text("More");
      }
      
      onDayHover(d) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = this.dataByDay.get(dateStr);
        
        if (!dayData || dayData.length === 0) {
          this.tooltip.innerHTML = \`<strong>\${d3.timeFormat("%b %d, %Y")(d)}</strong><br>No activity\`;
          this.tooltip.classList.add('visible');
          return;
        }
        
        // Show tooltip
        const stats = this.calculateDayStats(dayData);
        this.tooltip.innerHTML = \`
          <strong>\${d3.timeFormat("%b %d, %Y")(d)}</strong><br>
          \${dayData.length} data points<br>
          \${stats.distance}m traveled
        \`;
        this.tooltip.classList.add('visible');
        
        // Load whole visualization on hover (if not already selected)
        if (this.selectedDate !== dateStr) {
          this.hoveredDate = dateStr;
          this.showDayStats(d, dayData);
          this.drawPathPlot(dayData);
          this.showSlider(dayData);
        }
      }
      
      onDayLeave() {
        this.hideTooltip();
        
        // If we were just hovering (not selected), clear the visualization
        if (this.hoveredDate && this.selectedDate !== this.hoveredDate) {
          this.hoveredDate = null;
          // Hide the visualizations if no date is selected
          if (!this.selectedDate) {
            document.getElementById('day-stats').style.display = 'none';
            document.getElementById('time-slider-section').style.display = 'none';
            document.getElementById('path-plot-container').style.display = 'none';
            document.getElementById('select-day-prompt').style.display = 'block';
          } else {
            // Restore the selected date's visualization
            const selectedDayData = this.dataByDay.get(this.selectedDate);
            if (selectedDayData) {
              const selectedDate = new Date(this.selectedDate);
              this.showDayStats(selectedDate, selectedDayData);
              this.drawPathPlot(selectedDayData);
              this.showSlider(selectedDayData);
            }
          }
        }
      }
      
      showTooltip(event, d) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = this.dataByDay.get(dateStr);
        
        if (!dayData || dayData.length === 0) {
          this.tooltip.innerHTML = \`<strong>\${d3.timeFormat("%b %d, %Y")(d)}</strong><br>No activity\`;
        } else {
          const stats = this.calculateDayStats(dayData);
          this.tooltip.innerHTML = \`
            <strong>\${d3.timeFormat("%b %d, %Y")(d)}</strong><br>
            \${dayData.length} data points<br>
            \${stats.distance}m traveled
          \`;
        }
        
        this.tooltip.classList.add('visible');
        this.moveTooltip(event);
      }
      
      moveTooltip(event) {
        this.tooltip.style.left = (event.clientX + 10) + 'px';
        this.tooltip.style.top = (event.clientY + 10) + 'px';
      }
      
      hideTooltip() {
        this.tooltip.classList.remove('visible');
      }
      
      onDayClick(d) {
        const dateStr = d.toISOString().split('T')[0];
        const dayData = this.dataByDay.get(dateStr);
        
        if (!dayData || dayData.length === 0) return;
        
        // Toggle selection: if already selected, unselect it
        if (this.selectedDate === dateStr) {
          this.selectedDate = null;
          this.selectedDayData = null;
          
          // Hide all visualizations
          document.getElementById('day-stats').style.display = 'none';
          document.getElementById('time-slider-section').style.display = 'none';
          document.getElementById('path-plot-container').style.display = 'none';
          document.getElementById('select-day-prompt').style.display = 'block';
        } else {
          // Select the new date
          this.selectedDate = dateStr;
          this.selectedDayData = dayData.sort((a, b) => a.time - b.time);
          
          // Show stats
          this.showDayStats(d, dayData);
          
          // Show path plot
          this.drawPathPlot(dayData);
          
          // Show slider
          this.showSlider(dayData);
        }
        
        // Redraw to update selection border
        this.draw();
      }
      
      calculateDayStats(dayData) {
        // Calculate total distance traveled
        let totalDistance = 0;
        for (let i = 1; i < dayData.length; i++) {
          const prev = dayData[i - 1];
          const curr = dayData[i];
          const dx = curr.location[0] - prev.location[0];
          const dy = curr.location[1] - prev.location[1];
          totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        
        // Calculate furthest radius from first point (home proxy)
        const home = dayData[0].location;
        let maxRadius = 0;
        for (const point of dayData) {
          const dx = point.location[0] - home[0];
          const dy = point.location[1] - home[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxRadius) maxRadius = dist;
        }
        
        // Calculate time "outside" (when position is beyond home threshold)
        let timeOutside = 0;
        for (const point of dayData) {
          const dx = point.location[0] - home[0];
          const dy = point.location[1] - home[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > this.HOME_THRESHOLD_METERS) {
            timeOutside += point.duration || this.DEFAULT_DURATION_SECONDS;
          }
        }
        
        return {
          distance: Math.round(totalDistance),
          radius: Math.round(maxRadius),
          timeOutside: Math.round(timeOutside / 60), // convert seconds to minutes
          points: dayData.length
        };
      }
      
      showDayStats(d, dayData) {
        const stats = this.calculateDayStats(dayData);
        
        document.getElementById('stats-date').textContent = d3.timeFormat("%Y-%m-%d")(d);
        document.getElementById('stat-distance').textContent = stats.distance + 'm';
        document.getElementById('stat-radius').textContent = stats.radius + 'm';
        document.getElementById('stat-outside').textContent = stats.timeOutside + 'min';
        document.getElementById('stat-points').textContent = stats.points;
        
        document.getElementById('day-stats').style.display = 'block';
        document.getElementById('select-day-prompt').style.display = 'none';
      }
      
      drawPathPlot(dayData) {
        const svg = this.pathSvg;
        svg.selectAll("*").remove();
        
        const margin = { top: 10, right: 10, bottom: 10, left: 10 };
        const containerWidth = svg.node().getBoundingClientRect().width || 800;
        const width = containerWidth - margin.left - margin.right;
        
        // Sort by time
        const sortedData = [...dayData].sort((a, b) => a.time - b.time);
        
        // Calculate extent once for both aspect ratio and scales
        const xExtent = d3.extent(sortedData, d => d.location[0]);
        const yExtent = d3.extent(sortedData, d => d.location[1]);
        
        const dataWidth = xExtent[1] - xExtent[0];
        const dataHeight = yExtent[1] - yExtent[0];
        
        // Use natural aspect ratio, but cap the height for very tall data
        let height;
        if (dataWidth > 0) {
          const naturalAspectRatio = dataHeight / dataWidth;
          height = Math.min(width * naturalAspectRatio, width * 0.75, 400);
        } else {
          height = 200; // Default if no width variance
        }
        
        // Ensure minimum height
        height = Math.max(height, 150);
        
        svg.attr("width", containerWidth).attr("height", height + margin.top + margin.bottom);
        
        const g = svg.append("g")
          .attr("transform", \`translate(\${margin.left},\${margin.top})\`);
        
        // Add padding to scales
        const xPad = (xExtent[1] - xExtent[0]) * 0.1 || 10;
        const yPad = (yExtent[1] - yExtent[0]) * 0.1 || 10;
        
        const x = d3.scaleLinear()
          .domain([xExtent[0] - xPad, xExtent[1] + xPad])
          .range([0, width]);
        
        const y = d3.scaleLinear()
          .domain([yExtent[0] - yPad, yExtent[1] + yPad])
          .range([height, 0]);
        
        // Store scales for slider
        this.pathScales = { x, y };
        this.pathG = g;
        
        // Time color scale
        const timeColorScale = d3.scaleSequential(d3.interpolateRainbow)
          .domain([0, 24]);
        
        // Draw single smoothed path with gradient effect
        // Use catmull-rom spline for smooth curves that pass through points
        const lineGenerator = d3.line()
          .x(d => x(d.location[0]))
          .y(d => y(d.location[1]))
          .curve(d3.curveCatmullRom.alpha(0.5));
        
        // Draw the full smoothed path first as a background
        g.append("path")
          .datum(sortedData)
          .attr("fill", "none")
          .attr("stroke", "#27272a")
          .attr("stroke-width", 3)
          .attr("d", lineGenerator);
        
        // Draw colored segments on top using the smoothed path
        // Group points by hour for smoother color transitions
        const hourGroups = d3.group(sortedData, d => new Date(d.time * 1000).getHours());
        
        // Create segments for each hour transition
        for (let i = 1; i < sortedData.length; i++) {
          const prevHour = new Date(sortedData[i-1].time * 1000).getHours();
          const currHour = new Date(sortedData[i].time * 1000).getHours();
          
          // Get a window of points around this segment for smoother curve
          const startIdx = Math.max(0, i - 2);
          const endIdx = Math.min(sortedData.length, i + 2);
          const windowData = sortedData.slice(startIdx, endIdx);
          
          g.append("path")
            .datum(windowData)
            .attr("fill", "none")
            .attr("stroke", timeColorScale(currHour))
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.8)
            .attr("d", lineGenerator);
        }
        
        // Position marker for slider (starts hidden)
        this.positionMarker = g.append("circle")
          .attr("class", "position-marker")
          .attr("r", 6)
          .attr("fill", "#fafafa")
          .attr("stroke", "#0a0a0a")
          .attr("stroke-width", 2)
          .style("display", "none");
        
        document.getElementById('path-plot-container').style.display = 'block';
      }
      
      drawActivityTimeline(dayData) {
        const svg = d3.select("#activity-timeline-svg");
        svg.selectAll("*").remove();
        
        const containerWidth = svg.node().getBoundingClientRect().width || 800;
        const height = 30;
        const margin = { left: 0, right: 0 };
        const width = containerWidth - margin.left - margin.right;
        
        svg.attr("width", containerWidth).attr("height", height);
        
        const g = svg.append("g")
          .attr("transform", \`translate(\${margin.left}, 0)\`);
        
        // Group data by hour
        const hourCounts = new Array(24).fill(0);
        dayData.forEach(d => {
          const hour = new Date(d.time * 1000).getHours();
          hourCounts[hour]++;
        });
        
        const maxCount = Math.max(...hourCounts);
        const barWidth = width / 24;
        
        // Time color scale matching the path
        const timeColorScale = d3.scaleSequential(d3.interpolateRainbow)
          .domain([0, 24]);
        
        // Draw bars
        hourCounts.forEach((count, hour) => {
          const barHeight = maxCount > 0 ? (count / maxCount) * (height - 4) : 0;
          g.append("rect")
            .attr("x", hour * barWidth + 1)
            .attr("y", height - barHeight - 2)
            .attr("width", Math.max(0, barWidth - 2))
            .attr("height", barHeight)
            .attr("fill", timeColorScale(hour))
            .attr("opacity", count > 0 ? 0.7 : 0.1);
        });
      }
      
      setupSlider() {
        const slider = document.getElementById('time-slider');
        slider.addEventListener('input', (e) => this.onSliderChange(e.target.value));
      }
      
      showSlider(dayData) {
        this.sliderData = [...dayData].sort((a, b) => a.time - b.time);
        
        // Guard against empty data
        if (this.sliderData.length === 0) {
          document.getElementById('time-slider-section').style.display = 'none';
          return;
        }
        
        // Get the date we're working with (from first data point)
        const firstTime = new Date(this.sliderData[0].time * 1000);
        const midnightStart = new Date(firstTime);
        midnightStart.setHours(0, 0, 0, 0);
        const midnightEnd = new Date(midnightStart);
        midnightEnd.setHours(23, 59, 59, 999);
        
        // Store midnight boundaries for slider calculation
        this.sliderStartTime = midnightStart.getTime() / 1000;
        this.sliderEndTime = midnightEnd.getTime() / 1000;
        
        document.getElementById('time-slider-section').style.display = 'block';
        
        // Draw activity timeline
        this.drawActivityTimeline(dayData);
        
        // Reset slider to midnight
        const slider = document.getElementById('time-slider');
        slider.value = 0;
        this.onSliderChange(0);
      }
      
      onSliderChange(value) {
        if (!this.sliderData || this.sliderData.length === 0) return;
        
        // Calculate the time based on slider position (0-100 maps to midnight-midnight)
        const timeInSeconds = this.sliderStartTime + (value / 100) * (this.sliderEndTime - this.sliderStartTime);
        
        // Binary search to find the closest data point to this time (more efficient for large datasets)
        let left = 0;
        let right = this.sliderData.length - 1;
        let closestPoint = this.sliderData[0];
        let minDiff = Math.abs(this.sliderData[0].time - timeInSeconds);
        
        while (left <= right) {
          const mid = Math.floor((left + right) / 2);
          const diff = Math.abs(this.sliderData[mid].time - timeInSeconds);
          
          if (diff < minDiff) {
            minDiff = diff;
            closestPoint = this.sliderData[mid];
          }
          
          if (this.sliderData[mid].time < timeInSeconds) {
            left = mid + 1;
          } else {
            right = mid - 1;
          }
        }
        
        // Update time display (show the slider time, not necessarily the data point time)
        const displayTime = new Date(timeInSeconds * 1000);
        document.getElementById('time-display').textContent = 
          d3.timeFormat("%H:%M:%S")(displayTime);
        
        // Update position marker with closest point
        if (this.positionMarker && this.pathScales) {
          // Only show marker if we have a reasonably close data point (within 30 minutes)
          if (minDiff < 1800) {
            this.positionMarker
              .style("display", "block")
              .attr("cx", this.pathScales.x(closestPoint.location[0]))
              .attr("cy", this.pathScales.y(closestPoint.location[1]));
          } else {
            this.positionMarker.style("display", "none");
          }
        }
      }
    }
  `;
}
