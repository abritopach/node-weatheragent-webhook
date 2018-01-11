var express = require("express");
var router = express.Router();
var http = require("http");

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

/* POST current weather */
router.post("/get-current-weather", function(req, res) {
  let cityName =
    req.body.result &&
    req.body.result.parameters &&
    req.body.result.parameters.city
      ? req.body.result.parameters.city
      : "Madrid";
  let reqUrl = encodeURI(
    "http://api.openweathermap.org/data/2.5/weather?q=" +
      cityName +
      "&APPID=f4c5f1b9615292aebad5c50aa10c0d14&units=metric"
  );
  http.get(
    reqUrl,
    responseFromAPI => {
      responseFromAPI.on("data", function(chunk) {
        //console.log(chunk);
        let weather = JSON.parse(chunk);
        //console.log(weather);
        let dataToSend =
          weather.name +
          "," +
          weather.sys.country +
          " " +
          weather.weather[0].description +
          weather.main.temp +
          " °С from " +
          weather.main.temp_min +
          " to " +
          weather.main.temp_max;

        return res.json({
          speech: dataToSend,
          displayText: dataToSend,
          source: "get-current-weather"
        });
      });
    },
    error => {
      return res.json({
        speech: "Something went wrong!",
        displayText: "Something went wrong!",
        source: "get-current-weather"
      });
    }
  );
});

module.exports = router;