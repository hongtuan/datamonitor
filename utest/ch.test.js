const mongoose = require('mongoose');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const async = require('async');

const util = require('../utils/util');
require('../app_api/models/db');
const ndDao = require('../app_api/dao/nodedatadao');
//const NodeData = mongoose.model('NodeData');
//const ch = require('../app_api/controllers/controllerHelper.js');
// const dp = require('../app_api/helper/data.parser.helper');

// const gateWayMac = 'C47F51001099';
// const gateWayMac = '005043c9a3360b70';
// old http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=10
// new  http://xsentry.co/api/v1/sentry/005043c9a337b136/snapshots?top=10
//const gateWayMac = '005043c9a337b136';
const gateWayMac = '005043c9a3360b70';
const rawDataUrl = `http://xsentry.co/api/v1/sentry/${gateWayMac}/snapshots?top=60`;

const date_fmt = 'YYYY-MM-DD HH:mm:ss A';

function fmtStr(timeStr){
  return moment(timeStr).format(date_fmt);
}

function fmt(m){
  return m.format(date_fmt);
}

console.log('test loadPastData...');
const readRawStartTime = moment();
console.log('rawDataUrl=',rawDataUrl);
util.loadPastData(
  rawDataUrl,
  15,
  (err, dataList) => {
    console.log(`read raw data use ${moment().diff(readRawStartTime,'seconds')} seconds`);
    if(err) {
      console.log(err.message);
      return;
    }
    // console.log(dataList);
    if(dataList) {
      console.log(`data count=${dataList.length}.`,
        `min:${fmtStr(dataList[0].timestampISO)},max:${fmtStr(dataList[dataList.length - 1].timestampISO)}`);
    }
  },
  (rawData)=>{
    // console.log('rawData:', JSON.stringify(rawData,null,2));
  },
  (classifiedData)=>{

    //const nidList = _.keys(classifiedData);
    //console.log('nid count=',nidList.length);
    /*
    const ndMap = {};
    _.each(classifiedData, (ndList, nid)=>{
      const sortedList = _.sortBy(ndList,['timestampISO']);
      ndMap[nid] = {
        from: sortedList[0].timestampISO,
        to:sortedList[sortedList.length - 1].timestampISO,
        pdc:sortedList.length
      };
    });//*/
    //const lid = '5b2f3c78f5f24e735e1ae2a6';
    const lid = '5b1ff157a1ed167ed2eb6cab';
    //const nid = '005043c9a337b56a';
    /*
    const queryOption = {
      filter:{
        locid:lid,
        nodeid:''
      },
      select:'locid nodeid collectedOn',
      sort:'collectedOn',
      limit:3
    };//*/
    ndDao.savePastNodeData(lid,classifiedData,(err,result)=>{
      if(err){
        console.error(err);
        return;
      }
      console.log(result);
    });
  }
);
