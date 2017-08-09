var request = require('request');
var formidable = require("formidable");
var moment = require('moment');
var locDao = require('../../app_api/dao/locationdao.js');
var util = require('../../utils/util');
/*
var apiOptions = {
  server : 'http://localhost:'+(process.env.PORT || '3000')
};//*/

function getServerStartTime(req){
  var startTimeDesc = moment(req.app.locals.startTime).format('LLL');
    //dateFormat(req.app.locals.startTime, "yyyy-mm-dd hh:MM:ss");
  var dist = Date.now()-req.app.locals.startTime;
  startTimeDesc +=',it has running for '+util.getTimeDistanceDesc(dist);
  //console.log('startTimeDesc='+startTimeDesc);
  return startTimeDesc;
}

var renderListPage = function(req, res, rows){
  var message;
  if (!(rows instanceof Array)) {
    message = "API lookup error";
    rows = [];
  } else {
    if (!rows.length) {
      message = "No Location found in DB";
    }
  }
  /*
  var startTimeDesc = moment(req.app.locals.startTime).format('LLL')
    //dateFormat(req.app.locals.startTime, "yyyy-mm-dd hh:MM:ss");
  var dist = Date.now()-req.app.locals.startTime;
  startTimeDesc +=',it has running for '+util.getTimeDistanceDesc(dist);
  console.log('startTimeDesc='+startTimeDesc);//*/
  res.render('locations_list',
    {title:"Current Location list.",rows:rows,
      startTimeDesc:getServerStartTime(req),message: message});
};

//do not use api
module.exports.add = function(req, res) {
  res.render('location_edit',
	  {title:'AddLocation',locData:'{}',
	    success:req.session.success,errors:req.session.errors});
	req.session.errors = null;
};
/*
module.exports.edit = function(req, res) {
  //console.log('server controllers===req.params.lid='+req.params.lid);
  var requestOptions, path;
  path = '/api/locations/edit/'+req.params.lid;
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      if(err){
        //process.env.PORT
        console.error(err);
        //console.info('process.env.PORT='+process.env.PORT);
      } 
      //var i, data;
      //data = body;
      res.render('location_edit',
	      {title:'EditLocation',locData:JSON.stringify(body),
	        success:req.session.success,errors:req.session.errors});
	    req.session.errors = null;
    }
  );
};//*/

module.exports.inputCenter = function(req, res) {
  //console.log('In controller inputCenter : req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  res.render('input_center', {lid:lid});
};

module.exports.expFreeNode = function(req, res) {
  //console.log('In controller inputCenter : req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  locDao.getLocationData(lid,function(err,locationData){
    if (err) {
      console.log(err);
      res.status(404).json(err);
    }
    var freeNodeData = {
      lid:lid,
      locName:locationData.name,
      expDate:moment().format('YYYY-MM-DD Z HH:mm:ss a'),
      pTagNidMap:{},
    };
    locationData.FNL.forEach(function(fn){
      if(fn.nid && fn.nid != ''){
        freeNodeData.pTagNidMap[fn.ptag] = fn.nid;
        //var fdObj = {};
        //fdObj[fn.ptag] = fn.nid;
        //freeNodeData.freeNodeList.push(fdObj);
      }
    });
    util.downloadFile(res,freeNodeData);
  });
};

module.exports.impFile = function(req, res) {
  res.render('imp_file',
    {lid:req.params.lid,impUrl:'/locations/ifn'});
};

