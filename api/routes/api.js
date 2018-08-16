var express = require('express');
var router = express.Router();
var request = require("request");
var Gamer = require('../models/gamer');
var Tag = require('../models/tag');
var logic_lol = require('../logics/lol');
var array_tools = require('../utils/arrays');
var Q = require('q');
var User = require('../models/user');
var get_ip = require('ipware')().get_ip;
var ObjectId = require('mongoose').Types.ObjectId;

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
      if (reviews[i].reviewer_id === loggedInuserId) return true;
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
        resolve(newReview);
      });
    }));
  }
  return Promise.all(newReviews);
}

const getReviewerNameInReviews = (gamers, loggedInuserId) => {
  const newGamers = [];
  for (i = 0; i < gamers.length; i++) {
    let newGamer = JSON.parse(JSON.stringify(gamers[i]));
    newGamers.push(
    Q().then(() => {
        return getUsersFromReviews(newGamer.reviews);
    }).then((updatedReviews) => {
      newGamer.hasReviewed = hasUserAlreadyReviewed(newGamer.reviews, loggedInuserId);
      newGamer.reviews = updatedReviews;
      return newGamer;
    }));
  }
  return Q.all(newGamers);
}

// Search a specific usertag based on the platform
router.get('/search/:platform/:gamertag', function(req, res, next) {
    // if (!req.session._id) {
    //     res.status(403).json({err : "Forbidden"});
    //     return;
    // }
    const loggedInuserId = (req.session._id) ? req.session._id : null;
    var platform = req.params.platform ? req.params.platform : null;
    var gamertag = req.params.gamertag ? req.params.gamertag.toLowerCase() : null;

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    Q().then(function(){
       return Gamer.find({gamertag:gamertag})
    }).then(function(gamers, err) {
        if (err) {
            res.status(400).json({error: err});
        }
        // If no gamers found in the db we try to find it in the api
        if (gamers.length == 0) {
            console.log("No gamers found in db reaching the api...");
            return Q().then(function(){
                return logic_lol.getLol(gamertag);
            }).then(function(result) {
                res.status(result.status).json(result.data);
            }).done();
        } else if (gamers) {
            return Q().then(() => {
              return getReviewerNameInReviews(gamers, loggedInuserId);
            }).then((gamers) => {
              res.status(201).json(gamers);
            });
        }
    });
});

// Retrieve a gamer profile
router.get('/gamer/:gamer_id', function(req, res, next) {
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
        return;
    }
    var gamer_id = req.params.gamer_id ? req.params.gamer_id : null;

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

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

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

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


//Get 5 most reviewed players
router.get('/getRecentReviews', function(req, res, next){
    Q().then(function() {
    return Gamer.find({}).sort({review_count:-1}).limit(5);
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
router.get('/getRecentReviews', function(req, res, next){
    Q().then(function() {
    return Gamer.find({}).sort({rep_review_count:-1}).limit(5);
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
