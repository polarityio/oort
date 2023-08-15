'use strict';
const { validateOptions } = require('./server/userOptions');
const { setLogger, getLogger } = require('./server/logging');

const {
  buildIgnoreResults,
  organizeEntities,
  parseErrorToReadableJson
} = require('./server/dataTransformations');

const searchEntities = require('./server/searchEntities');
const assembleLookupResults = require('./server/assembleLookupResults');

const doLookup = async (entities, options, cb) => {
  const Logger = getLogger();
  try {
    Logger.debug({ entities }, 'Entities');

    const { searchableEntities, nonSearchableEntities } = organizeEntities(entities);

    const { endUserStates } = await searchEntities(searchableEntities, options);

    Logger.trace({ endUserStates }, 'Search Results');

    const lookupResults = assembleLookupResults(entities, endUserStates, options);

    const ignoreResults = buildIgnoreResults(nonSearchableEntities);

    Logger.trace({ lookupResults, ignoreResults }, 'Lookup Results');
    cb(null, lookupResults.concat(ignoreResults));
  } catch (error) {
    const err = parseErrorToReadableJson(error);

    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');
    cb({ detail: error.message || 'Lookup Failed', err });
  }
};

module.exports = {
  startup: setLogger,
  validateOptions,
  doLookup
};
