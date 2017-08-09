var request = require('request');
var moment = require('moment');
var locDao = require('../../app_api/dao/locationdao.js');
//var moment = require('moment');
var util = require('../../utils/util');
/*
var apiOptions = {
  server : 'http://localhost:'+(process.env.PORT || '3000')
};//*/

module.exports.edit = function(req, res) {
  var lid = req.params.lid;
  locDao.getLocationBaseInfo(lid,function(err,location){
    if(err){
      console.error(err);
    }
    res.render(
      'boundarymgr',
      {
        title: 'Roof Position management.',
        lid:lid,
        locInfo:JSON.stringify(location)
      }
    );
  });
};

module.exports.view = function(req, res) {
  var lid = req.params.lid;
  locDao.getLocationBaseInfo(lid,function(err,location){
    if(err){
      console.error(err);
    }
    res.render(
      'boundaryview',
      {
        title: 'Roof View.',
        lid:lid,
        locInfo:JSON.stringify(location),
        dataPolicy:location.alertPolicy
      }
    );
  });
};

/*
module.exports.saveOneBoundary = function(req, res) {
  var lid = req.params.lid;
  console.log('lid='+lid);
  if (lid) {
    var requestOptions, path;
    path = '/api/locations/'+lid+'/savebound';
    requestOptions = {
      url : apiOptions.server + path,
      method : "POST",
      json : req.body,
      qs : {}
    };
    request(
      requestOptions,
      function(err, response, body) {
        if(err){
          //process.env.PORT
          console.error(err);
          //console.info('process.env.PORT='+process.env.PORT);
        } 
        res.json(util.jsonMsg('save successful.'));
      }
    );
  }
}//*/
/*
module.exports.fillTestData = function(req, res) {
  console.log('controllers===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  if (lid) {
    var requestOptions, path;
    path = '/api/locations/'+lid+'/filltd';
    requestOptions = {
      url : apiOptions.server + path,
      method : "GET",
      json : {},
      qs : {}
    };
    request(
      requestOptions,
      function(err, response, body) {
        if(err){
          //process.env.PORT
          console.error(err);
          //console.info('process.env.PORT='+process.env.PORT);
        } 
        res.json({fc:body});
      }
    );
  }
}//*/
/*
module.exports.loadNodesData = function(req, res) {
  console.log('controllers===req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  if (lid) {
    var requestOptions, path;
    path = '/api/locations/'+lid+'/loadnd';
    requestOptions = {
      url : apiOptions.server + path,
      method : "POST",
      json : req.body
    };
    request(
      requestOptions,
      function(err, response, body) {
        if(err){
          //process.env.PORT
          console.error(err);
          //console.info('process.env.PORT='+process.env.PORT);
        }
        //console.log('body='+body);
        res.json(body);
      }
    );
  }
}//*/


module.exports.viewNodeData = function(req, res) {
  var lid = req.params.lid;
  var nid = req.params.nid;
  console.log('lid='+lid,'nid='+nid);
  ndDao.getNodeData(lid,nid,function(err,nodeDataList){
    if(err){
      console.log(err);
      res.status(406).join(err);
    }
    //res.status(200).json(nodeDataList);
    res.render('show_node_data',{nodeDataList:nodeDataList});
  });
  
  /*
  if (nid) {
    //user lid to query exist boundaries from db
    var requestOptions, path;
    path = '/api/nd/getnd/'+nid;
    requestOptions = {
      url : apiOptions.server + path,
      method : "GET",
      json : {}
    };
    request(
      requestOptions,
      function(err, response, nodeDataList) {
        console.log('in server after request,typeof nodeDataList='+(typeof nodeDataList));
        if(err){
          //process.env.PORT
          console.error(err);
          //console.info('process.env.PORT='+process.env.PORT);
        }
        console.log('viewNodeData,nodeDataList='+JSON.stringify(nodeDataList,null,2));
        res.render(
          'show_node_data',{ nodeDataList:nodeDataList }
        );
      }
    );
  }//*/
};


module.exports.expBoundaryContent = function(req, res) {
  var lid = req.params.lid;
  var bid = req.params.bid;
  //here,create a temp file
  //console.log("Filedescriptor: ", tmpFile.fd);
  
  //console.log('server expBoundaryContent',lid,bid);
  locDao.expBoundaryContent(lid,bid,function(err,boundaryData){
    if(err){
      console.error(err);
      res.status(500).json(err);
    }
    var tmp = require('tmp');
    var tmpFileObj = tmp.fileSync();
    //console.log("File: ", tmpFileObj.name);
    //res.status(200).json(boundaryData);
    var fs = require('fs');
    //console.log(JSON.stringify(boundaryData,null,2));
    fs.appendFileSync(tmpFileObj.name,JSON.stringify(boundaryData.nodeData,null,2));
    //console.log("File content write over.");
    var fn = `${boundaryData.bname}_${moment().format('YYYYMMDDHHmm')}.json`;
    //console.log(fn);
    res.download(tmpFileObj.name, fn); 
  });
};

module.exports.impBoundaryContent = function(req, res) {
  var lid = req.params.lid;
  var bid = req.params.bid;
  //console.log('server expBoundaryContent',lid,bid);
  //console.log('req.body='+JSON.stringify(req.body));
  
  var impData = {};
  //an Array in body
  var inputData = JSON.parse(req.body.data);
  //console.log('inputData='+JSON.stringify(inputData));
  inputData.forEach(function(data){
    for(var pro in data){
      //impData.push({ptag:pro,nodeid:data[pro]});  
      impData[pro] = data[pro];  
    }
  });
  //console.log('impData='+JSON.stringify(impData));
  locDao.impBoundaryContent(lid,bid,impData,function(err,expData){
    if(err){
      console.error(err);
      res.status(500).json(err);
    }
    res.status(200).json(expData);
  });
};


module.exports.impBoundaryDataPage = function(req, res) {
  var lid = req.params.lid;
  var bid = req.params.bid;
  res.render('imp_bound_data',{ lid:lid,bid:bid});
};
