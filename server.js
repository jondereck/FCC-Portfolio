// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

const multer = require('multer');

let storage = multer.memoryStorage()
let upload = multer({ storage: storage }).single('upfile');

const dotenv = require("dotenv");
dotenv.config();
const bodyParser = require('body-parser')
const dns = require('dns');



// DB Packages
const mongodb = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
});

// MongoDB connection confirmation and error handling
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => console.log("MongoDB connection established \n"));

// * Exercise Schema
const exerciseSchema = new Schema({
  date: { type: Date },
  duration: { type: Number },
  description: { type: String },
});

// * User Schema
const usersSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
  },
  log: [exerciseSchema],
});

// * Model
const Exercise = mongoose.model("Exercise", exerciseSchema);
const User = mongoose.model("User", usersSchema);


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





//FCC PROBLEM 4


app.post("/api/users", (req, res) => {
  if (req.body.username === "") {
    res.json({ error: "Please enter username" });
  } else {
    let searchUser = User.findOne(
      { username: req.body.username },
      (err, searchResult) => {
        if (searchResult) {
          res.json({ error: "Username already taken" });
        } else {
          let newUser = new User({
            username: req.body.username,
          });
          newUser.save();
          res.json({
            _id: newUser._id,
            username: newUser.username,
          });
        }
      }
    );
  }
});



app.get("/api/users", async (req, res) => {
  await User.find({}, (err, resultDocs) => {
    if (err) {
      console.error(err);
      res.send(err);
    } else {
      res.json(resultDocs);
    }
  });
});

app.post("/api/users/:_id/exercises", (req, res) => {
  var newExercise = {
    date: req.body.date,
    duration: parseInt(req.body.duration),
    description: req.body.description,
  };
 
  if (!req.body.date) {
    newExercise.date = new Date();
  }

  User.findByIdAndUpdate(
    
    req.params._id,
    { $push: { log: newExercise } },
    { new: true },
    (err, userUpdate) => {
      if (err) {
        console.error(err);
        res.send(err);
      } else {
        if (!userUpdate) {
          res.json({
            error: "_id does not exist",
          });
        } else {
          let newExerciseApiObj = {
            username: userUpdate.username,
            description: newExercise.description,
            duration: newExercise.duration,
            _id: userUpdate._id,
            date: new Date(newExercise.date).toDateString(),
          };
          res.json(newExerciseApiObj);
         
        }
      }
    }
  );
});


app.get("/api/users/:_id/logs", (req, res) => {
  let userId = req.params._id;
  // let from;
  // let to;
  // let limit;
  User.findById(userId, (err, searchResult) => {
    if (err) {
      res.json({
        error: "_id does not exist",
      });
    } else {
      // *getting query string parameters if they are given

      if (req.query.from) {
        from = new Date(req.query.from).getTime();
      }
      if (req.query.to) {
        to = new Date(req.query.to).getTime();
      }

      /*
       * Filter of Array will be done using the EPOCH date
       */

      if (req.query.from !== undefined && req.query.to !== undefined) {
        searchResult.log = searchResult.log.filter((filteredLogs) => {
          let exerciseDate = new Date(filteredLogs.date).getTime();
          return exerciseDate >= from && exerciseDate <= to;
        });
      }

      if (req.query.from !== undefined) {
        searchResult.log = searchResult.log.filter((filteredLogs) => {
          let exerciseDate = new Date(filteredLogs.date).getTime();
          return exerciseDate >= from;
        });
      }

      if (req.query.to !== undefined) {
        searchResult.log = searchResult.log.filter((filteredLogs) => {
          let exerciseDate = new Date(filteredLogs.date).getTime();
          return exerciseDate <= to;
        });
      }

      // * limiting the results of filtered logs

      if (req.query.limit !== undefined) {
        limit = req.query.limit;
        searchResult.log = searchResult.log.slice(0, limit);
      }

      for(let i= 0; i < searchResult.log.length; i++){
        searchResult.log[i]['date'] = new Date(searchResult.log[i]
        ['date']).toDateString()
      }

      res.json({
        _id: searchResult._id,
        username: searchResult.username,
        count: searchResult.log.length,
        log: searchResult.log,
      });
    }
  });
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


app.get("/tracker", function (req, res) {
  res.sendFile(__dirname + '/views/tracker.html');
});


app.get("/metadata", function (req, res) {
  res.sendFile(__dirname + '/views/metadata.html');
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

app.post('/api/fileanalyse', (req, res) => {
  upload(req, res, (err) => {
     if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
       res.send(err)
    } else if (err) {
      // An unknown error occurred when uploading.
       res.send(err)
     } else {
       console.log('file uploaded');
       res.json({
         name: req.file.originalname,
         type: req.file.mimetype,
         size: req.file.size
       })
    }
  })
  
})
