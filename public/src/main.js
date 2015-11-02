var $ = window.$
var d3 = window.d3
var moment = require('moment')

d3.select('div#submit').on('click', function () {
  var oz = 0
  d3.selectAll('div#ounces').each(function (d, i) {
    var is_picked = d3.select(this).attr('picked')
    if (is_picked === 'true') {
      oz = (i * 2) + 2
    }
  })

  var minutes = d3.select('input').node().value
  console.log(minutes)
  console.log(new Date(Date.now() - (minutes * 60 * 1000)).valueOf())
  var datetime = new Date(Date.now() - (minutes * 60 * 1000)).valueOf()

  $.ajax({
    type: 'POST',
    url: '/feed',
    data: JSON.stringify({
      ounces: oz,
      datetime: (datetime)
    }),
    contentType: 'application/json'
  }).done(function (d) {
    console.log('done!')
    console.log(d)
    get_latest()
  }).error(function (status, msg) {
    console.log(status, msg, 'error!')
  })
})

d3.selectAll('div#ounces').on('click', function () {
  d3.selectAll('div#ounces').attr('picked', 'false').attr('class', 'col-xs-4 btn btn-default')
  d3.select(this).attr('picked', 'true').attr('class', 'col-xs-4 btn btn-primary')
})

function get_latest () {
  $.get('/latest').done(function (d) {
    var parent = d3.select('div#latest')
    parent.selectAll('div').remove()

    console.log(d)

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

get_latest()
// d3.select('div.container').append('div')
