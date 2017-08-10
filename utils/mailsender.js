var nodemailer = require('nodemailer');
var mailTransport = nodemailer.createTransport({
  host: 'smtp.sina.com',
  secureConnection: true, //use SSL
  auth: {
    user: 'tht@sina.com',
    pass: 'thinkpad118'
  },
});

/*/test options
var options = {
  from: '"tht" <tht@sina.com>',
  to: '"goodfriend" <3239048@qq.com>, "hongtuan" <hongtuang3@gmail.com>',
  // cc          : ''    //抄送
  // bcc         : ''    //密送
  subject: 'A mail with attachments',
  text: 'Hello,files for you.',
  //html: '<h1>Hello,NodeMailer!</h1><p>look</p>',

  attachments    :[
    {
      filename: 'ECharts1.png',            // 改成你的附件名
      path: 'C:/FUT/images/ECharts1.png',  // 改成你的附件路径
      cid : '00000001'                 // cid可被邮件使用
    },
    {
      filename: 'test.log',            // 改成你的附件名
      path: 'C:/FUT/txt/test.log',  //te 改成你的附件路径
      cid : '00000002'                 // cid可被邮件使用
    },
  ]
};

mailTransport.sendMail(options, function(err, msg) {
  if(err) {
    console.log(err);
  } else {
    console.log(msg);
  }
});//*/

module.exports.sendMail = function(config,cb) {
  var options = {
    from: config.sender||'"tht" <tht@sina.com>',
    to: config.recipient||'"goodfriend" <3239048@qq.com>',
    subject: config.title||'A mail with attachments',
    text: config.contentInText||'Hello!',
    html: config.contentInHtml||'<b>Hello!</b>'
  };
  if(config.attachments)
    options['attachments'] = config.attachments;
  //call sendMail
  mailTransport.sendMail(options, function(err, msg) {
    /*
    if(err) {
      console.log(err);
    } else {
      console.log(msg);
    }//*/
    if(cb) cb(err,msg);
  });  
};
