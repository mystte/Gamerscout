const config = require('../config');
const ENV = require('express')().get('env');
const getClientBaseUrl = function () {
  let url = config.client.dev.url;
  if (ENV === 'production') {
    url = config.client.prod.url;
  } else if (ENV === 'staging') {
    url = config.client.staging.url;
  }
  return url;
}

const CLIENT_BASE_URL = getClientBaseUrl();

module.exports = {
  CLIENT_BASE_URL,
  ENV,
}