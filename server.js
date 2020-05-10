 // read dht 22 sensor (GPIO PIN 4)
var sensor = require("node-dht-sensor");
var tempCelcius;
var tempFarenheit;
var humidtyReading;
const path = require('path');
var express = require('express')
const { StillCamera } = require("pi-camera-connect");
var fs = require('fs')
var userName;
var password;
     
// START OF DB ACCESS                
console.log("*********Starting grow room server********************");        
fs.readFile('./dbAccess.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log("Error reading db access file from disk:", err)
        return
    }
    try {
      console.log("*********Reading dbAccess file.********************")
      const dbAccess = JSON.parse(jsonString)
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

       app.get('/', function(req, res) {
        res.sendFile('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/index.html');
      })
      
      // grow room readings
      app.get('/room', function(req, res) {
        sensor.read(22, 4, function(err, temperature, humidity) {
        if (!err) {
          tempCelcius = temperature;
          humidtyReading = humidity;
          console.log(temperature);
        }
        });
        var cToFahr = tempCelcius * 9 / 5 + 32;
        var growRoomReadings = {
          tempFarenheit: cToFahr, 
          tempCel: tempCelcius,
          humidity: humidtyReading
        };
        
        res.json(growRoomReadings);
        
        // make sure we have a reading before uploading
        if (growRoomReadings.tempCel !== null ) {
          var MongoClient = require('mongodb').MongoClient;
          var url = "mongodb+srv://" + userName + ":" + password + "@cluster0-4r75h.mongodb.net/test?retryWrites=true&w=majority";

          MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var dbo = db.db("mydb");
            dbo.collection("indoor-garden").insertOne(growRoomReadings, function(err, res) {
              if (err) throw err;
              console.log("1 document inserted");
              db.close();
            });
          });
        }
      })

      // still image capture
      app.get('/image.jpg', function(req,res){
        const stillCamera = new StillCamera();

        stillCamera.takeImage().then(image => {
          fs.writeFileSync("still-image.jpg", image);
          res.sendFile('/home/pi/GrowRoomProject/backend/still-image.jpg');
        });
      });
       
      app.listen(3000)
    // END OF REST API
        
} catch(err) {
        console.log('Error parsing JSON string:', err)
    }
})
// END OF DB ACCESS
