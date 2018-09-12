const controller = require('../../controllers/systeminfo');
module.exports.routeConfig = {
  '/sysinfo/':[
    {'':{get: controller.getSystemInfo}},
    {'glti/:taskName':{get: controller.getLongTaskInfo}},
  ]
};

//router.get('/sysinfo', systemInfo.getSystemInfo);
//router.get('/sysinfo/glti/:taskName', systemInfo.getLongTaskInfo);
