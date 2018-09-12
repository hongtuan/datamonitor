const mongoose = require('mongoose');
//mongoose.set('debug', true);//打印执行语句 生产应该关闭
//var gracefulShutdown;
//var dbURI = 'mongodb://localhost/rsdb';
var dbURI = 'mongodb://rsdbOUser:kent1605@localhost/rsdb';

if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}
//(node:6700) DeprecationWarning: Mongoose: mpromise (mongoose's default promise library) is deprecated,
mongoose.Promise = global.Promise;
// mongoose.connect(dbURI,{useMongoClient: true,useNewUrlParser: true});
// mongoose.connect(dbURI,{useNewUrlParser: true});
mongoose.connect(dbURI);
// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
const gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app termination', function() {
    process.exit(0);
  });
});
require('./locations');
require('./users');
