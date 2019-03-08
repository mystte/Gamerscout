var request = require('request-promise');
var config = require('../config/common.json');
var constants = require('../utils/constants.js');

// Enable cookies
var j = request.jar();
var request = request.defaults({jar:j});

const setupCookieJarWithSid = function(sid) {
  var cookie = null;
  if (sid) {
    cookie = request.cookie("gamerscout-api-session=" + sid);
  } else {
    cookie = request.cookie("gamerscout-api-session=42");
  }
  j.setCookie(cookie, `${config.api.protocol}://${constants.getApiUrl()}`);
}

const getApicookie = function(body) {
  if (!body) return null;
  if (!body.headers) return null;
  const apiCookieName = 'gamerscout-api-session=';
  var cookieString = (body.headers['set-cookie']) ? body.headers['set-cookie'][0] : '';
  var cookiesArray = cookieString.split('; ').find(s => s.includes(apiCookieName));
  var apiCookie = cookiesArray ? cookiesArray.replace(apiCookieName, '') : null;
  return apiCookie;
}

exports.do_put_request = function(uri, body, sid = null) {
  setupCookieJarWithSid(sid);
  var options = {
    method: 'PUT',
    uri: uri,
    jar: j,
    body: body,
    resolveWithFullResponse: true,
    json: true // Automatically stringifies the body to JSON 
  };

  return request(options).then(function(body){
    return {
      ...body,
      apiCookie: getApicookie(body)
    };
  }).catch(function (err) {
    return err;
  });
}

exports.do_post_request = function(uri, body, sid = null, isForm = false) {
  setupCookieJarWithSid(sid);
  var options = {
    method: 'POST',
    uri: uri,
    jar: j,
    body: body,
    resolveWithFullResponse: true,
    json: true // Automatically stringifies the body to JSON 
  };
  if (isForm) options.form = body;
  return request(options).then(function(body, err){
    return {
      ...body,
      apiCookie: getApicookie(body)
    };
  }).catch(function (err) {
    return err;
  });
}

exports.do_delete_request = function(uri, body, sid = null) {
  setupCookieJarWithSid(sid);
  var options = {
    method: 'DELETE',
    uri: uri,
    jar: j,
    body: body,
    resolveWithFullResponse: true,
    json: true // Automatically stringifies the body to JSON 
  };

  return request(options).then(function(body){
    return {
      ...body,
      apiCookie: getApicookie(body)
    };
  }).catch(function (err) {
    return err;
  });
}

exports.do_get_request = function(uri, sid = null) {
  setupCookieJarWithSid(sid);
  var options = {
    uri: uri,
    jar: j,
    resolveWithFullResponse: true,
    json: true // Automatically stringifies the body to JSON 
  };

  return request(options).then(function(body){
    return {
      ...body,
      apiCookie: getApicookie(body)
    };
  }).catch(function (err) {
    return err;
  });
}
