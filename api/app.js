var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var config = require('./config');
var routes = require('./routes/index');
var api = require('./routes/api');
var users = require('./routes/users');
var forgot_password = require('./routes/forgot_password');
var session = require('express-session');

// Path to the mongodb Database. For now we use the localhost one
var connStr = "mongodb://localhost:" + config.mongodb_port + "/" + config.project_name;

// Plug Q promises into mongoose
mongoose.Promise = require('q').Promise;

mongoose.connect(connStr, {useMongoClient: true}, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB:' + config.project_name + ' on port ' + config.mongodb_port);
});

var app = express();

// Setup express sessions
var sess = {
  secret: 'powarepflameforever',
  cookie: {},
  name: "gamerscout-api-session",
  resave: true,
  saveUninitialized: true,
}
 
if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy 
  sess.cookie.secure = true // serve secure cookies
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(allowCrossDomain);
// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(session(sess));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
// api users routes
app.use('/api/1/users', users);
app.use('/reset', forgot_password);
// repflame api routes
app.use('/api/1', api);

module.exports = app;
