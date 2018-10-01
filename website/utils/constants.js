const config = require('../config/common');

const API_BASE_URL = `https://${config.api.url}:${config.api.port}/api/1/`;

module.exports = {
  API_BASE_URL,
}