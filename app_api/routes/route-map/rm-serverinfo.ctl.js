const controller = require('../../controllers/serverinfo');
module.exports.routeConfig = {
  '/srv/':[
    {'ct':{get: controller.serverTime}},
    {'sst':{get: controller.serverStartTime}},
  ]
};

//router.get('/srv/ct', ctrlServerInfo.serverTime);
//router.get('/srv/sst', ctrlServerInfo.serverStartTime);
