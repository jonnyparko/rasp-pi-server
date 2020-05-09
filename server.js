 // read dht 22 sensor (GPIO PIN 4)
var sensor = require("node-dht-sensor");
var tempCelcius;
var tempFarenheit;
var humidtyReading;
const path = require('path');
var express = require('express')
const { StillCamera } = require("pi-camera-connect");
var fs = require('fs')

 
var app = express()
app.use(express.static('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/'))
app.use(express.static('/home/pi/GrowRoomProject/backend/'));

 app.get('/', function(req, res) {
  res.sendFile('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/index.html');
})
app.get('/room', function(req, res) {
  sensor.read(22, 4, function(err, temperature, humidity) {
  if (!err) {
    tempCelcius = temperature;
    humidtyReading = humidity;
    console.log(temperature);
  }
});
  var cToFahr = tempCelcius * 9 / 5 + 32;
  var GrowRoomReadings = {
    tempFarenheit: cToFahr, 
    tempCel: tempCelcius,
    humidity: humidtyReading
  };
  
  res.json(GrowRoomReadings);
})


app.get('/image.jpg', function(req,res){
  const stillCamera = new StillCamera();

  stillCamera.takeImage().then(image => {
    fs.writeFileSync("still-image.jpg", image);
    res.sendFile('/home/pi/GrowRoomProject/backend/still-image.jpg');
  });
});
 
app.listen(3000)

