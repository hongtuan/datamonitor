const moment = require('moment');
const util = require('../../utils/util.js');
const dmt = require('../../utils/data.monitor.task.js');
const mailSender = require('../../utils/mailsender.js');
const dataParser = require('../../app_api/helper/data.parser.helper');

const locDao = require('../dao/locationdao.js');
const ndDao = require('../dao/nodedatadao.js');
const llDao = require('../../app_api/dao/locationlogdao.js');
const sysLogger = require('log4js').getLogger('system');
//create emptyData for Interpolation
function getEmptyData(dap){
  const emptyData = {isSham:true};
  dap.forEach(function(_dap){
    emptyData[_dap.name] = 0;
  });
  return emptyData;
}

function getInitData(dap){
  const emptyData = {DC:0};
  dap.forEach(function(_dap){
    emptyData[_dap.name] = 0;
  });
  return emptyData;
}

function getDatesInRange(from,to,fmt='YYYY-MM-DD'){
  //var fromDate = from.substr(0,from.indexOf('T'));
  //var toDate = to.substr(0,to.indexOf('T'));
  //console.log('fromDate,toDate',fromDate,toDate);
  //var start = moment(fromDate),end = moment(toDate);
  const start = moment(from),end = moment(to);
  let dc = end.diff(start,'days');
  const dateRange = [start.format(fmt)];
  do{
    dateRange.push(start.add(1,'d').format(fmt));
  }while(--dc > 0);
  return dateRange;
}

function cvtNodeData(nd,ptag){
  //cvtNodeData here:
  const dataInfo = [];
  nd.data.forEach(function(d){
    for(let k in d){
      dataInfo.push(k+':'+d[k]);
    }
  });
  return {
    nid:nd.nid,
    ptag:ptag,//nidNodeMap[nd.nid].ptag,
    dtime:dataParser.iso2Locale(nd.timestampISO),
    data:dataInfo.join(',')
  };
}

function getDataItem(data,dataName){
  for(let i in data){
    const d = data[i];
    for(let pro in d){
      if(pro === dataName)
        return d[pro];
    }
  }
  return null;
}

function doInterpolation(data,emptyData,dataTimeRange){
  //if data is empty,just add to two empty data by from,to
  var iData = [];
  var dl = data?data.length:0;
  if(dl === 0){
    iData.push({
      dataTime:dataTimeRange.from,
      dataObj:emptyData
    });
    iData.push({
      dataTime:dataTimeRange.to,
      dataObj:emptyData
    });
    return iData;
  }
  //*
  var startDataTime = data[0].dataTime;
  var dist = moment(startDataTime).diff(moment(dataTimeRange.from),'minutes');
  if(dist > 15){
    iData.push({
      dataTime:dataTimeRange.from,
      dataObj:emptyData
    });
  }

  if(dist > 30){
    iData.push({
      dataTime:moment(startDataTime).subtract(15,'minutes'),
      dataObj:emptyData
    });
  }

  if(dl >= 2){
    var dA,dB;
    var dtA,dtB;
    for(var i=0;i<dl-1;i++){
      dA = data[i];
      iData.push(dA);
      dB = data[i+1];
      dtA = moment(dA.dataTime);
      dtB = moment(dB.dataTime);

      dist = dtB.diff(dtA,'minutes');
      if(dist > 30){//add a data close to dtA;
        iData.push({
          dataTime:dtA.add(15,'minutes'),
          dataObj:emptyData
        });
      }

      if(dist > 45){//add a data close to dtB
        iData.push({
          dataTime:dtB.subtract(15,'minutes'),
          dataObj:emptyData
        });
      }
    }
    iData.push(data[dl-1]);
  }
  //
  var endDataTime = data[dl-1].dataTime;
  dist = moment(dataTimeRange.to).diff(moment(endDataTime),'minutes');
  if(dist > 30){
    iData.push({
      dataTime:moment(endDataTime).add(15,'minutes'),
      dataObj:emptyData
    });
  }

  if(dist > 15){
    iData.push({
      dataTime:dataTimeRange.to,
      dataObj:emptyData
    });
  }

  return iData;
}

