const mongoose = require('mongoose');
const moment = require('moment');
const async = require('async');
const _ = require('lodash');
const cdDao = require('./common.document.dao');
const NodeData = mongoose.model('NodeData');
const Location = mongoose.model('Location');
const sysLogger = require('log4js').getLogger('system');
const dbLogger = require('log4js').getLogger('database');
const date_fmt = 'YYYY-MM-DD HH:mm:ss';
function fmt(m){
  return m.format(date_fmt);
}
function fmtStr(timeStr){
  return moment(timeStr).format(date_fmt);
}

function saveOneNodeData(lid, nd, cb) {
  //just save not exist nodedata.
  NodeData.findOne({locid:lid, nodeid: nd.nid, collectedOn: nd.timestampISO},
    'nodeid',
    function(err, existNodeData) {
      // console.log('existNodeData=', existNodeData);
      if (err) {
        dbLogger.error(err);
        if(cb) cb(err,0);
        return;
      }
      //console.log('nodeData='+nodeData);
      if (!existNodeData) {
        //console.log('Find new data,need save.');
        //create a new document.
        NodeData.create({
          locid:lid,
          nodeid: nd.nid,
          data: nd.data,
          collectedOn: nd.timestampISO
        }, function(err, createdNodeData) {
          if (err) {
            dbLogger.error(err);
            if(cb) cb(err,0);
            return;
          }
          //console.log('createdNodeData='+JSON.stringify(createdNodeData,null,2));
          if(cb) cb(null,1);
        });
      }
      else {
        //console.log('Find old data,need not save.');
        if(cb) cb(null,0);
      }
    }
  );
}

//for reuse call.
module.exports.saveNodesData = function(lid,nodesData, cb) {
  //console.log('Save nodesData here.');
  //console.log(req.body);
  let totalDataCount = 0;
  if(Array.isArray(nodesData)) {
    //let errs = [];
    totalDataCount = nodesData.length;
    let newDataCount = 0;
    let oldDataCount = 0;
    let finishCount = 0;
    async.forEachOfSeries(nodesData,(nd,index,callback)=>{
      saveOneNodeData(lid,nd,function(err,savedCount){
        if(err) {
          dbLogger.error(err);
          callback(err);
          return;
        }
        newDataCount += savedCount;
        if(err === null && savedCount === 0) oldDataCount += 1;
        finishCount++;
        callback();
      });
    },function (err) {
      if (err) {
        dbLogger.error(err);
        if(cb) cb(err,null);
        return;
      }
      dbLogger.info('totalDataCount=', totalDataCount,'finishCount=' ,finishCount);
      const saveRes = {
        total:totalDataCount,
        new:newDataCount,
        old:oldDataCount,
        finish:finishCount
      };
      //fill pid here:
      fillNodePid(lid,null);
      //call back here:
      if(cb) cb(null,saveRes);
    });
  }else{
    dbLogger.info('nodesData is not Array.');
    const saveRes = {
      total:0,
      new:0,
      old:0,
      finish:0
    };
    if(cb) cb(null,saveRes);
  }
};

module.exports.fillLastestNodeDataByRaw = function(lid,nodesData, cb) {
  //console.info('lastestNodesData.length',lastestNodesData.length);
  Location.findOne({_id:lid},'boundaries freeNodes',function(err, location) {
    if(err){
      console.error(err);
      if(cb) cb(err,null);
      return;
    }
    let updateCount = 0;
    location.boundaries.forEach(function(boundar){
      for(let point of boundar.points){
        if(!point.nodeid) continue;
        for(let nodeData of nodesData){
          if(nodeData.nid === point.nodeid){
            var ndTime = new Date(nodeData.timestampISO).getTime();
            var pTime = new Date(point.latestdatatime).getTime();
            if(point.latestdata.length === 0 || ndTime>pTime) {
              point.latestdata = nodeData.data;
              point.latestdatatime = nodeData.timestampISO;
              updateCount++;
              break;
            }
          }
        }
      }
    });

    for(let point of location.freeNodes){
      if(!point.nodeid) continue;
      for(let nodeData of nodesData){
        if(nodeData.nid === point.nodeid){
          var ndTime = new Date(nodeData.timestampISO).getTime();
          var pTime = new Date(point.latestdatatime).getTime();
          if(point.latestdata.length === 0 || ndTime>pTime) {
            point.latestdata = nodeData.data;
            point.latestdatatime = nodeData.timestampISO;
            updateCount++;
            break;
          }
        }
      }
    }

    // console.info('updateCount='+updateCount);
    if(updateCount>0) {
      location.latestDataOn = new Date();//.toISOString();
      //save location!!!
      location.save(function(err,updatedLocation){
        if(err){
          console.error(err);
        }
        console.info('location save over.');
      });
    }
    //what ever update,do cb
    if(cb) cb(null,{uldn:updateCount});
  });
};

