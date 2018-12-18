var request = require('request-promise');
var mongoose = require('mongoose');
var axios = require('axios');
var Q = require('q');
var Gamer = require('../models/gamer');
var Review = require('../models/review');
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

var getLolProfileIcon = function(iconId) {
  return (iconId) ? "https://ddragon.leagueoflegends.com/cdn/6.24.1/img/profileicon/" + iconId + ".png" : "/static/images/default_profile_picture.jpg";
}

// Create entries with json form 
var createLolGamersInDB = function(json) {
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
      top_tags: [],
      reviews: [],
      last_update: Date.now(),
      profile_picture: getLolProfileIcon(json[i].profileIconId)
    });
    result.push(newGamer.save(json[i].item));
  })(i); // avoid the closure loop problem
  return Q.all(result)
}

// TODO
var hasAlreadyReviewedPlayer = function() {
  return false;
}

// Update the gamer profile with the review
var postReview = function(gamer, comment, tags, review_type, reviewer_id) {
  var result = {status : 400, data : {message : "postReview"}};
  if (comment == null) {
      result.data = {error : "bad value format (review, comment)"};
      return result;
  } else {
    var review = {
      _id: mongoose.Types.ObjectId(),
      comment: comment,
      tags : tags,
      review_type : review_type,
      reviewer_id : reviewer_id,
      gamer_id : gamer.gamer_id
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
        gamer.review_count += 1;
        result.status = 201;
        result.data = {message : "Review Successfully posted"};
        gamer.top_tags = getTopTags(gamer.reviews);
        const newReview = new Review(review);
        newReview.save();

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
    const newStats = await lolRequestGetStatsForGamer(region, json[0].id, json[0].accountId);
    json[0].stats = newStats;
    return json;
  });
}

var getWinrate = function(wins = 0, losses = 0) {
  const totalGames = wins + losses;
  return Math.floor(wins * 100 / totalGames);
}

var romanToNumber = function(romanNumber) {
  const convertTable = {
    I: 1,
    II: 2,
    III: 3,
    IV: 4,
    V: 5,
    VI: 6,
  };
  const result = convertTable[romanNumber];
  return result ? result : 0;
}

var getLeagueIconUrl = function(tier, rank) {
  const image = (tier === 'grandmaster') ? 'grandmaster.png' : tier + '_' + rank + '.png';
  const path = '/static/images/lol_ranking_icons/';
  return path + image;
}

var getRankedFromData = function(data) {
  const result = [];
  for (var i = 0; i < data.length; i++) {
    result.push({
      team_name: data[i].playerOrTeamName,
      team_id: data[i].playerOrTeamId,
      tier: data[i].tier.toLowerCase(),
      rank: data[i].rank,
      rank_in_number: romanToNumber(data[i].rank),
      name: data[i].leagueName,
      type: data[i].queueType,
      league_img_url: getLeagueIconUrl(data[i].tier.toLowerCase(), romanToNumber(data[i].rank)),
      wins: data[i].wins,
      lost: data[i].losses,
      winrate: getWinrate(data[i].wins, data[i].losses),
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
    top: { count: 0, percentage: 0 },
    jungle: { count: 0, percentage: 0 },
    mid: { count: 0, percentage: 0 },
    bottom: { count: 0, percentage: 0 },
    support: { count: 0, percentage: 0 },
  };
  var totalCount = 0;
  for (var i = 0; i < data.matches.length; i++) {
    const match = data.matches[i];
    if (match.lane === 'TOP') {
      result.top.count += 1;
    } else if (match.lane === 'BOTTOM') {
      if (match.role === 'DUO_SUPPORT') {
        result.support.count += 1;
      } else {
        result.bottom.count += 1;
      }
    } else if (match.lane === 'JUNGLE') {
      result.jungle.count += 1;
    } else if (match.lane === 'MID') {
      result.mid.count += 1;
    }
  };
  totalCount = result.top.count + result.support.count + result.bottom.count + result.jungle.count + result.mid.count;
  result.top.percentage = Math.trunc(result.top.count * 100 / totalCount);
  result.support.percentage = Math.trunc(result.support.count * 100 / totalCount);
  result.bottom.percentage = Math.trunc(result.bottom.count * 100 / totalCount);
  result.jungle.percentage = Math.trunc(result.jungle.count * 100 / totalCount);
  result.mid.percentage = Math.trunc(result.mid.count * 100 / totalCount);
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
  var stats = {
    ranked: [],
    frequent_champions: {},
    roles: {},
  };
  try {
    var urlRanking = "https://" + region + ".api.riotgames.com/lol/league/v3/positions/by-summoner/" + gamerId + "?api_key=" + lolDeveloperKey;
    var urlMatches = "https://" + region + ".api.riotgames.com/lol/match/v3/matchlists/by-account/" + accountId + "?api_key=" + lolDeveloperKey;

    var rankingPromise = axios.get(urlRanking);
    var matchesPromise = axios.get(urlMatches);

    const [rankingRes, matchesRes] = await Promise.all([rankingPromise, matchesPromise]);
    var stats = {
      ranked: getRankedFromData(rankingRes.data),
      frequent_champions: await getPlayedChampionsFromData(matchesRes.data),
      roles: getPlayedPositionsFromData(matchesRes.data),
    };
    return stats;
  } catch(err) {
    return stats;
  }
}

var refreshGamerData = async function(region, gamers) {
  for (var i = 0; i < gamers.length; i++) {
    const gamer = gamers[i];
    if (Date.now() - gamer.last_update > 3600000) {// refresh data if last refresh was made at least one hour ago
      const updatedGamer = (await getLolInRegion(region, gamer.gamertag))[0];

      gamer.last_update = Date.now();
      gamer.gamertag = updatedGamer.name.toLowerCase();
      gamer.stats = updatedGamer.stats;
      gamer.level = updatedGamer.summonerLevel;
      gamer.profile_picture = getLolProfileIcon(updatedGamer.profileIconId);
      gamer.save();
    }
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
  createLolGamersInDB: createLolGamersInDB,
}