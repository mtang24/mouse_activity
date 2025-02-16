

// // Set the dimensions and margins of the graph
// const margin = { top: 50, right: 150, bottom: 50, left: 70 },
//       width  = 900 - margin.left - margin.right,
//       height = 500 - margin.top - margin.bottom;

// // Append the SVG object to the container with id "chart"
// const svg = d3.select("#chart")
//   .attr("width", width + margin.left + margin.right)
//   .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//   .attr("transform", `translate(${margin.left},${margin.top})`);

// // Global data array
// let data = [];

// // List of mouse IDs (adjust if needed)
// const mouseList = [
//   "f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","f13",
//   "m1","m2","m3","m4","m5","m6","m7","m8","m9","m10","m11","m12","m13"
// ];

// // Initialize the dropdown options
// function initializeDropdown() {
//   const dropdown = d3.select("#mouseDropdown");
//   dropdown.selectAll("option").remove();
  
//   // Add an "All Mice" option
//   dropdown.append("option")
//     .attr("value", "all")
//     .text("All Mice");
  
//   // Add each mouse as an option
//   mouseList.forEach(m => {
//     dropdown.append("option")
//       .attr("value", m)
//       .text(m.toUpperCase());
//   });
  
//   // Redraw the chart when the dropdown selection changes
//   dropdown.on("change", updateChart);
// }

// // Load CSV data
// async function loadData() {
//   // Adjust the CSV loader as needed.
//   // This code assumes your CSV has columns like: Day, Minute, f1_temp, f1_act, …, m13_act
//   data = await d3.csv("mouse2.csv", function(row) {
//     return {
//       Day: +row.Day,              // not used for plotting minutes, but available if needed
//       Minute: +row.Minute,        // minutes should be 0 to 1439
//       // For each mouse, convert the columns to numbers:
//       f1_temp: +row.f1_temp,  f2_temp: +row.f2_temp,  f3_temp: +row.f3_temp,
//       f4_temp: +row.f4_temp,  f5_temp: +row.f5_temp,  f6_temp: +row.f6_temp,
//       f7_temp: +row.f7_temp,  f8_temp: +row.f8_temp,  f9_temp: +row.f9_temp,
//       f10_temp: +row.f10_temp, f11_temp: +row.f11_temp, f12_temp: +row.f12_temp,
//       f13_temp: +row.f13_temp,
      
//       f1_act: +row.f1_act,  f2_act: +row.f2_act,  f3_act: +row.f3_act,
//       f4_act: +row.f4_act,  f5_act: +row.f5_act,  f6_act: +row.f6_act,
//       f7_act: +row.f7_act,  f8_act: +row.f8_act,  f9_act: +row.f9_act,
//       f10_act: +row.f10_act, f11_act: +row.f11_act, f12_act: +row.f12_act,
//       f13_act: +row.f13_act,
      
//       m1_temp: +row.m1_temp,  m2_temp: +row.m2_temp,  m3_temp: +row.m3_temp,
//       m4_temp: +row.m4_temp,  m5_temp: +row.m5_temp,  m6_temp: +row.m6_temp,
//       m7_temp: +row.m7_temp,  m8_temp: +row.m8_temp,  m9_temp: +row.m9_temp,
//       m10_temp: +row.m10_temp, m11_temp: +row.m11_temp, m12_temp: +row.m12_temp,
//       m13_temp: +row.m13_temp,
      
//       m1_act: +row.m1_act,  m2_act: +row.m2_act,  m3_act: +row.m3_act,
//       m4_act: +row.m4_act,  m5_act: +row.m5_act,  m6_act: +row.m6_act,
//       m7_act: +row.m7_act,  m8_act: +row.m8_act,  m9_act: +row.m9_act,
//       m10_act: +row.m10_act, m11_act: +row.m11_act, m12_act: +row.m12_act,
//       m13_act: +row.m13_act,
//     };
//   });
  
//   // Initialize the dropdown options
//   initializeDropdown();
  
//   // Draw the initial chart
//   updateChart();
// }

// function updateChart() {
    
//   // Get the selected measure from the radio buttons ("temp" or "act")
//   const selectedMeasure = d3.select('input[name="measure"]:checked').property("value");

//   svg.selectAll("*").remove();


//   // Get the selected mouse from the dropdown ("all" or a specific mouse id)
//   const selectedMouse = d3.select("#mouseDropdown").property("value");
  
//   // Group the data by Minute (averaging across days)
//   const aggregatedDataMap = d3.rollup(
//     data,
//     values => {
//       const result = {};
//       // Use the minute value from any row in the group
//       result.Minute = values[0].Minute;  
      
//       // For each mouse, compute the average value for the selected measure over all days for this minute
//       const aggregatedValues = mouseList.map(m => d3.mean(values, d => d[`${m}_${selectedMeasure}`]));
      
//       // Overall aggregated stats across mice:
//       result.mean = d3.mean(aggregatedValues);
//       result.min = d3.min(aggregatedValues);
//       result.max = d3.max(aggregatedValues);
      
//       // Save the individual averaged values for each mouse
//       mouseList.forEach((m, i) => {
//         result[`${m}_${selectedMeasure}`] = aggregatedValues[i];
//       });
      
