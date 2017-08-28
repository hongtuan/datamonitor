var os = require('os');
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
  error:'../../err.log'
}

module.exports.loadFile = function(req, res) {
  var fn = req.query.fn;
  console.log('fn',fn);
  var fc = '';
  if(fileConfig.hasOwnProperty(fn)){
	var fileName = path.join(__dirname,fileConfig[fn]);
	console.log('fileName',fileName);
	fc = util.loadTextContent(fileName);
	if(fc == null) fc = 'file not exists.';
  }
  res.status(200).json({fn:fn,fc:fc});
};