function array2jsonObj(array){
  var jsonObj = {};
  array.forEach(function(a){
    for(var k in a){
      jsonObj[k] = a[k];
    }
  });
  return jsonObj;
}

module.exports.getNodeData = function(lid,nid,timeRange, cb) {
  //var filter = {locid:lid, nodeid: nid};
  var filter = {locid:lid, pid: nid};
  if(timeRange != null){
    filter['collectedOn'] = {
      //$gt:new Date(timeRange.from),
      //$lt:new Date(timeRange.to)
      $gt:timeRange.from,
      $lt:timeRange.to
    };
  }
  //console.log('timeRange in DAO:',JSON.stringify(filter,null,2));
  NodeData.find(filter).limit(18000).sort('collectedOn').
    select('data collectedOn').exec(function (err, rows) {
      if (err) {
        dbLogger.error(err);
        //res.status(500).json(err);
        if(cb) cb(err,null);
        return;
      }
      //console.log('rows='+rows);
      var dataList = [];
      rows.forEach(function(row){
        var nd = {dataTime:row.collectedOn};
        if(row.data.length > 0){
          nd['dataObj'] = array2jsonObj(row.data);
        }
        dataList.push(nd);
      });
      //cb to return dataList.
      if(cb) cb(null,dataList);
    }
  );
};

module.exports.getNodesData = function(lid,timeRange, cb) {
  //var filter = {locid:lid, nodeid: nid};
  var filter = {locid:lid};
  if(timeRange != null){
    filter['collectedOn'] = {
      //$gt:new Date(timeRange.from),
      //$lt:new Date(timeRange.to)
      $gt:timeRange.from,
      $lt:timeRange.to
    };
  }
  //console.log('timeRange in DAO:',JSON.stringify(filter,null,2));
  NodeData.find(filter).limit(18000)
    .select('pid data collectedOn')
    .sort('pid collectedOn')
    .exec(function (err, rows) {
      if (err) {
        dbLogger.error(err);
        //res.status(500).json(err);
        if(cb) cb(err,null);
        return;
      }
      //console.log('rows='+rows);
      var pidDataMap = {};
      rows.forEach(function(row){
        if(row.pid && row.pid.length>0 && row.data.length > 0){
          var nd = {dataTime:row.collectedOn};
          nd['dataObj'] = array2jsonObj(row.data);
          var pd = pidDataMap[row.pid];
          if(pd){
            pd.push(nd);
          }else{
            pidDataMap[row.pid] = [nd];
          }
        }
      });
      //cb to return dataList.
      if(cb) cb(null,pidDataMap);
    }
  );
};

