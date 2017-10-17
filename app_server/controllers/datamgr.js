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
    }
    //console.log('showNodeData',lid,nid);
    res.render('show_node_data',
      {nid:nid,lid:lid,query:req.query,dap:dataAlertPolicy,
          serverTimezoneOffset:req.app.locals.serverTimezoneOffset});
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

module.exports.synDataLogGraph = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  if (lid) {
    res.render('syn_data_log_graph', {lid:lid});
  }
};

module.exports.inspectNode = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  llDao.getLocLogList(lid,llDao.logType.inspectNode,100,function(err,logList){
    if(err){
      console.error(err);
      res.status(500).json(err);
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
    //var insta
    var installedNodes = [];
    for(var pid in nodesInfo.pidNodeMap){
      var node = nodesInfo.pidNodeMap[pid];
      if(node.nid && node.nid.length > 0){
        installedNodes.push({ptag:node.ptag,pid:pid});//[pid] = node;
      }
    }
    //sort installedNodes by ptag
    installedNodes.sort(function (a, b) {
      if (a.ptag > b.ptag) {
        return 1;
      }
      if (a.ptag < b.ptag) {
        return -1;
      }
      // a 必须等于 b
      return 0;
    });
    //add newline here.
    for(var i=0;i<installedNodes.length-1;i++){
      var node = installedNodes[i],nextNode = installedNodes[i+1];
      if(node.ptag.charAt(0)!=nextNode.ptag.charAt(0)){
        node['newline'] = true;
      }
    }
    res.render('nd_alldata', {lid:lid,query:req.query,dap:nodesInfo.dap,
      installedNodes:installedNodes,
      serverTimezoneOffset:req.app.locals.serverTimezoneOffset});
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
      {nid:nid,lid:lid,query:req.query,dap:dapExt,
          serverTimezoneOffset:req.app.locals.serverTimezoneOffset});
  });
};


module.exports.showAllDataAvg = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  //locDao.getDataAlertPolicy(lid,function(err,dataAlertPolicy){
  locDao.getNodesInfoInLocation(lid,function(err,nodesInfo){
    if(err){
      console.log(err);
      res.status(406).json(err);
      return;
    }
    //var insta
    var installedNodes = [];
    for(var pid in nodesInfo.pidNodeMap){
      var node = nodesInfo.pidNodeMap[pid];
      if(node.nid && node.nid.length > 0){
        installedNodes.push({ptag:node.ptag,pid:pid});//[pid] = node;
      }
    }
    //sort installedNodes by ptag
    installedNodes.sort(function (a, b) {
      if (a.ptag > b.ptag) {
        return 1;
      }
      if (a.ptag < b.ptag) {
        return -1;
      }
      // a 必须等于 b
      return 0;
    });
    //add newline here.
    for(var i=0;i<installedNodes.length-1;i++){
      var node = installedNodes[i],nextNode = installedNodes[i+1];
      if(node.ptag.charAt(0)!=nextNode.ptag.charAt(0)){
        node['newline'] = true;
      }
    }
    var dapExt = [{name:'DC',desc:'dataCount'},...nodesInfo.dap];
    res.render('nd_alldata_avg', {lid:lid,query:req.query,dap:dapExt,
        installedNodes:installedNodes,
        serverTimezoneOffset:req.app.locals.serverTimezoneOffset});
  });
};
