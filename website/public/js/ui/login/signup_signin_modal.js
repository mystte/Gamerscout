$(document).ready(function() {
  var root = $("#signup-signin-modal");
  if (root.length) {
    // write js here
    const MODE = {
      SIGNIN: "signin",
      SIGNUP: "signup",
    };
    var currentMode = MODE.SIGNUP;

    // Props

    // Methods
    var toggleSigninSignup = function (newMode) {
      hideAllInputErrors();
      if (newMode === MODE.SIGNIN) {
        $(".signup-mode").hide();
        $(".signin-mode").show();
        $(".js-top-menu-tab-signin").addClass("uk-active");
        $(".js-top-menu-tab-signup").removeClass("uk-active");
        $("#signin-email").focus();
        currentMode = MODE.SIGNIN;
      } else {
        $(".signup-mode").show();
        $(".signin-mode").hide();
        $(".js-top-menu-tab-signin").removeClass("uk-active");
        $(".js-top-menu-tab-signup").addClass("uk-active");
        $("#signup-email").focus();
        currentMode = MODE.SIGNUP;
      }
    }

    var login = function (email, password) {
      data = {
        "username": email,
        "password": password.length > 0 ? md5(password) : null,
        "email": email,
      };
      url = "/login";
      return new Promise((resolve, reject) => {
        resolve(doApiCall('POST', data, url));
      });
    }

    var checkUserAgreement = function () {
      return $('.user-agreement-checkbox').prop('checked');
    }

    var submit = function (mode) {
      var data = {};
      var url = "";
      var emailInputId = null;
      var pwdInputId = null;
      var displayNameId = null;
      var email = null;
      var displayName = null;
      var password = null;
      var messageId = null;

      if (mode === MODE.SIGNIN) {
        email = $('#signin-email').eq(0).val();
        password = $('#signin-pwd').eq(0).val();
        url = "/login";
        data = {
          "username": email,
          "password": password.length > 0 ? md5(password) : null,
          "email": email
        }
        // Setup ids for errors
        emailInputId = 'signin-email';
        pwdInputId = 'signin-pwd';
        messageId = 'signin-error-msg';
      } else {
        if (checkUserAgreement() === false) {
          showInputError(["ua-input", "ua-terms", "ua-policy"], 'You must read and accept our terms of use and privacy policy', 'signup-error-msg');
          return;
        }
        const newsletter = $('.newsletter-checkbox').eq(0).prop('checked');
        email = $('#signup-email').eq(0).val();
        displayName = $('#signup-displayname').eq(0).val();
        password = $('#signup-pwd').eq(0).val();
        // Setup ids for errors
        emailInputId = 'signup-email';
        pwdInputId = 'signup-pwd';
        displayNameId = 'signup-displayname';
        url = "/signup";
        data = {
          "username": displayName,
          "password": password.length > 0 ? md5(password) : null,
          "email": email,
          "newsletter": newsletter,
        };
        messageId = 'signup-error-msg';
      }
      return new Promise((resolve, reject) => {
        resolve(doApiCall('POST', data, url));
      }).then((apiResult) => {
        if (apiResult.success) {
          hideAllInputErrors();
          if (url == "/signup") {
            return new Promise((resolve, reject) => {
              resolve(doApiCall('POST', data, "/login"));
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            window.location.href = "/";
          }
        } else {
          showInputError([emailInputId, displayNameId, pwdInputId], apiResult.error.msg, messageId);
        }
      }).catch((error) => {
        // TODO: change error callback structure to remove error.error.error.error.wtf
        showInputError([emailInputId, displayNameId, pwdInputId], error.responseJSON.error.error, messageId);
      });
    }

    // jQuery hook
    $(".js-facebook-auth").click(function () {
    });

    $(".js-signin-mode").click(function () {
      toggleSigninSignup(MODE.SIGNIN);
    });

    $(".js-signup-mode").click(function () {
      toggleSigninSignup(MODE.SIGNUP);
    });

    $(".js-signin").click(function () {
      submit(MODE.SIGNIN);
    });

    $(".js-signup").click(function () {
      submit(MODE.SIGNUP);
    });

    // detect enter keypress
    $(document).keypress(function (e) {
      var keycode = (e.keyCode ? e.keyCode : e.which);
      if (keycode == '13' && root.hasClass('uk-open')) {
        e.preventDefault();
        submit(currentMode);
      }
    });
  }
});
