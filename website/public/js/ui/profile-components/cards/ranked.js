$(document).ready(function () {
  var root = $("#ranked-card-container");
  if (root.length) {
    $('.rankings-tabs.solo').click((event) => {
      selectRankedTab('solo');
    });
    $('.rankings-tabs.flex-5v5').click((event) => {
      selectRankedTab('5v5');
    });
    $('.rankings-tabs.flex-3v3').click((event) => {
      selectRankedTab('3v3');
    });
  }
});

var selectRankedTab = function(selector) {
  if (selector === 'solo' || selector === '3v3' || selector === '5v5') {
    $('.rankings-tabs.solo').removeClass('selected');
    $('.rankings-tabs.flex-3v3').removeClass('selected');
    $('.rankings-tabs.flex-5v5').removeClass('selected');
  }
  if (selector === 'solo') {
    $('.rankings-tabs.solo').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'flex');
    $('.card-5v5-ranked-container').css('display', 'none');
    $('.card-3v3-ranked-container').css('display', 'none');
  } else if (selector === '3v3') {
    $('.rankings-tabs.flex-3v3').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'none');
    $('.card-5v5-ranked-container').css('display', 'none');
    $('.card-3v3-ranked-container').css('display', 'flex');
  } else if (selector === '5v5') {
    $('.rankings-tabs.flex-5v5').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'none');
    $('.card-5v5-ranked-container').css('display', 'flex');
    $('.card-3v3-ranked-container').css('display', 'none');
  }
}