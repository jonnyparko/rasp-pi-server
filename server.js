 // read dht 22 sensor (GPIO PIN 4)
var sensor = require("node-dht-sensor");
var tempCelcius;
var tempFarenheit;
var humidtyReading;
const path = require('path');
var express = require('express')
 
var app = express()
app.use(express.static('/home/pi/GrowRoomProject/indoor-garden/frontend/startbootstrap-sb-admin-2-gh-pages/'))
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
 
app.listen(3000)

