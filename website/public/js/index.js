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
      var region = $('#region-selection').html() ? $('#region-selection').attr("region-id").toLowerCase() : 'na';
      var gamertag = $('#gamertag-to-search').val();
      gtt = gamertag.trim()
			if (gtt.length > 0) {
        sessionStorage.setItem('gts', gamertag);
        sessionStorage.setItem('rts', region);
				var profile_url = "/profile/lol/" + region + "/" + gamertag;
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

    $(".search-input-container > div > ul.uk-nav.uk-dropdown-nav > a").click((e) => {
      $("#region-selection").html($(e.target).html());
      $("#region-selection").attr("region-id", $(e.target).attr("region-id"));
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
	}
});
