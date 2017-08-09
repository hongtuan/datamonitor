//var sendmail = require('sendmail')();
var sendmail = require('sendmail')({
  logger: {
    debug: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error
  },
  silent: false
});

console.log('sending maill...');
var mailOptions = {
  from: 'hongtuang3@gmail.com',
  to: 'hongtuang3@gmail.com',
  subject: 'test sendmail via node.js',
  html: 'Mail content of test sendmail ',
};
sendmail(mailOptions, function(err, reply) {
    console.log(err && err.stack);
    console.dir(reply);
    console.log('sending maill over.');
});

