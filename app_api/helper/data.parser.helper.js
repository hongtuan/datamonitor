
if (typeof(window) === 'undefined') {
  var moment = require('moment');
  var _ = require('lodash');
}

// depend on moment,lodash
function buildDataUrl(gateWayId,snapShotsCount){
  //'http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=3'
  return `http://xsentry.co/api/v1/sentry/${gateWayId}/snapshots?top=${snapShotsCount||3}`;
}

function iso2Locale(isoDateStr){
  //return new Date(isoDateStr).toLocaleString('en-US');
  return moment(isoDateStr).format('YYYY-MM-DD hh:mm:ss A');
}

function cvtJsonObj2StrKeyValue(jsonObj){
  var tmpA = [];
  for(var key in jsonObj){
    tmpA.push(`${key}:${jsonObj[key]}`);
  }
  return tmpA.join(',');
}

/**
 *
 * @param sensorList
 * @returns {Array}
 */
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
  const classifiedData = classifyData(sentryList);
  if(cb) cb(classifiedData);

  const ndList = [];
  _.each(classifiedData, (dataList, nid) => {
    let sortedList = _.sortBy(dataList, ['timestampISO']);//default: asc 1->2
    let tmpList = [];
    for (let item of sortedList) {
      const dist = tmpList.length == 0?timeGap:moment(item.timestampISO)
        .diff(moment(tmpList[tmpList.length - 1].timestampISO), 'minutes');
      // console.log('dist=',dist);
      if (dist >= timeGap) {
        tmpList.push(item);
      }
    }
    //console.log('tmpList.length=', tmpList.length);
    for(let item of tmpList){
      ndList.push(item);
    }
  });
  const sortedList = _.sortBy(ndList,['timestampISO']);
  return sortedList;
}


!function(){
  const dataParser = {};
  dataParser.buildDataUrl = function(gateWayId,snapShotsCount){
    return buildDataUrl(gateWayId,snapShotsCount);
  };
  dataParser.iso2Locale = function(isoDateStr){
    return iso2Locale(isoDateStr);
  };
  dataParser.cvtJsonObj2StrKeyValue = function(jsonObj){
    return cvtJsonObj2StrKeyValue(jsonObj);
  };

  dataParser.getNewData = function(rawData, rcb, ccb){
    return getNewData(rawData, rcb, ccb);
  };
  dataParser.getPastData = function(rawData, timeGap, ccb){
    return getPastData(rawData, timeGap, ccb);
  };
  this.dataParser = dataParser;
}();

if (typeof(window) === 'undefined') {
  module.exports.buildDataUrl = function(gateWayId,snapShotsCount){
    return buildDataUrl(gateWayId,snapShotsCount);
  };
  module.exports.iso2Locale = function(isoDateStr){
    return iso2Locale(isoDateStr);
  };
  module.exports.cvtJsonObj2StrKeyValue = function(jsonObj){
    return cvtJsonObj2StrKeyValue(jsonObj);
  };
  module.exports.getNewData = function (rawData, ccb) {
    return getNewData(rawData, ccb);
  };
  module.exports.getPastData = function (rawData, timeGap, ccb) {
    return getPastData(rawData, timeGap, ccb);
  };
}
