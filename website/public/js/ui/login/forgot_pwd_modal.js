$(document).ready(function () {
  const PWD = {
    FORGOT: "forgot",
    RESET: "reset",
  };
  var currentMode = PWD.FORGOT;

  // Props

  // Methods

  var showConfirmation = function() {
    $('.email-confirm-container').show();
    $('.form-container').hide();
  }

  var submit = function () {
    var emailInputId = 'input-email';
    var messageId = 'error-msg';
    var data = {
      email: $('.forgot-pwd-email').eq(0).val(),
    };
    const api_url = $('.api-url').eq(0).val();
    var url = api_url + "/api/1/users/forgotten_password";
    hideAllInputErrors();
    if (validateEmail(data.email)) {
      return new Promise((resolve, reject) => {
        resolve(doApiCall('POST', data, url));
      }).then((apiResult) => {
        if (apiResult.success) {
          showConfirmation();
          hideAllInputErrors();
        } else {
          showInputError([emailInputId], apiResult.error.msg, messageId);
        }
      }).catch((error, test) => {
        // TODO: change error callback structure to remove error.error.error.error.wtf
        console.log(error);
        showInputError([emailInputId], error.responseJSON.error.error, messageId);
      });
    } else {
      showInputError([emailInputId], 'Email is invalid', messageId);
    }
  }

  // jQuery hook

  var root = $("#forgot-pwd-modal");
  if (root.length && root.css("display") === "block") {
    // write js here
    $(".submit").click(() => {
      submit();
    });

    $(".back").click(() => {
      hideAllInputErrors();
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
