//Dependencies
var express = require("express");
var expresshandlebars = require("express-handlebars");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var cheerio = require("cheerio");
var request = request("request");
var logger = require("morgan");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
	extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/week18homework");
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
// A GET request to scrape the people website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.vogue.com/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

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
 

// Listen on port 3000
app.listen(3000, function() {
	console.log("App running on port 3000!");
});

