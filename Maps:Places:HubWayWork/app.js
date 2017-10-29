var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(3000);
app.get("/", function(request, response) {
})

var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBKfiM9qa6Rsf455Bqp6pZCmyyXB-R64lY'
});

googleMapsClient.geocode({
    address: '1600 Amphitheatre Parkway, Mountain View, CA'
}, function(err, response) {
    if (!err) {
        console.log(response.json.results[0]["geometry"]["location"]);
    }
});



(function () {
    "use strict";

    var assert = require("assert");

    var PlaceSearch = require("googleplaces");
    var config = require("./config.js");

    var placeSearch = new PlaceSearch(config.apiKey, config.outputFormat);

    var parameters = {
        location: [42.350309, -71.097017],
        types: "transit_station",
        radius: "1600"
    };
    placeSearch.placeSearch(parameters, function (error, response) {
        if (error) throw error;
        assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
        var i;
        var answer = [];
        for(i = 0; i < response.results.length; i++)
        {
            if (!answer.includes(response.results[i].name))
            answer.push(response.results[i].name);
        }
        console.log(answer);
    });

})();