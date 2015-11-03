// https://www.digitalocean.com/community/tutorials/how-to-create-an-ssl-certificate-on-nginx-for-ubuntu-14-04
// openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout nginx.key -out nginx.crt

var fs = require('fs'),
  http = require('http'),
  https = require('https'),
  express = require('express');

var bodyParser = require('body-parser')

var mongojs = require('mongojs')

// initialize database
var db = mongojs('bottle_tracker', ['incoming'])
db.on('error', function (err) {
  console.log('database error', err)
})
db.on('connect', function () {
  console.log('database connected')
})

var port = 8000;

var options = {
  // key: fs.readFileSync('./nginx.key'),
  // cert: fs.readFileSync('./nginx.crt'),
  // requestCert: false,
  // rejectUnauthorized: false
};

var app = express();
app.use(bodyParser.json())

var server = http.createServer(app).listen(port, function () {
  console.log("Express server listening on port " + port);
});

app.post('/feed', function (req, res) {
  // console.log(req)
  console.log(req.body)
  if (req.body.ounces !== undefined && req.body.datetime !== undefined) {
    db.incoming.save(req.body, function (err, d) {
      console.log('success saving to db')
      console.log(d)
      res.status(200).send('ok')
    })
  } else {
    res.status(500).send('wronnggg')
  }

})

app.get('/latest', function (req, res) {

  db.incoming.find({
      $query: {},
      $orderby: {
        _id: -1
      },
    }, {}, {
      limit: 250
    },
    function (err, data) {
      if (err) {
        console.log('error')
        console.log(err)
        res.status(500)
      } else {
        console.log(data.length + ' elements returned - latest')
        res.status(200).json(data)
      }
    })

})

app.get('/remove/:dbid', function(req,res){

  console.log('remove called')
  console.log(req.params.dbid)

  db.incoming.remove({ _id: mongojs.ObjectId(req.params.dbid) }, function(err,data){
      if (err) {
        console.log('error')
        console.log(err)
        res.status(500)
      } else {
        console.log(data.length + ' elements returned - remove')
        res.status(200).json(data)
      }
  })

})

app.use(express.static(__dirname + '/public'))
