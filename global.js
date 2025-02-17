// Global variables for the selected mouse, measure, and tooltip timeout
let data = [];
let selectedMouse = "select";      // Default: first mouse
let selectedMeasure = "temp";  // Default: temperature
let selectedTime = "all";       // Default: all times
let dailyMeans = [];
let tooltipTimeout; // Global variable to manage tooltip hide delay

// We'll also store a reference to the SVG so we can update it smoothly.
let chartSVG = null;

// Load CSV data from mouse.csv (located in the parent directory)
async function loadData() {
  data = await d3.csv("mouse.csv", (row, index) => {
    return {
      // Use the row index as a unique minute identifier (if needed)
      Minute: index,
      Day: +row.Day, // Assuming CSV has a Day column
      Night: row.Night.toLowerCase() === "true",

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
    d3.select("#male-button").classed("selected-button", false);
    d3.select("#female-button").classed("selected-button", false);
    d3.select("#both-button").classed("selected-button", false);
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

  // Toggle button for Male
  d3.select("#male-button").on("click", function () {
    const isSelected = d3.select(this).classed("selected-button");
    d3.select("#male-button").classed("selected-button", !isSelected);
    d3.select("#female-button").classed("selected-button", false);
    d3.select("#both-button").classed("selected-button", false);
    selectedMouse = isSelected ? "select" : "male";
    d3.select("#mouse-select").property("value", "select");
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Female
  d3.select("#female-button").on("click", function () {
    const isSelected = d3.select(this).classed("selected-button");
    d3.select("#female-button").classed("selected-button", !isSelected);
    d3.select("#male-button").classed("selected-button", false);
    d3.select("#both-button").classed("selected-button", false);
    selectedMouse = isSelected ? "select" : "female";
    d3.select("#mouse-select").property("value", "select");
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Both
  d3.select("#both-button").on("click", function () {
    const isSelected = d3.select(this).classed("selected-button");
    d3.select("#both-button").classed("selected-button", !isSelected);
    d3.select("#male-button").classed("selected-button", false);
    d3.select("#female-button").classed("selected-button", false);
    selectedMouse = isSelected ? "select" : "both";
    d3.select("#mouse-select").property("value", "select");
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Day
  d3.select("#day-button").on("click", function () {
    const isSelected = d3.select(this).classed("selected-button");
    d3.select("#day-button").classed("selected-button", !isSelected);
    d3.select("#night-button").classed("selected-button", false);
    selectedTime = isSelected ? "all" : "day";
    updateDailyMeans();
    plotData();
  });

  // Toggle button for Night
  d3.select("#night-button").on("click", function () {
    const isSelected = d3.select(this).classed("selected-button");
    d3.select("#night-button").classed("selected-button", !isSelected);
    d3.select("#day-button").classed("selected-button", false);
    selectedTime = isSelected ? "all" : "night";
    updateDailyMeans();
    plotData();
  });
});

// Update daily means based on selected mouse and measure.
// Now also computing the min and max for each day.
function updateDailyMeans() {
  dailyMeans = [];
  if (selectedMouse === "select") {
    return;
  }

  const filteredData = data.filter(d => {
    if (selectedTime === "day") {
      return !d.Night;  // keep day rows (Night is false)
    } else if (selectedTime === "night") {
      return d.Night;   // keep night rows (Night is true)
    }
    return true;        // "all" selected: do not filter
  });
  

  const groupedData = d3.group(filteredData, (d) => d.Day);

  if (selectedMouse === "female" || selectedMouse === "male" || selectedMouse === "both") {
    const genderPrefixes = selectedMouse === "both" ? ["f", "m"] : [selectedMouse === "female" ? "f" : "m"];
    groupedData.forEach((values, key) => {
      const meanValues = [];
      genderPrefixes.forEach((prefix) => {
        for (let i = 1; i <= 13; i++) {
          const columnName = `${prefix}${i}_${selectedMeasure}`;
          const meanValue = d3.mean(values, (d) => d[columnName]);
          if (!isNaN(meanValue)) {
            meanValues.push(meanValue);
          }
        }
      });
      const overallMean = d3.mean(meanValues);
      const overallMin = d3.min(meanValues);
      const overallMax = d3.max(meanValues);
      dailyMeans.push({ Day: key, Mean: overallMean, Min: overallMin, Max: overallMax });
    });
  } else {
    groupedData.forEach((values, key) => {
      const columnName = `${selectedMouse}_${selectedMeasure}`;
      const meanValue = d3.mean(values, (d) => d[columnName]);
      const minValue = d3.min(values, (d) => d[columnName]);
      const maxValue = d3.max(values, (d) => d[columnName]);
      dailyMeans.push({ Day: key, Mean: meanValue, Min: minValue, Max: maxValue });
    });
  }
}

// Plot the chart using D3 with smooth transitions.
function plotData() {
  const width = 1400;
  const height = 800;
  const margin = { top: 10, right: 10, bottom: 40, left: 40 };

  // let chartBackground;
  // if(selectedTime === "day"){
  //   chartBackground = "rgba(255, 255, 200, 0.3)";

  // } else if(selectedTime === "night"){
  //   chartBackground = "rgba(230, 200, 250, 0.3)"
  // } else {
  //   chartBackground = "";
  // }

  // d3.select("#chart").style("background-color", chartBackground);


  let pageBackground;
  if (selectedTime === "day") {
    pageBackground = "rgba(255, 255, 200, 0.3)";
  } else if (selectedTime === "night") {
    pageBackground = "rgba(230, 200, 250, 0.3)";
  } else {
    pageBackground = "";
  }

  d3.select("body").style("background-color", pageBackground);

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
  const y = d3.scaleLinear().domain([0, 55]).nice().range([usableArea.height, 0]);

  // Update x-axis.
  const xAxis = d3.axisBottom(x).ticks(14);
  chartSVG
    .select(".x-axis")
    .transition()
    .duration(500)
    .attr("transform", `translate(0,${usableArea.height})`)
    .call(xAxis)
    .style("font-size", "16px");

  // X-axis label.
  chartSVG
    .select(".x-label")
    .attr("x", usableArea.width / 2)
    .attr("y", usableArea.height + margin.bottom +15)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")  
    .text("Day Number");

  // Update y-axis.
  const yAxis = d3.axisLeft(y);
  chartSVG.select(".y-axis").transition().duration(500).call(yAxis) .style("font-size", "16px");

  // Y-axis label.
  const yLabelText =
  selectedMeasure === "temp"
    ? "Body Temperature (°C)"
    : "Activity Score";
  chartSVG
    .select(".y-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -usableArea.height / 2)
    .attr("y", -margin.left -10)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")  
    .text(yLabelText);

  // Update gridlines.
  chartSVG
    .select(".gridlines")
    .transition()
    .duration(500)
    .call(d3.axisLeft(y).tickFormat("").tickSize(-usableArea.width));


  const trendColor = selectedMeasure === "temp" ? "red" : "green";
    // Update the light blue trend line.
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
    .attr("stroke", trendColor)
    .attr("stroke-width", 2)
    .attr("d", lineGenerator(dailyMeans));

  let dotColor;
  if (selectedMouse === "male"){
    dotColor = "rgb(11, 164, 240)";
  } else if (selectedMouse === "female"){
    dotColor = "rgb(224, 84, 108)";
  } else {
    if (selectedMouse.startsWith("f")){
      dotColor = "rgb(224, 84, 108)";
    } else if (selectedMouse.startsWith("m")){
      dotColor = "rgb(11, 164, 240)";
    } else {
      dotColor = "grey";
    }
  }
  console.log("selectedMouse:", selectedMouse, "dotColor:", dotColor);
  
    // Update dots using the enter-update-exit pattern.
  const dots = chartSVG.select(".dots").selectAll("circle").data(dailyMeans, d => d.Day);

  // EXIT old elements.
  dots
    .exit()
    .transition()
    .duration(500)
    .attr("r", 0)
    .remove();

  // If the dailyMeans array is empty, do not plot any dots.
  if (dailyMeans.length === 0) {
    return;
  }

  // UPDATE existing elements.
  dots
    .transition()
    .duration(500)
    .attr("fill", dotColor)
    .attr("cx", (d) => x(d.Day))
    .attr("cy", (d) => y(d.Mean));

  // ENTER new elements.
  dots
    .enter()
    .append("circle")
    .attr("cx", (d) => x(d.Day))
    .attr("cy", (d) => y(d.Mean))
    .attr("fill", dotColor)
    .style("fill-opacity", 0.7)
    .on("mouseenter", function (event, d) {
      //d3.select(this).transition().duration(200).attr("fill", "hotpink");
      updateTooltipContent(d);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on("mousemove", function (event, d) {
      updateTooltipPosition(event);
    })
    .on("mouseleave", function (event, d) {
      //d3.select(this).transition().duration(200).attr("fill", "steelblue");
      tooltipTimeout = setTimeout(() => {
        updateTooltipVisibility(false);
      }, 200);
    })
    .transition()
    .duration(500)
    .attr("r", 10);
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