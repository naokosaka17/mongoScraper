//Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request");
var logger = require("morgan");

//mport article and node models
var Article = require("./models/Article.js");
var Note = require("./models/Note.js");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Set Handlebars as the default templating engine.
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyparser.urlencoded({
	extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/ellescraper");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
	console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
	console.log("Mongoose connection successful.");
});

//+++++++++ Routes +++++++++++//
//A GET page
app.get('/', function(req, res) {
    res.render('home');
  });

//A GET homepage
app.get('/home', function(req, res) {
    res.render('home');
  });

// A GET request to scrape the echojs website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.elle.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $(".landing-feed--story-image").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = "test";
  		result.link = "test";
  	  result.imgURL = $(this).children("a").children("div").children("img").attr("src");
  		console.log(result);

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
    // Tell the browser that we finished scraping the text
    res.send("Scrape Complete");
  });

// //A GET request to scrape the people website
// app.get("/articles", function(req, res) {
// 	Article
//     .findAll()
//     .exec(function(err,data) {
//       if (err) return console.error(err);
//       // If successful render first data
//       res.render('articles', {
//         imgURL: data.imgURL,
//         title: data.title,
//         synopsis: data.synopsis,
//         _id: data._id,
//         articleURL: data.articleURL,
//         comments: data.comments
//       });
//     })
//  res.render('articles');
// });
// Listen on port 8001
app.listen(8001, function() {
	console.log("App running on port 8001!");
});
