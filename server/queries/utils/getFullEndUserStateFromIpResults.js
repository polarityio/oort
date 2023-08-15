const {
  flow,
  map,
  get,
  values,
  flatten,
  compact,
  flatMap,
  reduce,
  filter,
  uniq
} = require('lodash/fp');
const getEndUserStatesByEmails = require('../getEndUserStatesByEmails');
const { encodeHex } = require('../../dataTransformations');

const getFullEndUserStateFromIpResults = async (endUserStateFromIpResults, options) => {
  const ipByEmails = getIpByEmails(endUserStateFromIpResults);

  const fakeEmailEntitiesFromIpResults = buildFakeEmailEntitiesFromIpResults(ipByEmails);

  const fullEndUserResultsFromEmails = await getEndUserStatesByEmails(
    fakeEmailEntitiesFromIpResults,
    options
  );

  const fullEndUserStateFromIpResults = buildFullEndUserStateFromIpResults(
    endUserStateFromIpResults,
    fullEndUserResultsFromEmails,
    ipByEmails
  );

  return fullEndUserStateFromIpResults;
};

const getIpByEmails = (endUserState) =>
  reduce(
    (agg, { entity, result }) => ({
      ...agg,
      [entity.value]: flow(
        flatMap(flow(get('items'), map(get('login')))),
        uniq
      )(result || [])
    }),
    {},
    endUserState
  );

const buildFakeEmailEntitiesFromIpResults = (ipByEmails) =>
  flow(
    values,
    flatten,
    compact,
    uniq,
    map((email) => ({ isEmail: true, value: email, hexValue: encodeHex(email) }))
  )(ipByEmails);

const buildFullEndUserStateFromIpResults = (
  endUserStateFromIpResults,
  fullEndUserResultsFromEmails,
  ipByEmails
) =>
  map(
    ({ entity: ipEntity }) => ({
      entity: ipEntity,
      result: flow(
        filter(({ entity: emailEntity }) =>
          ipByEmails[ipEntity.value].includes(emailEntity.value)
        ),
        flatMap(get('result'))
      )(fullEndUserResultsFromEmails)
    }),
    endUserStateFromIpResults
  );

module.exports = getFullEndUserStateFromIpResults;
