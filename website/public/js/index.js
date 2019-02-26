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

	var root = $("#index");
  if (root.length) {
    $( ".search-button" ).click(function() {
    	search_lol_player();
	  });

    $('#search-nav').keypress(function(event){
      if(event.keyCode == 13){
        $('#search-icon-nav').click();
      }
    });

    $('.gamertag-to-search').keypress(function(event){
      if(event.keyCode == 13){
        $('.search-button').click();
      }
    });


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
