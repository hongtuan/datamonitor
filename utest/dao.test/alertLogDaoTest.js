require('../../app_api/models/db');
var alertLogDao = require('../../app_api/dao/alertlogdao.js');
var lid = '58890bd8b746703db8e4615d';
//var dataInfo = {type:'FD',range:{min:1.2,max:5.3}};
var dataInfo = {type:'SC',range:{min:20,max:80}};
var alertInfo = {at:'low',nid:'33333',dt: '2017-09-15T01:00:00.108Z',dv:30};
var testData = [
  {dataInfo : {type:'SC',range:{min:20,max:80}},alertInfo : [{at:'low',nid:'33333',dt: '2017-09-15T01:00:00.108Z',dv:30}]},
  {dataInfo : {type:'SC',range:{min:20,max:80}},alertInfo : [{at:'low',nid:'33333',dt: '2017-09-15T01:00:00.108Z',dv:30}]},
];
/*
testData.forEach(function(td){
  alertLogDao.appendAlertLog(lid,td.dataInfo,td.alertInfo,function(err, row){
    if(err){
      console.log(err);
      return;
    }
    console.log(row);
  });
});//*/
for(let i=0;i<testData.length;i++){
  (function(_i){
    console.log(_i);
    let td = testData[_i];
    alertLogDao.appendAlertLog(lid,td.dataInfo,td.alertInfo,function(err, row){
      if(err){
        console.log(err);
        return;
      }
      console.log(row);
    });
  })(i);
}
