$(document).ready(function () {
  window.fbAsyncInit = function () {
    window.FB.init({
      appId: $('.env').val() === 'production' ? '1575376835882846' : '1823676284348269',
      cookie: true,
      xfbml: true,
      version: 'v3.1'
    });
    window.FB.AppEvents.logPageView();
    window.FB.Event.subscribe('auth.authResponseChange', auth_response_change_callback);
    window.FB.Event.subscribe('auth.statusChange', auth_status_change_callback);
  };

  (function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.1&appId=1575376835882846&autoLogAppEvents=1';
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));
});

function facebookLoginAPI(response) {
  data = {
    "access_token": response.authResponse.accessToken,
  };
  url = "/fb-login";
  return new Promise((resolve, reject) => {
    resolve(doApiCall('POST', data, url));
  }).then((apiResult) => {
    window.location.href = "/";
  });
};

// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
  const isLoggedIn = $('.isLoggedIn').val() !== "";
  if (response.status === 'connected') {
    // Logged into your app and Facebook.
    facebookLoginAPI(response);
  } else {
    // The person is not logged into your app or we are unable to tell.
    console.log("#### user not connected to fb");
  }
}

function auth_response_change_callback (response) {
  console.log("auth_response_change_callback");
  console.log(response);
}

function auth_status_change_callback (response) {
  console.log("auth_status_change_callback: " + response.status);
  if (response.status === "unknown") {
    var url = "/logout";
    facebookLogout();
    doApiCall('POST', {}, url).then((response) => {
      window.location.href = "/";
    });
  }
}

function facebookLogout() {
  window.FB.logout(function (response) {
    window.location.href = "/";
  });
}

function checkLoginState() {
  window.FB.getLoginStatus(function (response) {
    statusChangeCallback(response);
  });
}
