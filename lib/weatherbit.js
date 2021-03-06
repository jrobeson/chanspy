module.exports = (function () {
  const apiHost = 'https://api.weatherbit.io';
  const apiCurrentWeatherPath = '/v2.0/current';
  let apiKey = '';

  function apiGet(path, queryObject, responseCallback, errorCallback) {
    const fullQueryObject = {
      key: apiKey,
      ...queryObject,
    };

    const http = require('./http');
    http(
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
    setApiKey(key) {
      apiKey = key;
    }
    getCurrentWeather(searchParam, responseHandler, errorHandler) {
      apiGet(apiCurrentWeatherPath, { city: searchParam }, responseHandler, errorHandler);
    }
  }

  return new Weatherbit();
})();
