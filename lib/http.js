const http = require('http');
const axios = require('axios');

function axiosErrorHandler(error) {
  // only including this for type checking
  if (typeof error.request !== 'undefined' && error.request instanceof http.ClientRequest) {
    const req = error.request;
    let responseInfo = '';
    if (typeof req.res !== 'undefined') {
      const res = req.res;
      responseInfo = ` status code: ${res.statusCode}, status message: ${res.statusMessage},`;
    }
    console.error(
      `request error:${responseInfo}` +
        ` method: ${req.method}` +
        `, protocol: ${req.protocol}` +
        `, host: ${req.host}` +
        `, path: ${req.path}`
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

function httpRequest(
  method,
  host,
  path,
  query,
  responseType,
  statusCallback,
  responseCallback,
  errorCallback
) {
  const requestConfig = {
    url: path,
    method: method,
    baseURL: host,
    params: query,
    timeout: 30000,
    responseType: responseType,
    validateStatus: statusCallback,
  };
  axios
    .request(requestConfig)
    .then(responseCallback)
    .catch(function (error) {
      axiosErrorHandler(error);
      errorCallback(error);
    });
}

module.exports = (function () {
  return httpRequest;
})();
