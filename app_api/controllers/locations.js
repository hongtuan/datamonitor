
var locDao = require('../dao/locationdao.js');
var userDao = require('../dao/userdao.js');

//var du = require('../../app_client/myjs/data_utils.js');
var util = require('../../utils/util.js');

module.exports.create = function(req, res) {
  //console.log('req.body='+JSON.stringify(req.body));
  //console.log('req.body='+req.body);
  locDao.createLocation(req.body,function(err,location){
    if (err) {
      console.log(err);
      res.status(406).json(err);
      return;
    }
    var userInfo = req.body.userInfo;
    //console.log('userInfo',JSON.stringify(userInfo,null,2));
    if(userInfo && userInfo.role!='root' && location!=null){
      //fill lid to user here
      userDao.appendLoc2User(location._id,userInfo.uid,function(err,user){
        if(err){
          console.error(err);
          return;
        }
        //console.log('appendLoc2User ok');
      });
    }
    res.status(201).json(location);
  });
};

module.exports.showList = function(req, res) {
  var filter = null;
  //console.log('req.body='+JSON.stringify(req.body,null,2));
  var userInfo = req.body;
  if(userInfo && userInfo.role != 'root'){
    //for not root user,filter location.
    userDao.getUserLocList(userInfo.uid,function(err,locList){
      if(err){
        console.error(err);
        res.status(400).json(err);
      }
      //console.log('locList=',JSON.stringify(locList,null,2));
      filter = {_id:{$in:locList},status:1};
      locDao.getLocationList(filter,20,function(err,rows){
        if (err) {
          console.log(err);
          res.status(400).json(err);
        }
        res.status(200).json(rows);
      });
    });
    return;
  }
  locDao.getLocationList(filter,20,function(err,rows){
    if (err) {
      console.log(err);
      res.status(400).json(err);
    }
    res.status(200).json(rows);
  });
};

module.exports.updateOne = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  locDao.updateLocation(req.params.lid,req.body,function(err,location){
    if (err) {
      console.log(err);
      res.status(406).json('update failed:'+err);
    }
    res.status(200).json(location);
  });
};

module.exports.deleteOne = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.removeLocation(lid,function(err,lid){
    if (err) {
      console.log(err);
      //res.status(404).json(err);
      res.status(500).json('location remove failed.'+err);
    }
    res.status(200).json(lid);
  });
};

module.exports.readOne = function(req, res) {
  //console.log('api controllers.readOne===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.getLocationBaseInfo(lid,function(err,location){
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    res.status(200).json(location);
  });
};

module.exports.getLocationContent = function(req, res) {
  var lid = req.params.lid;
  locDao.getLocationContent(lid,function(err,locationContent){
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    res.status(200).json(locationContent);
  });
};

module.exports.getLocationData = function(req, res) {
  var lid = req.params.lid;
  locDao.getLocationData(lid,function(err,locationData){
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    //console.log('locationData',JSON.stringify(locationData,null,2));
    res.status(200).json(locationData);
  });
};

module.exports.getLocInfo4Boundary = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.getLocationBaseInfo(lid,function(err,location){
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    res.status(200).json(location);
  });
};


module.exports.updateCenter = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  //console.log('api controllers===req.body='+JSON.stringify(req.body));
  var lid = req.params.lid;
  //locDao.updateLocCenter(lid,req.body.ctLatLng,function(err,location){
  var centerInfo = req.body;
  locDao.updateLocCenter(lid,centerInfo,function(err,location){
    if(err){
      console.error(err);
      res.status(500).json(err);
    }
    //res.status(200).json(location);
    res.status(200).json('UpdateCenter successful.');
  });
};

module.exports.saveFreeNodes = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  //console.log('api controllers===req.body='+JSON.stringify(req.body));
  var lid = req.params.lid;
  var fnData = req.body.fnData;
  //console.log('in controllers fnData=',fnData);
  locDao.saveFreeNodes(lid,fnData,function(err,freeNodes){
    if(err){
      console.error(err);
      res.status(500).json(err);
    }
    //res.status(200).json(location);
    res.status(200).json('Save Free nodes successful.');
  });
};


module.exports.updateAlertpolices = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.updateAlertpolices(lid,
    //JSON.stringify(JSON.parse(req.body.alertpolices)),function(err,location){
    req.body.alertpolices,function(err,location){
      if(err){
        console.error(err);
        res.status(500).json(err);
      }
      //res.status(200).json(location);
      //res.status(200).json(util.jsonMsg('updateAlertpolices successful.'));
      res.status(200).json('updateAlertpolices successful.');
    }
  );
};


module.exports.saveOneBoundary = function(req, res) {
  //console.log('api controllers===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.saveOneBoundary(lid,req.body,function(err,savedBoundary){
    if(err){
      console.error(err);
      res.status(500).json(err);
    }
    //res.status(200).json(savedBoundary);
    //res.json(util.jsonMsg('save successful.'));
    res.json('Save successful.');
  });
};

/*
module.exports.getPointInfo = function(req, res) {
  //console.log('In api controllers getPointInfo:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  var bid = req.params.bid;
  var pid = req.params.pid;
  locDao.getPointInfo(lid,bid,pid,function(err,point){
    if (err) {
      console.log(err);
      res.status(404).json(err);
      return;
    }
    res.status(200).json(point);
  });
};//*/

//*
module.exports.updatePointInfo = function(req, res) {
  //console.log('In api controllers:req.params.lid='+req.body.lid);
  var point = req.body;
  locDao.updatePointInfo(point,function(err,savedPoint){
    if(err){
      console.error(err);
      res.status(500).json(err);
      return;
    }
    //console.log(JSON.stringify(savedPoint,null,2));
    //res.status(200).json(savedPoint);
    res.status(200).json('Node update successful.');
  });
};//*/

//2016.11.05 add new method,just load nodes data,need not query in from db.
module.exports.loadNodesData = function(req, res) {
  //console.log('api:loadNodesData req.params.lid='+req.params.lid);
  util.getNodesData(req.body.dataurl,function(sdA){
    res.status(200).json(sdA);
  });
};

module.exports.updateBoundaryName = function(req, res) {
  //console.log('api:loadNodesData req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  var bid = req.params.bid;
  var newName = req.params.nn;
  //console.log(lid,bid,newName);
  locDao.updateBoundaryName(lid,bid,newName,function(err,updateRes){
    if(err){
      console.error(err);
      return;
    }
    res.status(200).json(updateRes);
  });
};

module.exports.deleteBoundary = function(req, res) {
  //console.log('api:loadNodesData req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  var bid = req.params.bid;
  //console.log(lid,bid);
  locDao.deleteBoundary(lid,bid,function(err,deleteRes){
    if(err){
      console.error(err);
      return;
    }
    res.status(200).json(deleteRes);
  });
};

