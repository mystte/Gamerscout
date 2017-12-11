var express = require('express');
var router = express.Router();
var requests = require('../utils/requests.js');
var constants = require('../utils/constants.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  var reviews = requests.do_get_request(`${constants.API_BASE_URL}/getRandomPlayers/3`).then(function(result) {
    res.render('index', { title: 'Repflame', gamers: result.body.gamers });
  });
});

module.exports = router;
