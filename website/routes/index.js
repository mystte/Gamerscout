var express = require('express');
var router = express.Router();
var requests = require('../utils/requests.js');
var constants = require('../utils/constants.js');
var Q = require('q');
var config = require('../config/common.json');

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  var reviews = requests.do_get_request(`${constants.API_BASE_URL}/getRandomPlayers/3`).then(function(result) {
    res.render('index', { title: 'Repflame', gamers: result.body.gamers });
  });
});

router.post('/login', function(req, res, next) {
  var uri = config.api.url + ":" + config.api.port + "/api/1/users/login";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null
  };
  Q().then(function() {
    return requests.do_post_request(uri, data);
  }).then(function(result) {
    res.status(201).json(result);
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

router.post('/signup', function(req, res, next) {
  var uri = config.api.url + ":" + config.api.port + "/api/1/users/signup";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null,
    username : req.body.email ? req.body.email : null,
  };
  Q().then(function() {
    return requests.do_post_request(uri, data);
  }).then(function(result) {
    res.status(201).json(result);
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

module.exports = router;
