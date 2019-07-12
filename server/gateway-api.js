const axios = require('axios'),
  session = require('./session'),
  jwt = require('jsonwebtoken'),
  log = require('./log'),
  logError = require('./logError').logError,
  eliteApiUrl = process.env.API_AUTH_ENDPOINT_URL || 'http://localhost:8080/',
  useEliteApiAuth = (process.env.USE_API_GATEWAY_AUTH || 'no') === 'yes';

axios.interceptors.request.use((config) => {
  
  if (!config.url.includes(process.env.KEYWORKER_API_URL) && useEliteApiAuth) {
    const backendToken = config.headers.authorization;
    if (backendToken) {
      config.headers['elite-authorization'] = backendToken; // eslint-disable-line no-param-reassign
    }
    config.headers.authorization = `Bearer ${gatewayToken()}`; // eslint-disable-line no-param-reassign
  }
  return config;
}, (error) => Promise.reject(error));

const generateRequestHeaders = (req) => {
  return {jwt: {access_token: req.access_token, refresh_token: req.refresh_token}, host: req.headers.host};
};

const getRequest = ({req, res, url, headers, params, paramsSerializer}) => service.callApi({
  method: 'get',
  url,
  headers: headers || {},
  reqHeaders: generateRequestHeaders(req),
  params,
  paramsSerializer,
  onTokenRefresh: session.updateHmppsCookie(res)
});

const postRequest = ({req, res, url, headers}) => service.callApi({
  method: 'post',
  url,
  headers: headers || {'content-type': 'application/json'},
  reqHeaders: generateRequestHeaders(req),
  data: req.data,
  onTokenRefresh: session.updateHmppsCookie(res)
});

const putRequest = ({req, res, url, headers}) => service.callApi({
  method: 'put',
  url,
  headers: headers || {'content-type': 'application/json'},
  reqHeaders: generateRequestHeaders(req),
  data: req.body,
  onTokenRefresh: session.updateHmppsCookie(res)
});

const getHeaders = ({headers, reqHeaders, token}) => {
  return Object.assign({}, headers, {
    'authorization': 'Bearer ' + token,
    'access-control-allow-origin': reqHeaders.host
  });
};

const callApi = ({method, url, headers, reqHeaders, params, paramsSerializer, onTokenRefresh, responseType, data}) => {
  const {access_token, refresh_token} = reqHeaders.jwt;

  if (!access_token || !refresh_token) { // eslint-disable-line camelcase
    const message = 'Null session or missing jwt';
    log.error(message);
    throw new Error(message);
  }
  log.debug({url, data}, 'Calling API');
  return axios({
    url,
    method,
    responseType,
    params,
    paramsSerializer,
    data,
    headers: getHeaders({headers, reqHeaders, token: access_token})
  }).catch(error => {
    if (error.response) {
      if (error.response.status === 401) {
        return service.refreshTokenRequest({token: refresh_token, headers, reqHeaders}).then(response => {
          onTokenRefresh(response.data);
          return service.retryRequest({
            url,
            method,
            responseType,
            params,
            paramsSerializer,
            data,
            headers: getHeaders({headers, reqHeaders, token: response.data.access_token})
          });
        });
      } else if (error.response.status === 404) {
        throw error;
      }
    }
    logError(url, error, 'Unexpected error caught in callApi');
    throw error;
  });
};

const refreshTokenRequest = ({headers, reqHeaders, token}) => axios({
  method: 'post',
  url: `${eliteApiUrl}oauth/token`,
  headers: getClientHeaders({headers, reqHeaders}),
  params: {
    grant_type: 'refresh_token',
    refresh_token: token
  }
});

function gatewayToken() {
  const apiGatewayToken = process.env.API_GATEWAY_TOKEN;
  const milliseconds = Math.round((new Date()).getTime() / 1000);
  const payload = {
    iat: milliseconds,
    token: apiGatewayToken
  };
  const base64PrivateKey = process.env.API_GATEWAY_PRIVATE_KEY || '';
  const privateKey = Buffer.from(base64PrivateKey, 'base64');
  const cert = new Buffer(privateKey);
  return jwt.sign(payload, cert, {algorithm: 'ES256'});
}

const apiClientId = process.env.API_CLIENT_ID || 'omic';
const apiClientSecret = process.env.API_CLIENT_SECRET || 'clientsecret';
const encodeClientCredentials = () => new Buffer(`${apiClientId}:${apiClientSecret}`).toString('base64');

const getClientHeaders = ({headers, reqHeaders}) => Object.assign({}, headers, {
  "authorization": `Basic ${encodeClientCredentials()}`,
  'Content-Type': 'application/x-www-form-urlencoded',
  'access-control-allow-origin': reqHeaders.host
});

const service = {
  callApi,
  getRequest,
  postRequest,
  putRequest,
  refreshTokenRequest,
  retryRequest: (options) => axios(options),
  login: (req) => {
    const data = `username=${req.body.username.toUpperCase()}&password=${req.body.password}&grant_type=password&client_id=${apiClientId}`;    
    return axios.post(`${eliteApiUrl}oauth/token`, data, {
      headers: {
        'authorization': `Basic ${encodeClientCredentials()}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  }
};

module.exports = service;
