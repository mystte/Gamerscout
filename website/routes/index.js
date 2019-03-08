var express = require('express');
var router = express.Router();
var requests = require('../utils/requests.js');
var constants = require('../utils/constants.js');
var Q = require('q');
var config = require('../config/common.json');
var env = express().get('env');

/* GET home page. */
router.get('/', async function(req, res, next) {
  // Call to API HERE
  const recentReviewedGamers = await requests.do_get_request(`${constants.API_BASE_URL}/getRecentReviews`, req.session.sid);
  const mostReviewsGamers = await requests.do_get_request(`${constants.API_BASE_URL}/getMostReviewed`, req.session.sid);
  const highestRatedGamers = await requests.do_get_request(`${constants.API_BASE_URL}/getHighestRated`, req.session.sid);
  const recentReviews = await requests.do_get_request(`${constants.API_BASE_URL}/reviews/latest`, req.session.sid);

  var data = {
    ...req.globalData,
    API_BASE_URL: constants.API_BASE_URL,
    recent_reviewed_gamers: recentReviewedGamers.body,
    most_reviews_gamers: mostReviewsGamers.body,
    highest_rated_gamers: highestRatedGamers.body,
    recent_reviews: recentReviews ? recentReviews.body : [],
  };
  res.render('index', data);
});


