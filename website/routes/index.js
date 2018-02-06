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
    var data = {
      title: 'Gamerscout',
      gamers: result.body.gamers,
      lol_regions_short: config.lol_regions_short,
      session: req.session,
      api_url: config.api.protocol + '://' + config.api.url + ':' + config.api.port
    };
    res.render('index', data);
  });
});

router.post('/logout', function (req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/users/logout";
  var data = {
    email: req.body.email ? req.body.email : null,
    password: req.body.password ? req.body.password : null
  };
  Q().then(function () {
    return requests.do_post_request(uri, data);
  }).then(function (result) {
    req.session = null;
    res.status(result.statusCode).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/login', function(req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/users/login";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null
  };
  Q().then(function() {
    return requests.do_post_request(uri, data);
  }).then(function(result) {
    if (result.statusCode == 201) {
      req.session.email = data.email;
      req.session._id = result.body._id;
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

router.post('/signup', function(req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/users/signup";
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


router.get('/profile/:platform/:region/:gamertag', function(req,res,next){
	var platform = req.params.platform;
	var region = req.params.region;
	var region_verbose = config.lol_regions[region];
	var player = requests.do_get_request(`${constants.API_BASE_URL}search/${req.params.platform}/${req.params.gamertag}`).then(function(result){
		console.log(result.body);
		console.log("region" + region);
		console.log("verbose" + region_verbose);
		if(result.body.length == 0) res.render('player_not_found', {title:'Gamerscout'});
		for(var i = 0; i < result.body.length; i++){
			if(result.body[i].platform == region_verbose){
				res.render('profile',{title:'Repflame', gamer:result.body[i]});
				break;
			}
			else if(i == result.body.length - 1 && result.body[i].platform != region_verbose) res.render('player_not_found', {title:'Repflame'});
		}
	});
});

module.exports = router;













