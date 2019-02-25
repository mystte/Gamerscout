$(document).ready(function() {
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

  $(".lol-regions-list > ul.uk-nav.uk-dropdown-nav > a").click((e) => {
    $("#region-selection").html($(e.target).html());
    $("#region-selection").attr("region-id", $(e.target).attr("region-id"));
  });

  //persist searches in navbar
  var lastSearchedGamer = sessionStorage.getItem('gts');
  var lastSearchedRegion = JSON.parse(sessionStorage.getItem('rts'));

  if (lastSearchedRegion) {
    $('.selected-region').html(lastSearchedRegion.text);
    $('.selected-region').attr('region-id', lastSearchedRegion.id);
  }

	var root = $("#index");
  if (root.length) {
    $("#search-nav").val(lastSearchedGamer);

    $( ".search-button" ).click(function() {
    	search_lol_player();
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
      search_lol_player();
    });

    $("#search-icon-nav-mobile").click(function () {
        search_lol_player();
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