module.exports.impFreeNode = function(req, res) {
  console.log("impFreeNode here...");
  var form = new formidable.IncomingForm();
  console.log("about to parse");
  form.parse(req, function(error, fields, files) {
    console.log("parsing done",files);
    var fc = util.loadTextContent(files.impfile.path);
    console.log(fc);
    var freeNodeData = JSON.parse(fc);
    console.log(JSON.stringify(freeNodeData,null,2));
    locDao.impFreeNodeData(freeNodeData,function(err,impCount){
      res.status(200).json(`${impCount} free nodes imported.`);      
    });
  });
  //res.status(200).json('ok');
  //res.render('imp_file',
  //  {lid:req.params.lid,impUrl:'/locations/ifn'});
};
/*
module.exports.deleteOne = function(req, res) {
  //console.log('In controllers:req.params.lid='+req.params.lid);
  var lid = req.params.lid;
  if (lid) {
    var requestOptions, path;
    path = '/api/locations/'+lid;
    requestOptions = {
      url : apiOptions.server + path,
      method : "DELETE",
      json : {}
    };
    request(
      requestOptions,
      function(err, response, body) {
        if(err){
          console.error(err);
        }
        //console.log('deleteOne,response='+response);
        //console.log('deleteOne,body='+body);
        res.status(200).json(util.jsonMsg(body));
      }
    );
  }
};//*/

module.exports.showIndex = function(req, res) {
  res.render('index',
    {title:"Angular2 Index page.",startTimeDesc:getServerStartTime(req)});
};

module.exports.showApp = function(req, res) {
  var serverNow = Date.now();
  //console.log('serverNow='+serverNow);
  res.render('my-app',
    {title:"Angular2 Application.",startTimeDesc:getServerStartTime(req),
      servertime:serverNow
    });
};

/*
module.exports.showList = function(req, res) {
  //res.render('locations_list', { });
  //console.log('locationList!!');
  var requestOptions, path;
  path = '/api/locations';
  requestOptions = {
    url : apiOptions.server + path,
    method : "GET",
    json : {}
  };
  request(
    requestOptions,
    function(err, response, body) {
      if(err){
        //process.env.PORT
        console.error(err);
        //console.info('process.env.PORT='+process.env.PORT);
      } 
      var data = body;
      renderListPage(req, res, data);
    }
  );
};//*/

module.exports.mgrPointInfo = function(req, res) {
  //render a template here.
  var lid = req.params.lid;
  var bid = req.params.bid;
  var pid = req.params.pid;
  
  locDao.getPointInfo(lid,bid,pid,function(err,point){
    if (err) {
      console.log(err);
      res.status(404).json(err);
      return;
    }
    res.render('input_point_info', {lid:lid,bid:bid,pid:pid,point:point});
    //res.status(200).json(point);
  });
};

module.exports.expLocationList = function(req, res) {
  var expLids = req.params.lids.split(',');
  //console.log(JSON.stringify(expLids,null,2));
  var filter = {_id:{$in:expLids},status:1};
  locDao.getLocationList(filter,20,function(err,rows){
    if (err) {
      console.log(err);
      res.status(400).json(err);
    }
    /*
    var tmp = require('tmp');
    var tmpFileObj = tmp.fileSync();
    //console.log("File: ", tmpFileObj.name);
    //res.status(200).json(boundaryData);
    var fs = require('fs');
    //console.log(JSON.stringify(boundaryData,null,2));
    fs.appendFileSync(tmpFileObj.name,JSON.stringify(rows,null,2));
    //console.log("File content write over.");
    var fn = `test_${moment().format('YYYYMMDDHHmm')}.json`;
    //console.log(fn);
    res.download(tmpFileObj.name, fn);//*/
    var expLocations = [];
    rows.forEach(function(location){
      var expLoc = [location.name,location.address,location.contactInfo,location.emails];
      /*
      {name:location.name,
        address:location.address,
        contactInfo:location.contactInfo,
        emails:location.emails,
        latestDataOn:moment(location.latestDataOn).format('YYYY-MM-DD Z HH:mm:ss a')
      };//*/
      expLocations.push(expLoc);
    });
    
    var headerInfo = [
      {title:'name',width:20},
      {title:'address',width:45},
      {title:'contactInfo',width:30},
      {title:'emails',width:15},
    ]
    //util.downloadFile(res,expLocations,'expLoc');
    util.downloadExcelFile(res,expLocations,headerInfo,'expLoc');
    //res.status(200).json(rows);
  });
};

