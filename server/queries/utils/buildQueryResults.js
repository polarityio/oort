const { flow, map, isEmpty, compact, merge, reduce, get, flatten } = require('lodash/fp');

const buildQueryResults = (entitiesWithHexValues, queryResponse) =>
  flow(
    mergeAllQueryResultsFromParallelQueries,
    (queryResultObj) =>
      map(
        (entity) => getResultsForThisEntity(entity, queryResultObj),
        entitiesWithHexValues
      ),
    compact
  )(queryResponse);

const mergeAllQueryResultsFromParallelQueries = (queryResponse) =>
  reduce(merge, {}, queryResponse);

const getResultsForThisEntity = (entity, queryResultObj) =>
  flow(
    get(`a${entity.hexValue}`),
    (queryResultForThisEntity) =>
      !isEmpty(queryResultForThisEntity) && {
        entity,
        result: flatten([queryResultForThisEntity])
      }
  )(queryResultObj);

module.exports = buildQueryResults;
