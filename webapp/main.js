console.log('hello world')
var moment = require('moment')

var bottle_data = require('../output/bottles.json')
histogram()

function all_plot () {
  var w = 1000
  var h = 500
  var svg = d3.select('div#main').append('svg')
    .attr('viewBox', [0, 0, w, h].join(' '))
    .attr('preserveApsectRatio', 'xMidYMid')
    .attr('width', '100%')
    .style('background-color', 'rgb(240,240,240)')

  console.log(bottle_data)

  var min_time = d3.min(bottle_data, function (d) { return d.t })
  var max_time = d3.max(bottle_data, function (d) { return d.t })

  var scale_x_time = d3.scaleLinear()
    .domain([min_time, max_time])
    .range([0, w])

  console.log('time values', min_time, max_time)
  console.log('time values', new Date(min_time), new Date(max_time))

  // graph, (x, time)(y, hour of day)

  var scale_y_hour_of_day = d3.scaleLinear().domain([0, 23]).range([h * 0.1, (h - (h * 0.1))])

  bottle_data.forEach(function (b) {
    svg.append('circle')
      .attr('cx', scale_x_time(b.t))
      .attr('cy', scale_y_hour_of_day(moment(b.t).hours()))
      .attr('r', b.oz)
      .attr('fill', 'rgb(33,66,255)')
      .attr('fill-opacity', 0.5)
  })
}

// histogram hour of the day
function histogram () {
  var w = 1000
  var h = 300
  var svg = d3.select('div#main').append('svg')
    .attr('viewBox', [0, 0, w, h].join(' '))
    .attr('preserveApsectRatio', 'xMidYMid')
    .attr('width', '100%')
    .style('background-color', 'rgb(240,240,240)')

  var d = {}
  bottle_data.forEach(function (b) {
    var hour = moment(b.t).hours()
    if (d[hour] === undefined) {
      d[hour] = 0
    }
    d[hour] += 1
  })
  console.log(d)
  var max = 0
  d3.range(0, 24).forEach(function (v) {
    var value = d[v]
    if (value > max) {
      max = value
    }
  })

  var scale_x = d3.scaleLinear().domain([0, 24]).range([0, w])
  var scale_y = d3.scaleLinear().domain([0, max]).range([0, h])

  d3.range(0, 24).forEach(function (v, idx) {
    var value = d[v]
    var g = svg.append('g').attr('transform', ['translate(', scale_x(idx), 0 , ')'].join(' '))
    g.append('rect')
      .attr('x', 0)
      .attr('y', h - scale_y(value))
      .attr('width', scale_x(1) - 1)
      .attr('height', scale_y(value))
      .attr('fill', 'rgb(33,66,255)')
      .attr('stroke', 'none')
    g.append('text').text(function () {
      var am_pm = 'AM'
      if (idx >= 12) {
        am_pm = 'PM'
      }
      var v = (idx % 12)
      if (v === 0) {
        v = 12
      }
      return (v + am_pm)
    }).attr('x', scale_x(1) * 0.5)
      .attr('y', h - 10)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .attr('fill', 'white')

  })

}
