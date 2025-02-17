// Global variables for the selected mouse, measure, and tooltip timeout
let data = [];
let selectedMouse = "f1";      // Default: first mouse
let selectedMeasure = "temp";  // Default: temperature
let dailyMeans = [];
let tooltipTimeout; // Global variable to manage tooltip hide delay

// We'll also store a reference to the SVG so we can update it smoothly.
let chartSVG = null;

// Load CSV data from mouse.csv (located in the parent directory)
async function loadData() {
  data = await d3.csv("../mouse.csv", (row, index) => {
    return {
      // Use the row index as a unique minute identifier (if needed)
      Minute: index,
      Day: +row.Day, // Assuming CSV has a Day column

      // Female Temperatures
      f1_temp: +row.f1_temp, f2_temp: +row.f2_temp, f3_temp: +row.f3_temp,
      f4_temp: +row.f4_temp, f5_temp: +row.f5_temp, f6_temp: +row.f6_temp,
      f7_temp: +row.f7_temp, f8_temp: +row.f8_temp, f9_temp: +row.f9_temp,
      f10_temp: +row.f10_temp, f11_temp: +row.f11_temp, f12_temp: +row.f12_temp,
      f13_temp: +row.f13_temp,

      // Male Temperatures
      m1_temp: +row.m1_temp, m2_temp: +row.m2_temp, m3_temp: +row.m3_temp,
      m4_temp: +row.m4_temp, m5_temp: +row.m5_temp, m6_temp: +row.m6_temp,
      m7_temp: +row.m7_temp, m8_temp: +row.m8_temp, m9_temp: +row.m9_temp,
      m10_temp: +row.m10_temp, m11_temp: +row.m11_temp, m12_temp: +row.m12_temp,
      m13_temp: +row.m13_temp,

      // Female Activity
      f1_act: +row.f1_act, f2_act: +row.f2_act, f3_act: +row.f3_act,
      f4_act: +row.f4_act, f5_act: +row.f5_act, f6_act: +row.f6_act,
      f7_act: +row.f7_act, f8_act: +row.f8_act, f9_act: +row.f9_act,
      f10_act: +row.f10_act, f11_act: +row.f11_act, f12_act: +row.f12_act,
      f13_act: +row.f13_act,

      // Male Activity
      m1_act: +row.m1_act, m2_act: +row.m2_act, m3_act: +row.m3_act,
      m4_act: +row.m4_act, m5_act: +row.m5_act, m6_act: +row.m6_act,
      m7_act: +row.m7_act, m8_act: +row.m8_act, m9_act: +row.m9_act,
      m10_act: +row.m10_act, m11_act: +row.m11_act, m12_act: +row.m12_act,
      m13_act: +row.m13_act,
    };
  });

  updateDailyMeans();
  plotData();
}

