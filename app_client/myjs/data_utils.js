const _ = require('lodash');
const moment = require('moment');
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


function parserNodeData(ndList){
  const sda = [];
  for (let item of ndList) {
    const sd = {};
    sd[item.id] = item.readings[0].value;
    sda.push(sd);
  }
  return sda;
  /*
  var sda = [];
  for(var i in joa){
    var sd = {
      //typeId:joa[i].typeId,
      //timestamp:joa[i].readings[0].timestamp.startsWith('000')?joa[i].readings[0].timestamp:iso2Locale(joa[i].readings[0].timestamp),
    };
    sd[joa[i].id] = joa[i].readings[0].value;
    sda.push(sd);
  }
  return sda;//*/
}

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
        data: parserNodeData(node.sensors)
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
}

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

module.exports.parserNodes = function(nodeArray){
  return parserNodes(nodeArray);
};
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
