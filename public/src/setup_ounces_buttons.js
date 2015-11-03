var d3 = window.d3

module.exports = function () {
  // setup the state on the ounces buttons
  d3.selectAll('div#ounces').on('click', function () {
    d3.selectAll('div#ounces').attr('picked', 'false').attr('class', 'col-xs-4 btn btn-default')
    d3.select(this).attr('picked', 'true').attr('class', 'col-xs-4 btn btn-primary')
  })
}
