var request = require('request-promise');
var Q = require('q');
var Gamer = require('../models/gamer');
var Tag = require('../models/tag');

// Setup League of legends
var lolDeveloperKey = '7c156c4f-7757-4bbe-b0ab-6a639d99bcbb';
var regions = {
    na : "na",
    br : "br",
    eune : "eune",
    euw : "euw",
    kr : "kr",
    lan : "lan",
    las : "las",
    oce : "oce",
    ru : "ru",
    tr : "tr"
};

var regions_verbose = {
    na : "North America",
    br : "Brazil",
    eune : "Europe North & East",
    euw : "Europe West",
    kr : "Korea",
    lan : "Latin America North",
    las : "Latin America South",
    oce : "Oceania",
    ru : "Russia",
    tr : "Turkey"
};

var findIp = function(arr, search) {
    var res = -1;
    var len = arr.length;
    while( len-- ) {
        if(arr[len].toString() === search.toString()) {
            res = len;
            return len;         
        }
    }
    return -1;
}

function orderByOccurrence(arr) {
    var counts = {};
    arr.forEach(function(value){
        if(!counts[value]) {
            counts[value] = 0;
        }
        counts[value]++;
    });

    return Object.keys(counts).sort(function(curKey,nextKey) {
        return counts[curKey] < counts[nextKey];
    });
}

// get third top tags for a user
var getTopTags = function(reviews) {
    var i = 0;
    var j = 0;
    var previous = null;
    var top_tags = [];
    var frequency = [];
    while (i < reviews.length) {
        while (j < reviews[i].tags.length) {
            frequency.push(reviews[i].tags[j].name); 
            j++;
        }
        j = 0;
        i++;
    }
    frequency = orderByOccurrence(frequency);
    i = 0;
    while (i < frequency.length) {
        top_tags.push(frequency[i]);
        if (i == 2) {
            return top_tags;
        }
        i++;
    }
    return top_tags;
}

// get overall rating
var getOverallRating = function(reviews) {
    var total = 0;
    var i = 0;
    while (i < reviews.length) {
        total += parseFloat(reviews[i].rating);
        i++;
    }
    return total / i + 1;
}

// Generate the request for the lol api
var lolRequest = function(region, username, json) {
    var url = "https://" + region + ".api.pvp.net/api/lol/" + region + "/v1.4/summoner/by-name/"+ username +"?api_key=" + lolDeveloperKey;
    console.log(url);
    return Q().then(function() {
        return request(url)
    }).then(function(body) {
        var data = JSON.parse(body);
        data[username].platform = regions_verbose[region];
        data[username].game = "League Of legends";
        json.push(data);
        return json;
    }).catch(function (err) {
        // console.log(err);
        return json;
    });
}

// Create entries with json from 
var createDBEntries = function(gamertag, json) {
    var result = [];
    for(var i=0; i < json.length; i++) (function(i){
        var newGamer = new Gamer({
            gamer_id : json[i][gamertag].id,
            gamertag : json[i][gamertag].name.toLowerCase(),
            platform : json[i][gamertag].platform,
            game : json[i][gamertag].game,
            profile_picture : "img/profile_picture.png"
        });
        result.push(newGamer.save(json[i].item));
    })(i); // avoid the closure loop problem
    return Q.all(result)
}

// Update the gamer profile with the review
exports.postReview = function(gamer, comment, tags, ip, review_type) {
    gamer_json = JSON.parse(JSON.stringify(gamer));
    var result = {status : 400, data : {message : "postReview"}};
    if (comment == null) {
        result.data = {error : "bad value format (review, comment)"};
        return result;
    } else {
        var review = {
            comment: comment,
            tags : tags,
            review_type : review_type
        };
        return Q().then(function() {
            return Gamer.findOne({_id:gamer._id});
        }).then(function(gamer, err) {
            if (findIp(gamer.ips, ip) != -1) {
                result.data = {message : "User already posted a review for this gamer"};
                return result;
            } else {
                if (review_type == "REP") {
                    gamer.rep_review_count ++;
                } else if (review_type == "FLAME") {
                    gamer.flame_review_count ++;
                }
                gamer.reviews.push(review);
                gamer.ips.push(ip);
                gamer.review_count += 1;
                result.status = 201;
                result.data = {message : "Review Successfully posted"};
                gamer.top_tags = getTopTags(gamer.reviews);
                return gamer.save().then(function() {
                    return result;
                });
            }
        });
    }
}

// Retrieve one gamer profile in the db + the tags list
exports.getGamerProfile = function(gamer) {
    var result = {status : 400, data : {message : "getGamerProfile"}};
    return Q().then(function(){
       return Tag.find({}); 
    }).then(function(tags, err) {
        if (err) {
            result.data = {message : err};
            return result;
        } else {
            var data = JSON.parse(JSON.stringify(gamer));
            data.all_tags = tags;
            result.status = 201;
            result.data = data;
            return result;
        }
    });
}

// Request for a specific lol gamertag
exports.getLol = function(gamertag) {
	var result = {status : 400, data : {message : "getLol"}};
	return Q().then(function() {
        json = [];
        return lolRequest(regions.na, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.br, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.eune, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.kr, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.lan, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.las, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.oce, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.ru, gamertag, json);
    }).then(function(json){
        return lolRequest(regions.tr, gamertag, json);
    }).then(function(json){
        return createDBEntries(gamertag, json);
    }).then(function(json) {
		result.status = 201;
		result.data = json;
		return result;
	});
}