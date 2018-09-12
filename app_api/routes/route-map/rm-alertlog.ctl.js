const controller = require('../../controllers/alertlog.ctl');
module.exports.routeConfig = {
  '/al/':[
    {':lid/:lr':{get: controller.getAlertLog}},
  ]
};

//router.get('/al/:lid/:lr', ctrlAlertLog.getAlertLog);
