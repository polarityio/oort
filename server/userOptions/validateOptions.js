const { validateStringOptions } = require('./utils');

const validateOptions = async (options, callback) => {
  const stringOptionsErrorMessages = {
    clientId: '* Required',
    clientSecret: '* Required',
    audience: '* Required'
  };

  const stringValidationErrors = validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  callback(null, stringValidationErrors);
};

module.exports = validateOptions;
