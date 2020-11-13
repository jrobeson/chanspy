module.exports = function(robot) {
    const weatherbitApiHost = 'https://api.weatherbit.io';
    const weatherbitCurrentPath = '/v2.0/current';
    const weatherbitApiKey = process.env.HUBOT_WEATHERBIT_API_KEY;

    function weatherbitGet(path, queryObject, responseCallback, errorCallback) {
        const fullQueryObject = {
            key: weatherbitApiKey,
            ...queryObject
        };

        const requestConfig = {
            url: weatherbitCurrentPath,
            method: 'get',
            baseURL: weatherbitApiHost,
            params: fullQueryObject,
            timeout: 30000,
            responseType: 'json',
            validateStatus: function (status) {
                return status === 200;
            }
        };

        const axios = require('axios');
        axios.request(requestConfig)
            .then(responseCallback)
            .catch(errorCallback);
    }

    function formatWeatherData(data) {
        return `current weather for`
            + ` ${data.city_name}, ${data.state_code}, ${data.country_code}`
            + ` (${data.lat},${data.lon})`
            + ` at ${data.ob_time}:`
            + ` ${data.temp}°C,`
            + ` ${data.rh}% humidity,`
            + ` wind ${data.wind_cdir} at ${data.wind_spd}m/s,`
            + ` ${data.weather.description}`;
    }

    robot.respond(/weather( for)? (.+)/i, function(msg){
        if (typeof weatherbitApiKey === 'undefined') {
            console.error(`error: HUBOT_WEATHERBIT_API_KEY is not set`);
            msg.send('error: the weather module is not configured properly');
            return;
        }

        function apiResponseHandler(response) {
            msg.send(formatWeatherData(response.data.data[0]));
        }

        function apiErrorHandler(error) {
            if (error.request) {
                console.error('request error: dumping request object:');
                console.error(error.request);
            } else if (error.response) {
                console.error(`response error: http status ${error.response.status}: ${error.response.statusText}`);
                console.error(error.response.headers);
                console.error(error.response.data);
            } else {
                console.error(`general api error: ${error.message}`);
            }
            msg.send('oof, there was a problem getting the weather data :(');
        }

        const searchParam = msg.match[2].replaceAll(/\s+/g, '');
        weatherbitGet(weatherbitCurrentPath, {city: searchParam}, apiResponseHandler, apiErrorHandler);
    });
}
