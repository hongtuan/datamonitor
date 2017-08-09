var mongoose = require('mongoose');
var Location = mongoose.model('Location');
var du = require('../../app_client/myjs/data_utils.js');
function trimJSONStr(jStr){
  return JSON.stringify(JSON.parse(jStr));
}

module.exports.createLocation = function(locData,cb){
  //create a location document here.
  Location.create({
    name: locData.name,
    datasrc: locData.datasrc,
    snapcount: locData.snapcount,
    synperiod: locData.synperiod,
    monitperiod: locData.monitperiod,
    address: locData.address,
    contactInfo: locData.contactInfo,
    emails: locData.emails,
    //alertPolicy: trimJSONStr(locData.alertPolicy)
    alertPolicy:locData.alertPolicy
  }, function(err, location) {
    if (err) {
      console.log(err);
      //res.status(406).json(err);
      if(cb) cb(err,null);
      return;
    }
    if(cb) cb(null,location);
  });
};

module.exports.updateLocation = function(lid,locData,cb){
  //update location here:
  Location.findById(lid).exec(function(err, location) {
    if(err){
      console.error(err);
      if(cb) cb(err,null);
      return;
    }
    location.update({
      name: locData.name,
      datasrc: locData.datasrc,
      snapcount: locData.snapcount,
      synperiod: locData.synperiod,
      monitperiod: locData.monitperiod,
      address: locData.address,
      contactInfo: locData.contactInfo,
      emails: locData.emails,
      //alertPolicy: trimJSONStr(locData.alertPolicy),
      alertPolicy: locData.alertPolicy,
      updatedOn:Date.now()
    },function(err, location) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        //res.status(406).json('update failed:'+err);
      }
      if(cb) cb(null,location);
    });
  });
};

module.exports.removeLocation = function(lid,cb){
  Location.findById(lid).select('status').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    location.status = 0;
    location.save(function(err,updatedLocation){
      if(err){
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,lid);
    });
  });
};

module.exports.getLocationList = function(filter,limit,cb){
  Location.find(filter||{status:1}).limit(limit||20).sort('-createdOn').
    select('id name datasrc snapcount synperiod monitperiod alertPolicy latestDataOn address contactInfo emails isAutoSyn').
    exec(function(err, rows) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,rows);
    });
};

function getLocationContentBrief(lid,cb){
  Location.findById(lid).select('boundaries freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    //var boundsCount = location.boundaries.length;
    var boundsCount = 0;
    var totalNodeCount = 0,installedNodeCount = 0;
    if(location.boundaries != null){
      location.boundaries.forEach(function(bound){
        if(bound.status == '1'){
          bound.points.forEach(function(p){
            if(p.status == '1'){
              totalNodeCount++;
              if(p.nodeid) installedNodeCount += 1;
            }
          });
          boundsCount++;
          //totalNodeCount += bound.points.length;
        }
      });
    }
    if(location.freeNodes != null){
      location.freeNodes.forEach(function(p){
        if(p.status == '1'){
          totalNodeCount++;
          if(p.nodeid) installedNodeCount += 1;
        }
      });
    }

    if(cb) cb(null,{
      bc:boundsCount,
      nc:totalNodeCount,
      inc:installedNodeCount
    });
  });
}

function mergeObjects(obj1,obj2){
  var mObj = {};
  for(var pro in obj1){
    mObj[pro] = obj1[pro];
  }
  for(var pro in obj2){
    mObj[pro] = obj2[pro];
  }
  console.log('mergeObjects:mObj='+JSON.stringify(mObj,null,2));
  return mObj;
}

module.exports.getLocationBaseInfo = function(lid,cb){
  //query location by lid
  Location.findById(lid).
    select('id name datasrc snapcount ctpos gwpos synperiod monitperiod alertPolicy contentbrief').
    exec(function(err, location) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      getLocationContentBrief(lid,function(err,locContentBrief){
        if(err){
          console.error(err);
          if(cb) cb(null,location);
          return;
        }
        //fill locContentBrief to location
        //location.contentbrief = JSON.stringify(locContentBrief);
        location.contentbrief = locContentBrief;
        if(cb) cb(null,location);
      });
    }
  );
};

