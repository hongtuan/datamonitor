require('../app_api/models/db');
var fs = require('fs');
var path = require('path');
var locDao = require('../app_api/dao/locationdao.js');
var lid = '58890bd8b746703db8e4615d';
locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
  if(err){
    console.log(err);
    return;
  }
  var ni = JSON.stringify(nodesInfo,null,2);
  console.log('nodesInfo',ni);
  fs.writeFileSync(path.join(__dirname,'ni.txt'),ni);
  locDao.getLocationData(lid,function(err,locationData){
    if(err){
      console.log(err);
      return;
    }
    var ld = JSON.stringify(locationData,null,2);
    console.log('nodesInfo',ld);
    fs.writeFileSync(path.join(__dirname,'ld.txt'),ld);
    process.exit(0);
  });
});


