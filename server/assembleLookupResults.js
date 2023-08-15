const { flow, get, size, find, eq, map, some, join } = require('lodash/fp');

const assembleLookupResults = (entities, endUserStates, options) =>
  map((entity) => {
    const resultsForThisEntity = getResultsForThisEntity(entity, endUserStates, options);

    const resultsFound = some(size, resultsForThisEntity);

    const lookupResult = {
      entity,
      data: resultsFound
        ? {
            summary: createSummaryTags(resultsForThisEntity, options),
            details: resultsForThisEntity
          }
        : null
    };

    return lookupResult;
  }, entities);

const getResultsForThisEntity = (entity, endUserStates) => ({
  endUserStateResults: getResultForThisEntity(entity, endUserStates)
});

const getResultForThisEntity = (entity, results) =>
  flow(find(flow(get('entity.value'), eq(entity.value))), get('result'))(results);

const createSummaryTags = ({ endUserStateResults }, options) => {
  const associatedUsernames = flow(
    map(get('displayName')),
    join(', '),
    (usernames) => `${usernames.slice(0, 120)}${usernames.length > 120 ? '...' : ''}`
  )(endUserStateResults);

  return [].concat(associatedUsernames);
};

module.exports = assembleLookupResults;
