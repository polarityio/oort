const { flow, chunk, map, join, get, filter, compact, size } = require('lodash/fp');

const { requestsInParallel } = require('../request');
const buildQueryResults = require('./utils/buildQueryResults');

const getEndUserStatesByEmails = async (entitiesWithHexValues, options) => {
  const endUserStateQueries = buildEndUserStateQueries(entitiesWithHexValues, options);

  if (!size(endUserStateQueries)) return [];

  const endUserStateResponse = await requestsInParallel(endUserStateQueries, 'body.data');

  const endUserState = buildQueryResults(entitiesWithHexValues, endUserStateResponse);

  return endUserState;
};

const buildEndUserStateQueries = (entitiesWithHexValues, options) =>
  flow(
    filter((entity) => get('isEmail', entity)),
    chunk(5),
    map(
      (entityChunk) =>
        size(entityChunk) && {
          options,
          query: `{${flow(
            map((entity) => getEndUserStateQueryForThisEntity(entity)),
            join('\n')
          )(entityChunk)}}`
        }
    ),
    compact
  )(entitiesWithHexValues);

const getEndUserStateQueryForThisEntity = ({ hexValue, value }) =>
  `a${hexValue}: getEndUserState(login: "${value}") {
    id
    displayName
    login
    employeeId
    managerLogin
    status
    phoneNumber
    userTypeClassification
    referenceUrl
    lastSignInLocation {
      city
      state
      country
    }
    unusedApplications
    usedApplications
    usedFactors
    ipAddresses {
      ipAddress
      location {
        city
        state
        country
      }
    }
  }`;

module.exports = getEndUserStatesByEmails;