function executeSyncTask(lid,dataUrl, cb){
  //read data from data server
  util.loadNewData(dataUrl,function(err,nodesData){
    // console.log('step1 getNodesData ok.', lid, nodesData.length);
    // then write data to db:
    ndDao.saveNodesData(lid,nodesData,function(err,saveRes){
      if(err){
        sysLogger.error(err);
      }
      // console.log('step2 saveNodesData ok.', lid, saveRes.finish);
      //call fill lastestNodeData here:
      ndDao.fillLastestNodeDataByRaw(lid,nodesData,function(err,updateRes){
        if(err){
          sysLogger.error("fillLastestNodeDataByRaw failed:"+err);
          return;
        }
        // console.log('step3 fillLastestNodeDataByRaw ok.', lid);
        const logContent = dataParser.cvtJsonObj2StrKeyValue(saveRes)+','+
          dataParser.cvtJsonObj2StrKeyValue(updateRes);
        // console.log('logContent='+logContent);
        llDao.recordLocLog(lid,llDao.logType.dataSync,logContent,function(err,taskLog){
          if(err) console.log(err);
          // console.log('step4 recordLocLog ok.');
          //check log here：
          //llDao.getLocLogList();
          llDao.getLocLogList(lid, llDao.logType.dataSync, 3, function(err, dataSyncLogList,location) {
            // console.log('step5 getLocLogList ok.');
            var ucs = [];
            var lastestLogDate = moment(dataSyncLogList[0].createdOn).format('YYYY-MM-DD h:mm a');
            for(let slog of dataSyncLogList) {
              var logContent = slog.logContent;
              var udc = logContent.substr(logContent.lastIndexOf(':') + 1);
              ucs.push(udc === '0' ? 0 : 1);
            }
            var ucStr = ucs.join('');
            sysLogger.info(`lastestDataSynLogTime ${lastestLogDate},ucStr=${ucStr}.`);
            switch(ucStr){
              //case '000':
              case '001':
              case '011':
                sysLogger.info(`Location ${location.name} at ${lastestLogDate} around found lost data!`);
                mailSender.sendMail({
                  recipient: '"goodfriend" <3239048@qq.com>;"pgray" <pgray@nighthawkimagingservices.com>;"hongtuan" <hongtuang3@gmail.com>',
                  title: `Location:${location.name}'s data lost!`,
                  contentInText: `Location:${location.name} at ${lastestLogDate} around found data lost!(${ucStr})`,
                  contentInHtml: `<h2>Location:${location.name} at ${lastestLogDate} around found data lost!(${ucStr})</h2>`
                },function(){
                  sysLogger.info('data lost mail send over.');
                });
                break;
              case '100':
                sysLogger.info(`Location ${location.name} at ${lastestLogDate} around had new data come up!`);
                mailSender.sendMail({
                  recipient: '"goodfriend" <3239048@qq.com>;"pgray" <pgray@nighthawkimagingservices.com>;"hongtuan" <hongtuang3@gmail.com>',
                  title: `Location:${location.name}'s new data come up!`,
                  contentInText: `Location:${location.name} at ${lastestLogDate} around new data come up!(${ucStr})`,
                  contentInHtml: `<h2>Location:${location.name} at ${lastestLogDate} around new data come up!(${ucStr})</h2>`
                },function(){
                  sysLogger.info('data come up mail send over.');
                });
                break;
            }
            //add data monitor task here on 9/24 by Tim
            dmt.doDataMonitorTask(lid);
            if(cb) cb();
          });
          //console.info('taskLog='+taskLog);
          //console.log('taskLog record over.');
        });
        //console.info('updateLastestNodeData Task execute over.');
      });
      //console.info('saveNodesData Task execute over.');
    });
    //console.info('getNodesData(Raw) Task execute over.');
  });
}

