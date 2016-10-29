// https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt

var fs = require('fs')
var mongojs = require('mongojs')

// initialize database
var db = mongojs('bottle_tracker', ['incoming'])
db.on('error', function (err) {
  console.log('database error', err)
})
db.on('connect', function () {
  console.log('database connected')
})
db.incoming.find({}, function(err, docs){
  console.log(docs.length)
  console.log(docs[0])
  var o = []
  docs.forEach(function(d){
    o.push({
      oz: d.ounces,
      t: d.datetime
    })
  })
  fs.writeFileSync('./output/bottles.json', JSON.stringify(o))
})