router.post('/forgot-pwd', function(req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/forgotten_password";
  var data = {
    email: req.body.email ? req.body.email : null,
  };
  Q().then(function () {
    return requests.do_post_request(uri, data);
  }).then(function (result) {
    res.status(result.statusCode).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/logout', function (req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/logout";
  var data = {
    email: req.body.email ? req.body.email : null,
    password: req.body.password ? req.body.password : null
  };
  Q().then(function () {
    return requests.do_post_request(uri, data, req.session.sid);
  }).then(function (result) {
    req.session.destroy();
    res.status(200).json(result);
  }).catch(function (reason) {
    console.log("reason", reason);
    res.status(500).json({ err: "Internal Server Error" });
  });
});

const recaptchaValidation = function (req) {
  var uri = 'https://www.google.com/recaptcha/api/siteverify';
  var data = {
    secret: '6LeEzXQUAAAAAAs8v55piUHGMmmHX7cDCvyBsKSh',
    response: req.body.recaptcha,
  };

  return Q().then(function () {
    return requests.do_post_request(uri, data, req.session.sid, true);
  }).then(function (result) {
    return result.body.success;
  }).catch(function (reason) {
    return false;
  });
}

router.post('/login', async function(req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/login";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null,
    bypass: req.body.bypass ? req.body.bypass : false,
  };
  const captchaValidation = (!data.bypass) ? await recaptchaValidation(req) : true;
  if (captchaValidation) {
    Q().then(function () {
      return requests.do_post_request(uri, data, req.session.sid);
    }).then(function (result) {
      if (result.statusCode == 201) {
        req.session.email = data.email;
        req.session._id = result.body._id;
        req.session.username = result.body.username;
        req.session.validated = result.body.validated;
        req.session.fb_id = result.body.fb_id;
        req.session.sid = result.apiCookie;
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    }).catch(function (reason) {
      console.log(reason);
      res.status(500).json({ err: "Internal Server Error" });
    });
  } else {
    res.status(400).json({ err: "Failed to verify captcha" });
  }
});

router.post('/fb-login', function(req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/facebook_auth";
  var data = {
    access_token: req.body.access_token ? req.body.access_token : null,
  };
  Q().then(function () {
    return requests.do_post_request(uri, data, req.session.sid);
  }).then(function (result) {
    if (result.statusCode == 201) {
      req.session.email = result.body.email;
      req.session._id = result.body._id;
      req.session.username = result.body.username;
      req.session.validated = result.body.validated;
      req.session.fb_id = result.body.facebook_id;
      req.session.sid = result.apiCookie;
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
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/signup";
  var data = {
    email : req.body.email ? req.body.email : null,
    password : req.body.password ? req.body.password : null,
    username: req.body.username ? req.body.username : null,
    newsletter: req.body.newsletter ? req.body.newsletter : false,
  };
  Q().then(function() {
    return requests.do_post_request(uri, data, req.session.sid);
  }).then(function(result) {
    res.status(201).json(result);
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json({err : "Internal Server Error"});
  });
});

router.post('/review', function(req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/gamer/review";
  var data = {
    id: req.body.id ? req.body.id : null,
    comment: req.body.comment ? req.body.comment : null,
    tags: req.body.tags ? req.body.tags : null,
    review_type: req.body.review_type ? req.body.review_type : null,
  };

  Q().then(function () {
    return requests.do_post_request(uri, data, req.session.sid);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/facebook-disconnect', function(req, res, next) {
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/facebook_disconnect";

  Q().then(function () {
    return requests.do_post_request(uri, {}, req.session.sid);
  }).then(function (result) {
    req.session.fb_id = null;
    res.status(201).json(result);
  }).catch(function (reason) {
    console.log(reason);
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/profile-update', function (req, res, next) {
  if (!req.session) {
    res.status(403).json({err : "Forbidden"});
    return;
  }
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/" + req.session._id;
  var data = {};

  if (req.body.username) data.username = req.body.username;
  Q().then(function () {
    return requests.do_put_request(uri, data, req.session.sid);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/validation/email/resend/', function(req, res, next) {
  if (!req.session) {
    res.status(403).json({ err: "Forbidden" });
    return;
  }
  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/validation/email/resend";
  
  Q().then(function () {
    return requests.do_post_request(uri, {}, req.session.sid);
  }).then(function () {
    res.status(201).json({ statusCode: 201, msg: 'OK' });
  }).catch(function (reason) {
    console.log(reason);
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.post('/account-update', function (req, res, next) {
  if (!req.session) {
    res.status(403).json({ err: "Forbidden" });
    return;
  }

  var uri = config.api.protocol + "://" + constants.getApiUrl() + "/api/1/users/" + req.session._id;
  var data = {};
  if (req.body.username) { data.username = req.body.username; req.session.username = req.body.username; }
  if (req.body.password) { data.password = req.body.password; }
  if (req.body.email) { data.email = req.body.email; req.session.email = req.body.email; }

  Q().then(function () {
    return requests.do_put_request(uri, data, req.session.sid);
  }).then(function (result) {
    res.status(201).json(result);
  }).catch(function (reason) {
    res.status(500).json({ err: "Internal Server Error" });
  });
});

router.get('/legal/:type', function(req,res,next){
  res.render('pages/legal', {
    ...req.globalData,
  });
});

router.get('/validate-account/:token', function (req, res, next) {
  var data = {
    token : req.params.token ? req.params.token : null,
  }
  var validated = false;

  return requests.do_post_request(`${constants.API_BASE_URL}account/validate`, data).then((result) => {
    if (result.statusCode === 201) {
      validated = true;
      req.session.validated = true;
    }

    res.render('pages/validate_account', {
      ...req.globalData,
      validated,
    });
  });
});


router.get('/account',  function(req,res,next){
  if (req.session && !req.session._id) {
    res.redirect('/');
    return;
  }
  res.render('pages/account_settings', {
    ...req.globalData,
  });
});

router.get('/profile/:platform/:region/:gamertag', async function(req,res,next){
  var region = req.params.region;
  var tags = null;
  var query_limit = req.query.limit ? +req.query.limit : 5;
  var query_sort = req.query.sort ? req.query.sort : null;
  var query_filter = (req.query.filter && (req.query.filter === "APPROVALS" || req.query.filter === "DISAPPROVALS") ? req.query.filter : "ALL");
  var query_page = req.query.page ? +req.query.page : 1;

  const similar_gamers = await requests.do_get_request(`${constants.API_BASE_URL}/getMostReviewed`, req.session.sid);

  requests.do_get_request(`${constants.API_BASE_URL}tags`, req.session.sid).then(function (result) {
    tags = result.body ? result.body.tags : null;
    return requests.do_get_request(`${constants.API_BASE_URL}search/${req.params.platform}/${region}/${req.params.gamertag}?limit=${query_limit}&sort=${query_sort}&filter=${query_filter}&page=${query_page}`, req.session.sid);
  }).then(function(result) {
    if (!result.body || result.body.length == 0){
      res.render('pages/player_not_found', {
        similar_gamers: similar_gamers.body,
        ...req.globalData,
      })
    } else {
      res.render('pages/profile', {
        ...req.globalData,
        gamer: result.body[0],
        tags: tags,
        sorting_params: {
          limit: query_limit,
          sort: query_sort,
          filter: query_filter,
        },
      });
    }
  });
});

module.exports = router;













