//summary-section
$(document).ready(function () {
  var root = $(".summary-section");
  var leagueList = {};
  if (root.length) {
    $('.leagues.selector').click(() => {
      getLeaguePage(1).then((res) => {
        leagueList = res.data.leagues;
        displayLeagueTierData('I');
      });
    });

    $('.leagues-number.tier1').click((event) => {
      selectTierNumber('I');
      displayLeagueTierData('I');
    });
    $('.leagues-number.tier2').click((event) => {
      selectTierNumber('II');
      displayLeagueTierData('II');
    });
    $('.leagues-number.tier3').click((event) => {
      selectTierNumber('III');
      displayLeagueTierData('III');
    });
    $('.leagues-number.tier4').click((event) => {
      selectTierNumber('IV');
      displayLeagueTierData('IV');
    });
  }

  var displayLeagueTierData = function (tier) {
    let leagueDataRowsHtml = '';
    for (i = 0; i < leagueList.entries.length; i++) {
      const entry = leagueList.entries[i];
      if (entry.rank === tier) {
        leagueDataRowsHtml += `\
          <div class="leagues-data-row" >\
            <span class="leagues-data-rank rank-data">${i + 1}</span>\
            <img class="leagues-data-icon icon-data" src="${entry.iconUrl}"/>\
            <span class="leagues-data-cell summoner-data">${entry.summonerName}</span>\
            <span class="leagues-data-cell winrate-data">${entry.wins}W / ${entry.losses}L (51%)</span>\
            <span class="leagues-data-cell league-points-data">${entry.leaguePoints}</span>\
            <span class="leagues-data-cell status-data">${(entry.miniSeries) ? entry.miniSeries.progress : '...'}</span>\
          </div >`;
      }
    }
    $('.leagues-data-container').html(leagueDataRowsHtml);
  }

  var selectTierNumber = function (tier) {
    if (tier === 'I') {
      $('.leagues-number.tier1').addClass('selected');
      $('.leagues-number.tier2').removeClass('selected');
      $('.leagues-number.tier3').removeClass('selected');
      $('.leagues-number.tier4').removeClass('selected');
    } else if (tier === 'II') {
      $('.leagues-number.tier1').removeClass('selected');
      $('.leagues-number.tier2').addClass('selected');
      $('.leagues-number.tier3').removeClass('selected');
      $('.leagues-number.tier4').removeClass('selected');
    } else if (tier === 'III') {
      $('.leagues-number.tier1').removeClass('selected');
      $('.leagues-number.tier2').removeClass('selected');
      $('.leagues-number.tier3').addClass('selected');
      $('.leagues-number.tier4').removeClass('selected');
    } else if (tier === 'IV') {
      $('.leagues-number.tier1').removeClass('selected');
      $('.leagues-number.tier2').removeClass('selected');
      $('.leagues-number.tier3').removeClass('selected');
      $('.leagues-number.tier4').addClass('selected');
    }
  }

  var getLeaguePage = function (page) {
    const API_BASE_URL = $('.api-url').eq(0).val() + '/api/1/';
    const res = doApiCall('GET', {}, API_BASE_URL + '/lol/na1/leagues/e52eafc0-fb5a-11e7-8f00-c81f66cf2333?page=' + 1);
    return res;
  };
});