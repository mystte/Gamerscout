const config = require('../config/common');
const ENV = require('express')().get('env');
const apiUrl = (ENV === 'production') ? config.api.url_prod : config.api.url_dev;

const API_BASE_URL = `https://${apiUrl}:${config.api.port}/api/1/`;


module.exports = {
  API_BASE_URL,
  ENV,
}