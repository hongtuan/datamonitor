var mongoose = require('mongoose');
var moment = require('moment');
var AlertLog = mongoose.model('AlertLog');

module.exports.appendAlertLog = function(lid,dataInfo,alertInfo, cb) {
  AlertLog.findOne({lid:lid,dataType: dataInfo.type,
    "dataRange.min":dataInfo.range.min,"dataRange.max":dataInfo.range.max},
    'lid dataType dataRange alertInfos',
    function(err, existRowData) {
      if (err) {
        console.log(err);
        if(cb) cb(err,0);
        return;
      }
      //console.log('nodeData='+nodeData);, dataRange: dataInfo.range
      if (existRowData == null) {
        //console.log('Find new data,need save.');
        //create a new document.
        AlertLog.create({
          lid:lid,
          dataType: dataInfo.type,
          dataDesc: dataInfo.desc,
          dataRange: dataInfo.range,
          alertInfos: alertInfo
        }, function(err, createdRowData) {
          if (err) {
            console.log(err);
            if(cb) cb(err,0);
            return;
          }
          //console.log('new Record created over.');
          if(cb) cb(null,{nalc:alertInfo.length,talc:createdRowData.alertInfos.length});
          return;
        });
      } else {
        //check alertLog existed
        var newAlertInfo = [];
        var naic = alertInfo.length;
        var eaic = existRowData.alertInfos.length;
        var cc = Math.max(0,eaic-naic);
        //console.log(`eaic=${eaic},naic=${naic},cc=${cc}`);
        for(let ai of alertInfo){
          var isNewAlertLog = true;
          //console.log('ai=',ai);
          for(let i = eaic - 1;i>=cc;i--){
            //console.log('ai=',ai,'eai=',eai);
            var eai = existRowData.alertInfos[i];
            if(eai.nid == ai.nid && moment(eai.dt).diff(moment(ai.dt),'minutes') == 0) {
              isNewAlertLog = false;
              break;
            }
          }
          if(isNewAlertLog){
            newAlertInfo.push(ai);
          }
        }
        if(newAlertInfo.length > 0){
          existRowData.alertInfos = existRowData.alertInfos.concat(newAlertInfo);
          existRowData.save(function(err, updatedRowData){
            if (err) {
              console.error(err);
              if(cb) cb(err,null);
              return;
            }
            //console.log(newAlertInfo.length,'new alertLog append,old Record update over.');
            if(cb) cb(null,{nalc:newAlertInfo.length,talc:updatedRowData.alertInfos.length});
            return;
          });
        }else{
          //console.log('no new alert log find.');
          if(cb) cb(null,{nalc:0,talc:existRowData.alertInfos.length});
        }
      }
    }
  );
};

module.exports.getAlertLog = function(lid,limit, cb) {
  AlertLog.find({lid:lid})
    .sort('"alertInfos.length"')
    .select('lid dataType atimes dataDesc dataRange alertInfos').exec(function (err, rows) {
    if (err) {
      console.log(err);
      //res.status(500).json(err);
      if(cb) cb(err,null);
      return;
    }
    for(let row of rows){
      if(row.alertInfos){
        var len = row.alertInfos.length;
        row.atimes = len;
        if(len<=limit){
          row.alertInfos = row.alertInfos.reverse();
        }else{
          row.alertInfos = row.alertInfos.slice(len-limit,len).reverse();
        }
      }
    }
    //console.log(JSON.stringify(rows,null,2));
    //console.log('in DAO:',rows[0].atimes);
    if(cb) cb(null,rows);
  });
}
