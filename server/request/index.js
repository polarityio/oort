
const createRequestWithDefaults = require('./createRequestWithDefaults');
const createRequestsInParallel = require('./createRequestsInParallel');

const requestWithDefaults = createRequestWithDefaults();

const requestsInParallel = createRequestsInParallel(requestWithDefaults);

module.exports = {
  createRequestWithDefaults,
  requestWithDefaults,
  requestsInParallel
};
