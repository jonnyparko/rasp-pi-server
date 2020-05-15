// read dht 22 sensor (GPIO PIN 4)
var sensor = require("node-dht-sensor");
var tempCelcius = 0;;
var humidtyReading = 0;;
var express = require('express')
const { StillCamera } = require("pi-camera-connect");
var fs = require('fs')
var userName;
var password;

// START OF DB ACCESS                
console.log("*********Starting grow room server********************");

// read dbAccess.json file for username and password       
fs.readFile('./dbAccess.json', 'utf8', (err, jsonString) => {
  if (err) {
    console.log("Error reading db access file from disk:", err);
    return;
  }
  try {
    console.log("*********Reading dbAccess file.********************");
    const dbAccess = JSON.parse(jsonString);
    userName = dbAccess.userName;
    password = dbAccess.password;
    var mongo = require('mongodb');
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb+srv://" + userName + ":" + password + "@cluster0-4r75h.mongodb.net/test?retryWrites=true&w=majority";

    console.log("************db url: " + url);

    // START OF REST API  
    var app = express()
    app.use(express.static('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/'))
    app.use(express.static('/home/pi/GrowRoomProject/backend/'));

    app.get('/', function (req, res) {
      res.sendFile('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/index.html');
    })

    // grow room readings
    app.get('/room', function (req, res) {
      sensor.read(22, 4, function (err, temperature, humidity) {
        if (!err) {
          tempCelcius = temperature;
          humidtyReading = humidity;
          console.log(temperature);

          var cToFahr = tempCelcius * 9 / 5 + 32;
          var timeDate = new Date();

          var growRoomReadings = {
            tempFarenheit: cToFahr,
            tempCel: tempCelcius,
            humidity: humidtyReading,
            timeDate: timeDate
          };

          res.json(growRoomReadings);
        }
      });
    })

    // get still image capture
    app.get('/image.jpg', function (req, res) {
      const stillCamera = new StillCamera();

      stillCamera.takeImage().then(image => {
        fs.writeFileSync("still-image.jpg", image);
        res.sendFile('/home/pi/GrowRoomProject/backend/still-image.jpg');
      });
    });

    // get data from db for temp/humditiy
    app.get('/load', function (req, res) {
      var MongoClient = require('mongodb').MongoClient;
      var url = "mongodb+srv://" + userName + ":" + password + "@cluster0-4r75h.mongodb.net/test?retryWrites=true&w=majority";

      MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("mydb");
        dbo.collection("indoor-garden").find({}, { _id: 0 }).toArray(function (err, result) {
          if (err) throw err;
          console.log("reading data: " + result.length);
          res.json(result);
          db.close();
        });
      });
    });

    app.listen(3000)
    // END OF REST API

  } catch (err) {
    console.log('Error parsing JSON string for DB access file:', err)
  }
})
// END OF DB ACCESS
