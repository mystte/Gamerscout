const config = require('../config/common');
const ENV = require('express')().get('env');
const getApiUrl = function() {
  let url = config.api.url_dev;
  if (ENV === 'production') {
    url = config.api.url_prod;
  } else if (ENV === 'staging') {
    url = config.api.url_staging;
  }
  return url;
}

const API_BASE_URL = `https://${getApiUrl()}/api/1/`;

module.exports = {
  API_BASE_URL,
  ENV,
  getApiUrl,
}