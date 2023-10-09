const { validateStringOptions } = require('./utils');

const validateOptions = async (options, callback) => {
  const stringOptionsErrorMessages = {
    clientId: '* Required',
    clientSecret: '* Required',
    audience: '* Required',
    tokenUrl: '* Required',
    apiUrl: '* Required'
  };

  const stringValidationErrors = validateStringOptions(
    stringOptionsErrorMessages,
    options
  );
  const urlValidationErrors = validateUrlOption(options);

  const errors = stringValidationErrors.concat(urlValidationErrors);

  callback(null, errors);
};

const validateUrlOption = (options) => {
  const { tokenUrl, apiUrl } = options;

  let allValidationErrors = [];

  if (tokenUrl.value.endsWith('//')) {
    allValidationErrors = allValidationErrors.concat([
      {
        key: 'tokenUrl',
        message: 'Your Url must not end with a //'
      }
    ]);
  }

  if (apiUrl.value.endsWith('//')) {
    allValidationErrors = allValidationErrors.concat([
      {
        key: 'apiUrl',
        message: 'Your Url must not end with a //'
      }
    ]);
  }

  if (tokenUrl.value) {
    try {
      new URL(tokenUrl.value);
    } catch (_) {
      allValidationErrors = allValidationErrors.concat({
        key: tokenUrl.value,
        message:
          'What is currently provided is not a valid URL. A valid Instance URL is Required.'
      });
    }
  }

  if (apiUrl.value) {
    try {
      new URL(apiUrl.value);
    } catch (_) {
      allValidationErrors = allValidationErrors.concat({
        key: apiUrl.value,
        message:
          'What is currently provided is not a valid URL. A valid Instance URL is Required.'
      });
    }
  }

  return allValidationErrors;
};

module.exports = validateOptions;
