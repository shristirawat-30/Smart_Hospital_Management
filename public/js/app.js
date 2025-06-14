fetch('/data/analytics.json')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // Use data to render charts using Chart.js
  });
