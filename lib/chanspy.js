module.exports = (function () {
    function axiosErrorHandler(error) {
        // only including this for type checking
        const http = require('http');
        if (typeof error.request !== 'undefined' && error.request instanceof http.ClientRequest) {
            const req = error.request;
            let responseInfo = '';
            if (typeof req.res !== 'undefined') {
                const res = req.res;
                responseInfo = ` status code: ${res.statusCode}, status message: ${res.statusMessage},`;
            }
            console.error(
                `request error:${responseInfo}`
                + ` method: ${req.method}`
                + `, protocol: ${req.protocol}`
                + `, host: ${req.host}`
                + `, path: ${req.path}`
            );
        } else {
            let errorInfo = '';
            if (typeof error.stack !== 'undefined') {
                errorInfo = error.stack;
            } else {
                errorInfo = `${error}`;
            }
            console.error(`general api error: ${errorInfo}`);
        }
    }

    class Chanspy {
        http(method, host, path, query, responseType, statusCallback, responseCallback, errorCallback) {
            const requestConfig = {
                url: path,
                method: method,
                baseURL: host,
                params: query,
                timeout: 30000,
                responseType: responseType,
                validateStatus: statusCallback
            };
            const axios = require('axios');
            axios.request(requestConfig)
            .then(responseCallback)
            .catch(function (error) {
                axiosErrorHandler(error);
                errorCallback(error);
            });
        }

    }

    return new Chanspy();
})();
