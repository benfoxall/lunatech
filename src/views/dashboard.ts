// Dashboard page that displays the tracker visualization
export function dashboardPage(trackerId: string, positionsData: any): string {
  // Convert positions data to JSON string for embedding in the page
  // Escape to prevent XSS via script injection
  const dataJson = JSON.stringify(positionsData)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tracker ${trackerId} Dashboard - Lunatech</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .header {
      max-width: 1200px;
      margin: 0 auto 20px;
      background: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    h1 {
      font-size: 2em;
      color: #667eea;
      margin: 0;
    }
    
    .nav-links {
      display: flex;
      gap: 15px;
    }
    
    .back-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      padding: 8px 16px;
      border: 2px solid #667eea;
      border-radius: 5px;
      transition: all 0.2s;
    }
    
    .back-link:hover {
      background: #667eea;
      color: white;
    }
    
    #dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
    
    .loading {
      text-align: center;
      padding: 60px;
      font-size: 1.2em;
      color: #666;
    }
    
    .error {
      text-align: center;
      padding: 60px;
      color: #d32f2f;
      background: #ffebee;
      border-radius: 10px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🐾 Tracker Dashboard</h1>
    <div class="nav-links">
      <a href="/trackers" class="back-link">← All Trackers</a>
      <a href="/" class="back-link">Home</a>
    </div>
  </div>
  
  <div id="dashboard-container">
    <div class="loading">Loading tracker data...</div>
    <svg id="heatmap"></svg>
    <svg id="timeline"></svg>
    <svg id="timeOfDay"></svg>
  </div>

  <script type="module">
    import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
    import { hexbin } from "https://cdn.skypack.dev/d3-hexbin";
    import proj from "https://cdn.skypack.dev/proj4";

    let data;
    let heatmap, timeline, timeOfDay;
    let filteredData;

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
        // Get embedded data
        const rawData = ${dataJson};
        
        // Extract positions array (it's a tuple with one array)
        const locationsList = rawData[0];
        
        if (!locationsList || locationsList.length === 0) {
          throw new Error('No location data available');
        }

        // Use first location as origin and map all positions
        const origin = locationsList[0];
        const mapped = locationsList.map(position => localise(position, origin));
        
        // Transform to match expected format (location instead of position)
        data = mapped.map(d => ({
          ...d,
          location: d.position,
          duration: 60 // Default duration in seconds
        }));

        data = data.filter((d) => d.pos_uncertainty < 50);
        
        // Hide loading message
        document.querySelector('.loading').style.display = 'none';

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
      } catch (error) {
        console.error('Error loading data:', error);
        document.querySelector('.loading').innerHTML = 
          '<div class="error"><h2>Error Loading Data</h2><p>' + error.message + '</p></div>';
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
