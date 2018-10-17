$(document).ready(function() {
  const API_BASE_URL = $('.api-url').eq(0).val() + '/api/1/';

  if ( window.location.pathname == "/legal/privacy" ) {
      $('#pp-link').css('border-bottom', '2px solid red');
      $('#terms-link').css('border-bottom' , '0px');
      $('#tos-content').css('display' , 'none');
      $('#pp-content').css('display' , 'block')
  } else {
    $('#terms-link').css('border-bottom', '2px solid red');
      $('#pp-link').css('border-bottom' , '0px');
      $('#pp-content').css('display' , 'none');
      $('#tos-content').css('display' , 'block');
  }

  var firstCard = document.getElementsByClassName("gamer-list-wrapper")[0];
  var lastCard = document.getElementsByClassName("gamer-list-wrapper")[2];
  var middleCard = document.getElementsByClassName("gamer-list-wrapper")[1];
  firstCard.style.marginLeft = "auto";
  lastCard.style.marginRight = "auto";

  middleCard.scrollIntoView({ inline: 'center' });
  window.scrollTo(375, 0);
  //URLs for api endpoints
  var getRecentURL = API_BASE_URL + "getRecentReviews"
  var getMostReviewedURL = API_BASE_URL + "getMostReviewed"
  var getHighestRatedURL = API_BASE_URL + "getHighestRated"

  $(".logout").click(function () {
    var url = "/logout";
    facebookLogout();
    doApiCall('POST', {}, url).then(() => {
      window.location.href = "/";
    });
  });

	var root = $("#index");
  if (root.length) {
    if ($(".featured-section-wrapper").length) {
      $.ajax({
        url: getRecentURL,
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {

          for (var i in data.gamers) {
            redirect_url = "/profile/lol/" + longtoshort(data.gamers[i].platform).toLowerCase() + "1/" + data.gamers[i].gamertag;

            html_string = buildGamerListComponent(redirect_url, data.gamers[i])
            var x = document.getElementsByClassName("gamer-list-title")[0];
            x.insertAdjacentHTML('beforeend', html_string)
          }
        }
      });

      $.ajax({
        url: getMostReviewedURL,
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
          for (var i in data.gamers) {
            redirect_url = "/profile/lol/" + longtoshort(data.gamers[i].platform).toLowerCase() + "1/" + data.gamers[i].gamertag;

            html_string = buildGamerListComponent(redirect_url, data.gamers[i])
            var x = document.getElementsByClassName("gamer-list-title")[1];
            x.insertAdjacentHTML('beforeend', html_string)
          }
        }
      });

      $.ajax({
        url: getHighestRatedURL,
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
          for (var i in data.gamers) {
            redirect_url = "/profile/lol/" + longtoshort(data.gamers[i].platform).toLowerCase() + "1/" + data.gamers[i].gamertag;

            html_string = buildGamerListComponent(redirect_url, data.gamers[i])
            var x = document.getElementsByClassName("gamer-list-title")[2];
            x.insertAdjacentHTML('beforeend', html_string)
          }
        }
      });
    }
    //persist searches in navbar
    var lastSearchedGamer = sessionStorage.getItem('gts');
    var lastSearchedRegion = sessionStorage.getItem('rts');
    $("#search-nav").val(lastSearchedGamer);

		var search_lol_player = function() {
			//Always searches league: update when more games added
			var region = $('#region-selection').val();
			var gamertag = $('#gamertag-to-search').val();
      gtt = gamertag.trim()
			if (gtt.length > 0) {
        sessionStorage.setItem('gts', gamertag);
        sessionStorage.setItem('rts', region)
				var profile_url = "/profile/lol/" + region + "1/" + gamertag;
				window.location.href = profile_url;
			}
		}

    $( ".search-button" ).click(function() {
    	search_lol_player()
	});

  $('#search-nav').keypress(function(event){
    if(event.keyCode == 13){
      $('#search-icon-nav').click();
    }
  });


  $('#search-nav-mobile').keypress(function(event){
    if(event.keyCode == 13){
      $('#search-icon-nav-mobile').click();
    }
  });

  $('#gamertag-to-search').keypress(function(event){
    if(event.keyCode == 13){
      $('.search-button').click();
    }
  });

  $("#navbar-mobile-search").click(function () {
    $('#top-menu').css('display', 'none');
    $('#top-menu-mobile').css('display', 'flex');
  });

  $('#back-icon').click(function(){
    $('#top-menu').css('display', 'flex');
    $('#top-menu-mobile').css('display', 'none');
  })


	$("#search-icon-nav").click(function () {
		var region = $('#region-selection-nav').val();
		var gamertag = $('#search-nav').val();
		var profile_url = "/profile/lol/" + region + "1/" + gamertag;
    gtt = gamertag.trim()
		if (gtt.length > 0){
      sessionStorage.setItem('gts', gamertag);
      window.location.href = profile_url;
    }
	});

$("#search-icon-nav-mobile").click(function () {
    var region = $('#region-selection-nav-mobile').val();
    var gamertag = $('#search-nav-mobile').val();
    var profile_url = "/profile/lol/" + region + "1/" + gamertag;
    gtt = gamertag.trim()
    if (gtt.length > 0){
      sessionStorage.setItem('gts', gamertag);
      window.location.href = profile_url;
    }
  });

    $(".featured-list").on('click', '#recent-view-item-container', function(){
      var a = $(this).text();
      var info = a.split("\n");
      $.each(info, function (id, val) {
        info[id] = $.trim(val);
      });
      var finalInfo = info.filter(function(v){return v!==''});
      shortRegion = toShortNotation(finalInfo[0]);
      var profileUrl = "profile/lol/" + shortRegion + "/" + finalInfo[1];
      window.location.href = profileUrl;
    });

    /*

    FUNCTIONALITY FOR TOS PAGE: i know it shouldnt be here lmao

    */

    $("#terms-link").click(function(){
      $('#terms-link').css('border-bottom', '2px solid red');
      $('#pp-link').css('border-bottom' , '0px');
      $('#pp-content').css('display' , 'none');
      $('#tos-content').css('display' , 'block');
    });

    $("#pp-link").click(function(){
      $('#pp-link').css('border-bottom', '2px solid red');
      $('#terms-link').css('border-bottom' , '0px');
      $('#tos-content').css('display' , 'none');
      $('#pp-content').css('display' , 'block')
    });

    function buildGamerListComponent(redirect_url, gamer){
      var html_string = "\
      <div id='individual-list-item'>\
        <div id='list-avatar'><img id='list-image' src=" + gamer.profile_picture + "></div>\
        <div id='list-player-details'>\
          <span id='list-gamertag'><a href='" + redirect_url + "'>" + gamer.gamertag + "</a></span>\
          <span id='list-region'>" + gamer.platform + "</span>\
        </div>\
        <div id='thumbs-container'>\
          <div class='thumb-container'>\
            <div class='thumb-lbl'>" + gamer.rep_review_count + "</div>\
            <img class='thumb-up' src='/static/images/thumb-up.svg' />\
          </div>\
          <div class='thumb-container'>\
            <div class='thumb-lbl'>" + gamer.flame_review_count + "</div>\
            <img class='thumb-up' src='/static/images/thumb-down.svg' />\
          </div>\
        </div>\
      </div>";
      return html_string

    }

    function longtoshort(region){
    	var regions = {
        "North America": "NA",
        "Brazil": "BR",
        "Europe North & East": "EUNE",
        "Europe West": "EUW",
        "Korea": "KR",
        "Latin America North": "LAN",
        "Latin America South": "LAS",
        "Oceania": "OCE",
        "Russia": "RU",
        "Turkey": "TR"
      }
      return regions[region];
    }

    function toShortNotation(region){
      var regions = {
        "na1" : "North America",
        "br1" : "Brazil",
        "eune1" : "Europe North & East",
        "euw1" : "Europe West",
        "kr1" : "Korea",
        "lan1" : "Latin America North",
        "las1" : "Latin America South",
        "oce1" : "Oceania",
        "ru1" : "Russia",
        "tr1" : "Turkey"
      }
      return Object.keys(regions).filter(function(key) {return regions[key] === region})[0];

    }

	}
});
