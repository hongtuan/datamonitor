
const _ = require('lodash');
const moment = require('moment');
const superagent = require('superagent');

function iso2Locale(isoDateStr){
  return new Date(isoDateStr).toLocaleString('en-US');
}

function iso2LocaleDate(isoDateStr){
  return new Date(isoDateStr).toLocaleDateString('en-US');
}

function iso2LocaleTime(isoDateStr){
  return new Date(isoDateStr).toLocaleTimeString('en-US');
}

function sortArrayByAttr(array, attr,order) {
  return array.sort(function(a, b) {
    var x = a[attr];
    var y = b[attr];
    //return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    return (order||'asc')=='asc'?
      (((x < y) ? -1 : ((x > y) ? 1 : 0))):
      (((x > y) ? -1 : ((x < y) ? 1 : 0)));
  });
}

/*
function parseSensorsData(sensorList){
  const sda = [];
  for (let sensor of sensorList) {
    const sd = {};
    sd[sensor.id] = sensor.readings[0].value;
    sda.push(sd);
  }
  return sda;
}

function classifyData(sentryList) {
  const classifiedData = {};
  for (let sentry of sentryList) {
    // const nd = {oid:node.oid};
    for (let node of sentry.nodes) {
      let dataTime = node.timestamp.startsWith('000') ? sentry.timestamp : node.timestamp;
      let localeDataTime = dataTime.startsWith('000') ? dataTime : iso2Locale(dataTime);
      const sd = {
        oid: sentry.oid,
        sentryId: sentry.sentryId,
        timestampISO: dataTime,
        timestamp: localeDataTime,
        nid: node.id,
        data: parseSensorsData(node.sensors)
      };
      let ndList = classifiedData[node.id];
      if (ndList) {
        ndList.push(sd);
      } else {
        classifiedData[node.id] = [sd];
      }
    }
  }
  return classifiedData;
}

function getNewData(sentryList, cb){
  const ndList = [];
  const classifiedData = classifyData(sentryList);
  if(cb) cb(classifiedData);
  _.each(classifiedData, (dataList, nid) => {
    let sortedList = _.sortBy(dataList, ['timestampISO']);//default: asc 1->2
    ndList.push(sortedList[sortedList.length - 1]);
  });
  const sortedList = _.sortBy(ndList,['timestampISO']);
  return sortedList;
}

function getPastData(sentryList, timeGap, cb){
  const ndList = [];
  const classifiedData = classifyData(sentryList);
  if(cb) cb(classifiedData);

  _.each(classifiedData, (dataList, nid) => {
    let sortedList = _.sortBy(dataList, ['timestampISO']);//default: asc 1->2
    let tmpList = [sortedList[0]];
    for (let item of sortedList) {
      const dist = moment(item.timestampISO).diff(moment(tmpList[tmpList.length - 1].timestampISO), 'minutes');
      // console.log('dist=',dist);
      if (dist >= timeGap) {
        tmpList.push(item);
      }
    }
    for(let item of tmpList){
      ndList.push(item);
    }
  });
  const sortedList = _.sortBy(ndList,['timestampISO']);
  return sortedList;
}*/

function readRawDataFromUrl(url, cb){
  // console.info('reading data from['+url+']...');
  superagent.get(url).end(function(err, urlContent) {
    let rawData = [];
    if (err) {
      console.error(err.status,err.message);
      if (cb) cb(err, rawData);
      return;
    }
    // try to parse raw data here
    if (typeof urlContent == 'object') {
      try {
        rawData = JSON.parse(urlContent.text);
      } catch (e) {
        console.error(e);
        if (cb) cb(err, rawData);
        return;
      }
      if (cb) cb(null, rawData);
      return;
    }else{
      if (cb) cb({message:`data format error,ur=${url}`}, rawData);
    }
  });
}

function loadNewData(url, cb, rcb, ccb){
  readRawDataFromUrl(url,(err, rawData)=>{
    let dataList = [];
    if(err) {
      if (cb) cb(err,dataList);
      return;
    }
    if(rcb) rcb(rawData);
    //then parse to node data.
    if(Array.isArray(rawData)){
      dataList = getNewData(rawData,ccb);
    }
    //return via cb.
    if(cb) cb(null,dataList);
  });
}

module.exports.loadNewData = function(url, cb, rcb, ccb){
  loadNewData(url, cb, rcb, ccb);
};

function loadPastData(url, timeGap, cb, rcb, ccb){
  readRawDataFromUrl(url,(err, rawData)=>{
    let dataList = [];
    if(err) {
      if (cb) cb(err,dataList);
      return;
    }
    if(rcb) rcb(rawData);
    //then parse to node data.
    if(Array.isArray(rawData)){
      dataList = getPastData(rawData, timeGap, ccb);
    }
    //return via cb.
    if(cb) cb(null,dataList);
  });
}

