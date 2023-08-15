const { parallelLimit } = require('async');
const { map, get } = require('lodash/fp');

const createRequestsInParallel =
  (requestWithDefaults) =>
  async (
    requestsOptions,
    responseGetPath,
    limit = 10
  ) => {
    const unexecutedRequestFunctions = map(
      ({ entity, ...requestOptions }) =>
        async () => {
          const response = await requestWithDefaults(requestOptions);
          const result = responseGetPath ? get(responseGetPath, response) : response;
          return entity ? { entity, result } : result;
        },
      requestsOptions
    );

    const results = await parallelLimit(unexecutedRequestFunctions, limit);

    return results;
  };

module.exports = createRequestsInParallel;
