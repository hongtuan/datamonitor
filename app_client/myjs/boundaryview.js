/**core functions for map operate**/
var map;
var mapCenter;
var gmgSph;//google.maps.geometry.spherical
//var gmgPoly;//google.maps.geometry.poly;

function initMap() {
  var lwi = parent.layer.load();
  mapCenter = str2gmLatLng(locInfo.ctpos);
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 19,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    //mapTypeId: google.maps.MapTypeId.SATELLITE,
    disableDefaultUI: true,
    heading: 90,
    tilt: 0
    //mapTypeId: google.maps.MapTypeId.HYBRID,
    //mapTypeId: google.maps.MapTypeId.ROADMAP
    //mapTypeId: google.maps.MapTypeId.SATELLITE
    //mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  //map.setTilt(45);
  //map.setRotateControl(true);

  gmgSph = google.maps.geometry.spherical;
  //gmgPoly = google.maps.geometry.poly;

  //draw a center mark here
  ctMarker = new google.maps.Marker({
    position: mapCenter,
    map: map,
    title: 'Location center,you can update by search.'
  });

  configMapNode();
  setupRichMarker();
  //rotateMap(40);

  loadLocationData(function(){
    parent.layer.close(lwi);
    /*
    setTimeout(function(){
      rotateTag(40);
      console.log('rotateMap over.');
    },1000);//*/
  });
}


var loadTimes = 0;
//var nidList=[];
var maxLatestDataTime = '2016-11-05T21:23:17.127Z';
var refreshTime;
//var nodesData = null;
//var noDataNodes = [];
//var lostDataNodes = [];
var alertNids = [];
var alertNodes = [];
var operateLogs = [];
function recordLoadLog(logInfo){
  //$('#dlv').val([logInfo,$('#dlv').val()].join('\n'));
  operateLogs.push(logInfo);
}

var nodesData = [];
//var nidNodeMap;
var boundaryNidTagMap;
var locationData;
function doMonitorTask(cb){
  //load nodesData from database,not from raw server.
  restorAlertNodes();
  $.get(`/api/locations/${locInfo._id}/ld`,null,function(data,status){
    //prepare nodesData for analysis.
    locationData = data;
    nodesData.length = 0;
    data.BDL.forEach(function(boundaryData){
      nodesData = nodesData.concat(boundaryData.nodeList);
    });

    boundaryNidTagMap = data.BNTM;
    //nidNodeMap = data.NNM;

    analysisNodesData();
    showAlertNodes();
    buildAlertLogs();

    recordLoadLog('Refresh '+(++loadTimes)+' times.');
    $("#bmMonitor").removeClass('disabled');
    if(cb) cb();
  },'json').fail(function(data,status){
    //$('#dlv').val(JSON.stringify(data)+status);
    //layer.close(lwi);
    recordLoadLog('load failed.');
  });
}


var timer;
function startMonitorTask(){
  if(locInfo.contentbrief.inc == 0){
    console.log('Empty location,need not monitor.');
    recordLoadLog('Empty location,need not monitor.');
    $("#monitorOn").click();
    return;
  }
  setTimeout(doMonitorTask,2000);//
  recordLoadLog('Monitoring start now.');
  recordLoadLog('Monitoring started');
  timer = setInterval(doMonitorTask, locInfo.monitperiod*1000);
  recordLoadLog('Repeat each '+locInfo.monitperiod+' seconds.');
}


function monitorCtrl(switchOn){
  if(switchOn){
    startMonitorTask();
  }else{
    clearInterval(timer);
    //$("#ctbt").val('start');
    recordLoadLog('Monitoring stoped.');
  }
}

var nidNodeMap = {};
var emptyNodes = [];
function putNodeOnPosition(ni){
  //var nType = pd.nid!='None'?'normal':'empty';
  ///var ncLatlgn = obj2gmLatLng(ni.pos);
  if(ni.nid &&ni.nid.length>0){
    var ncLatlgn = str2gmLatLng(ni.pos);
    //var sc = drawSensorUI(pi,c);
    var node = drawNodeByStatus(ncLatlgn,'normal');
    node.setNodeInfo(ni);
    nidNodeMap[ni.nid] = node;
    //bind click event
    node.addListener('click',function(e){
    	showNodeData(ni);
    	//addPointMeun("#t"+ni.pid);
    });

    node.addListener('mouseover',function(e){
    	//showNodeData(ni);
    	//addPointMeun("#t"+ni.pid);
    	//console.log(node.nodeInfo.latestData);
    	var dataName = dataPolicy.name;
    	if(dataName){
      	var data = [];
      	var nodeData = node.nodeInfo.latestData;
      	if(nodeData.length>0){
      	  var dv = getDataItem(nodeData,dataName);
      	  data.push(`${dataPolicy.desc}[${dataName}]:${dv}`);
        	//data.push(['min',dataPolicy.range.min].join(':'));
        	//data.push(['max',dataPolicy.range.max].join(':'));
        	//data.push(['r',node.getRadius()].join(':'));
      	}else{
      	  data.push('No data here.');
      	}
      	//data.push(['alldata',dataPolicy.range.min].join(':'));
      	//console.log(data.join('\n'));
      	//layer.tips(data.join(','), "#t"+ni.pid,{area:['200px','30px']});
      	layer.tips(data.join(','), "#t"+ni.pid);
    	}
    	//console.log(Object.keys(dataPolicy));
    });
    showNodeTag(node.getCenter(),ni);
  }else{
    emptyNodes.push(ni.ptag);
  }
}

