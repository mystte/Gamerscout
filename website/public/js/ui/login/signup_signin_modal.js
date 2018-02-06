$(document).ready(function() {
  const MODE = {
    SIGNIN : "signin", 
    SIGNUP: "signup", 
  };
  var currentMode = MODE.SIGNIN;

  // Props

  // Methods
  var toggleSigninSignup = function(newMode) {
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

  var login = function(username, pwd) {
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

  var submit = function(mode) {
    var data = {};
    var url = "";
    var emailInputId = null;
    var pwdInputId = null;
    var email = null;
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
      email = $('#signup-email').eq(0).val();
      password = $('#signup-pwd').eq(0).val();
      // Setup ids for errors
      emailInputId = 'signup-email';
      pwdInputId = 'signup-pwd';
      url = "/signup";
      data = {
        "username": email,
        "password": password.length > 0 ? md5(password) : null,
        "email": email
      };
      messageId = 'signup-error-msg';
    }
    return new Promise((resolve, reject) => {
      resolve(doApiCall('POST', data, url));
    }).then(function(apiResult) {
      if (apiResult.success) {
        hideAllInputErrors();
        window.location.href = "/"
      } else {
        showInputError([emailInputId, pwdInputId], apiResult.error.msg, messageId);
      }
    });
  }

  // jQuery hook
  $(".js-facebook-auth").click(function() {
    console.log("#########");
  });

  $(".js-signin-mode").click(function() {
    toggleSigninSignup(MODE.SIGNIN);
  });

  $(".js-signup-mode").click(function() {
    toggleSigninSignup(MODE.SIGNUP);
  });

  $(".js-signin").click(function() {
    submit(MODE.SIGNIN);
  });

  $(".js-signup").click(function() {
    submit(MODE.SIGNUP);
  });

  var root = $("#signup-signin-modal");
  if (root.length) {
    // write js here
  }

  // detect enter keypress
  $(document).keypress(function (e) {
    var keycode = (e.keyCode ? e.keyCode : e.which);
    if (keycode == '13') {
      e.preventDefault();
      submit(currentMode);
    }
  });
});