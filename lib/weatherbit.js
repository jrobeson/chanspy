const { httpRequest } = require('./http');

const apiHost = 'https://api.weatherbit.io';
const apiCurrentWeatherPath = '/v2.0/current';
let apiKey = '';

function apiGet(path, queryObject, responseCallback, errorCallback) {
  const fullQueryObject = {
    key: apiKey,
    ...queryObject,
  };

  httpRequest(
    'get',
    apiHost,
    path,
    fullQueryObject,
    'json',
    (status) => status === 200,
    responseCallback,
    errorCallback
  );
}

class Weatherbit {
  constructor(key) {
    apiKey = key;
  }
  getCurrentWeather(searchParam, responseHandler, errorHandler) {
    apiGet(apiCurrentWeatherPath, { city: searchParam }, responseHandler, errorHandler);
  }
}

module.exports.Weatherbit = Weatherbit;