var crtWin;
var crtWinIndex;

function showNodeData(ni){
  //show data here:
  parent.layer.open({
    type: 2,
    maxmin: false,
    closeBtn: 1,
    shadeClose: false,
    title: [`NODE&nbsp;${ni.ptag}&nbsp;&nbsp;&nbsp;[${ni.nid.substr(8)}]`,'font-size:24px;'],
    area: ['720px', '600px'],
    //content: `/dm/vnd/${locInfo._id}/${ni.nid}`,
    content: `/dm/vnd/${locInfo._id}/${ni.pid}`,
    //content: '/locations/vnd/'+posData.nid,
    success: function(layero, index) {
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
    }
  });//*/
  //var strWindowFeatures = "width=600px,height=800px;menubar=no,location=no,resizable=yes,scrollbars=yes,status=no";
  //window.open(`/dm/vnd/${locInfo._id}/${ni.pid}`,'nodeData',strWindowFeatures);
}


var delayTime = 30;
function analysisNodesData(){
  //var alertpolicesObj = JSON.parse($("#apv").val());
  var alertpolicesObj = {};//locInfo.alertpolices;
  var alertPolicy = locInfo.alertPolicy;
  if(Array.isArray(alertPolicy)){
    alertPolicy.forEach(function(ap){
      alertpolicesObj[ap.name] = ap.range;
    });
  }
  //console.log('alertpolicesObj',JSON.stringify(alertpolicesObj,null,2));
  delayTime = $("#delayTime").val();
  console.log('delayTime',delayTime);
  if(isNaN(delayTime)) delayTime = 30;
  //console.log('nodesData.length='+nodesData.length);
  var nowTime = Date.now();
  //console.log('nowTime='+nowTime);
  alertNodes.length = 0;
  var maxTime = new Date(maxLatestDataTime).getTime();
  for(var i in nodesData){
    var nd = nodesData[i];

    if(nd.nid && nd.nid.length == 0){//jump over empty nodes.
      //console.log(nd.ptag,'is empty.');
      continue;
    }
    //nidNodeDataMap[nd.nid] = nd;//{dataTime:nd.timestampISO,data:nd.data}
    //step1 first check data exist:if data is empty,no any data
    if(nd.latestData.length == 0){
      //no any data in this node.
      alertNodes.push({nid:nd.nid,atype:'noData'});
      continue;
    }
    //if(if())
    //step2 check nodeDataTime,if it later than 30 minutes,need warning.
    var latestDatatime = new Date(nd.latestDatatime).getTime();
    if(latestDatatime>maxTime){
      maxLatestDataTime = latestDatatime;
      maxTime = new Date(maxLatestDataTime).getTime();
    }
    var tDist = nowTime-latestDatatime;
    //console.log('tDist='+tDist);
    if(tDist>(+delayTime)*60*1000){
      //data lost!
      alertNodes.push({nid:nd.nid,atype:'dataDelay'});
      continue;
    }
    //step do the data content check.
    for(var j in nd.latestData){
      var sensorData = nd.latestData[j];
      for(var dataName in sensorData){
        //console.log('dataName='+dataName);
        var apItem = alertpolicesObj[dataName];
        //console.log('apItem='+apItem);
        if(apItem){
          //compare sensor's data with alertpolices;
          if(sensorData[dataName]<apItem.min||sensorData[dataName]>apItem.max){
            if(alertNids.indexOf(nodesData[i].nid)==-1){
              alertNids.push(nodesData[i].nid);
              alertNodes.push({nid:nd.nid,atype:'warning'});
            }
            console.warn('sensorData='+JSON.stringify(sensorData,null,2));
          }
        }
      }
    }
  }
}

//chang node's color:
function showAlertNodes(){
  for(var i in alertNodes){
    var an = alertNodes[i];
    var targetNode = nidNodeMap[an.nid];
    if(targetNode){
      targetNode.changStatus(an.atype);
      targetNode.flashNode(12);
    }
  }
}