function getTZOStr(tzo) {
  var sign = tzo > 0 ?'-':'+';
  //var oh = '00', om = '00';
  //if(tzo > 0) sign = '+';
  var oh = Math.abs(tzo) / 60;
  if(oh < 9) oh = '0' + oh;
  var om = Math.abs(tzo) % 60;
  if(om < 30) om = '0' + om;
  return `${sign}${oh}:${om}`;
}

function getTimeRange(req){
  var from = req.query.from;
  var to = req.query.to;
  //do with client timeZone diff from severtimezone.
  var ctzo = req.query.ctzo;
  if(ctzo != undefined) {
    var stzo = req.app.locals.serverTimezoneOffset;
    sysLogger.info('do tz cvt at:',moment().format('YYYY-MM-DD h:mm:ss a'),'ctzo:',ctzo,'stzo:',stzo);
    sysLogger.info('before cvt:from=',from,'to=',to);
    if(ctzo != stzo) {
      sysLogger.info('ctzo != stzo,need cvt.');
      //var tzos = getTZOStr(stzo - ctzo);
      var tzos = getTZOStr(ctzo - stzo);
      from = from.replace('Z', tzos);
      to = to.replace('Z', tzos);
      sysLogger.info('after cvt:from=',from,'to=',to);
    }else{
      sysLogger.info('ctzo == stzo,do not need cvt.');
    }
  }
  return {from:moment(from),to:moment(to)};
}

function calcAvgData(dataList,timeRange,dataAlertPolicy){
  //var from,to;
  //console.log(JSON.stringify(dataList,null,2));
  //console.log(from,to);
  var mfrom = moment(timeRange.from);
  var startHour = mfrom.hour(),startMinute = mfrom.minute();

  var mto = moment(timeRange.to);
  var endHour = mto.hour(),endMinute = mto.minute();

  var dateRange = getDatesInRange(timeRange.from, timeRange.to);

  var avgData = {};
  var serverTZ = process.env.TZ;
  //console.log('TZ:',serverTZ,'dateRange:',JSON.stringify(dateRange,null,2));
  for(let ds of dateRange) {
    var start = moment(ds).hour(startHour).minute(startMinute);
    var end = moment(ds).hour(endHour).minute(endMinute);
    //console.log('start,end(ISO):',start.toISOString(),end.toISOString());
    //console.log('start,end:',start.format('YYYY-MM-DD hh:mm:ss a'),end.format('YYYY-MM-DD hh:mm:ss a'));
    //console.log('start,end(TZ):',start.format('YYYY-MM-DD hh:mm:ss a'),end.format('YYYY-MM-DD hh:mm:ss a'));
    var navd = [];
    for(let d of dataList) {
      var md = moment(d.dataTime);
      //console.log('md=',md.format('YYYY-MM-DD h:mm:ss'));
      if(md.isBetween(start, end, null, '[]')) {
        navd.push(d.dataObj);
        //console.log('is between!',md,md.format('YYYY-MM-DD hh:mm:ss a'));
      }else{
        //console.log('Not between!',md,md.format('YYYY-MM-DD hh:mm:ss a'));
      }
    }
    avgData[ds] = navd;
    //console.log(JSON.stringify(navd,null,2));
  }

  //calc the avage:
  //var emptyData = getInitData(dataAlertPolicy);
  for(var ds in avgData) {
    var navd = avgData[ds];
    var avgDataValue = getInitData(dataAlertPolicy);
    if(navd.length == 0) {
      avgData[ds] = avgDataValue;
      continue;
    }

    for(let d of navd) {
      for(var dn in d) {
        avgDataValue[dn] += d[dn];
      }
    }

    for(var dn in avgDataValue) {
      var avgValue = avgDataValue[dn] / navd.length;
      avgDataValue[dn] = +avgValue.toFixed(2);
      if(dn == 'DC') {
        avgDataValue[dn] = navd.length;
      }
    }
    avgData[ds] = avgDataValue;
  }
  var avgDataList = [];
  for(var ds in avgData) {
    avgDataList.push({
      dataTime: ds,
      dataObj: avgData[ds]
    });
  }
  return avgDataList;
}

