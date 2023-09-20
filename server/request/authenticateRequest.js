const { get } = require('lodash/fp');
const NodeCache = require('node-cache');
const tokenCache = new NodeCache();

const authenticateRequest =
  (requestWithDefaults) =>
  async ({ query, options, ...requestOptions }) => {
    const cacheId = options.clientId + options.clientSecret + options.audience;
    let accessToken = tokenCache.get(cacheId);

    if (!accessToken) {
      const { access_token, expires_in } = get(
        'body',
        await requestWithDefaults({
          method: 'POST',
          url: options.tokenUrl,
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

    return {
      ...requestOptions,
      method: 'POST',
      url: options.apiUrl,
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      body: { query }
    };
  };

module.exports = authenticateRequest;
