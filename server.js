// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html' );
});


app.get("/parser", function (req, res) {
  res.sendFile(__dirname + '/views/parser.html');
});




// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});


// API main endpoint
app.get("/api/", function (req, res) {
  let dateApiObject = {
    unix: new Date().getTime(),
    utc: new Date().toUTCString(),
  };
  res.json(dateApiObject);
});

// whoami API endpoint... 
app.get("/api/whoami", function (req, res) {

  let whoamiApiResObj = {
    ipaddress: req.ip,
    language: req.headers['accept-language'],
    software: req.headers['user-agent'],
}

res.json(whoamiApiResObj);
console.log(`
  ipaddress : ${whoamiApiResObj.ipaddress} \n
  language:  ${whoamiApiResObj.language} \n
  software: ${ whoamiApiResObj.software} \n  
`)
});

// API endpoint for date parameters
app.get("/api/:date", function (req, res) {
  let date_string = req.params.date;
  if (new Date(date_string) == "Invalid Date" && isNaN(date_string)) {
    res.json({ error: "invalid date" });
  } else if (isNaN(date_string)) {
    res.json({
      unix: new Date(date_string).getTime(),
      utc: new Date(date_string).toUTCString(),
    });
  } else {
    date_string = parseInt(date_string);
    res.json({
      unix: new Date(date_string).getTime(),
      utc: new Date(date_string).toUTCString(),
    });
  }
});