//       return result;
//     },
//     d => d.Minute
//   );
  
//   // Convert the rollup map to an array
//   const aggregatedData = Array.from(aggregatedDataMap.values());
  
//   // Sort by Minute (ascending)
//   aggregatedData.sort((a, b) => a.Minute - b.Minute);
  
//   // Create X scale for minutes (displaying from 1 to 1440)
//   const x = d3.scaleLinear()
//     .domain([1, 1440])
//     .range([0, width]);
  
//   // Create Y scale based on the aggregated confidence interval values
//   const y = d3.scaleLinear()
//     .domain([ d3.min(aggregatedData, d => d.min), d3.max(aggregatedData, d => d.max) ])
//     .range([height, 0])
//     .nice();
  
//   // Add X axis (minutes)
//   const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
//   svg.append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(xAxis);
  
//   // Add Y axis
//   const yAxis = d3.axisLeft(y);
//   svg.append("g")
//     .call(yAxis);
  
//   // Define the area generator for the confidence interval (from min to max)
//   const area = d3.area()
//     // Note: our data Minute is 0-based, so add 1 for display
//     .x(d => x(d.Minute + 1))
//     .y0(d => y(d.min))
//     .y1(d => y(d.max));
  
//   // Append the confidence interval area (aggregated over all mice, averaged over days)
//   svg.append("path")
//     .attr("class", "line")
//     .datum(aggregatedData)
//     .attr("fill", "#cce5df")
//     .attr("stroke", "none")
//     .attr("d", area);
  
//   // Determine the value for the line:
//   // If "All Mice" is selected, use the aggregated mean;
//   // Otherwise, use the specific mouse's averaged value.
//   const lineValueAccessor = d => selectedMouse === "all" ? d.mean : d[`${selectedMouse}_${selectedMeasure}`];
  
//   // Define the line generator for the selected measure values
//   const lineGenerator = d3.line()
//     .x(d => x(d.Minute + 1))
//     .y(d => y(lineValueAccessor(d)));
  
//   // Append the line
//   svg.append("path")
//     .attr("class", "cv")
//     .datum(aggregatedData)
//     .attr("fill", "none")
//     .attr("stroke", "steelblue")
//     .attr("stroke-width", 1.5)
//     .attr("d", lineGenerator);

//   // Add a chart title
//   svg.append("text")
//     .attr("class", "title")
//     .attr("x", width / 2)
//     .attr("y", -20)
//     .attr("text-anchor", "middle")
//     .style("font-size", "16px")
//     .text(`${selectedMouse === "all" ? "Mean (All Mice)" : selectedMouse.toUpperCase()} ${selectedMeasure === "temp" ? "Temperature" : "Activity"} vs. Minute (Averaged over Days)`);
// }
  
// // Attach event listener to the measure radio buttons
// d3.selectAll('input[name="measure"]').on("change", updateChart);
  
// // Finally, load the data
// loadData();
// Set the dimensions and margins of the graph
const margin = { top: 50, right: 150, bottom: 50, left: 70 },
      width  = 900 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Append the SVG object to the container with id "chart"
const svg = d3.select("#chart")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// Global data array
let data = [];

// List of mouse IDs (adjust if needed)
const mouseList = [
  "f1","f2","f3","f4","f5","f6","f7","f8","f9","f10","f11","f12","f13",
  "m1","m2","m3","m4","m5","m6","m7","m8","m9","m10","m11","m12","m13"
];

// Initialize the dropdown options
function initializeDropdown() {
  const dropdown = d3.select("#mouseDropdown");
  dropdown.selectAll("option").remove();
  
  // Add an "All Mice" option
  dropdown.append("option")
    .attr("value", "all")
    .text("All Mice");
  
  // Add each mouse as an option
  mouseList.forEach(m => {
    dropdown.append("option")
      .attr("value", m)
      .text(m.toUpperCase());
  });
  
  // Redraw the chart when the dropdown selection changes
  dropdown.on("change", updateChart);
}

// Attach event listeners to the measure buttons
function initializeMeasureButtons() {
  d3.select("#temp-button").on("click", function() {
    d3.select("#temp-button").classed("selected-button", true);
    d3.select("#act-button").classed("selected-button", false);
    updateChart();
  });
  d3.select("#act-button").on("click", function() {
    d3.select("#act-button").classed("selected-button", true);
    d3.select("#temp-button").classed("selected-button", false);
    updateChart();
  });
}