/*
module.exports.getLocationContent = function(lid,cb){
  //query location by lid
  Location.findById(lid).select('boundaries').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    //cvt boundaries and points for client
    var locationContent = [];
    //if(Array.isArray(location.boundaries)){
    location.boundaries.forEach(function(bound){
      if(bound.status == 1){
        var boundInfo = {};
        boundInfo.bid = bound._id;
        boundInfo.bname = bound.bname?bound.bname:'unNamed';
        //boundInfo.bd = JSON.parse(bound.bdelimit);
        boundInfo.bd = bound.bdelimit;
        var pdA = [];
        bound.points.forEach(function(p){
          //append boundary info here.
          pdA.push({
            pid:p._id,
            pos:p.coords,
            nid:p.nodeid,
            ptag:p.ptag,
            bid:bound._id,
            bname:boundInfo.bname
          });
        });
        boundInfo.pd = pdA;
        locationContent.push(boundInfo);
      }
    });
    if(cb) cb(null,locationContent);
  });
};//*/


module.exports.updateLocCenter = function(lid,centerInfo,cb){
  Location.findById(lid).select('ctpos gwpos').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    location.ctpos = centerInfo.latLng;
    location.gwpos = centerInfo.latLng;
    location.address = centerInfo.address;
    location.save(function(err, location) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,location);
    });
    //console.log('updateCenter over.');
  });
};

module.exports.updateAlertpolices = function(lid,alertPolicy,cb){
  Location.findById(lid).select('alertPolicy').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    location.alertPolicy = alertPolicy;
    location.save(function(err, location) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,location);
    });
    //console.log('updateAlertpolices over.');
  });
};

module.exports.saveOneBoundary = function(lid,boundsData,cb){
  var bdObj = JSON.parse(boundsData.bd);
  //console.log('boundsData='+JSON.stringify(boundsData,null,2));
  //console.log('boundsData.bd='+JSON.stringify(boundsData.bd,null,2));
  //sensor position data
  var pointsData = JSON.parse(boundsData.pd);
  var pointsArray = [];
  if(Array.isArray(pointsData)){
    pointsData.forEach(function(p){
      //pointsArray.push({coords:[p.lat,p.lng].join(',')});
      pointsArray.push({coords:p.coords,ptag:p.ptag});
    });
  }
  var boundary = {
    btype:bdObj.bt,
    //btype:boundsData.bt,
    //bdelimit:boundsData.bd,
    bdelimit:bdObj,
    points: pointsArray
  };
  //then updata it to location
  Location.findById(lid).select('name boundaries').exec(function(err, location){
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    //console.log('location='+JSON.stringify(location,null,2));
    //console.log('location.name='+location.name);
    boundary.bname = `${location.name}_Area${location.boundaries.length+1}`;
    //console.log(boundary);
    location.boundaries.push(boundary);
    //console.log('before save:\n'+location);
    location.save(function(err, location) {
      if (err) {
        console.error(err);
        if(cb) cb(err,null);
        return;
      }
      var savedBoundary = location.boundaries[location.boundaries.length - 1];
      if(cb) cb(null,savedBoundary);
    });
  });
};

function buildPoint(_point){
  var point = {ptag:''};
  point.nodeid = _point.nodeid;
  point.ptag = _point.ptag;
  //cvt notes:
  var notesEcho = [];
  _point.notes.forEach(function(note){
    notesEcho.push(`${du.iso2Locale(note.ntime)} note:\n${note.nc}`);
  });
  point.notes = notesEcho.reverse().join('\n');
  return point;
}

