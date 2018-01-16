var express = require("express");
var router = express.Router();
var http = require("http");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

/* POST current weather */
router.post("/get-current-weather", function(req, res) {
  let apiKey = process.env.APIKEY;
  let cityName =
    req.body.result &&
    req.body.result.parameters &&
    req.body.result.parameters["geo-city"]
      ? req.body.result.parameters["geo-city"]
      : "Madrid";
  let reqUrl = encodeURI(
    "http://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&APPID=" + apiKey + "&units=metric"
  );

  http.get(
    reqUrl,
    responseFromAPI => {
      responseFromAPI.on("data", function(chunk) {
        //console.log(chunk);
        let weather = JSON.parse(chunk);
        //console.log(weather);
        let dataToSend = weather.name + "," + weather.sys.country + " " + weather.weather[0].description + " " + weather.main.temp +
          " °С temperature from " + weather.main.temp_min + " to " + weather.main.temp_max + ", wind " + weather.wind.speed +
          " m/s. " + weather.main.pressure + " hpa";

        return res.json({
          speech: dataToSend,
          displayText: dataToSend,
          source: "get-current-weather",
          data: {
            iconURL:
              "http://openweathermap.org/img/w/" +
              weather.weather[0].icon +
              ".png"
          }
        });
      });
    },
    error => {
      return res.json({
        speech: "Something went wrong!",
        displayText: "Something went wrong!",
        source: "get-current-weather",
        data: ""
      });
    }
  );
});

/* POST forecast weather */
// http://api.openweathermap.org/data/2.5/forecast?q=Madrid&mode=json&APPID=f4c5f1b9615292aebad5c50aa10c0d14&cnt=6&units=metric
router.post("/get-forecast-weather", function(req, res) {
  let apiKey = process.env.APIKEY;
  let cityName =
    req.body.result &&
    req.body.result.parameters &&
    req.body.result.parameters["geo-city"]
      ? req.body.result.parameters["geo-city"]
      : "Madrid";
  let reqUrl = encodeURI("http://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&mode=json&APPID=" + apiKey + "&cnt=4&units=metric");

  let chunks = [];

  http.get(
    reqUrl,
    responseFromAPI => {
      responseFromAPI.on("data", function(data) {
        chunks.push(data);
      }).on('end', function() {
        let data   = Buffer.concat(chunks);
        let weather = JSON.parse(data);
        //console.log(weather);
        let dataToSend = "Tiempo en " + weather.city.name + ', ' +  weather.city.country + ' Geo coords [' + weather.city.coord.lat + ',' + weather.city.coord.lon + ']';
        return res.json({
          speech: dataToSend,
          displayText: dataToSend,
          source: "get-forecast-weather",
          data: weather
        });
      });
    },
    error => {
      return res.json({
        speech: "Something went wrong!",
        displayText: "Something went wrong!",
        source: "get-forecast-weather",
        data: ""
      });
    }
  );
});

module.exports = router;