//module.exports.fillNodePid = function(lid,cb) {
function fillNodePid(lid,cb) {
  //console.log('lid=',lid);
  //get records which pid is empty.
  NodeData.find({locid:lid,pid:null}).select('nodeid').exec(function (err, rows) {
    if (err) {
      dbLogger.error(err);
      //res.status(500).json(err);
      if(cb) cb(err,0);
      return;
    }

    if(rows.length == 0){
      if(cb) cb(null,0);
      //console.log('No records need fill pid.');
      return;
    }
    //console.log('Find '+rows.length+' rows need fill pid.');
    Location.findById(lid).select('boundaries freeNodes').exec(function(err, location) {
      if (err) {
        dbLogger.error(err);
        if(cb) cb(err,0);
        return;
      }
      var nidPidMap = {};
      location.boundaries.forEach(function(bound){
        if(bound.status == '1'){
          bound.points.forEach(function(p){
            if(p.status == '1'){
              if(p.nodeid && p.nodeid.length>0)
                nidPidMap[p.nodeid] = p._id;
            }
          });
        }
      });

      location.freeNodes.forEach(function(p){
        if(p.status == '1'){
          if(p.nodeid && p.nodeid.length>0)
            nidPidMap[p.nodeid] = p._id;
        }
      });

      //console.log(JSON.stringify(nidPidMap,null,2));
      var fillCount = 0;
      //for(var i in rows){
      for(let row of rows){
        //console.log(JSON.stringify(row,null,2));
        var pid = nidPidMap[row.nodeid];
        if(pid){
          //fill pid here.
          //NodeData.update({ _id: row._id },{ $set: { pid: pid}}).exec();
          NodeData.update({ _id: row._id },{ pid: pid}).exec();
          //console.log(row._id,row.nodeid,pid,'fill over.');
          fillCount++;
        }else{
          //console.log(row.nodeid,'not assiged.');
        }
      }
      if(cb) cb(null,fillCount);
      //console.log('fill over.');
    });
  });
}

//for test this method.
module.exports.fillNodePid = function(lid,cb) {
  fillNodePid(lid,cb);
};

function querySavedNodeData(lid,nid,timeRange, cb){
  const queryOption = {
    filter:{
      locid:lid,
      nodeid:nid,
      collectedOn:{
        $gte:timeRange.from,
        $lt:timeRange.to
      }
    },
    select:'_id',
  };
  cdDao.getDocuments(NodeData, queryOption, (err,result)=>{
    if(err){
      if(cb) cb(err,null);
      return;
    }
    if(cb) cb(null,{sdc:result.rows.length});//saved data count
  });
}

function insertNodeData(lid,nid,ndList,cb){
  const dataArray = [];
  for(let nd of ndList){
    dataArray.push({
      locid:lid,
      nodeid: nd.nid,
      data: nd.data,
      collectedOn: nd.timestampISO
    });
  }
  cdDao.createDocuments(NodeData,dataArray,(err, docs)=>{
    if(err){
      if(cb) cb(err,null);
      return;
    }
    //直接返回插入记录的行数
    if(cb) cb(null, docs.length);
  });
}

function replaceNodeData(lid,nid,oldDataCount,timeRange,ndList,cb){
  const queryOption = {
    deleteCount : oldDataCount,
    filter:{
      locid:lid,
      nodeid: nid,
      collectedOn:{
        $gte:timeRange.from,
        $lt:timeRange.to
      }
    }
  };
  cdDao.deleteDocuments(NodeData,queryOption,(err,deleteCount)=>{
    if(err){
      if(cb) cb({message:'deleteOldData failed.'},null);
      return;
    }
    if(deleteCount>0){
      const dataArray = [];
      for(let nd of ndList){
        dataArray.push({
          locid:lid,
          nodeid: nd.nid,
          data: nd.data,
          collectedOn: nd.timestampISO
        });
      }
      cdDao.createDocuments(NodeData,dataArray,(err, docs)=>{
        if(err){
          if(cb) cb({message:'insert new data failed.'},null);
          return;
        }
        //返回追加的记录数，即删除后追加的行数，appendCount
        if(cb) cb(null, docs.length - deleteCount);
      });
    }
  });
}

