var express = require('express');
var router = express.Router();
var request = require("request");
var Gamer = require('../models/gamer');
var Tag = require('../models/tag');
var logic_lol = require('../logics/lol');
var Q = require('q');
var get_ip = require('ipware')().get_ip;

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
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
    }
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

// Search a specific usertag based on the platform
router.get('/search/:platform/:gamertag', function(req, res, next) {
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
    }
    var platform = req.params.platform ? req.params.platform : null;
    var gamertag = req.params.gamertag ? req.params.gamertag.toLowerCase() : null;

    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    Q().then(function(){
       return Gamer.find({gamertag:gamertag}); 
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
            res.status(201).json(gamers);
        }
    });
});

// Retrieve a gamer profile
router.get('/gamer/:gamer_id', function(req, res, next) {
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
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
    }
    var gamer_id = req.body.id ? req.body.id : null;
    var comment = req.body.comment ? req.body.comment : null;
    var tags = req.body.tags ? req.body.tags : [];
    var review_type = req.body.review_type ? req.body.review_type : null;
    var ip_info = get_ip(req);

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
                return logic_lol.postReview(gamer, comment, tags, ip_info.clientIp, review_type);
            }).then(function(result) {
                console.log(result);
                res.status(result.status).json(result.data);
            });
        }
    });
});

/* request steam api based on the username */
router.get('/steam/:username', function(req, res){
    if (!req.session._id) {
        res.status(403).json({err : "Forbidden"});
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