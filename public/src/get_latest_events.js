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

    var time_limit_hours = 4
    var limit_ounces = 0
    var limit_ounces_per_hour = 0

    var ounces_per_hour = 0
    var begin_time = Number.MAX_SAFE_INTEGER
    var end_time = 0
    var sum_of_ounces = 0

    d.forEach(function (element) {
      if (element.datetime < begin_time) {
        begin_time = element.datetime
      }
      if (element.datetime > end_time) {
        end_time = element.datetime
      }
      sum_of_ounces += element.ounces
      // console.log(element.datetime)
      if (element.datetime > (Date.now() - (time_limit_hours * 60 * 60 * 1000))) {
        console.log(element)
        limit_ounces += element.ounces
      }
    })
    limit_ounces_per_hour = limit_ounces / time_limit_hours

    var number_of_hours_in_dataset = ((((Date.now() - begin_time) / 1000) / 60) / 60)
    ounces_per_hour = sum_of_ounces / number_of_hours_in_dataset
    console.log(ounces_per_hour)

    // in how many hours will the limit_ounces_per_hour match the overall ounces per hour
    console.log('total ounces', sum_of_ounces)
    console.log('total hours', number_of_hours_in_dataset)

    console.log('limit ounces', limit_ounces)
    console.log('limit hours', time_limit_hours)

    var hrs_til_match = ((limit_ounces * number_of_hours_in_dataset) / sum_of_ounces) - time_limit_hours
    console.log('hours until they match', hrs_til_match)

    var hrs_til_feed = (((limit_ounces + 4) * number_of_hours_in_dataset) / sum_of_ounces) - time_limit_hours
    console.log('hours until the next feed', hrs_til_feed)

    // render stats

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(hours_since_last_bottle.toFixed(2) + ' hours since the last bottle.')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(ounces_per_hour.toFixed(2) + ' ounces per hour overall')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(limit_ounces_per_hour.toFixed(2) + ' ounces per hour in the last 4 hours')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(hrs_til_feed.toFixed(2) + ' maximum hours until his next feeding')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(hrs_til_match.toFixed(2) + ' minimum hours until his next feeding')

    parent.append('hr').attr('class', 'col-xs-12')

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