module.exports.loadPastData = function(url, timeGap, cb, rcb, ccb){
  loadPastData(url, timeGap, cb, rcb, ccb);
};

/*
function parserNodes(nodeArray){
  const sdA = [];
  const ndCache = {};
  for (let item of nodeArray) {
    // const nd = {oid:node.oid};
    for (let node of item.nodes) {
      let dataTime = node.timestamp.startsWith('000')?item.timestamp:node.timestamp;
      let localeDataTime = dataTime.startsWith('000')?dataTime : iso2Locale(dataTime);
      const sd = {
        oid: item.oid,
        sentryId: item.sentryId,
        timestampISO: dataTime,
        timestamp: localeDataTime,
        nid: node.id,
        data: parseSensorsData(node.sensors)
      };
      let nd = ndCache[node.id];
      if (nd) {
        const dist = moment(nd.timestampISO).diff(moment(sd.timestampISO), 'minutes');
        if (dist > 0) {
          ndCache[node.id] = sd;
        }
      }else{
        ndCache[node.id] = sd;
      }
      //sdA.push(sd);
    }
  }

  _.each(ndCache, (value, key) => {
    sdA.push(value);
  });

  // here sort the data by timestampISO
  _.sortBy(sdA, ['timestampISO']);
  return sdA;
}//*/

/*
function parserNodesExt(nodeArray,timeGap){
  const sdA = [];
  const ndCache = {};
  for (let item of nodeArray) {
    // const nd = {oid:node.oid};
    for (let node of item.nodes) {
      let dataTime = node.timestamp.startsWith('000')?item.timestamp:node.timestamp;
      let localeDataTime = dataTime.startsWith('000')?dataTime : iso2Locale(dataTime);
      const sd = {
        oid: item.oid,
        sentryId: item.sentryId,
        timestampISO: dataTime,
        timestamp: localeDataTime,
        nid: node.id,
        data: parseSensorsData(node.sensors)
      };
      let ndList = ndCache[node.id];
      if (ndList) {
        ndList.push(sd);
      }else{
        ndCache[node.id] = [sd];
      }
    }
  }

  _.each(ndCache, (value, key) => {
    // sortDataBy timestampISO
    //console.log('before sort',JSON.stringify(value,null,2));
    //let sortedValue = _.orderBy(value, ['timestampISO'],['asc']);
    let sortedValue = _.sortBy(value, ['timestampISO']);//default: asc 1->2
    // console.log('after sort',JSON.stringify(sortedValue,null,2));
    console.log(key,'data count', sortedValue.length,
      `min:${sortedValue[0].timestamp},max:${sortedValue[sortedValue.length - 1].timestamp}`);
    //const tmpDT = [];
    _.each(sortedValue,(data)=>{
      // tmpDT.push(data.timestampISO);
      console.log(data.timestampISO);
    });

    if(timeGap){
      let fnd = [sortedValue[0]];
      for(let item of sortedValue){
        const dist = moment(item.timestampISO).diff(moment(fnd[fnd.length - 1].timestampISO), 'minutes');
        // console.log('dist=',dist);
        if(dist >= timeGap){
          fnd.push(item);
        }
      }
      _.each(fnd,(data)=>{
        sdA.push(data);
      });
      if(fnd.length<sortedValue.length){
        console.log('find close data',fnd.length,sortedValue.length);
      }
      // console.log('find',fnd.length,'data items.');
    }else{
      sdA.push(sortedValue[sortedValue.length - 1]);
    }
  });
  return sdA;
}//*/

/**
 * get lastest data from an arry.
 **/
function getLastestData(dataList){
  if(Array.isArray(dataList)){
    var tmpData = dataList[0];
    dataList.forEach(function(nd){
      var dataTime = nd.timestampISO?nd.timestampISO:nd.collectedOn;
      var tmpDataTime = tmpData.timestampISO?tmpData.timestampISO:tmpData.collectedOn;
      if(dataTime>tmpDataTime){
        tmpData = nd;
      }
    });
    return tmpData;
  }
}

