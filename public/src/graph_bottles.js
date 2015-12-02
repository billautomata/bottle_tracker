module.exports = function graph_bottles (data) {
  data.forEach(function (element) {
    console.log(element)
  })
  calc_rolling_rate_byounces(data, 4)
}

function calc_rolling_rate_byounces (data, n_ounces) {
  var n_bottles = -1
  var tally_ounces = 0
  data.forEach(function (element, element_idx) {
    if (n_bottles === -1) {
      tally_ounces += element.ounces
      if (tally_ounces >= n_ounces) {
        n_bottles = element_idx
      }
    }
  })
}