module.exports.getPointInfo = function(lid,bid,pid, cb) {
  Location.findById(lid).select('boundaries freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    var point;// = {soid:'',ptag:''};
    if(bid == 'FreeNode'){
      //serrch from freeNodes.
      for(var i in location.freeNodes){
        var fn = location.freeNodes[i];
        if(fn._id == pid) {
          point = buildPoint(fn);
          point.bid = 'FreeNode';
          break;
        }
      }
    }else{
      //search from boundaries.
      for (var i in location.boundaries) {
        var boundary = location.boundaries[i];
        //if(pointHasFound) break;
        if(boundary._id == bid){
          //get the boundary,then get the point.
          for(var j in boundary.points){
            var _point = boundary.points[j];
            if(_point._id == pid){
              /*
              point.nodeid = _point.nodeid;
              point.ptag = _point.ptag;
              //cvt notes:
              var notesEcho = [];
              _point.notes.forEach(function(note){
                notesEcho.push(`${du.iso2Locale(note.ntime)} note:\n${note.nc}`);
              });
              point.notes = notesEcho.reverse().join('\n');//*/
              //console.log('point found.');
              point = buildPoint(_point);
              break;
            }
          }
          break;
        }
      }
    }
    if(cb) cb(null,point);
  });
};

function updatePoint(_point,point){
  if(point.nodeid!=undefined){//Cool!
    _point.nodeid = point.nodeid;
    //console.log('_point.nodeid',_point.nodeid,'updated.');
  }
  //if has ptag,and must not null,update it.
  if(point.ptag && point.ptag.length>0)
    _point.ptag = point.ptag;
  //if has coords and must not null,update it.
  if(point.coords && point.coords.length>0)
    _point.coords = point.coords;
  //if has note to append and must not null,update it.
  if(point.newnote && point.newnote.length>0){
    _point.notes.push({nc:point.newnote});
  }
  //support node delete @2017.1.10
  if(point.status && point.status.length>0)
    _point.status = point.status;
  //update the point's updatedOn field.
  _point.updatedOn = new Date().toISOString();
}

module.exports.updatePointInfo = function(point, cb) {
  //console.log('point='+JSON.stringify(point,null,2));
  var lid = point.lid;
  Location.findById(lid).select('boundaries freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      //res.status(404).json(err);
      return;
    }
    var bid = point.bid;
    var pid = point.pid;
    if(bid == 'FreeNode'){
      for(var i in location.freeNodes){
        var fn = location.freeNodes[i];
        if(fn._id == point.pid){
          updatePoint(fn,point);
          break;
        }
      }
      console.log('save free node over.');
    }else{
      var _point = null;
      for (var i in location.boundaries) {
        var boundary = location.boundaries[i];
        if(boundary._id == bid){
          for(var j in boundary.points){
            _point = boundary.points[j];
            if(_point._id == pid){
              updatePoint(_point,point);
              break;
            }
          }
          break;
        }
      }
      console.log('save normal node over.');
    }
    //save location here
    location.save(function(err, location) {
      //console.log(location);
      if (err) {
        console.error(err);
        if(cb) cb(err,null);
        //res.status(400).json(err);
      }
      if(cb) cb(null,_point);
    });
    //console.log('update point over.');
  });
};


module.exports.expBoundaryContent = function(lid,bid, cb) {
  //console.log(lid,bid);
  Location.findById(lid).select('boundaries').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      //res.status(404).json(err);
      return;
    }
    //var _point = null;
    var boundaryData = {};
    for (var i in location.boundaries) {
      var boundary = location.boundaries[i];
      if(boundary._id == bid){
        boundaryData['bname'] = boundary.bname;
        var nodeData = [];
        //find the bounds
        for(var j in boundary.points){
          var point = boundary.points[j];
          if(point.nodeid){
            var obj = {};
            obj[point.ptag] = point.nodeid;
            nodeData.push(obj);
          }
        }
        boundaryData['nodeData'] = nodeData;
        break;
      }
    }
    if(cb) cb(null,boundaryData);
  });
};

