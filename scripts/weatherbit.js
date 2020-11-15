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
        let stateCode = ` ${data.state_code},`;
        if (data.country_code !== 'US') {
            stateCode = '';
        }
        return `${data.city_name},${stateCode} ${data.country_code}`
            + ` (${data.lat},${data.lon}):`
            + ` ${data.temp}°C (${convertCelsiusToFahrenheit(data.temp)}°F),`
            + ` ${data.rh}% humidity,`
            + ` wind ${data.wind_cdir} at ${convertMetersPerSecondToKmPerHour(data.wind_spd).toFixed(2)}km/h`
            + ` (${convertMetersPerSecondToMilesPerHour(data.wind_spd).toFixed(2)}mph),`
            + ` ${data.weather.description.toLowerCase()}`;
    }

    function convertCelsiusToFahrenheit(c) {
        return (c * (9/5)) + 32;
    }

    function convertMetersPerSecondToKmPerHour(m) {
        return m * 3.6;
    }

    function convertMetersPerSecondToMilesPerHour(m) {
        return m * 2.236936;
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
            // only including this for type checking
            const http = require('http');
            if (typeof error.request !== 'undefined' && error.request instanceof http.ClientRequest) {
                const req = error.request;
                let responseInfo = '';
                if (typeof req.res !== 'undefined') {
                    const res = req.res;
                    responseInfo = ` status code: ${res.statusCode}, status message: ${res.statusMessage},`;
                }
                console.error(`request error:${responseInfo}`
                    + ` method: ${req.method}`
                    + `, protocol: ${req.protocol}`
                    + `, host: ${req.host}`
                    + `, path: ${req.path}`);
            } else {
                let errorInfo = '';
                if (typeof error.stack !== 'undefined') {
                    errorInfo = error.stack;
                } else {
                    errorInfo = `${error}`;
                }
                console.error(`general api error: ${errorInfo}`);
            }
            msg.send('oof, there was a problem getting the weather data :(');
        }

        // replace all whitespace with commas and then remove duplicate commas
        const searchParam = msg.match[2].replace(/\s+/g, ',').replace(/(,)\1+/g, '$1');
        weatherbitGet(weatherbitCurrentPath, {city: searchParam}, apiResponseHandler, apiErrorHandler);
    });
}