/*
module.exports.readNodesRawData = function(req, res) {
  //console.log('save nodedata here.');
  var url = req.body.url||'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=3';
  //console.info('reading data from['+url+']...');
  util.getNodesData(url,function(dataList){
    res.status(200).json(dataList);
  });
};//*/

module.exports.getNodeData = function(req, res) {
  var lid = req.params.lid;
  locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
    if(err){
      sysLogger.error(err);
      res.status(406).json(err);
      return;
    }
    var nid = req.params.nid;
    var timeRange = getTimeRange(req);
    sysLogger.info('timeRange',JSON.stringify(timeRange,null,2));
    var from = timeRange.from;
    var to = timeRange.to;
    var fmt = 'YYYY-MM-DD hh:mm a';
    sysLogger.info('getNodeData:from',from,moment(from).toISOString(),moment(from).format(fmt));
    sysLogger.info('getNodeData:to',from,moment(to).toISOString(),moment(to).format(fmt));
    var timeRange = null;
    if(from && to){
      timeRange = {from:from,to:to};
    }
    ndDao.getNodeData(lid,nid,timeRange,function(err,dataList){
      if(err){
        sysLogger.error(err);
        res.status(406).json(err);
      }
      //console.log('getNodeData:dataList',dataList.length,JSON.stringify(dataList,null,2));
      var emptyData = getEmptyData(dataAlertPolicy);
      var iDataList = doInterpolation(dataList,emptyData,timeRange);
      //console.log('getNodeData:iDataList',iDataList.length,JSON.stringify(iDataList,null,2));
      res.status(200).json({dap:dataAlertPolicy,dataList:iDataList});
    });
  });
};

module.exports.executeInspectNodeTask = function(req, res) {
  var lid = req.params.lid;
  var location = req.body;
  var dataUrl = dataParser.buildDataUrl(location.datasrc,Math.ceil(0.1*location.snapcount));

  util.loadNewData(dataUrl,function(err,nodesData){
    if(err){
      sysLogger.error(err);
      res.status(500).json(err);
      return;
    }
    locDao.getLocationData(lid,function(err,locationData){
      if(err){
        console.error(err);
         res.status(500).json(err);
        return;
      }
      var nidNodeMap = locationData.NNM;
      var swipNids = [];
      var swipNodes = [];
      var crtTime = Date.now();
      //find swip node,then record log.
      var lastestNodeData = nodesData[0];
      nodesData.forEach(function(nd){
        if(nd.timestampISO>lastestNodeData.timestampISO)
          lastestNodeData = nd;
        //datatime less then 30 seconds
        if(crtTime-new Date(nd.timestampISO).getTime()<=30*1000){//@2016.12.16 change to 30seconds,3 minutes
          //var scValue = +nd.data[0].SC;
          var scValue = +getDataItem(nd.data,'SC');
          //console.log('scValue='+scValue);
          if(scValue == 0){
            var node = nidNodeMap[nd.nid];
            //console.log('node='+JSON.stringify(node,null,2));
            if(!swipNids.includes(nd.nid)){
              swipNids.push(nd.nid);
              swipNodes.push(cvtNodeData(nd,node?node.ptag:'Mac'));
            }
          }
        }
      });

      //then record log.
      if(swipNodes.length>0){
        //record log here:
        var logContent = [];
        for(var i in swipNodes){
          var nd = swipNodes[i];
          var node = nidNodeMap[nd.nid];
          logContent.push(`${node?node.ptag:'Mac'}[${nd.nid.substr(8)}]@\n${nd.dtime}-Swiped,\n${nd.data}`);
        }
        llDao.recordLocLog(lid,llDao.logType.inspectNode,
          logContent.join('\n'),function(err,lastestLog){
          if(err) sysLogger.error(err);
          //console.log('lastestLog='+lastestLog);
          res.status(200).json({
            snc:swipNodes.length,
            swipLog:lastestLog,
            swipNodes:swipNodes
          });
        });
      }else{//just give an echo,need not record the log.
        //out put lastestNodeData here
        var node = nidNodeMap[lastestNodeData.nid];
        //console.log('lastestNodeData='+JSON.stringify(node,null,2));
        var cvtLastestNodeData  = cvtNodeData(lastestNodeData,node?node.ptag:'Mac');
        var mocLog = {
          snc:0,
          swipLog:{createdOn:new Date().toISOString(),logContent:'No swip node find.'},
          swipNodes:[],
          lnd:cvtLastestNodeData
        };
        res.status(200).json(mocLog);
      }
    });
  });

};

