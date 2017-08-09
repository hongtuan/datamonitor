var Email = require('lockit-sendmail');
var config = require('./config.js');
 
var email = new Email(config);
 
email.signup('john', 'hongtuang3@gmail.com', 'secret-token', function(err, res) {
  // res is the same res you would get from nodemailer 
  // for more infos see https://github.com/andris9/Nodemailer#return-callback 
  console.log(err);
  console.log(res);
});