module.exports.impFreeNodeData = function(freeNodeData,cb) {
  var lid = freeNodeData.lid;
  var pTagNidMap = freeNodeData.pTagNidMap;
  Location.findById(lid).select('freeNodes').exec(function(err, location) {
    var impCount = 0;
    location.freeNodes.forEach(function(p){
      if(p.status == '1'){
        var nid = pTagNidMap[p.ptag];
        if(nid && nid != undefined){
          p.nodeid = nid;
          impCount++;
        }
      }
    });
    if(impCount > 0){
      location.save(function(err,updatedLocation){
        if(err){
          console.error(err);
          if(cb) cb(err,null);
        }
        if(cb) cb(null,impCount);
      });
    }else{
      if(cb) cb(null,impCount);
    }
  });
};

module.exports.impBoundaryContent = function(lid,bid,impData, cb) {
  //console.log(lid,bid);
  //console.log('dao:impData='+JSON.stringify(impData));
  Location.findById(lid).select('boundaries').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    var impCount = 0,emptyCount = 0;
    for (var i in location.boundaries) {
      var boundary = location.boundaries[i];
      if(boundary._id == bid){
        for(var j in boundary.points){
          var point = boundary.points[j];
          for(var pro in impData){
            //console.log('pro='+pro);
            if(point.ptag == pro){
              var mac = impData[pro];
              if(mac.length>0){
                point.nodeid = impData[pro];
                impCount++;
              }else{
                point.nodeid = '';//clear!
                console.info(`${point.ptag}'s mac has been clear.`);
                emptyCount++;
              }
              break;
            }
          }
        }
        break;
      }
    }
    location.save(function(err,updatedLocation){
      if(err){
        console.error(err);
        if(cb) cb(err,null);
      }
      if(cb) cb(null,`${impCount} nodes imported,${emptyCount} empty mac.`);
    });
  });
};


module.exports.updateBoundaryName = function(lid,bid,newName, cb) {
  Location.findById(lid).select('boundaries').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    for (var i in location.boundaries) {
      var boundary = location.boundaries[i];
      if(boundary._id == bid){
        boundary.bname = newName;
        break;
      }
    }
    location.save(function(err,updatedLocation){
      if(err){
        console.error(err);
        if(cb) cb(err,null);
      }
      if(cb) cb(null,'Boundary name update success.');
    });
  });
};

module.exports.deleteBoundary = function(lid,bid, cb) {
  Location.findById(lid).select('boundaries').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    for (var i in location.boundaries) {
      var boundary = location.boundaries[i];
      if(boundary._id == bid){
        boundary.status = 0;
        break;
      }
    }
    location.save(function(err,updatedLocation){
      if(err){
        console.error(err);
        if(cb) cb(err,null);
      }
      if(cb) cb(null,'Boundary delete success.');
    });
  });
};

module.exports.getLoctionList4Users = function(filter,limit, cb) {
  Location.find(filter||{status:1}).limit(20).sort('-createdOn').
    select('id name').
    exec(function(err, rows) {
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,rows);
    });
};

module.exports.getDataAlertPolicy = function(lid, cb) {
  Location.findById(lid).select('alertPolicy').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    if(cb) cb(null,location.alertPolicy);
  });
};

