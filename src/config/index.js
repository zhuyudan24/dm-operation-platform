const config = {
  development: {
    // api: '/dmApi/'
    api: 'http://gicdev.demogic.com/'
  },
  production: {
    // api: 'https://hope.demogic.com/',
    api: window.location.protocol + '//' + window.location.host + '/' || ''
  }
};

export default {
  api: config[process.env['NODE_ENV']]['api']
};
