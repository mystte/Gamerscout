const config = require('../config/common');

const API_BASE_URL = `http://${config.api.url}:${config.api.port}/api/1/`;

module.exports = {
  API_BASE_URL,
}