var alterLogContent = '';
function buildAlertLogs(){
  //var hasManyBounds = boundList.length>1;
  alterLogContent = `Refresh Time ${iso2Locale(new Date().toISOString())}\n`;
  alterLogContent += `LatestDataTime is ${iso2Locale(maxLatestDataTime)}\n`;
  for(var bname in boundaryNidTagMap){
    var nidTagMap = boundaryNidTagMap[bname];
    var noDataNodes = [];
    var dataDelayNodes = [];
    for(var i in alertNodes){
      var an = alertNodes[i];
      var tagInBoundary = nidTagMap[an.nid];
      //var tagretNodeData = nidNodeDataMap[an.nid];
      if(tagInBoundary){
        var nodeDesc = `${tagInBoundary}[${an.nid.substr(8)}]`;
        switch(an.atype){
          case 'noData':
            noDataNodes.push({
              node:nodeDesc
            });
            break;
          case 'dataDelay':
            //var nodeLatestDatatime = tagretNodeData.latestDatatime;
            dataDelayNodes.push({
              node:nodeDesc,
              dataTime:nidNodeMap[an.nid].nodeInfo.latestDatatime
            });
            break;
          default:
            //do nothing.
        }
      }
    }
    //buildLogs:
    if(noDataNodes.length>0){
      alterLogContent += `${bname} has ${noDataNodes.length} no data nodes\n`;
      var noDataLog = [];
      noDataNodes.forEach(function(nd){
        noDataLog.push(`${nd.node} has no data.`);
      });
      alterLogContent += noDataLog.join('\n');
    }
    //parse dataDelayNodes.
    if(dataDelayNodes.length>0){
      //sort by dataTime,then show,latert sort.
      sortArrayByAttr(dataDelayNodes,'dataTime','desc');//sortByKey(employees, 'age');

      alterLogContent += `\n\n${bname} has ${dataDelayNodes.length} dataDelay nodes.\nDelay more than ${delayTime} minutes.\n`;
      var dataDelayLog = [];
      dataDelayNodes.forEach(function(nd){
        dataDelayLog.push(`${nd.node}@${iso2Locale(nd.dataTime)}.`);
      });
      alterLogContent += dataDelayLog.join('\n');
    }
  }
}


function restorAlertNodes(){
  for(var i in alertNids){
    var nid = alertNids[i];
    var tmpNode = nidNodeMap[nid];
    if(tmpNode){
      //tmpNode.changStatus(circleStatus.normal);
      tmpNode.changStatus('normal');
    }
  }
  alertNids.length = 0;
}

//*
function updateAlertpolices(){
  //var postData={alertpolices:$("#apv").val()};

  var postData={alertpolices:JSON.parse($("#apv").val())};
  //alert(postData);
  $.post('/api/locations/'+locInfo._id+'/ua',postData,function(data,status){
    //parent.layer.msg(status);
    parent.layer.msg(data);
  },'json').fail(function(data,status){
    console.error('data='+data+'status='+status);
    recordLoadLog('updateAlertpolices failed.');
  });
}//*/

var boundsMonitorMenu = [
  [{
    text: "Brief",
    func: viewBoundsInfo
  },{
    text: "Rename",
    func: updateBoundsName
  }]
];

function showDataCount(){
  console.log('showDataCount here.');
}
function showAlertLog(){
  console.log('showAlertLog here.');
}

var pointMonitorMenu = [
  [{
    text: "dataCount",
    func: showDataCount
  },{
    text: "alertLog",
    func: showAlertLog
  }]
];

function addBoundsMeun(tagId){
  //$(tagId).smartMenu(boundsMonitorMenu, {name: "boundsMonitorMenu"});
  //console.log('view do nothing.');
}

function addPointMeun(tagId){
  //$(tagId).smartMenu(pointMonitorMenu, {name: "pointMonitorMenu",textLimit:10});
  //console.log('view do nothing.');
}

function refresh(){
  doMonitorTask(function(){
    var cntHtml = `<div style="padding:5px 10px 5px 10px">
      Alert Log:<br />
      <textarea id="_an" rows="14" cols="45">${alterLogContent}</textarea><br/>
      Operate log:<br />
      <textarea id="_ol" rows="3" cols="45">${operateLogs.reverse().join('\n')}</textarea>
      </div>`;
    parent.layer.open({
      type: 1,
      title:'Monitoring log',
      //skin: 'layui-layer-rim',
      area: ['360px', '480px'],
      content: cntHtml
    });
  });
}

function viewDataTime(){
  console.log('viewLog here.');
  parent.layer.open({
    type: 2,
    title:'viewDataTime',
    maxmin: false,
    closeBtn: 1,
    shadeClose: false,
    area: ['800px', '600px'],
    content: '/dm/sdt/'+locInfo._id,
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
      //console.log('viewDataTime open over.');
    }
  });
}

