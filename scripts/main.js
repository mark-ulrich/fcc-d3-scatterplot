window.addEventListener('DOMContentLoaded', (e) => {
  getData();
});

const drawGraph = (data) => {
  const ChartTitle = 'Doping in Professional Bicycle Racing';
  const chartWidth = 900;
  const chartHeight = 600;
  const chartPadding = 100;
  const titleX = 170;
  const titleY = 50;
  const radius = 5;

  // Create the chart svg
  const svg = d3
    .select('#chart-container')
    .append('svg')
    .attr('width', chartWidth)
    .attr('height', chartHeight)
    .attr('class', 'chart');

  // Title
  svg
    .append('text')
    .attr('id', 'title')
    .attr('x', titleX)
    .attr('y', titleY)
    .text(ChartTitle);

  // Axes
  const years = data.map((d) => d.Year);
  const times = data.map((d) => {
    const time = new Date();
    time.setMinutes(d.Time.split(':')[0]);
    time.setSeconds(d.Time.split(':')[1]);
    return time;
  });

  times.forEach((t) => console.log(t.g));

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

  // Label
  // const yLabelX = 80;
  // const yLabelY = 350;
  // const yLabel = svg
  //   .append('text')
  //   .attr('id', 'y-label')
  //   .attr('x', yLabelX)
  //   .attr('y', yLabelY)
  //   .attr('transform', `rotate(270, ${yLabelX}, ${yLabelY})`)
  //   .text('Gross Domestic Product');

  // Draw dots
  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('data-xvalue', (d, i) => years[i])
    .attr('data-yvalue', (d, i) => times[i])
    .attr('class', 'dot')
    .attr('cx', (data, i) => parseInt(xScale(years[i])) + chartPadding)
    .attr('cy', (data, i) => parseInt(yScale(times[i])) + chartPadding)
    .attr('r', radius);

  const dots = document.querySelectorAll('.dot');
  dots.forEach((dot) => {
    dot.addEventListener('mouseenter', (e) => {
      const year = e.target.getAttribute('data-date');
      const gdp = e.target.getAttribute('data-gdp');
      drawTooltip({ x: e.clientX, y: e.clientY }, date, gdp);
    });
    dot.addEventListener('mouseleave', (e) => {
      const tooltip = document.getElementById('tooltip');
      if (tooltip) tooltip.style.visibility = 'hidden';
    });
  });
};

const drawTooltip = (mouseCoords, date, gdp) => {
  const offsetX = 30;
  const offsetY = -20;

  const tooltip = document.getElementById('tooltip');
  tooltip.style.top = `${mouseCoords.y + offsetY}px`;
  tooltip.style.left = `${mouseCoords.x + offsetX}px`;
  tooltip.style.visibility = 'visible';
  tooltip.setAttribute('data-date', date);

  const year = parseInt(date.split('-')[0]);

  const markup = `<strong>${year} Q${quarter}</strong><br>$${gdp} Billion`;
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
