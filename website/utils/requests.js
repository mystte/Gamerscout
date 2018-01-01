var request = require('request-promise');

// Enable cookies
var j = request.jar();
var request = request.defaults({jar:j});

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
      return body;
    }).catch(function (err) {
      return err;
    });
}

exports.do_post_request = function(uri, body) {
  var options = {
      method: 'POST',
      uri: uri,
      jar: j,
      body: body,
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON 
    };
    console.log("DO POST REQUEST", body);
    return request(options).then(function(body){
      console.log("DO POST REQUEST2");
      return body;
    }).catch(function (err) {
      console.log("DO POST REQUES33", err);
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
      return body;
    }).catch(function (err) {
      return err;
    });
}

exports.do_get_request = function(uri) {
  var options = {
      uri: uri,
      jar: j,
      resolveWithFullResponse: true,
      json: true // Automatically stringifies the body to JSON 
    };
    return request(options).then(function(body){
      return body;
    }).catch(function (err) {
      return err;
    });
}
