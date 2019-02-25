var search_lol_player = function () {
  var regionId = $('#region-selection').html() ? $('#region-selection').attr("region-id").toLowerCase() : 'na1';
  var regionText = $('#region-selection').html() ? $('#region-selection').html().trim() : 'na';
  var gamertag = $('#gamertag-to-search').val();

  gtt = gamertag.trim();
  if (gtt.length > 0) {
    sessionStorage.setItem('gts', gamertag);
    sessionStorage.setItem('rts', JSON.stringify({ id: regionId, text: regionText }));
    var profile_url = "/profile/lol/" + regionId + "/" + gamertag;
    window.location.href = profile_url;
  }
}