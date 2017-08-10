var mailsender = require('../utils/mailsender');
mailsender.sendMail({
  sender:'"啊团哥" <tht@sina.com>',
  title:'Tim\'s test mail.',
  recipient:'"Goodfriend" <3239048@qq.com>',
  contentInText:'hello,this is mailsender test mail.',
  contentInHtml:'<h2>hello,this is mailsender test mail,in Html</h2>',
  attachments:[
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
},function(err,msg){
  if(err){
    console.log('send failed',err);
    return;
  }
  console.log('send ok',msg);
});