function savePastNodeData(lid,pastNodeData,cb,pcb){
  let totalNodeCount = _.keys(pastNodeData).length;
  let finishedNodeCount = 0;
  let totalDataCount = 0;
  let totalOldCount = 0;
  let totalRemoveCount = 0;
  let totalAppendCount = 0;
  const adst = moment();
  async.forEachOfSeries(pastNodeData,(ndList,nid,callback)=>{
    const sortedList = _.sortBy(ndList,['timestampISO']);
    const dataBegin = moment(sortedList[0].timestampISO);
    const dataEnd = moment(sortedList[sortedList.length - 1].timestampISO);
    //queryOption.filter.nodeid = nid;
    const groupedData = [];
    const timeGap = 24;
    for(let from = dataBegin.clone().hour(0).minute(0).second(0);
        from.isBefore(dataEnd);from.add(timeGap,'hours')){
      let to = from.clone().add(timeGap,'hours');
      const fd = _.filter(sortedList,(item)=>{
        const t = moment(item.timestampISO);
        //rang:[...)
        return t.diff(from,'seconds')>=0 && t.diff(to,'seconds') < 0;
      });
      if(fd && fd.length > 0){
        //console.log(`~~${fmt(from)}~${fmt(to)} has data:${fd.length}`);
        groupedData.push({
          timeRange:{from:from.toISOString(),to:to.toISOString()},
          data:fd
        });
      }else{
        //console.log(`${fmt(from)}~${fmt(to)} no data`);
      }
    }
    // group data by day.
    sysLogger.info(`${nid} in[${fmt(dataBegin)} ~ ${fmt(dataEnd)}] sent data count: ${sortedList.length},groupBy ${timeGap} hours to ${groupedData.length}.`);
    let nodeDataCount = sortedList.length;
    let nodeAppendCount = 0;
    let nodeRemoveCount = 0;
    let nodeSavedCount = 0;
    async.forEachOfSeries(groupedData,(item,index,callback)=>{
      querySavedNodeData(lid,nid,item.timeRange,(err,result)=>{
        sysLogger.info(`${fmtStr(item.timeRange.from)}~${fmtStr(item.timeRange.to)} has data:${item.data.length}`);
        if(err){
          callback(err);
          return;
        }
        let savedDataCount = result.sdc;
        nodeSavedCount += savedDataCount;
        dbLogger.info('savedDataCount=',savedDataCount);
        if(savedDataCount == 0){
          dbLogger.info('insert data here...');
          insertNodeData(lid,nid,item.data,(err,inertCount)=>{
            if(err){
              callback(err);
              return;
            }
            nodeAppendCount += inertCount;
            callback();
          });
        }else{
          if(savedDataCount < item.data.length){
            dbLogger.info('remove old data first,then insert new data.');
            replaceNodeData(lid,nid,savedDataCount,item.timeRange,item.data,(err,appendCount)=>{
              if(err){
                callback(err);
                return;
              }
              nodeRemoveCount += savedDataCount;
              nodeAppendCount += appendCount;
              callback();
            });
          }else{
            dbLogger.info('do not need insert data.');
            callback();
          }
        }
      });
    },function(err) {
      sysLogger.info(`nodeDataCount=${nodeDataCount},nodeAppendCount=${nodeAppendCount},nodeSavedCount=${nodeSavedCount},nodeRemoveCount=${nodeRemoveCount}`);
      totalDataCount += nodeDataCount;
      totalOldCount += nodeSavedCount;
      totalRemoveCount += nodeRemoveCount;
      totalAppendCount += nodeAppendCount;
      finishedNodeCount++;
      if(pcb){
        pcb({
          finished:finishedNodeCount,
          totalNode:totalNodeCount
        });
      }
      if(err){
        sysLogger.error(err);
        callback(err);
        return
      }
      callback();
    });
  },function(err){
    let useTime = moment().diff(adst,'seconds');
    sysLogger.info(`save data use ${useTime} seconds`);
    sysLogger.info(`totalDataCount=${totalDataCount},totalOldCount=${totalOldCount},totalAppendCount=${totalAppendCount},totalRemoveCount=${totalRemoveCount}`);
    if(err){
      sysLogger.error(err);
    }
    if(cb) cb(null,{
      useTime:useTime,
      totalDataCount:totalDataCount,
      totalOldCount:totalOldCount,
      totalAppendCount:totalAppendCount,
      totalRemoveCount:totalRemoveCount
    });
  });
}

module.exports.savePastNodeData = function(lid,pastNodeData,cb,pcb) {
  savePastNodeData(lid,pastNodeData,cb,pcb);
};