module.exports.executeSyncTask = function(lid,dataUrl, cb) {
  executeSyncTask(lid,dataUrl,cb);
};

module.exports.synDataTaskCtrl = function(req, res) {
  var lid = req.params.lid;
  var sts = req.params.sts;//switch to status:on,off
  var taskId = req.app.locals.dataSyncTask[lid];
  var location = req.body;
  var dataUrl = dataParser.buildDataUrl(location.datasrc,location.snapcount);
  if(sts == 'on'){
    locDao.updateSynStatus(lid,true);
    //execute immediately one time.
    executeSyncTask(lid,dataUrl);
    if(taskId) clearInterval(taskId);
    taskId = setInterval(
      function(){executeSyncTask(lid,dataUrl);},
      location.synperiod*1000
    );
    req.app.locals.dataSyncTask[lid] = taskId;
  }else if(sts == 'off'){
    locDao.updateSynStatus(lid,false);
    if(taskId) clearInterval(taskId);
    req.app.locals.dataSyncTask[lid] = null;
  }else{
    //just do output.
    sysLogger.info('sts='+sts);
  }
  res.status(200).json(req.app.locals.dataSyncTask[lid]?'running':'stop');
};


module.exports.getNodesData = function(req, res) {
  var lid = req.params.lid;
  var timeRange = getTimeRange(req);
  sysLogger.info('timeRange',JSON.stringify(timeRange,null,2));
  var from = timeRange.from;
  var to = timeRange.to;

  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      sysLogger.error(err);
      res.status(404).json(err);
      return;
    }
    var alertPolicy = nodesInfo.dap;
    var pidNodeMap = nodesInfo.pidNodeMap;

    ndDao.getNodesData(lid,timeRange,function(err,pidDataMap){
      if(err){
        sysLogger.error(err);
        res.status(404).json(err);
        return;
      }
      var nodesData = {};
      var emptyData = getEmptyData(alertPolicy);
      for(var pid in pidNodeMap){
        var node = pidNodeMap[pid];
        //only get installed nodes.
        if(node.nid && node.nid.length > 0){
          var data = pidDataMap[pid];
          nodesData[pid] = doInterpolation(data,emptyData,timeRange);
        }
      }
      res.status(200).json(nodesData);
    });
  });
};


module.exports.getNodeAvgData = function(req, res) {
  var lid = req.params.lid;
  locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
    if(err){
      sysLogger.error(err);
      res.status(406).json(err);
      return;
    }
    var nid = req.params.nid;
    var timeRange = getTimeRange(req);
    sysLogger.info('timeRange',JSON.stringify(timeRange,null,2));
    var from = timeRange.from;
    var to = timeRange.to;

    var fmt = 'YYYY-MM-DD hh:mm a';
    sysLogger.info('getNodeAvgData:from',from,moment(from).toISOString(),moment(from).format(fmt));
    sysLogger.info('getNodeAvgData:to',to,moment(to).toISOString(),moment(to).format(fmt));
    var timeRange = null;
    if(from && to){
      timeRange = {from:from,to:to};
    }

    ndDao.getNodeData(lid,nid,timeRange,function(err,dataList){
      if(err){
        sysLogger.error(err);
        res.status(406).json(err);
      }
      //console.log('getNodeAvgData:dataList',dataList.length,JSON.stringify(dataList,null,2));
      var avgDataList = calcAvgData(dataList,timeRange,dataAlertPolicy);
      //console.log('getNodeAvgData:avgDataList',avgDataList.length,JSON.stringify(avgDataList,null,2));
      //console.log(JSON.stringify(avgDataList,null,2));
      res.status(200).json({dap:dataAlertPolicy,dataList:avgDataList});
    });
  });
};