//rebuild method:
module.exports.getLocationData = function(lid,cb){
  //query location by lid
  Location.findById(lid).select('name alertPolicy boundaries freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    //cvt boundaries and points for client
    var boundariesData = [];
    var nidNodeMap = {};
    var pidNodeMap = {};
    var boundaryNidTagMap = {};
    var totalNodeCount = 0;
    var totalInstalledNodeCount = 0;

    if(location.boundaries != null){
      location.boundaries.forEach(function(bound){
        if(bound.status == '1'){
          var boundaryData = {};
          boundaryData.bid = bound._id;
          boundaryData.bname = bound.bname;
          boundaryData.bd = bound.bdelimit;
          var nodeList = [];
          var nidTagMap = {};
          var installedNodeCount = 0;
          bound.points.forEach(function(p){
            //append boundary._id to node.
            if(p.status == '1'){
              var node = {
                bid:bound._id,
                pid:p._id,
                pos:p.coords,
                nid:p.nodeid,
                ptag:p.ptag,
                latestDatatime:p.latestdatatime,
                latestData:p.latestdata
              };
              nodeList.push(node);
              if(node.nid && node.nid.length>0){
                nidNodeMap[node.nid] = node;
                nidTagMap[node.nid] = node.ptag;
                installedNodeCount++;
              }
              pidNodeMap[node.pid] = node;
            }
          });
  
          boundaryNidTagMap[boundaryData.bname] = nidTagMap;
          
          boundaryData.nc = bound.points.length;
          boundaryData.inc = installedNodeCount;
          boundaryData.nodeList = nodeList;
          boundariesData.push(boundaryData);
  
          totalNodeCount += bound.points.length;
          totalInstalledNodeCount += installedNodeCount;
        }
      });
    }
    
    var fnList = [];
    if(location.freeNodes != null){
      location.freeNodes.forEach(function(p){
        if(p.status == '1'){
          var node = {
            bid:'FreeNode',
            pid:p._id,
            pos:p.coords,
            nid:p.nodeid,
            ptag:p.ptag,
            latestDatatime:p.latestdatatime,
            latestData:p.latestdata
          };
          fnList.push(node);
          if(node.nid && node.nid.length>0){
            nidNodeMap[node.nid] = node;
          }
          pidNodeMap[node.pid] = node;
        }
      });
    }

    //LocationData Object:
    var locationData = {
      lid:location._id,
      name:location.name,
      dataPolicy:location.alertPolicy,
      TNC:totalNodeCount,
      TINC:totalInstalledNodeCount,
      BDL:boundariesData,     //Boundary Data List
      NNM:nidNodeMap,       //Nid Node Map
      PNM:pidNodeMap,       //pid Node Map,add @2017.2.22
      BNTM:boundaryNidTagMap, //Boundary Node Tag Map
      FNL:fnList             //Free Node List
    };
    if(cb) cb(null,locationData);
  });
};


module.exports.getNodesInfoInLocation = function(lid,cb){
  //query location by lid
  Location.findById(lid).select('alertPolicy boundaries freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    var pidNodeMap = {};
    location.boundaries.forEach(function(bound){
      if(bound.status == '1'){
        bound.points.forEach(function(p){
          //append boundary._id to node.
          if(p.status == '1'){
            var node = {
              bid:bound._id,
              pid:p._id,
              pos:p.coords,
              nid:p.nodeid,
              ptag:p.ptag
            };
            pidNodeMap[p._id] = node;
          }
        });
      }
    });
    
    location.freeNodes.forEach(function(p){
      if(p.status == '1'){
        var node = {
          bid:'FreeNode',
          pid:p._id,
          pos:p.coords,
          nid:p.nodeid,
          ptag:p.ptag
        };
        pidNodeMap[p._id] = node;
      }
    });
    //send data via cb
    var nodesInfo = {dap:location.alertPolicy,pidNodeMap:pidNodeMap};
    if(cb) cb(null,nodesInfo);
  });
};

module.exports.saveFreeNodes = function(lid,fnData, cb) {
  //console.log('in dao fnData=',fnData);
  Location.findById(lid).select('freeNodes').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    var startIndex = location.freeNodes.length + 1;
    //var tmpA = fnData.split(' ');
    fnData.forEach(function(pos){
      location.freeNodes.push({
        coords:pos,
        ptag:'FN'+startIndex++
      });
    });
    location.save(function(err,updatedLocation){
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,location.freeNodes);
    });
  });
};


module.exports.updateSynStatus = function(lid,synStatus,cb) {
  Location.findById(lid).select('isAutoSyn').exec(function(err, location) {
    if (err) {
      console.log(err);
      if(cb) cb(err,null);
      return;
    }
    location.isAutoSyn = synStatus;
    location.save(function(err,updatedLocation){
      if (err) {
        console.log(err);
        if(cb) cb(err,null);
        return;
      }
      if(cb) cb(null,location.isAutoSyn);
    });
  });
};

