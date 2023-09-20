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
        'Select the environment you would like to connect to, either staging or production. This option defaults to pointing at production.',
      default: 'prouction',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiUrl',
      name: 'Token URL',
      description:
        'Select the environment you would like to connect to, either staging or production. This option defaults to pointing at production.',
      default: 'prouction',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
