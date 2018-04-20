//var os = require('os');
var fs = require('fs');
var path = require('path');
var moment = require('moment');
var util = require('../../utils/util');
var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
function bytes2M(b){
  var m = +b/1024/1204;
  return m.toFixed(0);
}
var fileConfig = {
  forever:'../../../.forever/forever.log',
  console:'../../out.log',
  error:'../../err.log',
  NginxAccessLog:'../../nginx/access.log',
  NginxErrorLog:'../../nginx/error.log',
}

module.exports.loadFile = function(req, res) {
  var fn = req.query.fn;
  //console.log('fn',fn);
  var fc = '';
  if(fileConfig.hasOwnProperty(fn)){
    var fileName = path.join(__dirname,fileConfig[fn]);
    if(fs.existsSync(fileName)){
      console.log(`load file ${fileName}.`);
      var _fc = util.loadTextContent(fileName);
      //var tmpA = _fc.split('\n').reverse();
      var fi = fs.statSync(fileName);
      fc = `log file modify time:${moment(fi.mtime).format('YYYY-MM-DD h:mm:ss a')},size:${fi.size} \n`;
      //fc += tmpA.join('\n');
      fc += _fc;
    }else{
      fc = `file ${fn} not exists.`;
    }
  }
  res.status(200).json({fn:fn,fc:fc});
};
