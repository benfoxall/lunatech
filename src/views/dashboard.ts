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
    <svg id="heatmap"></svg>
    <svg id="timeline"></svg>
    <svg id="timeOfDay"></svg>
  </div>

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
