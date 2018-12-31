//summary-section
$(document).ready(function () {
  var root = $(".summary-section");
  var leagueList = {};
  if (root.length) {
    $('.leagues.selector').click(() => {
      getLeaguePage().then((res) => {
        leagueList = res.data.leagues;
        showTierTabs();
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

  var displaySeriesProgressIcons = function(progress) {
    let progressIconsHtml = '';
    for (var i = 0; i < progress.length; i++) {
      if (progress[i] === 'L') {
        progressIconsHtml += '<img class="leagues-progress-icon" src="/static/images/times-circle.svg" />';
      } else if ((progress[i] === 'W')) {
        progressIconsHtml += '<img class="leagues-progress-icon" src="/static/images/check-circle.svg" />';
      } else {
        progressIconsHtml += '<img class="leagues-progress-icon" src="/static/images/dot-circle.svg" />';
      }
    }
    return progressIconsHtml;

  }

  var showTierTabs = function() {
    const tier = $('input.tier').val();
    if (tier !== 'challenger' && tier !== 'master') {
      $('.leagues-number.tier2').removeAttr('hidden');
      $('.leagues-number.tier3').removeAttr('hidden');
      $('.leagues-number.tier4').removeAttr('hidden');
    }
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
            <span class="leagues-data-cell winrate-data">${entry.wins}W / ${entry.losses}L (${entry.winPercentage}%)</span>\
            <span class="leagues-data-cell league-points-data">${entry.leaguePoints}</span>\
            <span class="leagues-data-cell progress-data">${(entry.miniSeries) ? displaySeriesProgressIcons(entry.miniSeries.progress) : ''}</span>\
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

  var getLeaguePage = function () {
    const API_BASE_URL = $('.api-url').eq(0).val() + '/api/1/';
    const leagueId = $('input.league-id').val();
    const region = $('input.region').val();

    const res = doApiCall('GET', {}, API_BASE_URL + `/lol/${region}/leagues/${leagueId}`);
    return res;
  };
});