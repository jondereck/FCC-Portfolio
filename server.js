// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

const bodyParser = require('body-parser')
const dns = require('dns');

// // DB Packages
// const mongodb = require("mongodb");
// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // MongoDB connection confirmation and error handling
// const db = mongoose.connection;
// db.on("error", console.error.bind(console, "connection error:"));
// db.once("open", () => console.log("MongoDB connection established \n"));




// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionSuccessStatus: 200}));  // some legacy browsers choke on 204
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false}));
app.use('/public', express.static(`${process.cwd()}/public`));

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


app.get("/shorten", function (req, res) {
  res.sendFile(__dirname + '/views/shorten.html');
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



const links = [];
let id = 0;

// post new original link then return short link
app.post('/api/shorturl/', (req, res) => {
  // destructuring url
  const { url } = req.body

  // remove http(s) with regex
  // const noHTTPSurl = url.replace(/^https?:\/\//, '');
  function getDomain(url) {
    let result
    let match
    if (match = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n\?\=]+)/im)) {
        result = match[1]
        if (match = result.match(/^[^\.]+\.(.+\..+)$/)) {
            result = match[1]
        }
    }
    return result
  }
  const domainOnly = getDomain(url)
  console.log(domainOnly)

  // check if the url is valid
  dns.lookup(domainOnly, (err) => {
    if(err) {
      res.json({
        "error": 'invalid URL'
      })
    } else {
      // increment the id 
      id++;

      // create url data
      const link = {
        original_url: url,
        // dont forget to convert the id to string because we would check it later by req.params that is type of STRING
        short_url: `${id}`
      };

      // push data to local array
      links.push(link);
      
      // return new entry
      return res.json({
        "original_url" : url,
        "short_url" : id
      });
    }
  })
})

app.get('/api/shorturl/:id', (req, res) => {
  // destructuring id
  const { id } = req.params;

  // get the result by id that is type of STRING makesure to change it before storing to the database
  const result = links.find(l => l.short_url === id)

  // checking algoritm
  if (result) {
    return res.redirect(result.original_url)
  } else {
    return res.json({
      error: 'No such URL'
    })
  }
})



