$(document).ready(function() {

  const MODE = {
    SIGNIN : "signin", 
    SIGNUP: "signup", 
  };

  // Props

  // Methods
  var toggleSigninSignup = function(newMode) {
    if (newMode === MODE.SIGNIN) {
      $(".signup-mode").hide();
      $(".signin-mode").show();
      $(".js-top-menu-tab-signin").addClass("uk-active");
      $(".js-top-menu-tab-signup").removeClass("uk-active");
    } else {
      $(".signup-mode").show();
      $(".signin-mode").hide();
      $(".js-top-menu-tab-signin").removeClass("uk-active");
      $(".js-top-menu-tab-signup").addClass("uk-active");
    }
  }

  var submit = function(mode) {
    console.log("Submit");
    var data = {};
    var url = "";
    if (mode === MODE.SIGNIN) {
      url = "/login";
      data = {
        "username" : $('.signup-mode .email').eq(0).text(),
        "password" : $('.signup-mode .password').eq(0).text(),
        "email" : $('.signup-mode .email').eq(0).text()
      }
    } else {
      url = "/signup";
      data = {
        "username" : $('.signin-mode .email').eq(0).text(),
        "password" : $('.signin-mode .password').eq(0).text(),
        "email" : $('.signin-mode .email').eq(0).text()
      }
    }
    $.ajax({
      contentType: "application/json",
      type: 'POST',
      data: JSON.stringify(data),
      url: url,
      success: function(result) {
      },
      error: function(error) {
      }
    });
  }

  // jQuery hook
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
});