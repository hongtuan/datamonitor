var mongoose = require('mongoose');
var NodeData = mongoose.model('NodeData');
var Location = mongoose.model('Location');

function saveOneNodeData(lid, nd, cb) {
  //just save not exist nodedata.
  NodeData.findOne({locid:lid,nodeid: nd.nid, collectedOn: nd.timestampISO},
    'nodeid',
    function(err, existNodeData) {
      //console.log('existNodeData='+existNodeData);
      if (err) {
        console.log(err);
        if(cb) cb(err,0);
        return;
      }
      //console.log('nodeData='+nodeData);
      if (existNodeData == null) {
        //console.log('Find new data,need save.');
        //create a new document.
        NodeData.create({
          locid:lid,
          nodeid: nd.nid,
          data: nd.data,
          collectedOn: nd.timestampISO
        }, function(err, createdNodeData) {
          if (err) {
            console.log(err);
            if(cb) cb(err,0);
            return;
          }
          //console.log('createdNodeData='+JSON.stringify(createdNodeData,null,2));
          if(cb) cb(null,1);
        });
      }
      else {
        //console.log('Find old data,need not save.');
        if(cb) cb(null,0);
      }
    }
  );
}

//for reuse call.
module.exports.saveNodesData = function(lid,nodesData, cb) {
  //console.log('Save nodesData here.');
  //console.log(req.body);
  var totalDataCount = 0;
  if(Array.isArray(nodesData)) {
    totalDataCount = nodesData.length;
    var newDataCount = 0;
    var oldDataCount = 0;
    var finishCount = 0;
    //console.log('get '+totalDataCount+' nodes data.');
    var errs = [];
    nodesData.forEach(function(nd){
      saveOneNodeData(lid,nd,function(err,savedCount){
        if(err) errs.push(err);
        newDataCount += savedCount;
        if(err == null && savedCount == 0) oldDataCount += 1;
        finishCount++;
        //if finishCount gt totalDataCount
        if(finishCount >= totalDataCount) {
          var saveRes = {
            total:totalDataCount,
            new:newDataCount,
            old:oldDataCount,
            finish:finishCount
          };
          //fill pid here:
          fillNodePid(lid,null);
          //call back here:
          if(cb) cb(errs,saveRes);
        }
      });
    });
  }
};

module.exports.fillLastestNodeDataByRaw = function(lid,lastestNodesData, cb) {
  //console.info('lastestNodesData.length',lastestNodesData.length);
  Location.findOne({_id:lid},'boundaries freeNodes',function(err, location) {
    if(err){
      console.error(err);
      if(cb) cb(err,null);
      return;
    }
    //if(Array.isArray(location.boundaries)){
    var updateCount = 0;
    location.boundaries.forEach(function(boundar){
      //boundar.points.forEach(function(point){
      for(var i in boundar.points){
        var point = boundar.points[i];
        //console.info('point=>',JSON.stringify(point,null,2));
        if(point.nodeid == undefined) continue;
        for(var j in lastestNodesData){
          var nodeData = lastestNodesData[j];
          //matched nodeid,then try to update it
          if(nodeData.nid == point.nodeid){
            var ndTime = new Date(nodeData.timestampISO).getTime();
            var pTime = new Date(point.latestdatatime).getTime();
            //if(point.latestdata.length == 0 || nodeData.timestampISO>point.latestdatatime) {
            if(point.latestdata.length == 0 || ndTime>pTime) {
              point.latestdata = nodeData.data;
              point.latestdatatime = nodeData.timestampISO;
              //console.log(point.ptag,point.nodeid,'update over.');
              updateCount++;
              break;
            }
          }
        }
      }
    });
    
    //for free node,need fill latestdata
    //for(var i=0;i<location.freeNodes.length;i++){
    for(var i in location.freeNodes){
      var point = location.freeNodes[i];
      if(point.nodeid == undefined) continue;
      for(var j in lastestNodesData){
        var nodeData = lastestNodesData[j];
        if(nodeData.nid == point.nodeid){
          var ndTime = new Date(nodeData.timestampISO).getTime();
          var pTime = new Date(point.latestdatatime).getTime();
          //if(point.latestdata.length == 0 || nodeData.timestampISO>point.latestdatatime) {
          if(point.latestdata.length == 0 || ndTime>pTime) {
            point.latestdata = nodeData.data;
            point.latestdatatime = nodeData.timestampISO;
            //console.log(point.ptag,point.nodeid,'update over.');
            updateCount++;
            break;
          }
        }
      }
    }
    
    //console.info('updateCount='+updateCount);
    if(updateCount>0) {
      //console.info('Need update location.');
      //update latestDataOn when updateCount>0
      location.latestDataOn = new Date();//.toISOString();
      //save location!!!
      location.save(function(err,updatedLocation){
        if(err){
          console.error(err);
        }
        //console.info('location save over.');
      });
    }
    //what ever update,do cb
    if(cb) cb(null,{uldn:updateCount});
  });
};

