$(document).ready(function () {
  var root = $(".content-wrapper-account");
  if (root.length) {
    $('.js-facebook-disconnect').click(() => {
      const url = '/facebook-disconnect';
      doApiCall('POST', {}, url).then((result) => {
        if (result.error) {
          showInputError([], result.error.msg);
        } else {
          UIkit.notification({ message: 'Successfuly disconnected your facebook account' })
          location.reload();
        }
      });
    });

    $('.js-resend-email').click(() => {
      const url = '/validation/email/resend/';
      
      doApiCall('POST', {}, url);
      $('.js-resend-email').html("Email sent!");
      $('.js-resend-email').removeClass('link');
      $('.js-resend-email').removeClass('js-resend-email');
    });

    $('.js-save-account-settings').click(() => {
      const displayName = $('#user-input').eq(0).val();
      const email = $('#email-input').eq(0).val();
      const pwd = $('#password-input').eq(0).val();
      const pwdValid = $('#password-input-valid').eq(0).val();
      const data = {};
      let okay = exists(displayName) || exists(email) || exists(pwd) || exists(pwdValid);

      hideInputErrors(['user-input', 'email-input', 'password-input', 'password-input-valid']);

      if (displayName) if (displayName.length < 6) { showInputError(['user-input'], 'Display Name should be a least 6 characters long'); okay = false; }
      if (email) if (!validateEmail(email)) { showInputError(['email-input'], 'Email is invalid'); okay = false; }
      if (pwd || pwdValid) if (pwd.length < 6) { showInputError(['password-input', 'password-input-valid'], 'Password must be 6 characters long'); okay = false; }
      if (pwd && pwd.length >= 6) if (pwd !== pwdValid) { showInputError(['password-input', 'password-input-valid'], 'Password must be identical'); okay = false; }

      const url = '/account-update';
      if (okay) {
        if (exists(displayName)) data.username = displayName;
        if (exists(email)) data.email = email;
        if (exists(pwd)) data.password = md5(pwd);
        doApiCall('POST', data, url).then((result) => {
          if (result.error) {
            showInputError([], result.error.msg);
          } else {
            UIkit.notification({ message: 'Profile has been updated' })
          }
        });
      }
    });
  }
});
