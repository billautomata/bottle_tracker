var d3 = window.d3
var $ = window.$
var moment = require('moment')

module.exports = function get_latest () {
  $.get('/latest').done(function (d) {
    var parent = d3.select('div#latest')
    parent.selectAll('div').remove()

    console.log(d)

    d = d.sort(function (a, b) {
      return b.datetime - a.datetime
    })

    var hours_since_last_bottle = ((((Date.now() - d[0].datetime) / 1000) / 60) / 60)

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(hours_since_last_bottle.toFixed(2) + ' hours since the last bottle.')

    d.forEach(function (element) {
      var div_local = parent.append('div').attr('class', 'row')
      var div_l = div_local.append('div').attr('class', 'col-xs-9')
      var div_r = div_local.append('div').attr('class', 'col-xs-3')
      div_l.append('h4').html(element.ounces + ' ounces')
      div_l.append('h6').html(moment(element.datetime).format('dddd MMM D hh:mm A'))
      var btn = div_r.append('div').attr('class', 'col-xs-12 btn btn-default text-center').html('x')

      btn.on('click', function () {
        $.get('/remove/' + element._id).done(function (d) {
          console.log(d)
          get_latest()
        })
      })

      div_local.append('hr').attr('class', 'col-xs-4')
    })
  })
}
