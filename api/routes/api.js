var express = require('express');
var apicache = require('apicache');
var router = express.Router();
var requests = require('../utils/requests');
var Gamer = require('../models/gamer');
var Review = require('../models/review');
var Tag = require('../models/tag');
var logic_lol = require('../logics/lol');
var array_tools = require('../utils/arrays');
var date_tools = require('../utils/date');
var Q = require('q');
var User = require('../models/user');
var ObjectId = require('mongoose').Types.ObjectId;
var slack = require('../utils/slack');
const environment = require('../global').environment;

let cache = apicache.middleware;

const cache_only_20x = (req, res) => (res.statusCode === 200 || res.statusCode === 201);
const cache_success = cache('3 hours', cache_only_20x);

// Setup Steam
var steamDeveloperKey = '389EC943738900A510BF540217AFB042';

// Enum for different kind of api (lol, steam, psn, xbox...)
var API_TYPE = {
    LOL: 0,
    STEAM: 1,
    PSN: 2,
    XBOX: 3
};

// Insert tags into the DB
router.post('/tags', function(req, res, next) {
    var secret_token = req.body.secret_token;
    var tags = req.body.tags;
    Q().then(function() {
        for (var i = 0; i < tags.length; i++) {
            var newTag = new Tag({
                name : tags[i].name,
                type : tags[i].type
            });
            newTag.save();
        }
        res.status(201).json({message : "Tags Created"});
    }).catch(function(reason) {
        console.log(reason);
        res.status(500).json({err : "Internal Server Error"});
    });
});

// Retrieve available tags
router.get('/tags', function(req, res, next) {
    // if (!req.session._id) {
    //     res.status(403).json({err : "Forbidden"});
    //     return;
    // }
    Q().then(function() {
        return Tag.find();
    }).then(function(tags, err) {
        if (err) {
            console.log(err);
            return res.status(500).json("Internal Server Error");
        } else {
            return res.status(200).json({tags : tags});
        }
    }).catch(function(reason) {
        console.log(reason);
        return res.status(500).json("Internal Server Error");
    });
});

const hasUserAlreadyReviewed = (reviews, loggedInuserId) => {
  if (loggedInuserId) {
    for (i = 0; i < reviews.length; i++) {
      if (reviews[i].reviewer_id == loggedInuserId) return true;
    }
  }
  return false;
}

const getUsersFromReviews = (reviews, email) => {
  const newReviews = [];
  for (i = 0; i < reviews.length; i++) {
    let newReview = JSON.parse(JSON.stringify(reviews[i]));
    newReviews.push(new Promise((resolve, reject) => {
      User.findOne({ _id: new ObjectId(newReview.reviewer_id) }).then((user) => {
        newReview.username = (user) ? user.username : null;
        newReview.date_since = date_tools.timeSince(newReview.date);
        resolve(newReview);
      });
    }));
  }
  return Promise.all(newReviews);
}

const getReviewerNameInReviews = (gamers, reviews, loggedInuserId) => {
  const newGamers = [];
  for (i = 0; i < gamers.length; i++) {
    let newGamer = JSON.parse(JSON.stringify(gamers[i]));
    newGamers.push(
      Q().then(() => {
          return getUsersFromReviews(reviews);
      }).then((updatedReviews) => {
        newGamer.hasReviewed = hasUserAlreadyReviewed(reviews, loggedInuserId);
        newGamer.reviews = updatedReviews;
        return newGamer;
      })
    );
  }
  return Q.all(newGamers);
}

const parsedGamersProfilePictures = (gamers) => {
  const newGamers = [];
  for (i = 0; i < gamers.length; i++) {
    let newGamer = JSON.parse(JSON.stringify(gamers[i]));
    newGamers.push(
      Q().then(() => {
        return requests.do_get_request(newGamer.profile_picture);
      }).then((response) => {
        if (response.statusCode === 403) {
          newGamer.profile_picture = 'https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/26.png';
        }
        return newGamer;
      })
    );
  }
  return Q.all(newGamers);
}

const gerUsernameRegexpForSearch = (gamertag) => {
  let regex = '';
  for (var i = 0; i < gamertag.length; i++) {
    regex += gamertag[i];
    regex += '[ ]*'
  }
  return regex;
}

router.get('/test/:wtv/:wtv2', async function(req, res, next) {
  // const result = await logic_lol.getGamerStats('na1', req.params.wtv, req.params.wtv2);
  res.status(200).json({ msg: 'OKAY', result: null });
});

