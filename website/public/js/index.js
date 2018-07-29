$(document).ready(function() {
	var root = $("#index");
  if (root.length) {

    //persist searches in navbar
    var lastSearchedGamer = sessionStorage.getItem('gts');
    $("#search-nav").val(lastSearchedGamer);

		var search_lol_player = function() {
			//Always searches league: update when more games added
			var region = $('#region-selection').val();
			var gamertag = $('#gamertag-to-search').val();
      gtt = gamertag.trim()
			if (gtt.length > 0) {
        sessionStorage.setItem('gts', gamertag);
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


  $('#gamertag-to-search').keypress(function(event){
  if(event.keyCode == 13){
    $('.search-button').click();
  }
});

	$( ".logout" ).click(function() {
			var url = "/logout";
			doApiCall('POST', {}, url);
			window.location.href = "/";
	});

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