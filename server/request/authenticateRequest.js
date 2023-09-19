const { get } = require('lodash/fp');
const NodeCache = require('node-cache');
const tokenCache = new NodeCache();

const authenticateRequest =
  (requestWithDefaults) =>
  async ({ query, options, ...requestOptions }) => {
    const cacheId = options.clientId + options.clientSecret + options.audience;
    let accessToken = tokenCache.get(cacheId);

    const { tokenUrl } = selectedEnvironment(options);

    if (!accessToken) {
      const { access_token, expires_in } = get(
        'body',
        await requestWithDefaults({
          method: 'POST',
          url: tokenUrl,
          headers: {
            'Content-Type': 'application/json'
          },
          body: {
            client_id: options.clientId,
            client_secret: options.clientSecret,
            audience: options.audience,
            grant_type: 'client_credentials'
          }
        })
      );
      tokenCache.set(cacheId, access_token, expires_in || 36000);
      accessToken = access_token;
    }

    const { apiUrl } = selectedEnvironment(options);
    return {
      ...requestOptions,
      method: 'POST',
      url: apiUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: { query }
    };
  };

function selectedEnvironment(options) {
  if (options.environment === 'staging') {
    return {
      tokenUrl: 'https://login.stage.oort.io/oauth/token',
      apiUrl: 'https://dashboard-api.stage.oort.io/api'
    };
  } else {
    return {
      tokenUrl: 'https://login.oort.io/oauth/token',
      apiUrl: 'https://dashboard-api.oort.io/api'
    };
  }
}

module.exports = authenticateRequest;
