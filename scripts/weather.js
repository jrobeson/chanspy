// Description:
//   Fetches and prints weather data.
//
// Dependencies:
//   weatherbit library (provided locally)
//
// Configuration:
//   HUBOT_WEATHERBIT_API_KEY
//
// Commands:
//   hubot weather <location> - Displays weather for the given location.
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

const weatherbit = require('../lib/weatherbit');

function formatWeatherData(data) {
  let stateCode = ` ${data.state_code},`;
  if (data.country_code !== 'US') {
    stateCode = '';
  }
  return (
    `${data.city_name},${stateCode} ${data.country_code}` +
    ` (${data.lat},${data.lon}):` +
    ` ${data.temp}°C (${convertCelsiusToFahrenheit(data.temp).toFixed(2)}°F),` +
    ` ${data.rh}% humidity,` +
    ` wind ${data.wind_cdir} at` +
    ` ${convertMetersPerSecondToKmPerHour(data.wind_spd).toFixed(2)}km/h` +
    ` (${convertMetersPerSecondToMilesPerHour(data.wind_spd).toFixed(2)}mph),` +
    ` ${data.weather.description.toLowerCase()}`
  );
}

function convertCelsiusToFahrenheit(c) {
  return c * (9 / 5) + 32;
}

function convertMetersPerSecondToKmPerHour(m) {
  return m * 3.6;
}

function convertMetersPerSecondToMilesPerHour(m) {
  return m * (3600 / 1609.344);
}

module.exports = (robot) => {
  const weatherbitApiKey = process.env.HUBOT_WEATHERBIT_API_KEY;

  robot.respond(/weather( for)? (.+)/i, function (msg) {
    if (typeof weatherbitApiKey === 'undefined') {
      console.error(`error: HUBOT_WEATHERBIT_API_KEY is not set`);
      msg.send('error: the weather module is not configured properly');
      return;
    }

    function currentWeatherResponseHandler(response) {
      msg.send(formatWeatherData(response.data.data[0]));
    }

    function weatherErrorHandler() {
      msg.send('oof, there was a problem getting the weather data :(');
    }

    const searchParam = msg.match[2];
    weatherbit.setApiKey(weatherbitApiKey);
    weatherbit.getCurrentWeather(searchParam, currentWeatherResponseHandler, weatherErrorHandler);
  });
};
