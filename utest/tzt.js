var moment = require("moment");
function getZoneOffet(){
  var d = new Date();
  var tzo = d.getTimezoneOffset();
  var sign = '+',oh='00',om='00';
  if(tzo>0) sign = '-';
  oh = Math.abs(tzo)/60;
  if(oh<9) oh = '0'+oh;
  om = Math.abs(tzo)%60;
  if(om<30) om = '0'+om;
  return `${sign}${oh}:${om}`;
}

console.log('getZone:',getZoneOffet());
var zOffset = getZoneOffet();
var fmt = 'YYYY-MM-DD hh:mm:ss a';
var d = new Date();
var diso = d.toISOString();
console.log('TimezoneOffset:',d.getTimezoneOffset(),diso,moment(diso).format(fmt));
var tzStr = diso.replace('Z',zOffset);//'2017-08-14T00:00:23.014+08:00';
var m1 = moment(tzStr);
console.log('tzStr:',tzStr);
console.log('m1:',m1);
console.log('m1.toISOString():',m1.toISOString());
console.log('m1.format(fmt):',m1.format(fmt));
