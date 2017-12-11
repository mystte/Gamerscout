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

  // jQuery hook
  $(".js-signin-mode").click(function() {
    toggleSigninSignup(MODE.SIGNIN);
  });

  $(".js-signup-mode").click(function() {
    toggleSigninSignup(MODE.signup);
  });

  var root = $("#signup-signin-modal");
  if (root.length) {
    // write js here
  }
});