function array2jsonObj(array){
  var jsonObj = {};
  array.forEach(function(a){
    for(var k in a){
      jsonObj[k] = a[k];
    }
  });
  return jsonObj;
}

module.exports.getNodeData = function(lid,nid,timeRange, cb) {
  //var filter = {locid:lid, nodeid: nid};
  var filter = {locid:lid, pid: nid};
  if(timeRange != null){
    filter['collectedOn'] = {
      //$gt:new Date(timeRange.from),
      //$lt:new Date(timeRange.to)
      $gt:timeRange.from,
      $lt:timeRange.to
    };
  }
  //console.log('timeRange in DAO:',JSON.stringify(filter,null,2));
  NodeData.find(filter).limit(18000).sort('collectedOn').
    select('data collectedOn').exec(function (err, rows) {
      if (err) {
        console.log(err);
        //res.status(500).json(err);
        if(cb) cb(err,null);
        return;
      }
      //console.log('rows='+rows);
      var dataList = [];
      rows.forEach(function(row){
        var nd = {dataTime:row.collectedOn};
        if(row.data.length > 0){
          nd['dataObj'] = array2jsonObj(row.data);
        }
        dataList.push(nd);
      });
      //cb to return dataList.
      if(cb) cb(null,dataList);
    }
  );
};

module.exports.getNodesData = function(lid,timeRange, cb) {
  //var filter = {locid:lid, nodeid: nid};
  var filter = {locid:lid};
  if(timeRange != null){
    filter['collectedOn'] = {
      //$gt:new Date(timeRange.from),
      //$lt:new Date(timeRange.to)
      $gt:timeRange.from,
      $lt:timeRange.to
    };
  }
  //console.log('timeRange in DAO:',JSON.stringify(filter,null,2));
  NodeData.find(filter).limit(18000).sort('pid collectedOn').
    select('pid data collectedOn').exec(function (err, rows) {
      if (err) {
        console.log(err);
        //res.status(500).json(err);
        if(cb) cb(err,null);
        return;
      }
      //console.log('rows='+rows);
      var pidDataMap = {};
      rows.forEach(function(row){
        if(row.pid && row.pid.length>0 && row.data.length > 0){
          var nd = {dataTime:row.collectedOn};
          nd['dataObj'] = array2jsonObj(row.data);
          var pd = pidDataMap[row.pid];
          if(pd){
            pd.push(nd);
          }else{
            pidDataMap[row.pid] = [nd];
          }
        }
      });
      //cb to return dataList.
      if(cb) cb(null,pidDataMap);
    }
  );
};

//module.exports.fillNodePid = function(lid,cb) {
function fillNodePid(lid,cb) {
  //console.log('lid=',lid);
  //get records which pid is empty.
  NodeData.find({locid:lid,pid:null}).select('nodeid').exec(function (err, rows) {
    if (err) {
      console.log(err);
      //res.status(500).json(err);
      if(cb) cb(err,0);
      return;
    }
    
    if(rows.length == 0){
      if(cb) cb(null,0);
      //console.log('No records need fill pid.');
      return;
    }
    //console.log('Find '+rows.length+' rows need fill pid.');
    Location.findById(lid).select('boundaries freeNodes').exec(function(err, location) {
      if (err) {
        console.log(err);
        if(cb) cb(err,0);
        return;
      }
      var nidPidMap = {};
      location.boundaries.forEach(function(bound){
        if(bound.status == '1'){
          bound.points.forEach(function(p){
            if(p.status == '1'){
              if(p.nodeid && p.nodeid.length>0)
                nidPidMap[p.nodeid] = p._id;
            }
          });
        }
      });
      
      location.freeNodes.forEach(function(p){
        if(p.status == '1'){
          if(p.nodeid && p.nodeid.length>0)
            nidPidMap[p.nodeid] = p._id;
        }
      });
      
      //console.log(JSON.stringify(nidPidMap,null,2));
      var fillCount = 0;
      //for(var i in rows){
      for(let row of rows){
        //console.log(JSON.stringify(row,null,2));
        var pid = nidPidMap[row.nodeid];
        if(pid){
          //fill pid here.
          //NodeData.update({ _id: row._id },{ $set: { pid: pid}}).exec();
          NodeData.update({ _id: row._id },{ pid: pid}).exec();
          //console.log(row._id,row.nodeid,pid,'fill over.');
          fillCount++;
        }else{
          //console.log(row.nodeid,'not assiged.');
        }
      }
      if(cb) cb(null,fillCount);
      //console.log('fill over.');
    });
  });
}

//for test this method.
module.exports.fillNodePid = function(lid,cb) {
  fillNodePid(lid,cb);
};