// When the DOM is loaded, load the data and add event listeners
document.addEventListener("DOMContentLoaded", async () => {
  await loadData();

  // When the dropdown value changes, update the selected mouse and replot
  d3.select("#mouse-select").on("change", function () {
    selectedMouse = d3.select(this).property("value");
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Temperature
  d3.select("#temp-button").on("click", function () {
    selectedMeasure = "temp";
    d3.select("#temp-button").classed("selected-button", true);
    d3.select("#act-button").classed("selected-button", false);
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Activity
  d3.select("#act-button").on("click", function () {
    selectedMeasure = "act";
    d3.select("#act-button").classed("selected-button", true);
    d3.select("#temp-button").classed("selected-button", false);
    updateDailyMeans();
    plotData();
  });
});

// Update daily means based on selected mouse and measure.
// Now also computing the min and max for each day.
function updateDailyMeans() {
  dailyMeans = [];
  const groupedData = d3.group(data, (d) => d.Day);
  groupedData.forEach((values, key) => {
    const columnName = `${selectedMouse}_${selectedMeasure}`;
    const meanValue = d3.mean(values, (d) => d[columnName]);
    const minValue = d3.min(values, (d) => d[columnName]);
    const maxValue = d3.max(values, (d) => d[columnName]);
    dailyMeans.push({ Day: key, Mean: meanValue, Min: minValue, Max: maxValue });
  });
}

// Plot the chart using D3 with smooth transitions.
function plotData() {
  const width = 800;
  const height = 500;
  const margin = { top: 10, right: 10, bottom: 50, left: 60 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // If the SVG hasn't been created yet, create it and the necessary groups.
  if (!chartSVG) {
    chartSVG = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible")
      .append("g")
      .attr("class", "chart-group")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create groups for axes, labels, gridlines, trend line, and dots.
    chartSVG.append("g").attr("class", "x-axis");
    chartSVG.append("g").attr("class", "y-axis");
    chartSVG.append("text").attr("class", "x-label");
    chartSVG.append("text").attr("class", "y-label");
    chartSVG.append("g").attr("class", "gridlines");
    chartSVG.append("path").attr("class", "trend-line");
    chartSVG.append("g").attr("class", "dots");
  }

  // Update scales.
  const x = d3.scaleLinear().domain([0, 14]).range([0, usableArea.width]);
  // Ensure y-axis always starts at 0. The max is the maximum of the daily Max values.
//   const yMax = d3.max(dailyMeans, (d) => d.Max);
  const y = d3.scaleLinear().domain([0, 55]).nice().range([usableArea.height, 0]);

  // Update x-axis.
  const xAxis = d3.axisBottom(x).ticks(14);
  chartSVG
    .select(".x-axis")
    .transition()
    .duration(500)
    .attr("transform", `translate(0,${usableArea.height})`)
    .call(xAxis);

  // X-axis label.
  chartSVG
    .select(".x-label")
    .attr("x", usableArea.width / 2)
    .attr("y", usableArea.height + margin.bottom - 5)
    .attr("text-anchor", "middle")
    .text("Day Number");

  // Update y-axis.
  const yAxis = d3.axisLeft(y);
  chartSVG.select(".y-axis").transition().duration(500).call(yAxis);

  // Y-axis label.
  const yLabelText =
    selectedMeasure === "temp"
      ? "Body Temperature (Degrees Celsius)"
      : "Activity Score";
  chartSVG
    .select(".y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -usableArea.height / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .text(yLabelText);

  // Update gridlines.
  chartSVG
    .select(".gridlines")
    .transition()
    .duration(500)
    .call(d3.axisLeft(y).tickFormat("").tickSize(-usableArea.width));

  // Update the green trend line.
  const lineGenerator = d3
    .line()
    .x((d) => x(d.Day))
    .y((d) => y(d.Mean))
    .curve(d3.curveMonotoneX); // Smooth curve
  chartSVG
    .select(".trend-line")
    .transition()
    .duration(500)
    .attr("fill", "none")
    .attr("stroke", "green")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator(dailyMeans));

  // Update dots using the enter-update-exit pattern.
  const dots = chartSVG.select(".dots").selectAll("circle").data(dailyMeans, d => d.Day);

  // EXIT old elements.
  dots
    .exit()
    .transition()
    .duration(500)
    .attr("r", 0)
    .remove();

  // UPDATE existing elements.
  dots
    .transition()
    .duration(500)
    .attr("cx", (d) => x(d.Day))
    .attr("cy", (d) => y(d.Mean));

  // ENTER new elements.
  dots
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.Day))
    .attr("cy", (d) => y(d.Mean))
    .attr("r", 0)
    .attr("fill", "steelblue")
    .style("fill-opacity", 0.7)
    .on("mouseenter", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "hotpink");
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mousemove", function (event, d) {
      updateTooltipPosition(event);
    })
    .on("mouseleave", function (event, d) {
      d3.select(this).transition().duration(200).attr("fill", "steelblue");
      tooltipTimeout = setTimeout(() => {
        updateTooltipVisibility(false);
      }, 200);
    })
    .transition()
    .duration(500)
    .attr("r", 5);
}

// Update tooltip content to show day, mean, min, and max values.
function updateTooltipContent(datum) {
  const dayElem = document.getElementById("day-number");
  const meanElem = document.getElementById("mean-activity");
  const minElem = document.getElementById("min-value");
  const maxElem = document.getElementById("max-value");

  if (!datum || !datum.Day) {
    dayElem.textContent = "";
    meanElem.textContent = "";
    minElem.textContent = "";
    maxElem.textContent = "";
    return;
  }

  dayElem.textContent = datum.Day;
  meanElem.textContent = datum.Mean.toFixed(2);
  minElem.textContent = datum.Min.toFixed(2);
  maxElem.textContent = datum.Max.toFixed(2);
}

// Show or hide the tooltip.
function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById("mean-tooltip");
  tooltip.hidden = !isVisible;
}

// Update tooltip position based on mouse event.
function updateTooltipPosition(event) {
  const tooltip = document.getElementById("mean-tooltip");
  tooltip.style.left = `${event.clientX + 10}px`;
  tooltip.style.top = `${event.clientY + 10}px`;
}
