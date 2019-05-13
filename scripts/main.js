window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (data) => {
  const chartTitle = 'Doping in Professional Bicycle Racing';
  const chartSubtitle = "35 Fastest times up Alpe d'Huez";
  const chartWidth = 900;
  const chartHeight = 600;
  const chartPadding = 100;
  const titleX = 170;
  const titleY = 50;
  const subtitleX = 300;
  const subtitleY = 75;
  const radius = 6.5;

  // Create the chart svg
  const svg = d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('class', 'chart');

  drawTitle(svg, titleX, titleY, chartTitle);
  drawSubtitle(svg, subtitleX, subtitleY, chartSubtitle);

  // Axes
  const { years, times, xScale, yScale } = drawAxes(
    data,
    chartWidth,
    chartPadding,
    chartHeight,
    svg
  );
  drawYLabel(svg);

  drawLegend(svg);

  drawDots(svg, data, years, times, xScale, chartPadding, yScale, radius);

  initDotEventHandlers();
};

const drawTooltip = (mouseCoords, year, data) => {
  const offsetX = 30;
  const offsetY = -20;

  const tooltip = document.getElementById('tooltip');
  tooltip.style.top = `${mouseCoords.y + offsetY}px`;
  tooltip.style.left = `${mouseCoords.x + offsetX}px`;
  tooltip.style.visibility = 'visible';
  tooltip.setAttribute('data-year', year);

  const { Name, Nationality, Year, Time, Doping } = JSON.parse(data);
  let markup = `
    <strong>${Name}: ${Nationality}</strong><br>
    <strong>Year</strong>: ${Year}, <strong>Time</strong>: ${Time}
  `;
  if (Doping) markup += `<br>${Doping}`;

  tooltip.innerHTML = markup;
};

const getData = () => {
  const url =
    'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);

  xhr.onload = () => {
    drawGraph(JSON.parse(xhr.responseText));
  };

  xhr.send();
};

function drawLegend(svg) {
  const legendBoxWidth = 20;
  const legendBox = {
    noDoping: {
      x: 780,
      y: 175,
      class: 'dot-no-doping',
      label: { text: 'No doping allegations', xOffset: -164, yOffset: 15 }
    },
    doping: {
      x: 780,
      y: 200,
      class: 'dot-doping',
      label: {
        text: 'Riders with doping allegations',
        xOffset: -220,
        yOffset: 15
      }
    }
  };
  const legend = svg.append('svg').attr('id', 'legend');
  legend
    .append('text')
    .attr('class', 'legend-text')
    .attr('x', legendBox.noDoping.x + legendBox.noDoping.label.xOffset)
    .attr('y', legendBox.noDoping.y + legendBox.noDoping.label.yOffset)
    .text(legendBox.noDoping.label.text);
  legend
    .append('text')
    .attr('class', 'legend-text')
    .attr('x', legendBox.doping.x + legendBox.doping.label.xOffset)
    .attr('y', legendBox.doping.y + legendBox.doping.label.yOffset)
    .text(legendBox.doping.label.text);
  legend
    .append('rect')
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth)
    .attr('x', legendBox.noDoping.x)
    .attr('y', legendBox.noDoping.y)
    .attr('class', 'legend-box ' + legendBox.noDoping.class);
  legend
    .append('rect')
    .attr('width', legendBoxWidth)
    .attr('height', legendBoxWidth)
    .attr('x', legendBox.doping.x)
    .attr('y', legendBox.doping.y)
    .attr('class', legendBox.doping.class);
}

function initDotEventHandlers() {
  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    dot.addEventListener('mouseover', (e) => {
      const year = e.target.getAttribute('data-xvalue');
      const data = e.target.getAttribute('data-json');
      drawTooltip({ x: e.clientX, y: e.clientY }, year, data);
    });
    dot.addEventListener('mouseleave', (e) => {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.visibility = 'hidden';
    });
  });
}

function drawDots(
  svg,
  data,
  years,
  times,
  xScale,
  chartPadding,
  yScale,
  radius
) {
  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('data-xvalue', (d, i) => years[i])
    .attr('data-yvalue', (d, i) => times[i])
    .attr('data-json', (d) => JSON.stringify(d))
    .attr('class', (d) => 'dot ' + (d.Doping ? 'dot-doping' : 'dot-no-doping'))
    .attr('cx', (d, i) => parseInt(xScale(years[i])) + chartPadding)
    .attr('cy', (data, i) => parseInt(yScale(times[i])) + chartPadding)
    .attr('r', radius);
}

function drawYLabel(svg) {
  const yLabelX = 50;
  const yLabelY = 350;
  const yLabel = svg
    .append('text')
    .attr('id', 'y-label')
    .attr('x', yLabelX)
    .attr('y', yLabelY)
    .attr('transform', `rotate(270, ${yLabelX}, ${yLabelY})`)
    .text('Time in Minutes');
}

function drawAxes(data, chartWidth, chartPadding, chartHeight, svg) {
  const years = data.map((d) => d.Year);
  const times = data.map((d) => {
    const time = new Date();
    time.setMinutes(d.Time.split(':')[0]);
    time.setSeconds(d.Time.split(':')[1]);
    return time;
  });
  const xDomain = [d3.min(years) - 1, d3.max(years) + 1];
  const xRange = [0, `${chartWidth - chartPadding * 2}`];
  const yDomain = [d3.min(times), d3.max(times)];
  const yRange = [0, `${chartHeight - chartPadding * 2}`];
  const xScale = d3
    .scaleLinear()
    .domain(xDomain)
    .range(xRange);
  const yScale = d3
    .scaleTime()
    .domain(yDomain)
    .range(yRange);
  const xAxis = d3.axisBottom(xScale).ticks(10, 'f');
  const yAxis = d3.axisLeft(yScale).ticks(d3.timeSecond.every(15));
  yAxis.tickFormat(d3.timeFormat('%M:%S'));
  svg
    .append('g')
    .attr('id', 'x-axis')
    .attr(
      'transform',
      `translate(${chartPadding}, ${chartHeight - chartPadding})`
    )
    .call(xAxis);
  svg
    .append('g')
    .attr('id', 'y-axis')
    .attr('transform', `translate(${chartPadding}, ${chartPadding})`)
    .call(yAxis);
  return { years, times, xScale, yScale };
}

function drawSubtitle(svg, subtitleX, subtitleY, chartSubtitle) {
  svg
    .append('text')
    .attr('id', 'subtitle')
    .attr('x', subtitleX)
    .attr('y', subtitleY)
    .text(chartSubtitle);
}

function drawTitle(svg, titleX, titleY, chartTitle) {
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(chartTitle);
}
