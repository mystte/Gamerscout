var request = require('request-promise');
var Q = require('q');
var Gamer = require('../models/gamer');
var Tag = require('../models/tag');

// Setup League of legends
var lolDeveloperKey = 'RGAPI-c8a4fa10-f207-4449-b6fb-35cfce91ce61';
var regions = {
    na : "na1",
    br : "br1",
    eune : "eune1",
    euw : "euw1",
    kr : "kr1",
    lan : "lan1",
    las : "las1",
    oce : "oce1",
    ru : "ru1",
    tr : "tr1"
};

var regions_verbose = {
  na1 : "North America",
  br1 : "Brazil",
  eune1 : "Europe North & East",
  euw1 : "Europe West",
  kr1 : "Korea",
  lan1 : "Latin America North",
  las1 : "Latin America South",
  oce1 : "Oceania",
  ru1 : "Russia",
  tr1 : "Turkey"
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

// TODO
var hasAlreadyReviewedPlayer = function() {
  // return Q().then(function() {
  //   return Gamer.find({_id: gamer_id})
  // }).then(function(gamer) {
    
  // }).catch(function (err) {
  //   // console.log(err);
  //   return json;
  // });
  return false;
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
    var url = "https://" + region + ".api.riotgames.com/lol/summoner/v3/summoners/by-name/"+ username +"?api_key=" + lolDeveloperKey;
    console.log(url);
    return Q().then(function() {
        return request(url)
    }).then(function(body) {
        var data = JSON.parse(body);
        data.platform = regions_verbose[region];
        data.game = "League Of legends";
        json.push(data);
        return json;
    }).catch(function (err) {
        // console.log(err);
        return json;
    });
}

// Create entries with json from 
var createDBEntries = function(json) {
    var result = [];
    for(var i=0; i < json.length; i++) (function(i){
        var newGamer = new Gamer({
            gamer_id : json[i].accountId,
            gamertag : json[i].name.toLowerCase(),
            platform : json[i].platform,
            game : json[i].game,
            profile_picture: (json[i].profileIconId) ? "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + json[i].profileIconId + ".png" : "/static/images/default_profile_picture.jpg"
        });
        result.push(newGamer.save(json[i].item));
    })(i); // avoid the closure loop problem
    return Q.all(result)
}

// Update the gamer profile with the review
exports.postReview = function(gamer, comment, tags, review_type, reviewer_id) {
  gamer_json = JSON.parse(JSON.stringify(gamer));
  var result = {status : 400, data : {message : "postReview"}};
  if (comment == null) {
      result.data = {error : "bad value format (review, comment)"};
      return result;
  } else {
    var review = {
        comment: comment,
        tags : tags,
        review_type : review_type,
        reviewer_id : reviewer_id,
    };
    return Q().then(function() {
      return Gamer.findOne({_id:gamer._id});
    }).then(function(gamer, err) {
      if (!hasAlreadyReviewedPlayer()) {
        if (review_type == "REP") {
          gamer.rep_review_count ++;
        } else if (review_type == "FLAME") {
          gamer.flame_review_count ++;
        }
        gamer.reviews.push(review);
        gamer.review_count += 1;
        result.status = 201;
        result.data = {message : "Review Successfully posted"};
        gamer.top_tags = getTopTags(gamer.reviews);

        return gamer.save().then(function(res) {
          return result;
        });
      } else {
        result.data = {error: "cannot review player twice"};
        return result;
      }
    }).catch(function(error) {
      console.log(error);
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
        return createDBEntries(json);
    }).then(function(json) {
		result.status = 201;
		result.data = json;
		return result;
	});
}