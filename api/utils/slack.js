var requests = require('./requests.js');

exports.slackNotificationSubscriptions = function (message) {
  const uri = 'https://hooks.slack.com/services/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';
  const data = {
    "text": message,
  };
  const headers = {
    'Content-type': 'application/json',
  }
  requests.do_post_request(uri, data, headers);
}