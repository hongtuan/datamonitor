"use strict";
//set timezone here.
process.env.TZ = 'America/New_York';

var debug = require('debug')('neapp:server');
var http = require('http');

var expressValidator = require('express-validator');
var expressSession = require('express-session');
require('dotenv').load();
var express = require("express");
var path = require('path');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var errorHandler = require("errorhandler");
var passport = require('passport');
//load models
require('./app_api/models/db');
require('./app_api/config/passport');

var routes = require("./app_server/routes/index");
var routesApi = require('./app_api/routes/index');

var dst = require('./utils/datasyntask.js');

var app = express();
// Configuration
app.set('views', path.join(__dirname,'app_server', 'views'));
app.set('view engine', 'pug');
//app.set('view options', { layout: false });
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());

app.use(cookieParser());

//app.use(logger(':date[iso] :method :url :status :res[content-length] :response-time ms'));

//app.use(express.static(path.join(__dirname, 'dist')));
app.use(express.static(path.join(__dirname, 'client')));
app.use(express.static(path.join(__dirname, 'app_client')));
app.use(expressSession({secret:'max',saveUninitialized:false,resave:false}));

var env = process.env.NODE_ENV || 'development';
if (env === 'development') {
    app.use(errorHandler());
}
// Routes
app.use('/', routes);
app.use(passport.initialize());
app.use('/api', routesApi);

// catch 404 and forward to error handler
//redirect to / for angular app
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  //console.log(err);
  res.redirect('/');
  //next(err);//
});//*/

//*
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

//*/

//app.listen(process.env.PORT || 8080, function () {
    //console.log("Demo Express server listening on port %d in %s mode", 8080, app.settings.env);
//});
var port = normalizePort(process.env.PORT || '3000');
//console.log('port:'+port)
console.log("Express server listening on port %d in %s mode", port, app.settings.env);
app.set('port', port);

//
/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

//record server startTime,for use later.
var startTime = Date.now();
app.locals.startTime = startTime;
app.locals.dataSyncTask = {};
app.locals.inspectNodeTask = {};
dst.deployDataSynTask(app);
//var taskID1 = dst.deployDataSynTask('url1',5000);
//app.locals.taskID1 = taskID1;
//console.log('JWT_SECRET='+process.env.JWT_SECRET);
exports.App = app;

