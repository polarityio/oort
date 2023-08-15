const { map, flatten } = require('lodash/fp');
const { encodeHex } = require('./dataTransformations');
const { getEndUserStatesByEmails, getEndUserStatesByIps } = require('./queries');

const searchEntities = async (entities, options) => {
  const entitiesWithHexValues = map(
    (entity) => ({ ...entity, hexValue: encodeHex(entity.value) }),
    entities
  );

  const endUserStates = flatten(
    await Promise.all([
      getEndUserStatesByEmails(entitiesWithHexValues, options),
      getEndUserStatesByIps(entitiesWithHexValues, options)
    ])
  );

  return { endUserStates };
};

module.exports = searchEntities;
