$(document).ready(function () {
  var root = $("#review-modal");
  if (root.length) {
    const upButton = $('.up-button');
    const upCheck = $('.up-button > .checkbox');
    const downButton = $('.down-button');
    const downCheck = $('.down-button > .checkbox');

    upButton.click(() => {
      upButton.addClass('selected');
      upCheck.addClass('selected');
      downButton.removeClass('selected');
      downCheck.removeClass('selected');
    });

    downButton.click(() => {
      downButton.addClass('selected');
      downCheck.addClass('selected');
      upButton.removeClass('selected');
      upCheck.removeClass('selected');
    });
  }
});