function viewDashboard(){
  console.log('viewDashboard here.');
  parent.layer.open({
    type: 2,
    title:'viewDashboard',
    maxmin: false,
    closeBtn: 1,
    shadeClose: false,
    area: ['750px', '600px'],
    content: '/dm/sndd/'+locInfo._id,
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
      //console.log('viewDashboard open over.');
    }
  });
}

function viewAllData(){
  //console.log('viewAllData here.');
  parent.layer.open({
    type: 2,
    title:['AllNodesData','font-size:24px;'],
    maxmin: false,
    closeBtn: 1,
    shadeClose: false,
    area: ['720px', '600px'],
    content: '/dm/ad/'+locInfo._id,
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
      //iframeWin.setDataObj(locInfo);
      //console.log('viewDashboard open over.');
    }
  });
}


function changeNodeSize(node,edgeValue,dp){
  if(node.nodeInfo.latestData.length == 0) return;
  var crtRadius = node.getRadius(),newRadius;
  var crtDataValue = +getDataItem(node.nodeInfo.latestData,dp.name);
  var dist,rule;
  //console.log(crtRadius,dp.range.min,dp.range.max,crtDataValue);
  if(crtDataValue<dp.range.min){//need minify the node.
    dist =  dp.range.min - crtDataValue;
    rule = dp.range.min - edgeValue;
    var minifyValue = +parseFloat(0.7/rule*dist).toFixed(3);
    newRadius = +parseFloat(crtRadius-minifyValue).toFixed(3);
    node.setRadius(newRadius);
  }
  if(crtDataValue>dp.range.max){//need magnify the node
    dist = crtDataValue - dp.range.max;
    rule = edgeValue - dp.range.max;
    var magnifyValue = +parseFloat(1/rule*dist).toFixed(3);
    newRadius = +parseFloat(crtRadius+magnifyValue).toFixed(3);
    node.setRadius(newRadius);
  }
}

function checkDataItem(dp){
  //console.log('dp=\n',JSON.stringify(dp,null,2));
  var min = +dp.range.min,max = +dp.range.max;
  var lowNodes = [],midNodes = [],highNodes = [];
  var newStatus;
  var dataMin = Infinity,dataMax = -Infinity;
  for(var nid in nidNodeMap){
    var node = nidNodeMap[nid];
    var nodeData = node.nodeInfo.latestData;
    if(nodeData.length == 0){
      //console.log(node.nodeInfo.ptag,'no data.');
      newStatus = 'noData';
      node.changStatus(newStatus);
      changeNodeTagColor(node.nodeInfo.pid,newStatus);
      continue;
    }
    var dv = +getDataItem(nodeData,dp.name);
    if(dv == null) {
      continue;
    }
    if(dv<dataMin){
      dataMin = dv;
    }
    if(dv>dataMax){
      dataMax = dv;
    }
    if(dv<min) lowNodes.push(nid);
    if(min<=dv && dv<=max) midNodes.push(nid);
    if(dv>max) highNodes.push(nid);
  }
  //console.log('dataMin=',dataMin,'dataMax=',dataMax);
  /*
  console.log('lowNodes',JSON.stringify(lowNodes,null,2));
  console.log('midNodes',JSON.stringify(midNodes,null,2));
  console.log('highNodes',JSON.stringify(highNodes,null,2));//*/
  if(lowNodes.length > 0){
    //show low node,change color to blue,size to little
    lowNodes.forEach(function(nid){
      var node = nidNodeMap[nid];
      newStatus = 'lowData';
      node.changStatus(newStatus);
      //node.setRadius(0.5);
      changeNodeSize(node,dataMin,dp);
      //console.log(node.nodeInfo.ptag,'newRadius',node.getRadius());
      changeNodeTagColor(node.nodeInfo.pid,newStatus);
    });
  }
  if(midNodes.length > 0){
    //show low node,change color to green,size to middle
    midNodes.forEach(function(nid){
      var node = nidNodeMap[nid];
      newStatus = 'normal';
      node.changStatus(newStatus);
      changeNodeTagColor(node.nodeInfo.pid,newStatus);
    });
  }
  if(highNodes.length > 0){
    //show low node,change color to blue,size to big
    highNodes.forEach(function(nid){
      var node = nidNodeMap[nid];
      newStatus = 'highData';
      node.changStatus('highData');
      //node.setRadius(2.0);
      changeNodeSize(node,dataMax,dp);
      //console.log(node.nodeInfo.ptag,'newRadius',node.getRadius());
      changeNodeTagColor(node.nodeInfo.pid,newStatus);
    });
  }
}

function echoFreeNodes(fnList){
  fnList.forEach(function(fn){
    //console.log(JSON.stringify(fn,null,2));
    var node = putNodeOnPosition(fn);
    //node.setDraggable(true);
  });
}

function getLocInfo(){
  return locInfo;
}
