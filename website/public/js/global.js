$(document).ready(function () {
  $(".logout").click(function () {
    var url = "/logout";
    facebookLogout();
    doApiCall('POST', {}, url).then(() => {
      window.location.href = "/";
    });
  });

  $('.js-search-gamer-mobile').click(() => {
    $("#search-nav").val($("#search-nav-mobile").val());
    search_lol_player();
  });

  $(".lol-regions-list > ul.uk-nav.uk-dropdown-nav > a").click((e) => {
    $(".region-selection").html($(e.target).html());
    $(".region-selection").attr("region-id", $(e.target).attr("region-id"));
  });

  $("#search-nav").val(lastSearchedGamer);
  $("#search-nav-mobile").val(lastSearchedGamer);
  if (lastSearchedRegion) {
    $('.selected-region').html(lastSearchedRegion.text);
    $('.selected-region').attr('region-id', lastSearchedRegion.id);
  }

  if ($('.sid').val()) {
    document.cookie = "gamerscout-api-session=" + $('.sid').val() + "; path=/;";
  }
});

//persist searches in navbar
var lastSearchedGamer = sessionStorage.getItem('gts');
var lastSearchedRegion = JSON.parse(sessionStorage.getItem('rts'));

var search_lol_player = function () {
  var regionId = $('.region-selection').html() ? $('.region-selection').attr("region-id").toLowerCase() : 'na1';
  var regionText = $('.region-selection').html() ? $('.region-selection').html().trim() : 'na';
  var gamertag = $('.gamertag-to-search').val();

  gtt = gamertag.trim();
  if (gtt.length > 0) {
    sessionStorage.setItem('gts', gamertag);
    sessionStorage.setItem('rts', JSON.stringify({ id: regionId, text: regionText }));
    var profile_url = "/profile/lol/" + regionId + "/" + gamertag;
    window.location.href = profile_url;
  }
}