var express = require('express');
var router = express.Router();
var requests = require('../utils/requests.js');
var constants = require('../utils/constants.js');
var Q = require('q');
var config = require('../config/common.json');
var env = express().get('env');
const apiUrl = (env === 'production') ? config.api.url_prod : config.api.url_dev;

/* GET home page. */
router.get('/', function(req, res, next) {
  // Call to API HERE
  var reviews = requests.do_get_request(`${constants.API_BASE_URL}/getRandomPlayers/5`).then(function(result) {
    var data = {
      ...req.globalData,
      lol_regions_short: config.lol_regions_short,
      API_BASE_URL: constants.API_BASE_URL
    };
    res.render('index', data);
  });
});

router.post('/forgot-pwd', function(req, res, next) {
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/forgotten_password";
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
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/logout";
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
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/login";
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
      req.session.username = result.body.username;
      req.session.fb_id = result.body.fb_id;
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

router.post('/fb-login', function(req, res, next) {
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/facebook_auth";
  var data = {
    access_token: req.body.access_token ? req.body.access_token : null,
  };
  Q().then(function () {
    return requests.do_post_request(uri, data, req.headers);
  }).then(function (result) {
    if (result.statusCode == 201) {
      req.session.email = result.body.email;
      req.session._id = result.body._id;
      req.session.username = result.body.username;
      req.session.fb_id = result.body.facebook_id;
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  }).catch(function (reason) {
    console.log(reason);
    res.status(500).json({ err: "Internal Server Error" });
  });
})

router.post('/signup', function(req, res, next) {
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/signup";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null,
    username: req.body.username ? req.body.username : null,
    newsletter: req.body.newsletter ? req.body.newsletter : false,
  };
  Q().then(function() {
    return requests.do_post_request(uri, data, req.headers);
  }).then(function(result) {
    res.status(201).json(result);
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

router.post('/review', function(req, res, next) {
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/gamer/review";
  var data = {
    id: req.body.id ? req.body.id : null,
    comment: req.body.comment ? req.body.comment : null,
    tags: req.body.tags ? req.body.tags : null,
    review_type: req.body.review_type ? req.body.review_type : null,
  };

  Q().then(function () {
    return requests.do_post_request(uri, data, req.headers);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/profile-update', function (req, res, next) {
  if (!req.session) {
    res.status(403).json({err : "Forbidden"});
    return;
  }
  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/" + req.session._id;
  var data = {};

  if (req.body.username) data.username = req.body.username;
  Q().then(function () {
    return requests.do_put_request(uri, data, req.headers);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/account-update', function (req, res, next) {
  if (!req.session) {
    res.status(403).json({ err: "Forbidden" });
    return;
  }

  var uri = config.api.protocol + "://" + apiUrl + ":" + config.api.port + "/api/1/users/" + req.session._id;
  var data = {};
  if (req.body.username) { data.username = req.body.username; req.session.username = req.body.username; }
  if (req.body.password) { data.password = req.body.password; }
  if (req.body.email) { data.email = req.body.email; req.session.email = req.body.email; }

  Q().then(function () {
    return requests.do_put_request(uri, data, req.headers);
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
  if (req.session && !req.session._id) {
    res.redirect('/');
    return;
  }
  res.render('account_settings', {
    ...req.globalData,
  });
});

router.get('/profile/:platform/:region/:gamertag', function(req,res,next){
	var platform = req.params.platform;
	var region = req.params.region;
  var region_verbose = config.lol_regions[region];
  var tags = null;
  requests.do_get_request(`${constants.API_BASE_URL}tags`, req.headers).then(function (result) {
    tags = result.body ? result.body.tags : null;
    return requests.do_get_request(`${constants.API_BASE_URL}search/${req.params.platform}/${req.params.gamertag}`);
  }).then(function(result) {
    var similar_gamers = [];
    if (!result.body || result.body.length == 0){
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













