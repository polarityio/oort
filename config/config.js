module.exports = {
  name: 'OORT',
  acronym: 'OORT',
  description: 'Find identities in OORT by IP Addresses and Emails',
  entityTypes: ['IPv4', 'email'],
  defaultColor: 'light-blue',
  styles: ['./client/styles.less'],
  block: {
    component: {
      file: './client/block.js'
    },
    template: {
      file: './client/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'clientId',
      name: 'Client ID',
      description: 'The Client ID found on you OORT Polarity Integration',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'clientSecret',
      name: 'Client Secret',
      description: 'The Client Secret found on you OORT Polarity Integration',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'audience',
      name: 'Audience',
      description: 'The Audience found on you OORT Polarity Integration',
      default: '',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'tokenUrl',
      name: 'Token URL',
      description:
        'Enter the Token URL for your OORT instance. This option defaults to pointing at the OORT production environment. Include the scheme (https://)',
      default: 'https://login.oort.io/oauth/token',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiUrl',
      name: 'API URL',
      description:
        'Enter the API URL for your OORT instance. This option defaults to pointing at the OORT production environment. Include the scheme (https://)',
      default: 'https://dashboard-api.oort.io/api',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
