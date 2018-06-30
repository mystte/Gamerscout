$(document).ready(function () {
  const PWD = {
    FORGOT: "forgot",
    RESET: "reset",
  };
  var currentMode = PWD.FORGOT;

  // Props

  // Methods

  var submit = function () {
    var emailInputId = 'input-email';
    var messageId = 'error-msg';
    var data = {
      email: $('.email').eq(0).val(),
    };
    var url = "/forgot-pwd";

    return new Promise((resolve, reject) => {
      resolve(doApiCall('POST', data, url));
    }).then((apiResult) => {
      if (apiResult.success) {
        hideAllInputErrors();
      } else {
        showInputError([emailInputId], apiResult.error.msg, messageId);
      }
    }).catch((error, test) => {
      // TODO: change error callback structure to remove error.error.error.error.wtf
      showInputError([emailInputId], error.responseJSON.error.error, messageId);
    });
  }

  // jQuery hook

  var root = $("#forgot-pwd-modal");
  if (root.length) {
    // write js here
    $(".submit").click(() => {
      console.log("click");
      submit();
    });
  }

  // detect enter keypress
  $(document).keypress(function (e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13' && root.hasClass('uk-open')) {
      e.preventDefault();
      submit(currentMode);
    }
  });
});