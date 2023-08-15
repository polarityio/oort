const fs = require('fs');

const request = require('postman-request');
const { get, isEmpty, getOr, identity } = require('lodash/fp');
const Bottleneck = require('bottleneck/es5');

const { getLogger } = require('../logging');
const { parseErrorToReadableJson } = require('../dataTransformations');
const authenticateRequest = require('./authenticateRequest');

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

let limiter;

function _setupLimiter(options) {
  limiter = new Bottleneck({
    maxConcurrent: 10, // no more than 5 lookups can be running at single time
    highWater: 100, // no more than 50 lookups can be queued up
    strategy: Bottleneck.strategy.OVERFLOW,
    minTime: 100 // don't run lookups faster than 1 every options.minTime ms
  });
}
const createRequestWithDefaults = () => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = require('../../config/config.js');

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    json: true
  };

  const requestWithDefaultsBuilder = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e, ro) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefaults = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      if (!limiter) _setupLimiter(requestOptions.options);

      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      try {
        result = await limiter.schedule(_requestWithDefaults, _requestOptions);

        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        try {
          postRequestFunctionResults = await postRequestFailureFunction(
            error,
            _requestOptions
          );
        } catch (error) {
          const err = parseErrorToReadableJson(error);

          if (_requestOptions.entity)
            error.entity = JSON.stringify(_requestOptions.entity);

          error.maxRequestQueueLimitHit =
            (isEmpty(err) && isEmpty(result)) ||
            (err && err.message === 'This job has been dropped by Bottleneck');

          error.isConnectionReset =
            getOr('', 'errors[0].meta.err.code', err) === 'ECONNRESET';
          error.entity = JSON.stringify(_requestOptions.entity);

          throw error;
        }
      }
      return postRequestFunctionResults;
    };
  };

  const checkForStatusError = ({ statusCode, body, headers }, requestOptions) => {
    const Logger = getLogger();

    const requestOptionsWithoutSensitiveData = {
      ...requestOptions,
      options: '{...}',
      auth: '{...}'
    };

    Logger.trace({
      MESSAGE: 'Request Ran, Checking Status...',
      statusCode,
      requestOptions: requestOptionsWithoutSensitiveData,
      responseBody: body
    });

    const roundedStatus = Math.round(statusCode / 100) * 100;
    const statusCodeNotSuccessful = ![200].includes(roundedStatus);
    const responseBodyError = get('error', body);

    if (statusCodeNotSuccessful || responseBodyError) {
      const requestError = Error(
        `Request Error${
          get('message', responseBodyError)
            ? ` -> ${get('message', responseBodyError)}`
            : ''
        }`
      );
      requestError.status = statusCodeNotSuccessful
        ? statusCode
        : get('code', responseBodyError);
      requestError.detail = get('error', body);
      requestError.headers = headers;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaultsBuilder(
    authenticateRequest(requestWithDefaultsBuilder())
  );

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
