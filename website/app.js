var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('./utils/i18n');
var config = require('./config/common.json');
var constants = require('./utils/constants');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var requests = require('./utils/requests.js');

var routes = require('./routes/index');

var app = express();

// Setup express sessions
var sess = {
  secret: 'gamerscoutForever',
  cookie: {},
  name: "gamerscout-ui-session",
  resave: false,
  saveUninitialized: false,
  maxAge: 604800 * 1000, // 1 week
}

if (app.get('env') === 'production') {
  sess.store = new RedisStore({
    port: 6379,
    host: 'localhost'
  });
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session(sess));
app.use(i18n);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(__dirname + '/bower_components'));
app.use('/.well-known/pki-validation/', express.static(__dirname + '/pki_validation'));

app.use(async function (req, res, next) {
  const api_config = await requests.do_get_request(`${constants.API_BASE_URL}/config`);
  req.globalData = {
    title: 'Gamerscout',
    session: req.session,
    api_url: config.api.protocol + '://' + constants.getApiUrl(),
    api_config: api_config.body,
    env: app.get('env'),
    version: config.website.version
  };
  next();
});

// Router
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('pages/404', {
    ...req.globalData,
  });
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
