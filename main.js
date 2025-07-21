// Cleaned data
const data = [
    { category: "18 to 24 years",
        reasons: {"Out of town": 8.8,
                  "Forgot to vote": 5.7,
                  "COVID-19 concerns": 2.3,
                  "Illness/Disability": 4.5,
                  "Not interested": 19.2,
                  "Too busy": 18.4,
                  "Transportation": 3.0,
                  "Dislike candidates": 11,
                  "Registration problems": 4.9,
                  "Other": 15.7}},
    { category: "25 to 44 years",
        reasons: {"Out of town": 5.8,
                  "Forgot to vote": 3.6,
                  "COVID-19 concerns": 3.8,
                  "Illness/Disability": 5.8,
                  "Not interested": 19.8,
                  "Too busy": 16.3,
                  "Transportation": 1.4,
                  "Dislike candidates": 16.7,
                  "Registration problems": 5.8,
                  "Other": 14.4}},
    { category: "45 to 64 years",
        reasons: {"Out of town": 6.3,
                  "Forgot to vote": 3.2,
                  "COVID-19 concerns": 4.1,
                  "Illness/Disability": 15.8,
                  "Not interested": 16.7,
                  "Too busy": 11.7,
                  "Transportation": 3.0,
                  "Dislike candidates": 15.3,
                  "Registration problems": 4.6,
                  "Other": 14.3}},
    { category: "65 years and over",
        reasons: {"Out of town": 3.8,
                  "Forgot to vote": 2.8,
                  "COVID-19 concerns": 8.1,
                  "Illness/Disability": 35.2,
                  "Not interested": 11.7,
                  "Too busy": 2.1,
                  "Transportation": 3.3,
                  "Dislike candidates": 11.2,
                  "Registration problems": 3.1,
                  "Other": 14.0}}        
];

// chart dimensions/margins
const margin = {top: 20, right: 200, bottom: 50, left: 80},
      width = 1200 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

// svg creation
const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Prepare data for stacking
const keys = Object.keys(data[0].reasons);
let filteredKeys = [...keys]; // enables filtering

const updateStackedData = () => d3.stack()
    .keys(filteredKeys)
    .value((d, key) => d.reasons[key])(data);

let stackedData = updateStackedData();

// Scales
const x = d3.scaleBand()
    .domain(data.map(d => d.category))
    .range([0, width])
    .padding(0.1);

const y = d3.scaleLinear()
    .range([height, 0]);

const color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeTableau10);

// Update the visualization
const updateChart = () => {
  // Update Y scale
  y.domain([0, d3.max(stackedData[stackedData.length - 1], d => d[1])]).nice();

  // Clear previous bars
  svg.selectAll(".layer").remove();

  // Draw bars
  svg.append("g")
    .selectAll("g")
    .data(stackedData)
    .join("g")
      .attr("class", "layer")
      .attr("fill", d => color(d.key))
    .selectAll("rect")
    .data(d => d)
    .join("rect")
      .attr("x", d => x(d.data.category))
      .attr("y", d => y(d[1]))
      .attr("height", d => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .append("title") // Tooltip
        .text(d => `${d.data.category}: ${d[1] - d[0]}%`);

  // axes
  svg.selectAll(".axis").remove();

  svg.append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(40, 0)")
      .style("text-anchor", "end");
  
  // x-axis label
  svg.selectAll(".x-axis-label").remove();
  svg.append("text")
      .attr("class", "x-axis-label")
      .attr("x", width / 2)
      .attr("y", height + 40)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Age Ranges");

  svg.append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(y));
  
  // y-axis label
  svg.selectAll(".y-axis-label").remove();
  svg.append("text")
      .attr("class", "y-axis-label")
      .attr("x", -height / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("transform", "rotate(-90)")
      .text("Percentage (%)");
};

// legend w/ interactivity
const legend = svg.append("g")
    .attr("transform", `translate(${width + 20}, 0)`);

legend.selectAll(".legend-item")
  .data(keys)
  .join("g")
    .attr("class", "legend-item")
    .attr("transform", (d, i) => `translate(0, ${i * 20})`)
  .call(g => {
    g.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", d => color(d))
      .on("click", (event, d) => {
        if (filteredKeys.includes(d)) {
          filteredKeys = filteredKeys.filter(key => key !== d);
        } else {
          filteredKeys.push(d);
        }
        stackedData = updateStackedData();
        updateChart();
      });

    g.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .text(d => d)
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle");
  });

updateChart();
