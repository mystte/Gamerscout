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
      ...req.globalData,
      featured: [
        { title: "RECENT", list: result.body.gamers},
        { title: "POPULAR", list: result.body.gamers},
        { title: "HIGHEST RATED", list: result.body.gamers}
      ],
      gamers: (result.body) ? result.body.gamers : null,
      featured: [
        { title: "RECENT", list: result.body.gamers},
        { title: "POPULAR", list: result.body.gamers},
        { title: "HIGHEST RATED", list: result.body.gamers}
      ],
      lol_regions_short: config.lol_regions_short,
    };
    res.render('index', data);
  });
});

router.post('/forgot-pwd', function(req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/users/forgotten_password";
  var data = {
    email: req.body.email ? req.body.email : null,
  };
  Q().then(function () {
    return requests.do_post_request(uri, data, req.headers);
  }).then(function (result) {
    res.status(result.statusCode).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/logout', function (req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/users/logout";
  var data = {
    email: req.body.email ? req.body.email : null,
    password: req.body.password ? req.body.password : null
  };
  Q().then(function () {
    return requests.do_post_request(uri, data, req.headers);
  }).then(function (result) {
    req.session.destroy();
    res.status(200).json(result);
  }).catch(function (reason) {
    console.log("reason", reason);
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
    return requests.do_post_request(uri, data, req.headers);
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

router.post('/review', function(req, res, next) {
  var uri = config.api.protocol + "://" + config.api.url + ":" + config.api.port + "/api/1/gamer/review";
  var data = {
    id: req.body.id ? req.body.id : null,
    comment: req.body.comment ? req.body.comment : null,
    tags: req.body.tags ? req.body.tags : null,
    review_type: req.body.review_type ? req.body.review_type : null,
  };

  Q().then(function () {
    return requests.do_post_request(uri, data);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.get('/legal', function(req,res,next){
  res.render('legal', {
        ...req.globalData,
      })
});

router.get('/account',  function(req,res,next){
  res.render('account_settings', {
        ...req.globalData,
      })
});

router.get('/profile/:platform/:region/:gamertag', function(req,res,next){
	var platform = req.params.platform;
	var region = req.params.region;
  var region_verbose = config.lol_regions[region];
  var tags = null;
  requests.do_get_request(`${constants.API_BASE_URL}tags`).then(function (result) {
    tags = result.body ? result.body.tags : null;
    return requests.do_get_request(`${constants.API_BASE_URL}search/${req.params.platform}/${req.params.gamertag}`);
  }).then(function(result) {
    var similar_gamers = []
    if (result.body.length == 0){
      res.render('player_not_found', {
        similar_gamers: similar_gamers,
        ...req.globalData,
      })
    }
    else {
      for (var i = 0; i < result.body.length; i++) {
        similar_gamers.push(result.body[i])
        if (result.body[i].platform == region_verbose) {
          res.render('profile', {
            ...req.globalData,
            gamer: result.body[i],
            tags: tags
          });
          break;
        } else if (i == result.body.length - 1 && result.body[i].platform != region_verbose) {
          res.render('player_not_found', {
            ...req.globalData,
            similar_gamers: similar_gamers,
          });
        }
      }
    }
  });
});

module.exports = router;













