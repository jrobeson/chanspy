module.exports = function(robot) {
    const weatherbitApiHost = 'https://api.weatherbit.io';
    const weatherbitCurrentWeatherPath = '/v2.0/current';
    const weatherbitApiKey = process.env.HUBOT_WEATHERBIT_API_KEY;

    function weatherbitGet(path, queryObject, responseCallback, errorCallback) {
        const fullQueryObject = {
            key: weatherbitApiKey,
            ...queryObject
        };

        chanspy = require('../lib/chanspy');
        chanspy.http(
            'get',
            weatherbitApiHost,
            path,
            fullQueryObject,
            'json',
            function (status) {
                return status === 200;
            },
            responseCallback,
            errorCallback
        );
    }

    function formatWeatherData(data) {
        let stateCode = ` ${data.state_code},`;
        if (data.country_code !== 'US') {
            stateCode = '';
        }
        return `${data.city_name},${stateCode} ${data.country_code}`
            + ` (${data.lat},${data.lon}):`
            + ` ${data.temp}°C (${convertCelsiusToFahrenheit(data.temp).toFixed(2)}°F),`
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
        return m * (3600/1609.344);
    }

    robot.respond(/weather( for)? (.+)/i, function(msg){
        if (typeof weatherbitApiKey === 'undefined') {
            console.error(`error: HUBOT_WEATHERBIT_API_KEY is not set`);
            msg.send('error: the weather module is not configured properly');
            return;
        }

        function currentWeatherResponseHandler(response) {
            msg.send(formatWeatherData(response.data.data[0]));
        }

        function weatherErrorHandler(error) {
            msg.send('oof, there was a problem getting the weather data :(');
        }

        // replace all whitespace with commas and then remove duplicate commas
        const searchParam = msg.match[2].replace(/\s+/g, ',').replace(/(,)\1+/g, '$1');
        weatherbitGet(
            weatherbitCurrentWeatherPath,
            {city: searchParam},
            currentWeatherResponseHandler,
            weatherErrorHandler
        );
    });
}
