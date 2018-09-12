/**
 *
 *
 * 5b1ff157a1ed167ed2eb6cab
 * db.getCollection('nodedatas').find({collectedOn:{$gt:ISODate("2018-08-31T22:12:45.581Z"),$lt:ISODate("2018-09-03T22:12:45.581Z")}})
 * db.getCollection('nodedatas').find({ lid: '5b1ff157a1ed167ed2eb6cab', nid: '005043c9a3361948' });
 */
const moment = require('moment');
const _ = require('lodash');
const async = require('async');
require('../../app_api/models/db');
const nodeDataDao = require('../../app_api/dao/nodedatadao');
const util = require('../../utils/util');
const gateWayMac = '005043c9a337b136';
// const gateWayMac = 'C47F51016BAC';
const testUrl = `http://xsentry.co/api/v1/sentry/${gateWayMac}/snapshots?top=3`;
console.log(testUrl);
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
      //process.exit(0);
      //const fileName = `./testData/${gateWayMac}_${moment().format('YYYYMMDDHHmm')}.json`;
      //fs.writeFileSync(path.join(__dirname, fileName),JSON.stringify(dataList, null, 2));
    }
  },
  (rawData)=>{
    // console.log('rawData:', JSON.stringify(rawData,null,2));
  },
  (classifiedData)=>{
    const lid = '5b1ff157a1ed167ed2eb6cab';
    console.log('lid=',lid);
    const ndMap = {};
    //let lwi = layer.load();
    _.each(classifiedData, (ndList, nid)=>{
      const sortedList = _.sortBy(ndList,['timestampISO']);
      ndMap[nid] = {
        from: sortedList[0].timestampISO,
        to:sortedList[sortedList.length - 1].timestampISO,
        pdc:sortedList.length
      };
    });

    nodeDataDao.compareManyNodes(lid,ndMap,(err, result)=>{
      if(err) {
        console.error(err);
        //res.status(500).json({message: 'server error.'});
        return;
      }
      console.log(JSON.stringify(result,null,2));
      process.exit(0);
      //res.status(200).json(result);
    },(processInfo)=>{
      console.log('processing info:',`${processInfo.finished}/${processInfo.totalNode}...`);
    });

    /*
    nodeDataDao.saveManyNodes(lid,classifiedData,(err,saveResult)=>{
      if(err){
        console.err(err);
        return;
      }
      console.log('saveResult=',JSON.stringify(saveResult,null,2));
      process.exit(0);
    },(processInfo)=>{
      //console.log('processing info:',JSON.stringify(processInfo,null,2));
      console.log('processing info:',`${processInfo.finished}/${processInfo.totalNode}...`);
    });//*/
  }
);

/*
const lid = '5b1ff157a1ed167ed2eb6cab';
const nid = '005043c9a3361948';
//const timeRange = {from:moment('2018-09-02T00:57:48Z'),to:moment('2018-09-03T00:59:43Z')};
const timeRange = {from:'2018-08-02T10:57:48Z',to:'2018-08-02T22:59:43Z'};

nodeDataDao.removeNodeData(lid,nid,timeRange,(err,deleteCount)=>{
  if(err){
    console.log(err);
    process.exit(0);
  }
  console.log('deleteCount=',deleteCount);
  process.exit(0);
});//*/


