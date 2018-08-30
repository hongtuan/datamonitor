const util = require('../utils/util');
const moment = require('moment');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
// const gateWayMac = 'C47F51001099';
// const gateWayMac = '005043c9a3360b70';
// old http://xsentry.co/api/v1/sentry/C47F51001099/snapshots?top=10
// new  http://xsentry.co/api/v1/sentry/005043c9a337b136/snapshots?top=10
const gateWayMac = '005043c9a337b136';
// const gateWayMac = 'C47F51016BAC';
const testUrl = `http://xsentry.co/api/v1/sentry/${gateWayMac}/snapshots?top=20`;
console.log(testUrl);
//*
util.getNodesData(testUrl, function (err, dataList) {
  if(err) {
    console.log(err.status);
    return;
  }
  // console.log(dataList);
  if(dataList) {
    //for(data of dataList) {
    //  console.log(JSON.stringify(data, null, 2));
    //}
    console.log('dataList.length=', dataList.length);
    let nids = [];
    for(let data of dataList){
      if(!nids.includes(data.nid)){
        nids.push(data.nid);
      }
    }
    console.log('nids.length=', nids.length);
    const fileName = `./testData/${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
    fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataList, null, 2));
  }
});

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
