var moment = require('moment');
var util = require('../../utils/util.js');
var dmt = require('../../utils/data.monitor.task.js');
var mailSender = require('../../utils/mailsender.js');
var du = require('../../app_client/myjs/data_utils.js');

var locDao = require('../dao/locationdao.js');
var ndDao = require('../dao/nodedatadao.js');
var llDao = require('../../app_api/dao/locationlogdao.js');

//create emptyData for Interpolation
function getEmptyData(dap){
  var emptyData = {isSham:true};
  dap.forEach(function(_dap){
    emptyData[_dap.name] = 0;
  });
  return emptyData;
}

function getInitData(dap){
  var emptyData = {DC:0};
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
  var start = moment(from),end = moment(to);
  var dc = end.diff(start,'days');
  var dateRange = [start.format(fmt)];
  do{
    dateRange.push(start.add(1,'d').format(fmt));
  }while(--dc>0);
  return dateRange;
}

function cvtNodeData(nd,ptag){
  //cvtNodeData here:
  var dataInfo = [];
  nd.data.forEach(function(d){
    for(var k in d){
      dataInfo.push(k+':'+d[k]);
    }
  });
  return {
    nid:nd.nid,
    ptag:ptag,//nidNodeMap[nd.nid].ptag,
    dtime:du.iso2Locale(nd.timestampISO),
    data:dataInfo.join(',')
  };
}

function getDataItem(data,dataName){
  for(var i in data){
    var d = data[i];
    for(var pro in d){
      if(pro == dataName)
        return d[pro];
    }
  }
  return null;
}

