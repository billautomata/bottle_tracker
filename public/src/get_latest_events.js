var d3 = window.d3
var $ = window.$
var moment = require('moment')

module.exports = function get_latest () {
  $.get('/latest').done(function (d) {
    var parent = d3.select('div#latest')
    parent.selectAll('div').remove()
    parent.selectAll('h3').remove()
    parent.selectAll('hr').remove()

    console.log(d)

    d = d.sort(function (a, b) {
      return b.datetime - a.datetime
    })

    var bottles_to_serve = -1

    var oz_to_track = 20
    var tracked_oz = 0
    d.forEach(function (element, element_idx) {
      tracked_oz += element.ounces
      if (tracked_oz >= oz_to_track && bottles_to_serve === -1) {
        bottles_to_serve = element_idx + 1
      }
    })

    var hours_since_last_bottle = ((((Date.now() - d[0].datetime) / 1000) / 60) / 60)

    var time_limit_hours = ((((d[0].datetime - d[bottles_to_serve - 1].datetime) / 1000) / 60) / 60)
    var avg_hours_per_bottle = time_limit_hours / (bottles_to_serve - 1)
    var limit_ounces = 0
    var limit_ounces_per_hour = 0

    var ounces_per_hour = 0
    var begin_time = Number.MAX_SAFE_INTEGER
    var end_time = 0
    var sum_of_ounces = 0

    d.forEach(function (element, element_idx) {
      if (element.datetime < begin_time) {
        begin_time = element.datetime
      }
      if (element.datetime > end_time) {
        end_time = element.datetime
      }
      sum_of_ounces += element.ounces
      // console.log(element.datetime)
      if (element.datetime >= d[bottles_to_serve - 1].datetime && element.datetime <= d[0].datetime) {
        console.log('using this bottle to calculate current rate', element)
        limit_ounces += element.ounces
      }
    })
    limit_ounces_per_hour = limit_ounces / (avg_hours_per_bottle * bottles_to_serve)

    var number_of_hours_in_dataset = ((((d[0].datetime - begin_time) / 1000) / 60) / 60)
    ounces_per_hour = sum_of_ounces / number_of_hours_in_dataset
    console.log(ounces_per_hour)

    // in how many hours will the limit_ounces_per_hour match the overall ounces per hour
    console.log('total ounces', sum_of_ounces)
    console.log('total hours', number_of_hours_in_dataset)

    console.log('limit ounces', limit_ounces)
    console.log('limit hours', time_limit_hours)

    var hrs_til_match = ((limit_ounces * number_of_hours_in_dataset) / sum_of_ounces)
    hrs_til_match -= time_limit_hours
    console.log('hours until they match', hrs_til_match)

    // var hrs_til_feed = (((limit_ounces + 4) * number_of_hours_in_dataset) / sum_of_ounces)
    var hrs_til_feed = (((limit_ounces + 4) * time_limit_hours) / limit_ounces)
    hrs_til_feed -= time_limit_hours
    console.log('hours until the next feed', hrs_til_feed)

    var ms_til_match = hrs_til_match * 60 * 60 * 1000
    var ms_til_feed = hrs_til_feed * 60 * 60 * 1000
    var time_of_next_feed_minimum = ms_til_match + d[0].datetime
    var time_of_next_feed_maximum = ms_til_feed + d[0].datetime

    console.log(new Date(time_of_next_feed_maximum))
    console.log(new Date(time_of_next_feed_minimum))

    var calced_hrs_max = (new Date(time_of_next_feed_maximum).valueOf() - Date.now()) / 1000 / 60 / 60
    console.log(calced_hrs_max)
    var calced_hrs_min = (new Date(time_of_next_feed_minimum).valueOf() - Date.now()) / 1000 / 60 / 60
    console.log(calced_hrs_min)

    // render stats
    // var div_min = parent.append('div').html('feed him after').attr('class', 'col-xs-12 text-center')
    // div_min.append('h3').html(moment(time_of_next_feed_minimum).format('h:mm A'))
    var div_max = parent.append('div').html('you have until').attr('class', 'col-xs-12 text-center')
    div_max.append('h3').html(moment(time_of_next_feed_maximum).format('h:mm A'))

    parent.append('hr').attr('class', 'col-xs-12')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text((calced_hrs_max * 60).toFixed(0) + ' minutes until his next feeding (4oz)')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text((hours_since_last_bottle * 60).toFixed(0) + ' minutes since the last bottle.')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(limit_ounces_per_hour.toFixed(2) + ' ounces per hour in the last ' + (avg_hours_per_bottle * bottles_to_serve).toFixed(2) + ' hours')

    parent.append('h3')
      .attr('class', 'col-xs-12 text-center')
      .text(ounces_per_hour.toFixed(2) + ' ounces per hour overall')

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
