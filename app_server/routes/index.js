var express = require('express');
var router = express.Router();
var ctrlLocations = require('../controllers/locations');
var ctrlBoundaries = require('../controllers/boundaries');
var ctrlDataMgr = require('../controllers/datamgr');
//var ctrlSpider = require('../controllers/spider');

/* Locations pages */
router.get('/', ctrlLocations.showIndex);
router.get('/my-app', ctrlLocations.showApp);

//router.get('/locations/list', ctrlLocations.showList);
//router.get('/locations/add', ctrlLocations.add);
//router.post('/locations/save', ctrlLocations.save);
//router.get('/locations/edit/:lid', ctrlLocations.edit);
//router.get('/locations/:lid', ctrlLocations.deleteOne);

//router.post('/locations/:lid/uc', ctrlLocations.updateCenter);
router.get('/locations/:lid/ic', ctrlLocations.inputCenter);
router.get('/locations/:lid/efn', ctrlLocations.expFreeNode);
router.get('/locations/:lid/ifp', ctrlLocations.impFile);
router.post('/locations/ifn', ctrlLocations.impFreeNode);
router.get('/locations/calcfee', ctrlLocations.calcFee);

//router.post('/locations/:lid/ua', ctrlLocations.updateAlertpolices);

//router.get('/locations/:lid/lc', ctrlLocations.getLocationContent);

router.get('/locations/:lid/editbound', ctrlBoundaries.edit);
router.get('/locations/:lid/viewbound', ctrlBoundaries.view);

//router.get('/locations/:lid/filltd', ctrlBoundaries.fillTestData);
router.get('/locations/:lid/mgr/:bid/:pid', ctrlLocations.mgrPointInfo);
//router.post('/locations/savepi', ctrlLocations.savePointInfo);
//router.post('/locations/:lid/loadtd', ctrlBoundaries.loadTestData);
//router.post('/locations/:lid/loadnd', ctrlBoundaries.loadNodesData);
router.get('/locations/explist/:lids', ctrlLocations.expLocationList);

//router.post('/locations/:lid/savebound', ctrlBoundaries.saveOneBoundary);
router.get('/locations/vnd/:nid', ctrlBoundaries.viewNodeData);
router.get('/locations/:lid/ebc/:bid', ctrlBoundaries.expBoundaryContent);

router.post('/locations/:lid/ibc/:bid', ctrlBoundaries.impBoundaryContent);

router.get('/locations/:lid/ibdp/:bid', ctrlBoundaries.impBoundaryDataPage);

router.get('/dm/:lid/in', ctrlDataMgr.inspectNode);//ok
router.get('/dm/:lid/sdmgr', ctrlDataMgr.synDataMgr);//ok
router.get('/dm/:lid/sdlg', ctrlDataMgr.synDataLogGraph);//ok

router.get('/dm/vnd/:lid/:nid',ctrlDataMgr.showNodeData);//ok
router.get('/dm/sdt/:lid',ctrlDataMgr.showDataTime);//ok
router.get('/dm/sndd/:lid',ctrlDataMgr.showNodeDataDashboard);//ok
router.get('/dm/ad/:lid',ctrlDataMgr.showAllData);//ok
router.get('/dm/adavg/:lid',ctrlDataMgr.showAllDataAvg);//ok

router.get('/dm/nad/:lid/:nid',ctrlDataMgr.showNodeAvgData);//ok

//router.post('/data/:lid/eint', ctrlDataMgr.executeInspectNodeTask);//mv

//router.post('/data/:lid/sdtc/:sts', ctrlDataMgr.synDataTaskCtrl);//mv

//router.get('/data/getraw',ctrlDataMgr.readNodesRawData);

//router.post('/data/savend',ctrlDataMgr.saveNodesData);//mv

//router.get('/data/gnd/:lid',ctrlDataMgr.getNodesDataInLocation);//mv

//router.get('/locations/:lid/boundary', ctrlBoundaries.readLocationInfo);

//router.post('/ps/index',ctrlSpider.indexTest);

module.exports = router;
