var request = require('request-promise');
var setCookie = require('set-cookie-parser');

// Enable cookies
var j = request.jar();
var request = request.defaults({jar:j});

const getClientHeader = function(headers) {
  console.log("############# headers", headers.cookie);
  // console.log("#### HEADERS NEW COOKIES", headers.cookie.replace('gamerscout-ui-session', 'gamerscout-api-session'));
  return {
    'cookie': headers.cookie,
    'user-agent': headers['user-agent'],
    'referer': headers.referer,
  };
  // return {};
}

const getApicookie = function(body) {
  if (!body) return null;
  const apiCookieName = 'gamerscout-api-session';
  var cookieString = (body.request) ? body.request.headers.cookie : '';
  var cookiesArray = cookieString.split('; ').find(s => s.includes(apiCookieName));
  var apiCookie = cookiesArray ? cookiesArray.replace(apiCookieName, '') : null;

  return apiCookie;
}

exports.do_put_request = function(uri, body) {
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

exports.do_post_request = function(uri, body, headers = null, isForm = false) {
  var options = {
      method: 'POST',
      uri: uri,
      jar: j,
      body: body,
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON 
    };
    if (isForm) options.form = body;
    if (headers) {
      options.headers = getClientHeader(headers);
    }
    return request(options).then(function(body, err){
      return {
        ...body,
        apiCookie: getApicookie(body)
      };
    }).catch(function (err) {
      return err;
    });
}

exports.do_delete_request = function(uri, body) {
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

exports.do_get_request = function(uri, headers = null) {
  var options = {
      uri: uri,
      jar: j,
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON 
    };
    if (headers) {
      options.headers = getClientHeader(headers);
    }
    return request(options).then(function(body){
      return {
        ...body,
        apiCookie: getApicookie(body)
      };
    }).catch(function (err) {
      return err;
    });
}
