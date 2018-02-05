$(document).ready(function() {
  var root = $("#index");
  if (root.length) {
    $( ".search-button" ).click(function() {
    	//Always searches league: update when more games added
    	var region = $('#region-selection').val();
    	var gamertag = $('#gamertag-to-search').val();
  		var profile_url = "/profile/lol/" + region + "1/" + gamertag; 
  		window.location.href = profile_url;
	});
	$( "#search-icon-nav").click(function(){
		var region = $('#region-selection-nav').val();
		var gamertag = $('#search-nav').val();
		var profile_url = "/profile/lol/" + region + "1/" + gamertag; 
  		window.location.href = profile_url;
	});
  }
});