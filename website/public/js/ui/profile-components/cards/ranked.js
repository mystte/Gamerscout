$(document).ready(function () {
  var root = $("#ranked-card-container");
  if (root.length) {
    $('.solo').click((event) => {
      selectRankedTab('solo');
    });
    $('.flex-5v5').click((event) => {
      selectRankedTab('5v5');
    });
    $('.flex-3v3').click((event) => {
      selectRankedTab('3v3');
    });
  }
});

var selectRankedTab = function(selector) {
  if (selector === 'solo' || selector === '3v3' || selector === '5v5') {
    $('.solo').removeClass('selected');
    $('.flex-3v3').removeClass('selected');
    $('.flex-5v5').removeClass('selected');
  }
  if (selector === 'solo') {
    $('.solo').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'flex');
    $('.card-5v5-ranked-container').css('display', 'none');
    $('.card-3v3-ranked-container').css('display', 'none');
  } else if (selector === '3v3') {
    $('.flex-3v3').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'none');
    $('.card-5v5-ranked-container').css('display', 'none');
    $('.card-3v3-ranked-container').css('display', 'flex');
  } else if (selector === '5v5') {
    $('.flex-5v5').addClass('selected');
    $('.card-solo-ranked-container').css('display', 'none');
    $('.card-5v5-ranked-container').css('display', 'flex');
    $('.card-3v3-ranked-container').css('display', 'none');
  }
}