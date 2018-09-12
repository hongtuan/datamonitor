
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const util = require('../utils/util');
// const dp = require('../app_api/helper/data.parser.helper');

// const gateWayMac = 'C47F51001099';
// const gateWayMac = '005043c9a3360b70';
// old http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=10
// new  http://xsentry.co/api/v1/sentry/005043c9a337b136/snapshots?top=10
const gateWayMac = '005043c9a337b136';
// const gateWayMac = 'C47F51016BAC';
const testUrl = `http://xsentry.co/api/v1/sentry/${gateWayMac}/snapshots?top=3`;
console.log(testUrl);
/*
console.log('test loadNewData...');
util.loadNewData(
  testUrl,
  (err, dataList)=>{
    if(err) {
      console.log(err.message);
      return;
    }
    //console.log('dataList',dataList);
    if(dataList) {
      const nidList = [];
      for(let data of dataList){
        if(!nidList.includes(data.nid)){
          nidList.push(data.nid);
        }
      }
      console.log(`nid count=${nidList.length},data count=${dataList.length}.`,
        `min:${dataList[0].timestamp},max:${dataList[dataList.length - 1].timestamp}`);
      const fileName = `./testData/${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
      fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataList, null, 2));
    }
  },
  (rawData)=>{
    //console.log(JSON.stringify(rawData,null,2));
  }
);//*/

//*
console.log('test loadPastData...');
util.loadPastData(
  testUrl,
  15,
  (err, dataList) => {
    if(err) {
      console.log(err.message);
      return;
    }
    // console.log(dataList);
    if(dataList) {
      const nidList = [];
      for(let data of dataList){
        if(!nidList.includes(data.nid)){
          nidList.push(data.nid);
        }
      }
      console.log(`nid count=${nidList.length},data count=${dataList.length}.`,
        `min:${dataList[0].timestamp},max:${dataList[dataList.length - 1].timestamp}`);
      const fileName = `./testData/${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
      fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataList, null, 2));
    }
  },
  (rawData)=>{
    // console.log('rawData:', JSON.stringify(rawData,null,2));
  },
  (classifiedData)=>{
    // console.log('classifiedData:', JSON.stringify(classifiedData,null,2));
  }
);//*/

/*
console.log('test loadNewData...');
du.loadNewData(
  testUrl,
  (err, dataList) => {
    if(err) {
      console.log(err.message);
      return;
    }
    // console.log(dataList);
    if(dataList) {
      const nidList = [];
      for(let data of dataList){
        if(!nidList.includes(data.nid)){
          nidList.push(data.nid);
        }
      }
      console.log(`nid count=${nidList.length},data count=${dataList.length}.`,
        `min:${dataList[0].timestamp},max:${dataList[dataList.length - 1].timestamp}`);
      const fileName = `./testData/${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
      fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataList, null, 2));
    }
  },
  (rawData)=>{
    // console.log('rawData:', JSON.stringify(rawData,null,2));
  },
  (classifiedData)=>{
    //console.log('classifiedData:', JSON.stringify(classifiedData,null,2));
  }
);

//*/
/*
util.getUrlContent(testUrl, function (err, content) {
  if(err) {
    console.log(err.status);
    return;
  }
  if (content && _.isObject(content)) {
    // if(typeof urlContent == 'object'){
    const fileName = `./testData/raw_${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
    const dataObj = JSON.parse(content.text);
    fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataObj, null, 2));
  }
});//*/
