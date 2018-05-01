const mongoose = require('mongoose');
//var NodeData = mongoose.model('NodeData');
const locDao = require('../dao/locationdao.js');
const LocationLog = mongoose.model('LocationLog');

module.exports.logType = {dataSync:'dataSync',inspectNode:'inspectNode'};

module.exports.recordLocLog = function(lid,logType,logContent,cb){
  // console.log(lid,logType,logContent);
  LocationLog.update(
    { locid: lid, logType:logType },
    { $push : { logList: {logContent:logContent} } },
    function(err, updatedLocationLog){
      if(err){
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      // console.log(JSON.stringify(updatedLocationLog,null,2));
      if(updatedLocationLog.nModified === 1){
        if(cb) cb(null,{logContent: logContent});
      }else{
        // insert new record
        LocationLog.create({
            locid:lid, logType:logType, logList:[{logContent:logContent}]},
          function(err,newLocationLog){
            if(err){
              console.log(err);
              if(cb) cb(err,null);
              return;
            }
            if(cb) cb(null,newLocationLog.logList[0]);
          }
        );
      }
    }
  );
  /*
  LocationLog.findOne(
    {locid: lid, logType:logType},
    'logList',
    function(err, existLocationLog) {
      if(err) {
        if(cb) cb(err,null);
        return;
      }
      if(!existLocationLog){
        //insert new record
        LocationLog.create({
          locid:lid, logType:logType, logList:[{logContent:logContent}]},
          function(err,newLocationLog){
            if(err){
              console.log(err);
              if(cb) cb(err,null);
              return;
            }
            if(cb) cb(null,newLocationLog.logList[0]);
          }
        );
      }else{
        existLocationLog.logList.push({logContent:logContent});
        existLocationLog.save(function(err,updatedLocationLog){
          if(err){
            console.log(err);
            if(cb) cb(err,null);
            return;
          }
          if(cb) cb(null,updatedLocationLog.logList[updatedLocationLog.logList.length-1]);
        });
      }
    }
  );//*/
};

module.exports.getLocLogList = function(lid,logType,limit,cb) {
  LocationLog.findOne({locid: lid,logType:logType}, 'logList',
    function(err, locationLog) {
      if(err){
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      var lastestLogList = [];
      if(locationLog != null){
        var len = locationLog.logList.length;
        if(len<=limit){
          lastestLogList = locationLog.logList.reverse();
        }else{
          lastestLogList = locationLog.logList.slice(len-limit,len).reverse();
        }
      }
      locDao.getLocationBaseInfo(lid,function(err,location){
        if(cb) cb(null,lastestLogList,location);
      });
    }
  );
};
