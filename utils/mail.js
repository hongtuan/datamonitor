/**
 *
 * @Description 邮件发送 
 * 调用方法:sendMail('amor_zhang@qq.com','这是测试邮件', 'Hi Amor,这是一封测试邮件');
 * @Author Amor
 * @Created 2016/04/26 15:10
 * 技术只是解决问题的选择,而不是解决问题的根本...
 * 我是Amor,为发骚而生!
 *
 */

var nodemailer = require('nodemailer');
var mailAccount = {
  //service: 'QQ',
  host: 'smtp.qq.com',
  secureConnection: true, //use SSL
  auth: {
    user: '3239048@qq.com',
    pass: 'xsmswyjselewcaab'
  }
};

var smtpTransport = nodemailer.createTransport(mailAccount);

/**
 * @param {String} recipient 收件人
 * @param {String} subject 发送的主题
 * @param {String} html 发送的html内容
 */
var sendMail = function (recipient, subject, html) {
  smtpTransport.sendMail({
    from: mailAccount.auth.user,
    to: recipient,
    subject: subject,
    html: html
  }, function (error, response) {
    console.log('send mail test over.');
    if (error) {
      console.log(error);
      return;
    }
    console.log('发送成功')
  });
};

sendMail('hongtuang3@gmail.com','testMail4','<h2>hello2中文</h2>');
