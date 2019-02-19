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
  if (firstCard) firstCard.style.marginLeft = "auto";
  if (lastCard) lastCard.style.marginRight = "auto";

  if (middleCard) middleCard.scrollIntoView({ inline: 'center' });
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
    //persist searches in navbar
    var lastSearchedGamer = sessionStorage.getItem('gts');
    var lastSearchedRegion = sessionStorage.getItem('rts');
    $("#search-nav").val(lastSearchedGamer);

		var search_lol_player = function() {
			//Always searches league: update when more games added
      var region = $('#region-selection').html() ? $('#region-selection').val().toLowerCase() : 'na';
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
		var profile_url = "/profile/lol/" + region.toLowerCase() + "1/" + gamertag;
    gtt = gamertag.trim()
		if (gtt.length > 0){
      sessionStorage.setItem('gts', gamertag);
      window.location.href = profile_url;
    }
	});

  $("#search-icon-nav-mobile").click(function () {
      search_lol_player();
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
      FUNCTIONALITY FOR TOS PAGE
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
