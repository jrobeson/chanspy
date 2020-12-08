const axios = require('axios');

const apiHost = 'https://api.weatherbit.io';
const apiCurrentWeatherPath = '/v2.0/current';
let apiKey = '';

async function apiGet(path, queryObject) {
  const fullQueryObject = {
    key: apiKey,
    ...queryObject,
  };
  const requestConfig = {
    url: path,
    method: 'get',
    baseURL: apiHost,
    params: fullQueryObject,
    timeout: 30000,
    responseType: 'json',
    validateStatus: (status) => status === 200,
  };
  return axios.request(requestConfig);
}

class Weatherbit {
  constructor(key) {
    apiKey = key;
  }

  async getCurrentWeather(searchParam) {
    return apiGet(apiCurrentWeatherPath, { city: searchParam });
  }
}

module.exports.Weatherbit = Weatherbit;
