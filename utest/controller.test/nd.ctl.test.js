const _ = require('lodash');
// const moment = require('moment');
const superAgent = require('superagent');

const util = require('../../utils/util');

const gateWayMac = '005043c9a337b136';
const rawDataUrl = `http://xsentry.co/api/v1/sentry/${gateWayMac}/snapshots?top=30`;

console.log('test loadPastData...');
console.log('rawDataUrl=',rawDataUrl);
util.loadPastData(
  rawDataUrl,
  15,
  (err, dataList) => {
    if(err) {
      console.log(err.message);
      return;
    }
    // console.log(dataList);
    if(dataList) {
      console.log(`data count=${dataList.length}.`,
        `min:${dataList[0].timestamp},max:${dataList[dataList.length - 1].timestamp}`);
    }
  },
  (rawData)=>{
    // console.log('rawData:', JSON.stringify(rawData,null,2));
  },
  (classifiedData)=>{
    /*
    const nidList = _.keys(classifiedData);
    console.log('nid count=',nidList.length);
    const ndMap = {};
    _.each(classifiedData, (ndList, nid)=>{
      const sortedList = _.sortBy(ndList,['timestampISO']);
      ndMap[nid] = {
        from: sortedList[0].timestampISO,
        to:sortedList[sortedList.length - 1].timestampISO,
        pdc:sortedList.length
      };
    });//*/
    const lid = '5b1ff157a1ed167ed2eb6cab';
    const apiUrl = `http://127.0.0.1:3000/api/nd/${lid}/save`;
    superAgent.post(apiUrl)
      .send({doc:classifiedData})
      .then(res=>{
        console.log(res.body);
      })
      .catch(err=>{
        console.log(err.message);
      });
  }
);//*/

// const apiUrl = 'http://127.0.0.1:3000/api/sysinfo';
/*
superagent.get(apiUrl)
  .then(res => {
    // res.body, res.headers, res.status
    console.log(res.status, res.body);
  })
  .catch(err => {
    // err.message, err.response
    console.error(err.message);
  });
//*/
