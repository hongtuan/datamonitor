// JavaScript File
/*
var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});


var ctrlLocations = require('../controllers/locations');
var ctrlNodeData = require('../controllers/nodedata');
var ctrlServerInfo = require('../controllers/serverinfo');
var ctrlAuth = require('../controllers/authentication');

var systemInfo = require('../controllers/systeminfo');
var fileLoader = require('../controllers/file.loader');
var ctrlAlertLog = require('../controllers/alertlog.ctl');
//*/
/*
router.get('/locations', ctrlLocations.showList);
router.post('/userloclist', ctrlLocations.showList);
router.post('/locations', ctrlLocations.create);
router.get('/locations/edit/:lid', ctrlLocations.readOne);
router.put('/locations/edit/:lid', ctrlLocations.updateOne);

router.get('/locations/:lid/gl4b', ctrlLocations.getLocInfo4Boundary);

router.delete('/locations/:lid', ctrlLocations.deleteOne);

router.post('/locations/:lid/uc', ctrlLocations.updateCenter);
router.post('/locations/:lid/ua', ctrlLocations.updateAlertpolices);

router.post('/locations/:lid/sfn', ctrlLocations.saveFreeNodes);

router.get('/locations/:lid/ubn/:bid/:nn', ctrlLocations.updateBoundaryName);
router.get('/locations/:lid/delb/:bid', ctrlLocations.deleteBoundary);
//router.get('/locations/:lid/lc', ctrlLocations.getLocationContent);
router.get('/locations/:lid/ld', ctrlLocations.getLocationData);

//router.get('/locations/:lid/filltd', ctrlLocations.fillTestData);
//router.post('/locations/:lid/loadtd', ctrlLocations.loadTestData);
// router.post('/locations/:lid/loadnd', ctrlLocations.loadNodesData);

router.post('/locations/:lid/savebound', ctrlLocations.saveOneBoundary);
router.post('/locations/upi', ctrlLocations.updatePointInfo);
//*/
/*
router.get('/srv/ct', ctrlServerInfo.serverTime);
router.get('/srv/sst', ctrlServerInfo.serverStartTime);//*/

/*/ authentication
router.post('/users/register', ctrlAuth.register);
router.put('/users/update/:uid', ctrlAuth.updateUser);
router.post('/users/login', ctrlAuth.login);
router.get('/users/userlist', ctrlAuth.userList);
router.delete('/users/:uid', ctrlAuth.deleteUser);
router.post('/users/:uid', ctrlAuth.updateLocList);//*/

//--router.get('/nd/getraw',ctrlNodeData.readNodesRawData);
//--router.post('/nd/savend',ctrlNodeData.saveNodesData);

/*
router.get('/nd/getnd/:lid/:nid',ctrlNodeData.getNodeData);
router.get('/nd/getavgnd/:lid/:nid',ctrlNodeData.getNodeAvgData);
router.get('/nd/getnsd/:lid',ctrlNodeData.getNodesData);
router.get('/nd/getnsdavg/:lid',ctrlNodeData.getNodesDataAvg);
router.get('/nd/getsdl/:lid/:lc',ctrlNodeData.getSynDataLog);//add @2017-08-09

router.post('/nd/:lid/sdtc/:sts', ctrlNodeData.synDataTaskCtrl);//ok
router.post('/nd/:lid/eint', ctrlNodeData.executeInspectNodeTask);//ok
router.post('/nd/:lid/save', ctrlNodeData.savePastNodeData);//ok
// router.post('/nd/:lid/comp', ctrlNodeData.comparePastData);//ok
//*/
/*
router.get('/sysinfo', systemInfo.getSystemInfo);
router.get('/sysinfo/glti/:taskName', systemInfo.getLongTaskInfo);//*/

//router.get('/fl', fileLoader.loadFile);

//router.get('/al/:lid/:lr', ctrlAlertLog.getAlertLog);

//router.post('/nd/savend',ctrlNodeData.saveNodesData);//ok,but not use anymore.

// module.exports = router;

const express = require('express');
const router = express.Router();
const requireAll = require('require-all');
const path = require('path');
const _ = require('lodash');


// const tokenUtil = require('../common/util/apiTokenUtil');
// const patienttokenUtil = require('../../utils/patient.token.util');
const webTokenUtil = require('../common/util/apiWebTokenUtil');

const commonFilterConfig = {
  /*
  'commonFilter1': tokenUtil.verifyToken,
  'commonFilter2': tokenUtil.jhGridQueryFilter,
  'commonFilter3': tokenUtil.packQueryFilter,
  'commonFilter4': patienttokenUtil.verifyToken,//*/
  'webFilter': webTokenUtil.verifyToken,
};

const routeConfigList = requireAll({
  dirname: path.join(__dirname, './route-map/'),
  filter: /rm\-(.+)\.js$/
});
// console.log('routeConfigList=', routeConfigList);
function appendRoute(route,map){
  _.forEach(map,function(action, method){
    if(_.isFunction(action)){
      // console.log(`method=${method},route=${route},action=...`);
      router[method](route, action);
    }
    if(_.isArray(action)){
      const len = action.length;
      if(len === 1 && _.isFunction(action[0])){
        router[method](route, action);
      }else if(len > 1){
        const tmpA = _.slice(action,0,len-1);
        const handler = action[len-1];
        const filters = [];
        const authorities = [];
        _.forEach(tmpA,function (item) {
          //处理通用过滤器
          if(_.isString(item)){
            filters.push(commonFilterConfig[item]);
          }
          //处理自定义的过滤器
          if(_.isFunction(item)){
            filters.push(item);
          }
          //处理权限
          if(_.isNumber(item)){
            authorities.push(item);
          }
        });
        // TO-DO authorities 后续使用
        if(!_.isEmpty(authorities)){
          console.log(authorities);
        }
        if(!_.isEmpty(filters)){
          //console.log(`method=${method},filters=...,route=${route},action=...`);
          router[method](route, filters, handler);
        }else{
          //console.log(`method=${method},route=${route},action=...`);
          router[method](route, handler);
        }
      }
    }
  });
}

/**
 * 配置控制器
 */
(function configRoute(map,configName) {
  let routeConfig = {};
  _.forEach(map,function(value,key){
    //_.mergeWith(routeConfig,value[configName||'routeConfig']);
    _.merge(routeConfig,value[configName||'routeConfig']);
  });
  //console.log('routeConfig=', routeConfig);

  _.forEach(routeConfig, function (value, key) {
    if (_.isArray(value)){
      // 迭代数组
      _.forEach(value,function (_map) {
        //迭代数值中的map
        _.forEach(_map,function(_value,_key){
          appendRoute(key+_key,_value);
        });
      });
    } else {
      appendRoute(key,value);
    }
  });
})(routeConfigList);

module.exports = router;
