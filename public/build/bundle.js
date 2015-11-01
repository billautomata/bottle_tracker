(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var $ = window.$
var d3 = window.d3

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

  $.ajax({
    type: 'POST',
    url: '/feed',
    data: JSON.stringify({
      ounces: oz,
      datetime: (new Date(Date.now() - (minutes * 60 * 100)).valueOf())
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
      var div_local = parent.append('div').attr('class', 'col-xs-12')
      div_local.append('h4').html(element.ounces + ' ounces')
      div_local.append('h6').html(new Date(element.datetime))
      div_local.append('div').attr('class', 'col-xs-12 btn btn-default').html('remove')

      div_local.on('click', function () {
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

},{}]},{},[1]);
