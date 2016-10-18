var fs = require('fs');
var path = require('path');
var mraa = require("mraa");

var speed = 100;
var speedLow = 1000;

var A2 = new mraa.Gpio(2);
A2.dir(mraa.DIR_OUT);
var A1 = new mraa.Gpio(10);
A1.dir(mraa.DIR_OUT);

var B2 = new mraa.Gpio(4);
B2.dir(mraa.DIR_OUT);
var B1 = new mraa.Gpio(5);
B1.dir(mraa.DIR_OUT);

var C1 = new mraa.Gpio(12);
C1.dir(mraa.DIR_OUT);
var C2 = new mraa.Gpio(13);
C2.dir(mraa.DIR_OUT);

var D1 = new mraa.Gpio(6);
D1.dir(mraa.DIR_OUT);
var D2 = new mraa.Gpio(8);
D2.dir(mraa.DIR_OUT);
 
var YUN1 = new mraa.Pwm(3);
YUN1.enable(true);
var YUN2 = new mraa.Pwm(9);
YUN2.enable(true);
YUN1.period_us(2000);
YUN2.period_us(2000);
var value1 = 0.0;
var value2 = 0.0;

var timer;

function move (req, res) {
  console.log('move');
  res.send('ok');
  clearInterval(timer);
  timer = setInterval(function() {
    A1.write(1); A2.write(0);
    B1.write(1); B2.write(0);
    C1.write(1); C2.write(0);
    D1.write(1); D2.write(0);
  }, speed)
}

function back (req, res) {
  console.log('back');
  res.send('ok');
  clearInterval(timer);
  timer = setInterval(function() {
    A1.write(0); A2.write(1);
    B1.write(0); B2.write(1);
    C1.write(0); C2.write(1);
    D1.write(0); D2.write(1);
  }, speedLow)
}

function stop (req, res) {
  console.log('stop');
  res.send('ok');
  clearInterval(timer);
  timer = setInterval(function() {
    A1.write(0); A2.write(0);
    B1.write(0); B2.write(0);
    C1.write(0); C2.write(0);
    D1.write(0); D2.write(0);
  }, speed)
}

function left (req, res) {
  console.log('left');
  res.send('ok');
  clearInterval(timer);
  timer = setInterval(function() {
    A1.write(0); A2.write(1);
    B1.write(1); B2.write(0);
    C1.write(0); C2.write(1);
    D1.write(1); D2.write(0);
  }, speed)
}

function right (req, res) {
  console.log('right');
  res.send('ok');
  clearInterval(timer);
  timer = setInterval(function() {
    A1.write(1); A2.write(0);
    B1.write(0); B2.write(1);
    C1.write(1); C2.write(0);
    D1.write(0); D2.write(1);
  }, speed)
}

function yunUp (req, res) {
  YUN1.enable(true);
  console.log('yun up ' + value1)
  res.send('ok');
  
  setInterval(function () {
    if (value1 >= 2.5) {
        value1 = 0.0;
    }
    
    value1 = value1 + 0.03;
    YUN1.write(value1); //Write duty cycle value. 

    console.log(YUN1.read());//read current value that is set before.
}, 3000);
}
function yunDown (req, res) {
  YUN1.enable(true);
  console.log('yun down ' + value1)
  res.send('ok'); 
  
  setInterval(function () {
    if (value1 <= 0) {
        value1 = 0.0;
    }
    
    value1 = value1 - 0.03;
    YUN1.write(value1); //Write duty cycle value. 

    console.log(YUN1.read());//read current value that is set before.
}, 3000);
}
function yunLeft (req, res) {
  YUN2.enable(true);
  console.log('yun left ' + value2)
  res.send('ok');
  
  setInterval(function () {
    if (value2 >= 2.5) {
        value2 = 0.0;
    }
    
    value2 = value2 + 0.03;
    YUN1.write(value2); //Write duty cycle value. 

    console.log(YUN2.read());//read current value that is set before.
}, 3000);
}
function yunRight (req, res) {
  YUN1.enable(true);
  console.log('yun right ' + value2)
  res.send('ok');
  
  setInterval(function () {
    if (value2 <= 0) {
        value2 = 0.0;
    }
    
    value2 = value2 - 0.03;
    YUN1.write(value2); //Write duty cycle value. 

    console.log(YUN2.read());//read current value that is set before.
}, 3000);
}

function server() {
  var app = require("express")();

  // Serve up the main web page used for the robot arm
  function index(req, res) {
    function serve(err, data) {
      if (err) { return console.error(err); }
      res.send(data);
    }
    fs.readFile(path.join(__dirname, "index.html"), {encoding: "utf-8"}, serve);
  }

  app.get("/", index);

  // Handler for each of the RESTful endpoints to control the arm
  function handle(stepper, dir) {
    return function(req, res) {
      res.send("done");
      move(stepper, dir);
    }
  }

  app.post("/move", move);
  app.post("/back", back);
  app.post("/stop", stop);
  app.post("/left", left);
  app.post("/right", right);
  
  app.post("/yunup", yunUp);
  app.post("/yundown", yunDown);
  app.post("/yunleft", yunLeft);
  app.post("/yunright", yunRight);

  app.listen(process.env.PORT || 3000);
}

server();
var distInterrupter = require("jsupm_rfr359f");
// Instantiate an RFR359F digital pin D2
// This was tested on the Grove IR Distance Interrupter
var myDistInterrupter = new distInterrupter.RFR359F(2);

// The range appears to be about 4 inches, depending on adjustment
var myInterval = setInterval(function()
{
//	if (myDistInterrupter.objectDetected())
//		console.log("Object detected");
//	else
//		console.log("Area is clear");
}, 100);

// When exiting: turn off LED, clear interval, and print message
process.on('SIGINT', function()
{
	clearInterval(myInterval);
	console.log("Exiting...");
	process.exit(0);
});