// Search a specific usertag based on the platform
router.get('/search/:platform/:region/:gamertag', function(req, res, next) {
  const loggedInuserId = (req.session._id) ? req.session._id : null;
  var platform = req.params.platform ? req.params.platform.toLowerCase() : null;
  var gamertag = req.params.gamertag ? req.params.gamertag.toLowerCase() : null;
  var region = req.params.region ? req.params.region.toLowerCase() : null;
  var query_limit = req.query.limit ? +req.query.limit : 5;
  var query_sort = (req.query.sort && (req.query.sort === "1" || req.query.sort === "-1")) ? +req.query.sort : -1;

  Q().then(function(){
    const gamerOptions = {
      gamertag: new RegExp('^' + gerUsernameRegexpForSearch(gamertag) + '$', "i"),
      platform: logic_lol.regions_verbose[region],
    };
    return Gamer.find(gamerOptions);
  }).then(function(gamers, err) {
    if (err) {
      res.status(400).json({error: err});
    }
    // If no gamers found in the db we try to find it in the api
    if (gamers.length == 0) {
      console.log("No gamers found in db reaching the api...");
      return Q().then(function(){
        if (region) {
          return logic_lol.getLolAccountInRegion(region, gamertag);
        } else {
          return logic_lol.getLol(gamertag);
        }
      }).then(function (json) {
        return logic_lol.createLolGamersInDB(json);
      }).then((gamers) => {
        return parsedGamersProfilePictures(gamers);
      }).then(function (gamers) {
        return {
          status: 201,
          data: gamers,
        };
      }).then(function(result) {
        res.status(result.status).json(result.data);
      }).done();
    } else if (gamers) {
      let gamerReviews = null;
      return Q().then(() => {
        return Review.find({ gamer_id: gamers[0].gamer_id }).sort({date: query_sort}).limit(query_limit);
      }).then((reviews) => {
        gamerReviews = reviews;
        return logic_lol.refreshGamerData(region, gamers);
      }).then(() => {
        return getReviewerNameInReviews(gamers, gamerReviews, loggedInuserId);
      }).then((gamers) => {
        return parsedGamersProfilePictures(gamers);
      }).then((gamers) => {
        res.status(201).json(gamers);
      });
    }
  });
});

router.get('/:platform/:region/leagues/:league_id', cache_success, async function(req, res, next) {
  var league_id = req.params.league_id ? req.params.league_id : null;
  var platform = req.params.platform ? req.params.platform : null;
  var region = req.params.region ? req.params.region : null;
  var query_page = req.query.page ? +req.query.page : 1;

  if (league_id && platform && region) {
    const leagues = await logic_lol.getLeague(region, league_id, query_page);
    res.status(201).json({ leagues: leagues, statusCode: 201 });
  } else {
    res.status(400).json({ error: 'missing parameters' });
  }
});

router.get('/reviews/:gamer_id', function(req, res, next) {
  var query_limit = req.query.limit ? +req.query.limit : 5;
  var query_sort = (req.query.sort && (req.query.sort === "1" || req.query.sort === "-1")) ? +req.query.sort : -1;
  const gamer_id = (req.params.gamer_id) ? +req.params.gamer_id : null;
  if (gamer_id) {
    Q().then(function () {
      return Review.find({ gamer_id: gamer_id }).sort({ date: query_sort }).limit(query_limit);
    }).then(function (reviews, err) {
      if (err) {
        res.status(400).json({ error: err });
      } else {
        res.status(201).json({ reviews: reviews });
      }
    });
  } else {
    res.status(400).json({ error: 'missing gamer_id' });
  }
});

// Retrieve a gamer profile
router.get('/gamer/:gamer_id', function(req, res, next) {
  if (!req.session._id) {
    res.status(403).json({err : "Forbidden"});
    return;
  }
  var gamer_id = req.params.gamer_id ? req.params.gamer_id : null;

  Q().then(function(){
    return Gamer.findOne({_id:gamer_id});
  }).then(function(gamer, err) {
    if (err) {
      res.status(400).json({error: err});
    } else if (!gamer) {
      res.status(404).json({error: "No Gamer Found"});
    } else {
      return res.status(201).json(gamer);
    }
  });
});

