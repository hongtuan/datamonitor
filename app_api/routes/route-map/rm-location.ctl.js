const controller  = require('../../controllers/locations');
module.exports.routeConfig = {
  '/locations/': [
    //{'': {get: controller.showList}}, no use.
    {'ull': {post: controller.showList}},
    {'create': {post: controller.create}},
    {'edit/:lid': {post: controller.readOne}},
    {'edit/:lid': {put: controller.updateOne}},
    {':lid/gl4b': {get: controller.getLocInfo4Boundary}},
    {':lid': {delete: controller.deleteOne}},
    {':lid/uc': {post: controller.updateCenter}},
    {':lid/ua': {post: controller.updateAlertpolices}},
    {':lid/sfn': {post: controller.saveFreeNodes}},
    {':lid/ubn/:bid/:nn': {get: controller.updateBoundaryName}},
    {':lid/delb/:bid': {get: controller.deleteBoundary}},
    {':lid/ld': {get: controller.getLocationData}},
    {':lid/savebound': {post: controller.saveOneBoundary}},
    {'upi': {post: controller.updatePointInfo}},
  ]
};

/*
*
*
//router.get('/locations', ctrlLocations.showList);
//? router.post('/userloclist', ctrlLocations.showList);ok
//router.post('/locations', ctrlLocations.create);
//router.get('/locations/edit/:lid', ctrlLocations.readOne);
//router.put('/locations/edit/:lid', ctrlLocations.updateOne);

//router.get('/locations/:lid/gl4b', ctrlLocations.getLocInfo4Boundary);

//router.delete('/locations/:lid', ctrlLocations.deleteOne);

//router.post('/locations/:lid/uc', ctrlLocations.updateCenter);
//router.post('/locations/:lid/ua', ctrlLocations.updateAlertpolices);

//router.post('/locations/:lid/sfn', ctrlLocations.saveFreeNodes);

//router.get('/locations/:lid/ubn/:bid/:nn', ctrlLocations.updateBoundaryName);
//router.get('/locations/:lid/delb/:bid', ctrlLocations.deleteBoundary);
//--router.get('/locations/:lid/lc', ctrlLocations.getLocationContent);
router.get('/locations/:lid/ld', ctrlLocations.getLocationData);

//--router.get('/locations/:lid/filltd', ctrlLocations.fillTestData);
//--router.post('/locations/:lid/loadtd', ctrlLocations.loadTestData);
//-- router.post('/locations/:lid/loadnd', ctrlLocations.loadNodesData);

//router.post('/locations/:lid/savebound', ctrlLocations.saveOneBoundary);
//router.post('/locations/upi', ctrlLocations.updatePointInfo);

* */
