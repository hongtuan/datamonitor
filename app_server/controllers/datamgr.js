var mongoose = require('mongoose');
var locDao = require('../../app_api/dao/locationdao.js');
//var ndDao = require('../../app_api/dao/nodedatadao.js');
var llDao = require('../../app_api/dao/locationlogdao.js');

module.exports.showNodeData = function(req, res) {
  //console.log(req.body);
  var lid = req.params.lid;
  var nid = req.params.nid;
  locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
    if(err){
      console.log(err);
      res.status(406).json(err);
      return;
    }
    //console.log('showNodeData',lid,nid);
    res.render('show_node_data',
      {nid:nid,lid:lid,query:req.query,dap:dataAlertPolicy});
  });
};


module.exports.synDataMgr = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  if (lid) {
    llDao.getLocLogList(lid,llDao.logType.dataSync,300,function(err,dataSyncLogList){
      res.render('syn_data_mgr', {
        lid:lid,
        isTaskRunning:req.app.locals.dataSyncTask[lid]?true:false,
        dataSyncLogList:dataSyncLogList
      });
    });
  }
};

module.exports.inspectNode = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  llDao.getLocLogList(lid,llDao.logType.inspectNode,100,function(err,logList){
    if(err){
      console.error(err);
    }
    res.render('inspect_node', {
      lid:lid,
      logList:logList
    });
  });
};

module.exports.showDataTime = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  res.render('nodes_data_time', {});
};

module.exports.showNodeDataDashboard = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  res.render('nd_dashboard', {});
};

module.exports.showAllData = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  //locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      console.log(err);
      res.status(406).json(err);
      return;
    }
    var installedNodes = {};
    for(var pid in nodesInfo.pidNodeMap){
      var node = nodesInfo.pidNodeMap[pid];
      if(node.nid && node.nid.length > 0){
        installedNodes[pid] = node;
      }
    }
    res.render('nd_alldata', {lid:lid,query:req.query,dap:nodesInfo.dap,pidNodeMap:installedNodes});
  });
};

module.exports.showNodeAvgData = function(req, res) {
  //console.log(req.body);
  var lid = req.params.lid;
  var nid = req.params.nid;
  locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
    if(err){
      console.log(err);
      res.status(406).json(err);
      return;
    }    
    var dapExt = [{name:'DC',desc:'dataCount'},...dataAlertPolicy];
    res.render('node_avg_data',
      {nid:nid,lid:lid,query:req.query,dap:dapExt});
  });
};
