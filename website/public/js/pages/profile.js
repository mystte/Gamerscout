$(document).ready(function () {
  var root = $("#lol-leagues-section");
  if (root.length) {
    $(".summary").click((event) => {
      $(".summary").addClass('selected');
      $(".leagues").removeClass('selected');
      $("#lol-summary-section").css('display', 'flex');
      $("#lol-leagues-section").css('display', 'none');
    });

    $(".leagues").click((event) => {
      $(".summary").removeClass('selected');
      $(".leagues").addClass('selected');
      $("#lol-summary-section").css('display', 'none');
      $("#lol-leagues-section").css('display', 'flex');
    });
  }
});