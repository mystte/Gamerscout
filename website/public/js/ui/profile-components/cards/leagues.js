//summary-section
$(document).ready(function () {
  var root = $(".summary-section");
  var loaded = false;
  var leaguesList = {
    'solo-5v5': null,
    'flex-5v5': null,
    'flex-3v3': null
  };
  let selectedLeague = 'solo-5v5';

  if (root.length) {
    $('.leagues.selector').click(() => {
      if (loaded) return;
      getLeaguePage('solo-5v5').then((res) => {
        leaguesList['solo-5v5'] = res.data.leagues;
        displayLeagueTierData('I');
      });
      getLeaguePage('flex-5v5').then((res) => {
        leaguesList['flex-5v5'] = res.data.leagues;
      });
      getLeaguePage('flex-3v3').then((res) => {
        leaguesList['flex-3v3'] = res.data.leagues;
      });
      loaded = true;
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

    $('.selector.league-name.solo-5v5').click((event) => {
      selectLeagueType('solo-5v5');
    });
    $('.selector.league-name.flex-5v5').click((event) => {
      selectLeagueType('flex-5v5');
    });
    $('.selector.league-name.flex-3v3').click((event) => {
      selectLeagueType('flex-3v3');
    });
  }

  var selectLeagueType = function(type) {
    if (type === 'solo-5v5') {
      $('.selector.league-name.solo-5v5').addClass('selected');
      $('.selector.league-name.flex-5v5').removeClass('selected');
      $('.selector.league-name.flex-3v3').removeClass('selected');
      $('.leagues-details-container.solo-5v5').removeAttr('hidden');
      $('.leagues-details-container.flex-5v5').attr('hidden', true);
      $('.leagues-details-container.flex-3v3').attr('hidden', true);
    } else if (type === 'flex-5v5') {
      $('.selector.league-name.solo-5v5').removeClass('selected');
      $('.selector.league-name.flex-5v5').addClass('selected');
      $('.selector.league-name.flex-3v3').removeClass('selected');
      $('.leagues-details-container.solo-5v5').attr('hidden', true);
      $('.leagues-details-container.flex-5v5').removeAttr('hidden');
      $('.leagues-details-container.flex-3v3').attr('hidden', true);
    } else if (type === 'flex-3v3') {
      $('.selector.league-name.solo-5v5').removeClass('selected');
      $('.selector.league-name.flex-5v5').removeClass('selected');
      $('.selector.league-name.flex-3v3').addClass('selected');
      $('.leagues-details-container.solo-5v5').attr('hidden', true);
      $('.leagues-details-container.flex-5v5').attr('hidden', true);
      $('.leagues-details-container.flex-3v3').removeAttr('hidden');
    }
    selectedLeague = type;
    displayLeagueTierData('I');
    $('.selector.leagues-number.tier1').click();
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
    const tier = $(`input.${selectedLeague}.tier`).val();

    if (tier !== 'challenger' && tier !== 'master') {
      $('.leagues-number.tier2').removeAttr('hidden');
      $('.leagues-number.tier3').removeAttr('hidden');
      $('.leagues-number.tier4').removeAttr('hidden');
    } else {
      $('.leagues-number.tier2').attr('hidden', true);
      $('.leagues-number.tier3').attr('hidden', true);
      $('.leagues-number.tier4').attr('hidden', true);
    }
  }

  var displayLeagueTierData = function (tier) {
    if (!leaguesList[selectedLeague]) return;
    let leagueDataRowsHtml = '';
    const gamertag = $(".gamertag").text().trim();

    for (i = 0; i < leaguesList[selectedLeague].entries.length; i++) {
      const entry = leaguesList[selectedLeague].entries[i];
      const isSummoner = (gamertag === entry.summonerName.toLowerCase()) ? 'black' : '';
      const isLastRow = (i === (leaguesList[selectedLeague].entries.length - 1)) ? 'last-data-row' : '';

      // const isSummoner = entry.
      if (entry.rank === tier) {
        leagueDataRowsHtml += `\
          <div class="leagues-data-row">\
            <div class="leagues-summoner-container"><span class="leagues-data-rank rank-data">${i + 1}</span>\
            <img class="leagues-data-icon icon-data" src="${entry.iconUrl}"/>\
            <span class="leagues-data-cell summoner-data ${isSummoner}">${entry.summonerName}</span></div>\
            <span class="leagues-data-cell winrate-data ${isSummoner}">${entry.wins}W / ${entry.losses}L (${entry.winPercentage}%)</span>\
            <span class="leagues-data-cell league-points-data ${isSummoner}">${entry.leaguePoints}<span class="league-points-label">LP</span></span>\
            <span class="leagues-data-cell progress-data">${(entry.miniSeries) ? displaySeriesProgressIcons(entry.miniSeries.progress) : ''}</span>\
          </div >`;
      }
    }
    const lastRowIdx = leagueDataRowsHtml.lastIndexOf('leagues-data-row') + 16;
    leagueDataRowsHtml = leagueDataRowsHtml.slice(0, lastRowIdx) + ' last-data-row' + leagueDataRowsHtml.slice(lastRowIdx);

    $('.leagues-data-container').html(leagueDataRowsHtml);
    showTierTabs();
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

  var getLeaguePage = function (leagueType = 'solo-5v5') {
    const API_BASE_URL = $('.api-url').eq(0).val() + '/api/1/';
    const leagueId = $(`input.${leagueType}.league-id`).val();
    const region = $('input.region').val();

    const res = (leagueId) ? doApiCall('GET', {}, API_BASE_URL + `/lol/${region}/leagues/${leagueId}`) : new Promise((resolve, reject) => resolve({data:{leagues:null}}));
    return res;
  };
});