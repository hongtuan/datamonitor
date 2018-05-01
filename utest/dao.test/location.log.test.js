require('../../app_api/models/db');
const location_log_dao = require('../../app_api/dao/locationlogdao');
const lid = '58890bd8b746703db8e4615d';
const logType = 'dataSync';
location_log_dao.getLocLogList(lid,logType,3, function (err, lastestLogList,location) {
  if(err){
    console.log(err);
    return;
  }
  console.log(lastestLogList,lastestLogList.length);
  process.exit(0);
});

