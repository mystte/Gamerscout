var request = require('request-promise');
var Q = require('q');
var Gamer = require('../models/gamer');
var Tag = require('../models/tag');
var array_tools = require('../utils/arrays');

// Setup League of legends
var lolDeveloperKey = 'RGAPI-c8a4fa10-f207-4449-b6fb-35cfce91ce61';
const regions = {
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

const regions_verbose = {
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
var lolRequestGetSummonerByName = function(region, username, json) {
    var url = "https://" + region + ".api.riotgames.com/lol/summoner/v3/summoners/by-name/"+ username +"?api_key=" + lolDeveloperKey;
    console.log(url);
    return Q().then(function() {
      return request(url);
    }).then(function(body) {
      var data = JSON.parse(body);
      data.platform = regions_verbose[region.toLowerCase()];
      data.game = "League Of legends";
      json.push(data);
      return json;
    }).catch(function (err) {
      console.log(err);
      return json;
    });
}

// Create entries with json from 
var createDBEntries = function(json) {
  var result = [];
  for(var i=0; i < json.length; i++) (function(i){
    var newGamer = new Gamer({
      gamer_id : json[i].id,
      level: json[i].summonerLevel,
      gamertag : json[i].name.toLowerCase(),
      platform : json[i].platform,
      account_id : json[i].accountId,
      last_update: json[i].revisionDate,
      game : json[i].game,
      stats: json[i].stats,
      profile_picture: (json[i].profileIconId) ? "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + json[i].profileIconId + ".png" : "/static/images/default_profile_picture.jpg"
    });
    result.push(newGamer.save(json[i].item));
  })(i); // avoid the closure loop problem
  return Q.all(result)
}

// Update the gamer profile with the review
var postReview = function(gamer, comment, tags, review_type, reviewer_id) {
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
var getGamerProfile = function(gamer) {
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
var getLolInRegion = function(region, gamertag) {
  var result = { status: 400, data: { message: "getLol" } };
  return Q().then(function () {
    json = [];
    return lolRequestGetSummonerByName(region, gamertag, json);
  }).then(async function(json) {
    const tests = await lolRequestGetStatsForGamer(region, json[0].id, json[0].accountId);
    json[0].stats = tests;
    return json;
    // stats: lolRequestGetStatsForGamer(region, json.id, json.accountId),
  }).then(function (json) {
    return createDBEntries(json);
  }).then(function (json) {
    result.status = 201;
    result.data = json;
    return result;
  });
}

var getRankedFromData = function(data) {
  const result = [];
  for (var i = 0; i < data.length; i++) {
    result.push({
      team_name: data[i].playerOrTeamName,
      team_id: data[i].playerOrTeamId,
      tier: data[i].tier,
      rank: data[i].rank,
      name: data[i].leagueName,
      type: data[i].queueType,
      league_img_url: null,
      wins: data[i].wins,
      lost: data[i].losses,
      points: data[i].leaguePoints,
      extras: {
        veteran: data[i].veteran,
        inactive: data[i].inactive,
        fresh_blood: data[i].fresh_blood,
        hot_streak: data[i].hot_streak
      }
    });
  }
  return result;
}

var getPlayedPositionsFromData = function(data) {
  const result = {
    top: 0,
    jungle: 0,
    mid: 0,
    bottom: 0,
    support: 0,
  };
  for (var i = 0; i < data.matches.length; i++) {
    const match = data.matches[i];
    if (match.lane === 'TOP') {
      result.top += 1;
    } else if (match.lane === 'BOTTOM') {
      if (match.role === 'DUO_SUPPORT') {
        result.support += 1;
      } else {
        result.bottom += 1;
      }
    } else if (match.lane === 'JUNGLE') {
      result.jungle += 1;
    } else if (match.lane === 'MID') {
      result.mid += 1;
    }
  };
  return result;
};

var getPlayedChampionsFromData = async function(data) {
  var urlChampions = "https://ddragon.leagueoflegends.com/cdn/6.24.1/data/en_US/champion.json";
  var championsRes = JSON.parse(await request(urlChampions));
  const champions = {};

  for (var i = 0; i < data.matches.length; i++) {
    const match = data.matches[i];
    const foundChampion = await array_tools.findObjectInJson(championsRes.data, 'key', match.champion);
    if (foundChampion !== -1) {
      if (champions[foundChampion.id]) champions[foundChampion.id] += 1;
      if (!champions[foundChampion.id]) champions[foundChampion.id] = 1;
    }
  };
  const sortedChampions = Object.keys(champions).sort(function (a, b) { return champions[b] - champions[a] });
  // for (var i = 0; i < sortedChampions.length; i++) {
  //   sortedChampions[i] = championsRes.data[sortedChampions[i]];
  // }
  return sortedChampions.slice(0, 5);
}

var lolRequestGetStatsForGamer = async function(region, gamerId, accountId) {
  try {
    var urlRanking = "https://" + region + ".api.riotgames.com/lol/league/v3/positions/by-summoner/" + gamerId + "?api_key=" + lolDeveloperKey;
    // var urlChampions = "https://" + region + ".api.riotgames.com/lol/champion-mastery/v3/champion-masteries/by-summoner/" + gamerId + "?api_key=" + lolDeveloperKey;
    var urlMatches = "https://" + region + ".api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?api_key=" + lolDeveloperKey;

    var rankingRes = JSON.parse(await request(urlRanking));
    // var championsRes = JSON.parse(await request(urlChampions));
    var matchesRes = JSON.parse(await request(urlMatches));
    var stats = {
      ranked: getRankedFromData(rankingRes),
      frequent_champions: await getPlayedChampionsFromData(matchesRes),
      roles: getPlayedPositionsFromData(matchesRes),
    };
    return stats;
  } catch(err) {
    console.log(err);
    return -1;
  }
}

var refreshGamerData = async function(region, gamers) {
  for (var i = 0; i < gamers.length; i++) {
    const gamer = gamers[i];
    const updatedData = await getLolInRegion(region, gamer.gamertag);
    updatedData.reviews = gamer.reviews;
    gamer.save();
  }
}

// Request for a specific lol gamertag (DEPRECATED)
var getLol = function(gamertag) {
	var result = {status : 400, data : {message : "getLol"}};
	return Q().then(function() {
    json = [];
    return lolRequestGetSummonerByName(regions.na, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.br, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.eune, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.kr, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.lan, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.las, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.oce, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.ru, gamertag, json);
  }).then(function(json){
    return lolRequestGetSummonerByName(regions.tr, gamertag, json);
  }).then(function(json){
    return createDBEntries(json);
  }).then(function(json) {
		result.status = 201;
		result.data = json;
		return result;
	});
}

module.exports = {
  getLol: getLol,
  getLolInRegion: getLolInRegion,
  getGamerProfile: getGamerProfile,
  postReview: postReview,
  regions_verbose: regions_verbose,
  regions: regions,
  getGamerStats: lolRequestGetStatsForGamer,
  refreshGamerData: refreshGamerData,
}