// Post a review for a specific gamer
router.post('/gamer/review', function(req, res, next) {
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
        return;
    }
    var gamer_id = req.body.id ? req.body.id : null;
    var comment = req.body.comment ? req.body.comment : null;
    var tags = req.body.tags ? req.body.tags : [];
    var review_type = req.body.review_type ? req.body.review_type : null;

    Q().then(function() {
        return Gamer.findOne({_id:gamer_id});
    }).then(function(gamer, err) {
        if (err) {
            res.status(400).json({error : err});
        } else if (!gamer) {
            res.status(404).json({error : "Gamer Not Found"});
        } else {
            return Q().then(function() {
                return logic_lol.postReview(gamer, comment, tags, review_type, req.session._id);
            }).then(function(result) {
                if (environment === 'production') slack.slackNotificationForReview('`' + req.session._id + '` just reviewed `' + gamer.gamertag + '` and said: `' + comment + '`');
                res.status(result.status).json(result.data);
            }).catch((reason) => {
                console.log("reason", reason);
                res.status(500).json('Internal Server Error');
            });
        }
    }).catch((reason) => {
        res.status(500).json('Internal Server Error');
    });
});

// Get random players
router.get('/getRandomPlayers/:reviews_number', function(req, res, next) {
  // Get three reviews by default
  var reviews_number = (req.params.reviews_number) ? req.params.reviews_number : 3;
  Q().then(function() {
    return Gamer.aggregate([{ $sample: { size: 3}}]);
  }).then(function(result, err) {
    if (!result.length > 0) {
      res.status(200).json({gamers: result}); return;
    }
    res.status(200).json({gamers: result});
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json('Internal Server Error');
  });
});


//Get 5 recent reviews
router.get('/getRecentReviews', function(req, res, next){
  Q().then(function() {
    return Gamer.find({}).sort({_id:-1}).limit(5);
  }).then((result) => {
    return parsedGamersProfilePictures(result);
  }).then(function(result) {
    if (!result.length > 0) {
      res.status(200).json({gamers: result}); return;
    }
    res.status(200).json({gamers: result});
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json('Internal Server Error');
  });
});


//Get 5 most reviewed players
router.get('/getMostReviewed', function(req, res, next){
    Q().then(function() {
    return Gamer.find({}).sort({review_count:-1}).limit(5);
    }).then((result) => {
      return parsedGamersProfilePictures(result);
    }).then(function(result, err) {
    if (!result.length > 0) {
      res.status(200).json({gamers: result}); return;
    }
    res.status(200).json({gamers: result});
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json('Internal Server Error');
  });
});

//Get 5 most highly rated players
router.get('/getHighestRated', function(req, res, next){
    Q().then(function() {
    return Gamer.find({}).sort({rep_review_count:-1}).limit(5);
    }).then((result) => {
      return parsedGamersProfilePictures(result);
    }).then(function(result, err) {
    if (!result.length > 0) {
      res.status(200).json({gamers: result}); return;
    }
    res.status(200).json({gamers: result});
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json('Internal Server Error');
  });
});

// Get random reviews
router.get('/getRandomReviews/:reviews_number', function(req, res, next) {
  // Get three reviews by default
  var reviews_number = (req.params.reviews_number) ? req.params.reviews_number : 3;
  Q().then(function() {
    return Gamer.aggregate([{$match: {'reviews': {$gt: []}}}, { $sample: { size: 1}}]);
  }).then((result) => {
    return parsedGamersProfilePictures(result);
  }).then(function(gamer, err) {
    if (!gamer.length > 0) {
      res.status(200).json({reviews: []}); return;
    }
    var reviews = array_tools.getRandomRows(gamer[0].reviews, 3);
    res.status(200).json({reviews: reviews});
  }).catch(function(reason) {
    console.log(reason);
    res.status(500).json('Internal Server Error');
  });
});

/* request steam api based on the username */
router.get('/steam/:username', function(req, res){
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
        return;
    }
    var username = req.params.username;
    var url =  "http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=" + steamDeveloperKey + "&steamids=76561197960435530"
    request(url, function(error, response, body){
        if (!error && response.statusCode === 200){
            var data = JSON.parse(body);
	    res.json(200, data);
        } else if (error){
            console.log("Something went wrong when trying to reach lol API : status code = " + response.statusCode);
	    res.json(500);
        } else {
	    res.json(404);
	}
    });
});

module.exports = router;
