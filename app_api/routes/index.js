// JavaScript File
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
router.post('/locations/:lid/loadnd', ctrlLocations.loadNodesData);

router.post('/locations/:lid/savebound', ctrlLocations.saveOneBoundary);
router.post('/locations/upi', ctrlLocations.updatePointInfo);

router.get('/srv/ct', ctrlServerInfo.serverTime);
router.get('/srv/sst', ctrlServerInfo.serverStartTime);

// authentication
router.post('/users/register', ctrlAuth.register);
router.put('/users/update/:uid', ctrlAuth.updateUser);
router.post('/users/login', ctrlAuth.login);
router.get('/users/userlist', ctrlAuth.userList);
router.delete('/users/:uid', ctrlAuth.deleteUser);

//router.get('/nd/getraw',ctrlNodeData.readNodesRawData);
//router.post('/nd/savend',ctrlNodeData.saveNodesData);
router.get('/nd/getnd/:lid/:nid',ctrlNodeData.getNodeData);
router.get('/nd/getavgnd/:lid/:nid',ctrlNodeData.getNodeAvgData);
router.get('/nd/getnsd/:lid',ctrlNodeData.getNodesData);
router.get('/nd/getnsdavg/:lid',ctrlNodeData.getNodesDataAvg);
router.get('/nd/getsdl/:lid/:lc',ctrlNodeData.getSynDataLog);//add @2017-08-09

router.post('/nd/:lid/sdtc/:sts', ctrlNodeData.synDataTaskCtrl);//ok
router.post('/nd/:lid/eint', ctrlNodeData.executeInspectNodeTask);//ok

router.get('/sysinfo', systemInfo.getSystemInfo);
//router.post('/nd/savend',ctrlNodeData.saveNodesData);//ok,but not use anymore.

module.exports = router;