function simplifyNodesData(nodesData){
  var simplifiedND = [];
  if(Array.isArray(nodesData)){
    var nidList = [];
    //get unique nid list first
    nodesData.forEach(function(nd){
      var nid = nd.nodeid?nd.nodeid:nd.nid;
      if(nidList.indexOf(nid) == -1){
        nidList.push(nid);
        //dataTimeList.push(nd.timestampISO?nd.timestampISO:nd.collectedOn);
      }
    });
    //console.log('nidList.length='+nidList.length);
    //then get each nid's lastestdata.
    for(var i in nidList){
      var uNid = nidList[i];
      var tmpList = [];
      nodesData.forEach(function(nd){
        var nid = nd.nodeid?nd.nodeid:nd.nid;
        if(nid == uNid){
          tmpList.push(nd);
        }
      });
      var lastData = getLastestData(tmpList);
      simplifiedND.push(lastData);
    }
  }
  return simplifiedND;
}

function simplifyStrKVJSONObj(jsonObj){
  var tmpA = [];
  for(var key in jsonObj){
    tmpA.push(`${key}:${jsonObj[key]}`);
  }
  return tmpA.join(',');
}

function getGWIdFromDataUrl(dataUrl){
  //	http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=20
  //var reg = '.*?/sentry/(.*.*?)/.*?';
  var regex = new RegExp('.*?/sentry/(.*.*?)/.*?','g');
  var regMatchRes = regex.exec(dataUrl);
  if(Array.isArray(regMatchRes)){
    return regMatchRes[1];
    //storyContent = regMatchRes.slice(1).join('<br/>');
      //console.log(storyContent);
  }
  return 'notfound';
}

function buildDataUrl(datasrc,snapcount){
  //'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=3'
  return `http://xsentry.co/api/v1/sentry/${datasrc}/snapshots?top=${snapcount||3}`;
}

function createNodeData(td){
  //var nid,data
  var nodeData = {id:td.nid,state:10,typeId:0,sensors:[]};
  var tmpA = td.data.split(',');
  tmpA.forEach(function(item){
    var kva = item.split(':');
    nodeData.sensors.push({id:kva[0],typeId:0,readings:[{value:kva[1]}]});
  });
  //console.log(JSON.stringify(nodeData));
  return {nodes:[nodeData]};
}

/**
* export functions for resuse in server side.
**/
module.exports.iso2Locale = function(isoDateStr){
  return iso2Locale(isoDateStr);
};

module.exports.iso2LocaleDate = function(isoDateStr){
  return iso2LocaleDate(isoDateStr);
};
module.exports.iso2LocaleTime = function(isoDateStr){
  return iso2LocaleTime(isoDateStr);
};

/*
module.exports.getLatestNodeData = function(nodeArray,cb){
  // return parserNodes(nodeArray);
  return getLatestNodeData(nodeArray, cb);
};

module.exports.getNodeData = function(nodeArray, timeGap, cb){
  // return parserNodes(nodeArray);
  return getNodeData(nodeArray, timeGap, cb);
};//*/

/*
module.exports.parserNodes = function(nodeArray){
  // return parserNodes(nodeArray);
  return parserNodesExt(nodeArray,15);
};//*/

module.exports.simplifyNodesData = function(nodesData){
  return simplifyNodesData(nodesData);
};
module.exports.simplifyStrKVJSONObj = function(jsonObj){
  return simplifyStrKVJSONObj(jsonObj);
};

module.exports.getGWIdFromDataUrl = function(dataUrl){
  return getGWIdFromDataUrl(dataUrl);
};

module.exports.buildDataUrl = function(datasrc,snapcount){
  return buildDataUrl(datasrc,snapcount);
};

module.exports.sortArrayByAttr = function(array, attr,order){
  return sortArrayByAttr(array, attr,order);
};


!function(){
  var du = {};
  du.iso2Locale = function(isoDateStr){
    return iso2Locale(isoDateStr);
  };
  du.iso2LocaleDate = function(isoDateStr){
    return iso2LocaleDate(isoDateStr);
  };
  du.parserNodes = function(nodeArray){
    return parserNodes(nodeArray);
  };
  du.simplifyNodesData = function(nodesData){
    return simplifyNodesData(nodesData);
  };
  du.simplifyStrKVJSONObj = function(jsonObj){
    return simplifyStrKVJSONObj(jsonObj);
  };

  du.getGWIdFromDataUrl = function(dataUrl){
    return getGWIdFromDataUrl(dataUrl);
  };

  du.buildDataUrl = function(datasrc,snapcount){
    return buildDataUrl(datasrc,snapcount);
  };

  du.sortArrayByAttr = function(array, attr,order){
    return sortArrayByAttr(array, attr,order);
  };
  du.loadNewData = function(url, cb, rcb, ccb){
    loadNewData(url, cb, rcb, ccb);
  };
  du.loadPastData = function(url, timeGap, cb, rcb, ccb){
    loadPastData(url, timeGap, cb, rcb, ccb);
  };
  this.du = du;
}();