// Load CSV data
async function loadData() {
  // Adjust the CSV loader as needed.
  // This code assumes your CSV (mouse2.csv) has columns:
  // Day, Minute, f1_temp, f1_act, …, m13_act
  data = await d3.csv("mouse2.csv", function(row) {
    return {
      Day: +row.Day,
      Minute: +row.Minute,
      f1_temp: +row.f1_temp,  f2_temp: +row.f2_temp,  f3_temp: +row.f3_temp,
      f4_temp: +row.f4_temp,  f5_temp: +row.f5_temp,  f6_temp: +row.f6_temp,
      f7_temp: +row.f7_temp,  f8_temp: +row.f8_temp,  f9_temp: +row.f9_temp,
      f10_temp: +row.f10_temp, f11_temp: +row.f11_temp, f12_temp: +row.f12_temp,
      f13_temp: +row.f13_temp,
      
      f1_act: +row.f1_act,  f2_act: +row.f2_act,  f3_act: +row.f3_act,
      f4_act: +row.f4_act,  f5_act: +row.f5_act,  f6_act: +row.f6_act,
      f7_act: +row.f7_act,  f8_act: +row.f8_act,  f9_act: +row.f9_act,
      f10_act: +row.f10_act, f11_act: +row.f11_act, f12_act: +row.f12_act,
      f13_act: +row.f13_act,
      
      m1_temp: +row.m1_temp,  m2_temp: +row.m2_temp,  m3_temp: +row.m3_temp,
      m4_temp: +row.m4_temp,  m5_temp: +row.m5_temp,  m6_temp: +row.m6_temp,
      m7_temp: +row.m7_temp,  m8_temp: +row.m8_temp,  m9_temp: +row.m9_temp,
      m10_temp: +row.m10_temp, m11_temp: +row.m11_temp, m12_temp: +row.m12_temp,
      m13_temp: +row.m13_temp,
      
      m1_act: +row.m1_act,  m2_act: +row.m2_act,  m3_act: +row.m3_act,
      m4_act: +row.m4_act,  m5_act: +row.m5_act,  m6_act: +row.m6_act,
      m7_act: +row.m7_act,  m8_act: +row.m8_act,  m9_act: +row.m9_act,
      m10_act: +row.m10_act, m11_act: +row.m11_act, m12_act: +row.m12_act,
      m13_act: +row.m13_act,
    };
  });
  
  initializeDropdown();
  initializeMeasureButtons();
  updateChart();
}

function updateChart() {
  // Remove everything from the SVG group before updating
  svg.selectAll("*").remove();
  
  // Get the selected measure from the button with class "selected-button"
  const selectedMeasure = d3.select(".selected-button").attr("data-measure");
  
  // Get the selected mouse from the dropdown ("all" or a specific mouse id)
  const selectedMouse = d3.select("#mouseDropdown").property("value");
  
  // Group the data by Minute (averaging across days)
  const aggregatedDataMap = d3.rollup(
    data,
    values => {
      const result = {};
      // Use the minute value from any row in the group
      result.Minute = values[0].Minute;
      
      // For each mouse, compute the average value for the selected measure over all days for this minute
      const aggregatedValues = mouseList.map(m => d3.mean(values, d => d[`${m}_${selectedMeasure}`]));
      
      // Overall aggregated stats across mice:
      result.mean = d3.mean(aggregatedValues);
      result.min = d3.min(aggregatedValues);
      result.max = d3.max(aggregatedValues);
      
      // Save the individual averaged values for each mouse
      mouseList.forEach((m, i) => {
        result[`${m}_${selectedMeasure}`] = aggregatedValues[i];
      });
      
      return result;
    },
    d => d.Minute
  );
  
  // Convert the rollup map to an array and sort by Minute
  const aggregatedData = Array.from(aggregatedDataMap.values())
    .sort((a, b) => a.Minute - b.Minute);
  
  // Create X scale for minutes (displaying from 1 to 1440)
  const x = d3.scaleLinear()
    .domain([1, 1440])
    .range([0, width]);
  
  // Create Y scale based on the aggregated confidence interval values
  const y = d3.scaleLinear()
    .domain([ d3.min(aggregatedData, d => d.min), d3.max(aggregatedData, d => d.max) ])
    .range([height, 0])
    .nice();
  
  // Add X axis (minutes)
  const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);
  
  // Add Y axis
  const yAxis = d3.axisLeft(y);
  svg.append("g")
    .call(yAxis);
  
  // Define the area generator for the confidence interval (from min to max)
  const area = d3.area()
    // Our data Minute is 0-based, so add 1 for display
    .x(d => x(d.Minute + 1))
    .y0(d => y(d.min))
    .y1(d => y(d.max));
  
  // Append the confidence interval area (aggregated over all mice, averaged over days)
  svg.append("path")
    .datum(aggregatedData)
    .attr("fill", "#cce5df")
    .attr("stroke", "none")
    .attr("d", area);
  
  // Determine the value for the line:
  // If "All Mice" is selected, use the aggregated mean;
  // Otherwise, use the specific mouse's averaged value.
  const lineValueAccessor = d => selectedMouse === "all" ? d.mean : d[`${selectedMouse}_${selectedMeasure}`];
  
  // Define the line generator for the selected measure values
  const lineGenerator = d3.line()
    .x(d => x(d.Minute + 1))
    .y(d => y(lineValueAccessor(d)));
  
  // Append the line
  svg.append("path")
    .datum(aggregatedData)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", lineGenerator);
  
  // Append the chart title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text(`${selectedMouse === "all" ? "Mean (All Mice)" : selectedMouse.toUpperCase()} ${selectedMeasure === "temp" ? "Temperature" : "Activity"} vs. Minute (Averaged over Days)`);
}
  
// Finally, load the data
loadData();