module.exports.getNodesDataAvg = function(req, res) {
  var lid = req.params.lid;
  var timeRange = getTimeRange(req);
  sysLogger.info('timeRange',JSON.stringify(timeRange,null,2));
  var from = timeRange.from;
  var to = timeRange.to;

  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      sysLogger.error(err);
      res.status(404).json(err);
      return;
    }
    var alertPolicy = nodesInfo.dap;
    var pidNodeMap = nodesInfo.pidNodeMap;

    ndDao.getNodesData(lid,timeRange,function(err,pidDataMap){
      if(err){
        sysLogger.info(err);
        res.status(404).json(err);
        return;
      }
      var nodesData = {};
      var emptyData = getEmptyData(alertPolicy);
      for(var pid in pidNodeMap){
        var node = pidNodeMap[pid];
        //only get installed nodes.
        if(node.nid && node.nid.length > 0){
          var data = pidDataMap[pid];
          if(data){
            var avgDataList = calcAvgData(data,timeRange,alertPolicy);
            nodesData[pid] = avgDataList;
          }
          //nodesData[pid] = doInterpolation(data,emptyData,timeRange);
        }
      }
      res.status(200).json(nodesData);
    });
  });
};


module.exports.getSynDataLog = function(req, res) {
  const lid = req.params.lid;
  const lc = req.params.lc;
  if (lid) {
    //res.render('syn_data_log_graph', {lid:lid});
    llDao.getLocLogList(lid,llDao.logType.dataSync,lc||300,function(err,dataSyncLogList){
      const logData = [];
      for(let slog of dataSyncLogList){
        const logContent = slog.logContent;
        const udc = logContent.substr(logContent.lastIndexOf(':')+1);
        logData.push({dataTime:slog.createdOn,updateCount:+udc});
      }
      //console.log(logData);
      res.status(200).json({logData:logData});
    });
  }
};

module.exports.savePastNodeData = function(req, res) {
  const lid = req.params.lid;
  const cData = req.body.doc;
  //console.log('cData=',cData);
  //ndDao.saveManyNodes(lid,cData,
  // 以lid作为任务名称
  const taskName = lid;
  // 从app中获取长时间任务信息.
  const longTaskInfo = req.app.locals.longTaskInfo;
  longTaskInfo[taskName] = { fc: 0, tc: 100 };

  ndDao.savePastNodeData(lid,cData,
    (err, saveResult)=>{
      if(err) {
        console.error(err);
        res.status(500).json({message: 'server error.'});
        return;
      }
      const tmpObj= {
        ut:saveResult.useTime+'s',
        total:saveResult.totalDataCount,
        new:saveResult.totalAppendCount,
        old:saveResult.totalOldCount,
        replace:saveResult.totalRemoveCount,
        uldn:saveResult.totalAppendCount
      };
      const logContent = dataParser.cvtJsonObj2StrKeyValue(tmpObj);
      //total:35,new:0,old:35,finish:35,uldn:0
      //nodeCount:35,removeCount:249,savedCount:249,useTime:54,fillCount:249
      llDao.recordLocLog(lid,llDao.logType.dataSync,logContent,(err, result)=>{
        if(err) console.error(err);
        res.status(200).json(tmpObj);
      });
      longTaskInfo[taskName] = {finished: true,fc:100,tc:100};
    },
    (processInfo)=> {
      sysLogger.info('processing info:',`${processInfo.finished}/${processInfo.totalNode}...`);
      longTaskInfo[taskName] = {fc:processInfo.finished,tc:processInfo.totalNode};
    }
  );
};
