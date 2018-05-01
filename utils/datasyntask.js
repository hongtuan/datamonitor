const locDao = require('../app_api/dao/locationdao.js');
const du = require('../app_client/myjs/data_utils.js');
const nd = require('../app_api/controllers/nodedata.js');

function deploySynTask(location,app){
  const lid = location.id;
  let taskId = app.locals.dataSyncTask[lid];
  const dataUrl = du.buildDataUrl(location.datasrc,location.snapcount);
  console.log(lid,dataUrl,location.synperiod);
  //execute immediately one time.
  setTimeout(function(){
    nd.executeSyncTask(lid,dataUrl);
  },Math.floor(Math.random()*1000));
  // deploy autotask.
  if(taskId) clearInterval(taskId);
  taskId = setInterval(
    function(){nd.executeSyncTask(lid,dataUrl);},
    location.synperiod*1000
  );
  app.locals.dataSyncTask[lid] = taskId;
}

module.exports.deployDataSynTask = function(app){
  locDao.getLocationList(null,30,function(err,rows){
    if(err){
      console.log('getLocationList err:',err);
      return;
    }
    for(let location of rows){
      if(location.isAutoSyn){
        deploySynTask(location,app);
      }
    }
    /*
    rows.forEach(function(location){
      //console.log(location.id,location.isAutoSyn);
      if(location.isAutoSyn){
        deploySynTask(location,app);
      }
    });//*/
  });
};

