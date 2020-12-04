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
//   hubot weather [--show-latlon] <location> - Displays weather for the given location.
//
// Notes:
//   None.
//
// Author:
//   https://github.com/davidscholberg

const { Weatherbit } = require('../lib/weatherbit');

function formatWeatherData(data, showLatLon) {
  let stateCode = '';
  if (data.country_code === 'US') {
    stateCode = ` ${data.state_code},`;
  }
  let latLon = '';
  if (showLatLon) {
    latLon = ` (${data.lat},${data.lon})`;
  }
  return (
    `${data.city_name},${stateCode} ${data.country_code}` + latLon +
    `: ${data.temp}°C (${convertCelsiusToFahrenheit(data.temp).toFixed(2)}°F),` +
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

function configureWeatherbit() {
  const weatherbitApiKey = process.env.HUBOT_WEATHERBIT_API_KEY;
  if (typeof weatherbitApiKey === 'undefined') {
    console.error(`HUBOT_WEATHERBIT_API_KEY is not set`);
    return null;
  }
  return new Weatherbit(weatherbitApiKey);
}

module.exports = (robot) => {
  const weatherbit = configureWeatherbit();

  robot.respond(/weather( --show-latlon)? (.+)/i, (msg) => {
    if (weatherbit === null) {
      msg.send('oof, the weather module is not configured properly :(');
      return;
    }

    const showLatLon = msg.match[1] === ' --show-latlon';
    function currentWeatherResponseHandler(response) {
      msg.send(formatWeatherData(response.data.data[0], showLatLon));
    }

    function weatherErrorHandler() {
      msg.send('oof, there was a problem getting the weather data :(');
    }

    const searchParam = msg.match[2].trim();
    weatherbit.getCurrentWeather(searchParam, currentWeatherResponseHandler, weatherErrorHandler);
  });
};
