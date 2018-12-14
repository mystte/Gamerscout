$(document).ready(function () {
  $(".js-profile-setup").click(() => {
    var url = "/profile-update";
    const displayName = $('.display-name-input').val();

    if ($('.display-name-input').val().length < 6) return showInputError(['display-name-input'], "Must be at least 6 characters long");
    const data = {
      username: displayName,
    };
    doApiCall('POST', data, url).then((res) => {
      location.reload();
    });
  });
});