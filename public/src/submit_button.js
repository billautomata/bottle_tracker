var d3 = window.d3
var $ = window.$

module.exports = function () {
  // on submit
  d3.select('div#submit').on('click', function () {
    var oz = 0
    d3.selectAll('div#ounces').each(function (d, i) {
      var is_picked = d3.select(this).attr('picked')
      if (is_picked === 'true') {
        oz = i + 1
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
      return require('./get_latest_events.js')()
    }).error(function (status, msg) {
      return console.log(status, msg, 'error!')
    })
  })
}
