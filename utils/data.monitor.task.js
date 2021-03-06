//require('../app_api/models/db');
// const fs = require('fs');
// const path = require('path');
const moment = require('moment');
const locDao = require('../app_api/dao/locationdao.js');
const alertLogDao = require('../app_api/dao/alertlogdao.js');
const async = require('async');

/*
function recordAlertLog(lid,dataInfo,alertInfo,delay){
  function writeAlertLogToDB(){
    alertLogDao.appendAlertLog(lid,dataInfo,alertInfo,function(err,logRes){
      if(err){
        console.log(err);
        return;
      }
      console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} ${dataInfo.type} alertLog:${JSON.stringify(logRes)}`);
    });
  }
  if(delay){
    //console.log('do delay task');
    setTimeout(writeAlertLogToDB,delay);
  }else{
    //console.log('do no delay task');
    writeAlertLogToDB();
  }
}//*/

module.exports.doDataMonitorTask = function(lid) {
  //execute data monitor task here:
  locDao.getLocationData(lid, function (err, locationData) {
    if (err) {
      console.log(err);
      return;
    }
    let nodesList = [];
    locationData.BDL.forEach(function (boundaryData) {
      nodesList = nodesList.concat(boundaryData.nodeList);
    });
    nodesList = nodesList.concat(locationData.FNL);
    //const jsonStr = JSON.stringify(nodesList,null,2);
    //console.log('nodeList',jsonStr);
    //var ld = JSON.stringify(locationData,null,2);
    //console.log('nodesInfo',ld);
    //fs.writeFileSync(path.join(__dirname,'jsonStr.txt'),jsonStr);
    const alertPolicy = locationData.dataPolicy;
    const dataRange = {},dataDesc = {}, alertDataLog = {};
    if (Array.isArray(alertPolicy)) {
      alertPolicy.forEach(function (ap) {
        dataRange[ap.name] = ap.range;
        dataDesc[ap.name] = ap.desc;
        alertDataLog[ap.name] = {};
      });
    }
    //check the node's datatime
    const crtTime = moment();
    const nodeCount = nodesList.length;
    let noDataNodeCount = 0, warningNodeCount = 0, okNodeCount = 0;
    for (let node of nodesList) {
      if (node.latestData.length === 0) {
        console.log(`${node.ptag} has no data!'`);
        noDataNodeCount++;
        continue;
      }

      const dataAge = crtTime.diff(moment(node.latestDatatime), 'minutes');
      if (dataAge > 1440) {//1440
        console.log(`${node.ptag} data has delay for ${dataAge} minutes.`);
      }
      //check data in range.
      for (let nd of node.latestData) {
        //var nd = node.latestData[j];
        for (let dn in nd) {
          var range = dataRange[dn];
          var sdv = +nd[dn];
          if (range && sdv) {
            var minV = +range.min;
            var maxV = +range.max;
            var alertType = null;
            if (sdv < minV) {
              alertType = 'low';
            }
            if (sdv > maxV) {
              alertType = 'high';
            }
            //console.log(alertLog);
            if (alertType != null) {
              var alertInfo = {at: alertType, nid: String(node.pid), ntag: node.ptag, dt: node.latestDatatime, dv: sdv};
              if (alertDataLog[dn].hasOwnProperty('alertInfo')) {
                alertDataLog[dn]['alertInfo'].push(alertInfo);
              } else {
                alertDataLog[dn]['alertInfo'] = [alertInfo];
              }
              warningNodeCount++;
            } else {
              okNodeCount++;
            }
          }
        }
      }
    }
    async.forEachOf(alertDataLog, function (adl, dn, callback) {
      if (adl.alertInfo) {
        alertLogDao.appendAlertLog(lid,
          {type: dn,desc:dataDesc[dn], range: dataRange[dn]},
          adl.alertInfo,function(err,logRes){
            if(err){
              console.log(err);
              callback(err);
              return;
            }
            console.log(`${moment().format('YYYY-MM-DD HH:mm:ss')} ${dn} alertLog:${JSON.stringify(logRes)}`);
            callback();
          });
      }else{
        callback();
      }
    }, function (err) {
      if (err) console.error(err.message);
      console.log('alertDataLog write to db over.');
      console.log(`nodeCount=${nodeCount},noDataNodeCount=${noDataNodeCount},warningNodeCount=${warningNodeCount},okNodeCount=${okNodeCount}`);
    });

    /*
    var i = 0, delay = 1000;
    //*These code runs good.
    for (let dn in alertDataLog) {
      var adl = alertDataLog[dn];
      if (adl.alertInfo) {
        recordAlertLog(lid, {type: dn,desc:dataDesc[dn], range: dataRange[dn]}, adl.alertInfo, ++i * delay);
      }
    }
    setTimeout(() => {
      console.log(`nodeCount=${nodeCount},noDataNodeCount=${noDataNodeCount},warningNodeCount=${warningNodeCount},okNodeCount=${okNodeCount}`);
      //process.exit(0);
    }, ++i * delay);//*/
  });
};