function doInterpolation(data,emptyData,dataTimeRange){
  //if data is empty,just add to two empty data by from,to
  var iData = [];
  var dl = data?data.length:0;
  if(dl == 0){
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
      if(dist >= 30){//add a data close to dtA;
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

function executeSyncTask(lid,dataUrl){
  //read data from data server
  util.getNodesData(dataUrl,function(err,nodesData){
    //then write data to db:
    ndDao.saveNodesData(lid,nodesData,function(errs,saveRes){
      if(errs.length>0){
        console.log(errs.join('\n'));
      }
      //call fill lastestNodeData here:
      ndDao.fillLastestNodeDataByRaw(lid,nodesData,function(err,updateRes){
        if(err){
          console.error("fillLastestNodeDataByRaw failed:"+err);
          return;
        }
        var logContent = du.simplifyStrKVJSONObj(saveRes)+','+
          du.simplifyStrKVJSONObj(updateRes);
        //console.log('logContent='+logContent);
        llDao.recordLocLog(lid,llDao.logType.dataSync,logContent,function(err,taskLog){
          if(err) console.log(err);
          //check log here：
          //llDao.getLocLogList();
          llDao.getLocLogList(lid, llDao.logType.dataSync, 3, function(err, dataSyncLogList,location) {
            var ucs = [];
            var lastestLogDate = moment(dataSyncLogList[0].createdOn).format('YYYY-MM-DD h:mm a');
            for(let slog of dataSyncLogList) {
              var logContent = slog.logContent;
              var udc = logContent.substr(logContent.lastIndexOf(':') + 1);
              ucs.push(udc=='0'?0:1);
            }
            var ucStr = ucs.join('');
            console.log(`lastestDataSynLogTime ${lastestLogDate},ucStr=${ucStr}.`);
            /*
            mailsender.sendMail({
              recipient: '"goodfriend" <3239048@qq.com>;"tht" <tht@sina.com>;"hongtuan" <hongtuang3@gmail.com>',
              title: `Location:${location.name}'s data info`,
              contentInText: `Location:${location.name} @ ${lastestLogDate} ucStr=${ucStr}`,
              contentInHtml: `<h2>Location:${location.name} @ ${lastestLogDate} ucStr=${ucStr}</h2>`
            },function(){
              console.log('test mail send over.');
            });//*/
            switch(ucStr){
              //case '000':
              case '001':
              case '011':
                console.log(`Location ${location.name} at ${lastestLogDate} around found lost data!`);
                mailSender.sendMail({
                  recipient: '"goodfriend" <3239048@qq.com>;"pgray" <pgray@nighthawkimagingservices.com>;"hongtuan" <hongtuang3@gmail.com>',
                  title: `Location:${location.name}'s data lost!`,
                  contentInText: `Location:${location.name} at ${lastestLogDate} around found data lost!(${ucStr})`,
                  contentInHtml: `<h2>Location:${location.name} at ${lastestLogDate} around found data lost!(${ucStr})</h2>`
                },function(){
                  console.log('data lost mail send over.');
                });
                break;
              case '100':
                console.log(`Location ${location.name} at ${lastestLogDate} around had new data come up!`);
                mailSender.sendMail({
                  recipient: '"goodfriend" <3239048@qq.com>;"pgray" <pgray@nighthawkimagingservices.com>;"hongtuan" <hongtuang3@gmail.com>',
                  title: `Location:${location.name}'s new data come up!`,
                  contentInText: `Location:${location.name} at ${lastestLogDate} around new data come up!(${ucStr})`,
                  contentInHtml: `<h2>Location:${location.name} at ${lastestLogDate} around new data come up!(${ucStr})</h2>`
                },function(){
                  console.log('data come up mail send over.');
                });
                break;
            }
            //add data monitor task here on 9/24 by Tim
            dmt.doDataMonitorTask(lid);
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
    console.log('do tz cvt at:',moment().format('YYYY-MM-DD h:mm:ss a'),'ctzo:',ctzo,'stzo:',stzo);
    console.log('before cvt:from=',from,'to=',to);
    if(ctzo != stzo) {
      console.log('ctzo != stzo,need cvt.');
      //var tzos = getTZOStr(stzo - ctzo);
      var tzos = getTZOStr(ctzo - stzo);
      from = from.replace('Z', tzos);
      to = to.replace('Z', tzos);
      console.log('after cvt:from=',from,'to=',to);
    }else{
      console.log('ctzo == stzo,do not need cvt.');
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

module.exports.readNodesRawData = function(req, res) {
  //console.log('save nodedata here.');
  var url = req.body.url||'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=3';
  //console.info('reading data from['+url+']...');
  util.getNodesData(url,function(dataList){
    res.status(200).json(dataList);
  });
};

module.exports.getNodeData = function(req, res) {
  var lid = req.params.lid;
  locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
    if(err){
      console.log(err);
      res.status(406).json(err);
      return;
    }
    var nid = req.params.nid;
    var timeRange = getTimeRange(req);
    console.log('timeRange',JSON.stringify(timeRange,null,2));
    var from = timeRange.from;
    var to = timeRange.to;
    var fmt = 'YYYY-MM-DD hh:mm a';
    console.log('getNodeData:from',from,moment(from).toISOString(),moment(from).format(fmt));
    console.log('getNodeData:to',from,moment(to).toISOString(),moment(to).format(fmt));
    var timeRange = null;
    if(from && to){
      timeRange = {from:from,to:to};
    }
    ndDao.getNodeData(lid,nid,timeRange,function(err,dataList){
      if(err){
        console.log(err);
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
  var dataUrl = du.buildDataUrl(location.datasrc,Math.ceil(0.1*location.snapcount));
  util.getNodesData(dataUrl,function(err,nodesData){
    if(err){
      console.log(err);
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
          if(err) console.log(err);
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

module.exports.executeSyncTask = function(lid,dataUrl) {
  executeSyncTask(lid,dataUrl);
};

module.exports.synDataTaskCtrl = function(req, res) {
  var lid = req.params.lid;
  var sts = req.params.sts;//switch to status:on,off
  var taskId = req.app.locals.dataSyncTask[lid];
  var location = req.body;
  var dataUrl = du.buildDataUrl(location.datasrc,location.snapcount);
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
    console.log('sts='+sts);
  }
  res.status(200).json(req.app.locals.dataSyncTask[lid]?'running':'stop');
};

//for route call:
module.exports.saveNodesData = function(req, res) {
  var nodesData = req.body.nodeData;
  var lid = req.body.lid;
  ndDao.saveNodesData(lid,nodesData,function(errs,saveRes){
    if(errs.length>0){
      console.log(errs.join('\n'));
    }
    var saveResStr = du.simplifyStrKVJSONObj(saveRes);
    ndDao.updateLastestNodeData(lid,function(err,updateRes){
      if(err){
        console.log(err);
      }
      if(updateRes)
        saveResStr += ','+du.simplifyStrKVJSONObj(updateRes);
      res.status(200).json({info:saveResStr});
    });
  });
};

module.exports.getNodesData = function(req, res) {
  var lid = req.params.lid;
  var timeRange = getTimeRange(req);
  console.log('timeRange',JSON.stringify(timeRange,null,2));
  var from = timeRange.from;
  var to = timeRange.to;

  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      console.log(err);
      res.status(404).json(err);
      return;
    }
    var alertPolicy = nodesInfo.dap;
    var pidNodeMap = nodesInfo.pidNodeMap;

    ndDao.getNodesData(lid,timeRange,function(err,pidDataMap){
      if(err){
        console.log(err);
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
      console.log(err);
      res.status(406).json(err);
      return;
    }
    var nid = req.params.nid;
    var timeRange = getTimeRange(req);
    console.log('timeRange',JSON.stringify(timeRange,null,2));
    var from = timeRange.from;
    var to = timeRange.to;

    var fmt = 'YYYY-MM-DD hh:mm a';
    console.log('getNodeAvgData:from',from,moment(from).toISOString(),moment(from).format(fmt));
    console.log('getNodeAvgData:to',to,moment(to).toISOString(),moment(to).format(fmt));
    var timeRange = null;
    if(from && to){
      timeRange = {from:from,to:to};
    }

    ndDao.getNodeData(lid,nid,timeRange,function(err,dataList){
      if(err){
        console.log(err);
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
  console.log('timeRange',JSON.stringify(timeRange,null,2));
  var from = timeRange.from;
  var to = timeRange.to;

  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      console.log(err);
      res.status(404).json(err);
      return;
    }
    var alertPolicy = nodesInfo.dap;
    var pidNodeMap = nodesInfo.pidNodeMap;

    ndDao.getNodesData(lid,timeRange,function(err,pidDataMap){
      if(err){
        console.log(err);
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
  var lid = req.params.lid;
  var lc = req.params.lc;
  if (lid) {
    //res.render('syn_data_log_graph', {lid:lid});
    llDao.getLocLogList(lid,llDao.logType.dataSync,lc||300,function(err,dataSyncLogList){
      var logData = [];
      for(let slog of dataSyncLogList){
        var logContent = slog.logContent;
        var udc = logContent.substr(logContent.lastIndexOf(':')+1);
        logData.push({dataTime:slog.createdOn,updateCount:+udc});
      }
      //console.log(logData);
      res.status(200).json({logData:logData});
    });
  }
};
