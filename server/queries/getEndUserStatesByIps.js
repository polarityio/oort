const { flow, chunk, map, join, get, filter, compact, size } = require('lodash/fp');

const { requestsInParallel } = require('../request');
const { buildQueryResults, getFullEndUserStateFromIpResults } = require('./utils');

const getEndUserStatesByIps = async (entitiesWithHexValues, options) => {
  const endUserStateQueries = buildIpEndUserInfoQueries(entitiesWithHexValues, options);

  if (!size(endUserStateQueries)) return [];

  const endUserStateResponse = await requestsInParallel(endUserStateQueries, 'body.data');

  const endUserState = buildQueryResults(entitiesWithHexValues, endUserStateResponse);

  const fullEndUserStateFromIpResults = await getFullEndUserStateFromIpResults(
    endUserState,
    options
  );

  return fullEndUserStateFromIpResults;
};

const buildIpEndUserInfoQueries = (entitiesWithHexValues, options) =>
  flow(
    filter((entity) => get('isIP', entity)),
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
  `a${hexValue}: getEndUsersByIp(ipAddress: "${value}") {
    items {
      id
      displayName
      login
      referenceUrl
    }
  }`;

module.exports = getEndUserStatesByIps;
