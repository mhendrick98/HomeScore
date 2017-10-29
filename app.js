var request = require('request');
var express = require('express');
var bodyParser = require('body-parser');
var app = express(); //inititate app
var assert = require("assert");
var PlaceSearch = require("googleplaces");
var config = require("./config.js");

app.listen(process.env.PORT || 3000); //listen on port 3000
app.use("/public",express.static("public"))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get("/",function(req,res){
  res.sendFile(__dirname + "/form.html");
})


app.get("/dev", function(req,res){
  res.send("The server is running !");
})


app.post("/post/sendAddressInfo", function(req,res){
  var rawAddressString = req.body.rawAddressString;
  var superScore = 0;
  var latitude;
  var longitude;
  var hubwayAnswer = [];
  var transitAnswer = [];
  var hospitalAnswer = [];
  var schoolAnswer = [];
  var googleMapsClient = require('@google/maps').createClient({
    key: 'AIzaSyBKfiM9qa6Rsf455Bqp6pZCmyyXB-R64lY'
  });

  googleMapsClient.geocode({
    address: rawAddressString},
    function(err, response) {
    if (!err) {
      latitude = response.json.results[0]["geometry"]["location"].lat;
      longitude = response.json.results[0]["geometry"]["location"].lng;

      var hubwaySearch = new PlaceSearch(config.apiKey, config.outputFormat);
      console.log("The lat is " + latitude + " and the type is " + typeof(latitude));
      console.log("The long is " + longitude + " and the type is " + typeof(longitude));

      var hubwayParameters = {
        location: [latitude, longitude],
        keyword: "hubway",
        radius: "800"
      };
      //console.log("Hubway params are " + hubwayParameters.location);
      hubwaySearch.placeSearch(hubwayParameters, function (error, response) {
        if (error) {
          return; // no results found
          //assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
        }
        else{
          var i;
          for(i = 0; i < response.results.length; i++)
          {
              if (!hubwayAnswer.includes(response.results[i].name))
                  hubwayAnswer.push(response.results[i].name);
              if(response.results[i].name === "Hubway" || response.results[i].name === "Hubway Station" || response.results[i].name === "Hubway Bike Stand"  || response.results[i].anme === "Bike share hubway")
                  continue;
          }
          superScore += 5;
          //console.log("Hubway stations within a " + hubwayParameters.radius + "\n" + hubwayAnswer);
        }

      });

      var transitSearch = new PlaceSearch(config.apiKey, config.outputFormat);
      var transitParameters = {
        location: [latitude, longitude],
        types: "transit_station",
        radius: "400"
      };


    transitSearch.placeSearch(transitParameters, function (error, response) {
      if (error) {
        return; // no results found
        //assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
      }
      else{
          var i;
          for(i = 0; i < response.results.length; i++)
          {
              if (!transitAnswer.includes(response.results[i].name))
                  transitAnswer.push(response.results[i].name);
          }
          superScore += 10;
          console.log(transitAnswer);
        }
      });


    var hospitalSearch = new PlaceSearch(config.apiKey, config.outputFormat);
    var hospitalParameters = {
        location: [latitude, longitude],
        keyword: "hospital",
        radius: "1600"
    };

    hospitalSearch.placeSearch(hospitalParameters, function (error, response) {
      if (error) {
        return; // no results found
        //assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
      }
      else{
          var i;

          for(i = 0; i < response.results.length; i++)
          {
              if (!hospitalAnswer.includes(response.results[i].name))
                  hospitalAnswer.push(response.results[i].name);
          }
          superScore += 10;
          //console.log(hospitalAnswer);
        }

    });

    var gymSearch = new PlaceSearch(config.apiKey, config.outputFormat);
    var gymParameters = {
        location: [latitude, longitude],
        types: "gym",
        radius: "1000"
    };
    gymSearch.placeSearch(gymParameters, function (error, response) {
      if (error) {
        return; // no results found
        //assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
      }
      else{
          var i;
          var gymAnswer = [];
          for(i = 0; i < response.results.length; i++)
          {
              if (!gymAnswer.includes(response.results[i].name))
                  gymAnswer.push(response.results[i].name);
          }
          superScore += 5;
          //console.log(gymAnswer);
        }

    });


    var schoolSearch = new PlaceSearch(config.apiKey, config.outputFormat);
    var schoolParameters = {
        location: [latitude, longitude],
        types: "school",
        radius: "1600"
    };
    schoolSearch.placeSearch(schoolParameters, function (error, response) {
      if (error) {
        return; // no results found
        //assert.notEqual(response.results.length, 0, "Place search must not return 0 results");
      }
      else{
          var i;
          for(i = 0; i < response.results.length; i++)
          {
              if (!schoolAnswer.includes(response.results[i].rating, response.results[i].name))
                  schoolAnswer.push(response.results[i].rating, response.results[i].name);
          }
          superScore += 15;
          //console.log(schoolAnswer);
        }

    });
}
  var addressArray = rawAddressString.split(" "); //split up addressArray
  var houseNum = addressArray[0]; //set house number
  var streetName = "";
  var zipCode = addressArray[-1]; //set zipcode
  if(addressArray.length == 6){
    streetName = addressArray[1] + " " + addressArray[2];
  }
  else{
    streetName = addressArray[1] + " " + addressArray[2] + " " + addressArray[3];
  }
  var options = {
  "url": "https://apis.solarialabs.com/shine/v1/total-home-scores/reports",
  "method": "GET",
  "qs": {
    "street-number": houseNum,
    "street-name": streetName,
    "city": "Boston",
    "state": "Massachusetts",
    "zip-code": zipCode,
    "apikey": "rgN2P63pYYz95MbDWoAx4ny4Fb23yrj0"
  }
  }
  var finalResponse = {};
  var safetyReport = []; //push all incidences of safety concerns into safetyReport;
  var noiseReport = []; //push all incidences of quietFactors into noiseReport array;
  request(options, function(err,response,body){
    var result = JSON.parse(body);

    finalResponse.quietValue = Math.round(result.totalHomeScores.quiet.value);
    finalResponse.safetyValue = Math.round(result.totalHomeScores.safety.value);
    superScore += (finalResponse.safetyValue * 0.5);
    var quietFactors = result.totalHomeScores.quiet.factors;
    var safetyFactors = result.totalHomeScores.safety.factors;
    if(quietFactors.cycleway){
      superScore += 5;
      noiseReport.push("Designated bicycle paths exist here");
    }
    if(quietFactors.light_rail || quietFactors.tram){
      noiseReport.push("The T runs close to here");
    }
    if(quietFactors.motorway || quietFactors.primary){
      superScore -= 3;
      noiseReport.push("A major road or highway runs close to here");
    }
    if(quietFactors.rail){
      superScore -= 1;
      noiseReport.push("The commuter rail runs close to here");
    }
    if(safetyFactors.accel || safetyFactors.speed){
      superScore -= 5;
      safetyReport.push("There have been reports of above average speeding in this area");
    }
    finalResponse.noiseReport = noiseReport;
    finalResponse.safetyReport = safetyReport;

    finalResponse.hubwayStations = hubwayAnswer;
    finalResponse.transitStations = transitAnswer;
    finalResponse.hospitals = hospitalAnswer;
    finalResponse.schools = schoolAnswer;
    finalResponse.superScore = superScore;
    console.log("Super score finally is " + superScore);
    res.json(finalResponse);
  })
});
})
//111 W 8th St, Boston, MA, 02127
