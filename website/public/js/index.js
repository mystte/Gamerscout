$(document).ready(function() {
  var root = $("#index");
  if (root.length) {
    $( ".search-button" ).click(function() {
    	//Always searches league: update when more games added
    	var region = $('#region-selection').val();
    	var gamertag = $('#gamertag-to-search').val();
  		var profile_url = window.location.href + "profile/lol/" + region + "1/" + gamertag; 
  		window.location.href = profile_url;
});
  }
});