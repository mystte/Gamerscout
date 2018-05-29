$(document).ready(function() {
	var root = $("#index");
  if (root.length) {
		var search_lol_player = function() {
			//Always searches league: update when more games added
			var region = $('#region-selection').val();
			var gamertag = $('#gamertag-to-search').val();
			if (gamertag) {
				var profile_url = "/profile/lol/" + region + "1/" + gamertag;
				window.location.href = profile_url;
			}
		}

    $( ".search-button" ).click(function() {
    	search_lol_player()
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
		window.location.href = profile_url;
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
		// detect enter keypress
		$(document).keypress(function (e) {
			var keycode = (e.keyCode ? e.keyCode : e.which);
			if (keycode == '13') {
				e.preventDefault();
				search_lol_player();
			}
		});

	}
});