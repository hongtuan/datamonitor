
/**core functions for map operate**/
var map;
var mapCenter;
var markers = [];
//var infoWindow;

var gmgSph;//google.maps.geometry.spherical
var gmgPoly;//google.maps.geometry.poly;


//roof edge offset and node span config.
var roofConfig = {
  weSpan:ft2m(40),    //West-East direction spance unit:meter
  snSpan:ft2m(40),    //South-North direction spance unit:meter
  weOffset:ft2m(20),   //West-East direction offset to edge unit:meter
  snOffset:ft2m(20)    //South-North direction offset to edge unit:meter
};

//var ctLatLng;
var ctMarker;

function setupSearchBox(){
  var markerInfoWin = new google.maps.InfoWindow();
  //search box.
  var input = document.getElementById('pac-input');

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var marker = new google.maps.Marker({
    map: map
  });
  marker.addListener('click', function() {
    markerInfoWin.open(map, marker);
  });

  autocomplete.addListener('place_changed', function() {
    markerInfoWin.close();
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    // Set the position of the marker using the place ID and location.
    marker.setPlace({
      placeId: place.place_id,
      location: place.geometry.location
    });
    marker.setVisible(true);
    locInfo.ctpos = [place.geometry.location.lat(),place.geometry.location.lng()].join(',');
    //ctLatLng = [place.geometry.location.lat(),place.geometry.location.lng()].join(',');
    //console.log('ctLatLng='+ctLatLng);

    markerInfoWin.setContent('<div><strong>' + place.name + '</strong><br>' +
      'Place ID: ' + place.place_id + '<br>' +
      place.formatted_address+'<br>'+
      '<input type="button" value="saveCenter" onclick="updateLocCenter()"/>'
    );
    markerInfoWin.open(map, marker);
  });
}

function updateNodeTag(){
  //update the node tag color here.
  for(var pid in pidNodeMap){
    var node = pidNodeMap[pid];
    if(node.nodeInfo.nid == undefined || node.nodeInfo.nid.length==0){
      changeNodeTagColor(node.nodeInfo.pid,'empty');
    }
  }
}

function initMap() {
  var lwi = parent.layer.load();
  //rotateMap(40);
  //mapCenter = new google.maps.LatLng(42.345858,-87.885888);
  mapCenter = str2gmLatLng(locInfo.ctpos);
  //mapCenter = new google.maps.LatLng(44.5452,-78.5389);
  map = new google.maps.Map(document.getElementById('map'), {
    center: mapCenter,
    zoom: 19,
    mapTypeId: google.maps.MapTypeId.HYBRID,
    //mapTypeId: google.maps.MapTypeId.SATELLITE,
    disableDefaultUI: true,
    heading: 90,
    tilt: 0
    //mapTypeId: google.maps.MapTypeId.ROADMAP
    //mapTypeId: google.maps.MapTypeId.SATELLITE,
    //mapTypeId: google.maps.MapTypeId.TERRAIN
    /*
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    heading: 90,
    tilt: 45//*/
  });

  //console.log('rotateMap over.');
  map.addListener('zoom_changed',function(e){
    console.log('zoom='+map.getZoom());
    showNewNids();
  });
  map.addListener('dragend',function(e){
    //console.log('zoom='+map.getZoom());
    showNewNids();
  });
  /*
  map.addListener('click',function(e){
    console.log('map click!');
  });
  map.addListener('resize',function(e){
    //console.log('zoom='+map.getZoom());
    //showNewNids();
  });//*/
  //draw a center mark here
  ctMarker = new google.maps.Marker({
    position: mapCenter,
    draggable: true,
    animation: google.maps.Animation.DROP,
    map: map,
    title: 'Location center,you can update by search.'
  });
  //update location's center when user dragend.
  ctMarker.addListener('dragend', function(e){
    var npos = ctMarker.getPosition();
    //console.log(npos);
    var geocoder = new google.maps.Geocoder;
    geocoder.geocode({location: npos,region:'en'}, function(results, status) {
      if (status === 'OK') {
        if (results[1]) {
          //window.alert(results[1].formatted_address);
          locInfo.ctpos = [npos.lat(),npos.lng()].join(',');
          var address = results[0].formatted_address;
          locInfo.address = address.replace('美国',', USA');
          updateLocCenter();
        } else {
          parent.layer.msg('No results found');
        }
      } else {
        parent.layer.msg('Geocoder failed due to: ' + status);
      }
    });
  });
  //

  //map.setTilt(45);
  //map.setHeading(90.0);
  //get two object for calc.
  gmgSph = google.maps.geometry.spherical;
  gmgPoly = google.maps.geometry.poly;
  // Define an info window on the map.
  crtRectInfoWin = new google.maps.InfoWindow();
  crtPolygonInfoWin = new google.maps.InfoWindow();
  //crtCircleInfoWin = new google.maps.InfoWindow();

  //initConfig();
  setupSearchBox();
  setupDrawingManager();
  //echo useage here:
  //showHelp();

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
    //updateNodeTag();
  });
  console.log('initMap called.');

  //$("#menutest").smartMenu(boundsMenu,{name:'testMenu',type:'left'});
  //console.log('over.');
  //setupTxtOverlay();

  //console.log('uid='+getUserInfo().uid);
  //console.log('crtUser:'+JSON.stringify(getUserInfo(),null,2));
}

function showHelp(){
  var helpInfo = 'You can draw rectangle or polygon to define the roof edge,<br />'+
    'then click Deploy button to put senors in edge.<br />'+
    'Before you click Save,you can click Del to remove edge.';
  //layer.tips(helpInfo,'#pac-input',
  //  {tips: [3, '#78BA32'],time: 6000});
  parent.layer.msg(helpInfo,{skin: 'layui-layer-molv',time:5000,area:['420px', '120px']});
}

function cvtUnit(uiv,dv,isFt){
  var num = 0.0;
  try{
    num = parseFloat(uiv);
  }catch(e){
    num = dv;
  }
  return isFt?ft2m(num):num;
}

function updateRoofConfig(){
  var isFt = 'ft'==$("input[name='du']:checked").val();
  /*
  roofConfig.weOffset = cvtUnit($("#weOffset").val(),20.0,isFt);
  roofConfig.weSpan = cvtUnit($("#weSpan").val(),40.0,isFt);
  roofConfig.snOffset = cvtUnit($("#snOffset").val(),20.0,isFt);
  roofConfig.snSpan = cvtUnit($("#snSpan").val(),40.0,isFt);//*/
  //putAheadLogInfo(JSON.stringify(roofConfig));
  roofConfig.weOffset = cvtUnit($("#edgeOffset").val(),20.0,isFt);
  roofConfig.weSpan = cvtUnit($("#sensorSpan").val(),40.0,isFt);
  roofConfig.snOffset = cvtUnit($("#edgeOffset").val(),20.0,isFt);
  roofConfig.snSpan = cvtUnit($("#sensorSpan").val(),40.0,isFt);
}

function switchUnit(){
  var sdu = $("input[name='du']:checked").val();
  if('ft'==sdu){
    $("#edgeOffset").val(m2ft($("#edgeOffset").val()));
    //$("#snOffset").val(m2ft($("#snOffset").val()));
    $("#sensorSpan").val(m2ft($("#sensorSpan").val()));
    //$("#snSpan").val(m2ft($("#snSpan").val()));
    //$(".dut").css('width','30px');
  }else{
    $("#edgeOffset").val(ft2m($("#edgeOffset").val()));
    //$("#snOffset").val(ft2m($("#snOffset").val()));
    $("#sensorSpan").val(ft2m($("#sensorSpan").val()));
    //$("#snSpan").val(ft2m($("#snSpan").val()));
    //$(".dut").css('width','40px');
  }
}

function saveRect(){
  crtRectInfo = getRectInfo(crtRect);
  //save Rect to db.
  //console.log('crtRectInfo='+JSON.stringify(crtRectInfo,null,2));
  //*/
  var pointsData = cvtPositionData(crtRectNodesPos);
  //console.log('pointsData='+JSON.stringify(pointsData,null,2));
  var rectData = {
    lid:locInfo._id,
    bd:JSON.stringify(crtRectInfo),
    //bd:crtRectInfo,
    pd:JSON.stringify(pointsData),
  };
  var lwi = parent.layer.load();
  $.post('/api/locations/'+locInfo._id+'/savebound',rectData,
    function(data,status){
      console.log(data);
      console.log(status);
      parent.layer.close(lwi);
      parent.layer.msg(data);
      crtRect.setDraggable(false);
      crtRect.setEditable(false);
      crtRect = null;
      window.location.reload();
    },'json'
  ).fail(function(data,status){
      console.log(data);
      console.log(status);
      parent.layer.close(lwi);
    }
  );
  //console.log('saveRect over.');
}

function savePolygon(){
  crtPolygonInfo = getPolygonInfo(crtPolygon);
  //save Polygon to db.
  //console.log('crtPolygon='+JSON.stringify(crtPolygonInfo));
  //*/
  var pointsData = cvtPositionData(crtPolygonNodesPos);
  //console.log('sensorData='+sensorData);
  var polygonData = {
    lid:locInfo._id,
    //must send as str to remain numbervalues.
    bd:JSON.stringify(crtPolygonInfo),
    //bd:crtPolygonInfo,
    pd:JSON.stringify(pointsData)
  };
  var lwi = parent.layer.load();
  $.post('/api/locations/'+locInfo._id+'/savebound',polygonData,
    function(data,status){
      console.log(data);
      console.log(status);
      parent.layer.close(lwi);
      parent.layer.msg(data);
      crtPolygon = null;
      window.location.reload();
    },'json'
  ).fail(function(data,status){
      console.log(data);
      console.log(status);
    }
  );
  //console.log('savePolygon over.');
}

function doSave(){
  if(crtRect!=null && rectSensors.length > 0) saveRect();
  if(crtPolygon!=null && polygonSensors.length > 0) savePolygon();
  if(freeNodes.length>0){
    saveFreeNodes();
    freeNodes.length = 0;
  }
}

var crtWin;
var crtWinIndex;

function inputCenter(){
  //alert('inputCenter');
  //console.log('lid='+locInfo._id);
  parent.layer.open({
    type: 2,
    title: 'InputCenter',
    fix: false,
    resize:false,
    shadeClose: true,
    maxmin: false,
    closeBtn:1,
    shadeClose: false,
    area : ['396px' , '150px'],
    content: '/locations/'+locInfo._id+'/ic',
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
      //console.log('inputCenter success.');
    }
  });
}

function saveDragNode(ni,pos){
  var tagPos = gmgSph.computeOffset(pos,1,45);
  pidNodeTagMap[ni.pid].setPosition(tagPos);
  //
  var pointData = {
    lid:locInfo._id,
    bid:ni.bid,
    pid:ni.pid,
    coords:gmLatLng2Str(pos)
  };
  var lwi = parent.layer.load();
  $.post('/api/locations/upi',pointData,function(response,status){
    parent.layer.msg(response);
    parent.layer.close(lwi);
    //disable draggable here.
    //pidNodeMap[ni.pid].setDraggable(false);
  });
}

var pidNodeMap = {};
var nidNodeMap = {};
var emptyNodes = [];
function putNodeOnPosition(ni){
  //var ncLatlgn = obj2gmLatLng(pd.pos.lat,pd.pos.lng);
  //console.log('ni.bid='+ni.bid);
  //var ncLatlgn = obj2gmLatLng(ni.pos);
  var ncLatlgn = str2gmLatLng(ni.pos);
  //var status = ni.nid && ni.nid.length>0?'normal':'empty';
  var nodeStatus = ni.nid && ni.nid.length>0?'normal':'empty';
  //console.log('nodeStatus=',nodeStatus);
  var node = drawNodeByStatus(ncLatlgn,nodeStatus);//,true
  showNodeTag(node.getCenter(),ni);
  node.setNodeInfo(ni);
  pidNodeMap[ni.pid] = node;//for update use.
  if(ni.nid && ni.nid.length>0) nidNodeMap[ni.nid] = node;//for flash use.
  else emptyNodes.push(ni.ptag);

  //bind click event
  node.addListener('click',function(e){
    //e.stop();
  	inputNodeInfo(ni);
  });
  /*
  node.addListener('rightclick',function(e){
  	//console.log('rightclick',ni.pid);
  	pidNodeMap[ni.pid].setDraggable(true);
  });//*/

  node.addListener('dragend', function(e){
    //To-do node move here:
    //var newLatLng = e.latLng;
    var newLatLng = node.getCenter();
    //console.log('dragend.');
    //calc newLatLng,if it not in it's boundary,not go back.
    var bid = node.nodeInfo.bid;
    if(bid == 'FreeNode'){
      saveDragNode(ni,newLatLng);
    }else{
      var bType = bidBoundaryMap[bid].bd.bt;
      //if(bType == 1)
      var edge = bidEdgeMap[bid];
      if((bType == 1 && edge.getBounds().contains(newLatLng))||
        (bType == 2 && gmgPoly.containsLocation(newLatLng,edge))){
        saveDragNode(ni,newLatLng);
      }else{
        //go back to its pos in db.
        var oldLatLng = str2gmLatLng(node.nodeInfo.pos);
        node.setCenter(oldLatLng);
        parent.layer.msg("Can't move node outside its edge.");
      }
    }
  });
  return node;

  //changeNodeTag(ni.pid,nodeStatus);

  //var customTxt = '<div>'+ni.ptag+'</div>'
  //var txt = new TxtOverlay(p, customTxt, "customBox", map);
  //txt.draggable = true; not work
}




function inputNodeInfo(posData){
  //console.log('pid='+pid);
  parent.layer.open({
    type: 2,
    title: 'InputNodeInfo',
    fix: false,
    shadeClose: true,
    maxmin: false,
    closeBtn:1,
    area : ['480px' , '340px'],
    //content: '/locations/'+locInfo._id+'/mgr/'+posData.bid+'/'+posData.pid,
    content: `/locations/${locInfo._id}/mgr/${posData.bid}/${posData.pid}`,
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
    }
  });
}

function showNewNode(nid){
  var _infoWin = new google.maps.InfoWindow();
}

//var newNids = ['105043c9a3373d35','205043c9a3361a6a','305043c9e7275293'];
var newNids = [];
var offsetZoomMap = {
  z17:{spxo:-70,spyo:30,eno:28},//-100
  z18:{spxo:-35,spyo:15,eno:14},//-50
  z19:{spxo:-17,spyo:8,eno:7},//-26
  z20:{spxo:-8,spyo:4,eno:4}//-13
};
var newNodes = [];
function removeNewNid(nid){
  var index = newNids.indexOf(nid);
  if(index!=-1){
    newNids = newNids.splice(index,1);
  }
  //console.log(newNids);
}

var targetNode = null;
//drag and drop to put node core function
function showNewNids() {
  //clear newNodes first.
  if(newNodes.length>0){
    for(var i in newNodes){
      var node = newNodes[i];
      node.onRemove();
      node.setMap(null);
    }
    newNodes.length = 0;
  }
  //put some test nodes around map center.
    //,
    //'005043c9032f1f69','005043c9032eb086','005043c9032f2b97','005043c9032f2a31',
    //'005043c9a3361c45','005043c9a3373ba9','005043c903378d66'];

  //var offset = offsetZoomMap['z'+map.getZoom()];
  var offsetInfo = offsetZoomMap['z'+map.getZoom()];
  if(!offsetInfo){
    console.log('zoom to small.');
    return;
  }
  //console.log('offsetInfo='+JSON.stringify(offsetInfo,null,2));
  var mapNE = map.getBounds().getNorthEast();
  var startPos = gmgSph.computeOffset(mapNE,offsetInfo.spxo,90);
  startPos = gmgSph.computeOffset(startPos,offsetInfo.spyo,180);
  for(var i in newNids){
    var distance = offsetInfo.eno*i+offsetInfo.eno;
    //var distance = (+(1+i))*offsetInfo.eno;//*i+offsetInfo.eno;
    //console.log('distance='+distance);
    var nodePos = gmgSph.computeOffset(startPos,distance,180);
    var div = document.createElement('DIV');
    div.innerHTML = '<div class="newnid">'+newNids[i].substr(8)+'</div>';
    var newNidMarker = new RichMarker({
      nid:newNids[i],
      map: map,
      position: nodePos,
      draggable: true,
      flat: true,
      anchor: RichMarkerPosition.BOTTOM_LEFT,
      content: div
    });

    //bind events in this function:
    (function(lockedNidMarker) {
      //bind dragend event here:
      google.maps.event.addListener(lockedNidMarker, 'dragstart', function() {
        //console.log($("#inspectOn"));//$("input[name='du']:checked")
        //console.log('inspectOn='+JSON.stringify($("input[name='inspectOn']:checked"),null,2));
        console.log('inspectOn='+$('#inspectOn').prop('checked'));
        if($('#inspectOn').prop('checked')) $("#inspectOn").click();
      });
      google.maps.event.addListener(lockedNidMarker, 'dragend', function() {
        var bounds = lockedNidMarker.getBounds();
        if(!bounds) {
          console.log('bounds not get.');
          return;
        }
        var findMatchedNode = false;
        //find the closest node:
        for(var pid in pidNodeMap){
          var tmpBounds = pidNodeMap[pid].getBounds();
          if(bounds.intersects(tmpBounds)){
            //record the closest node and chang the color.
            targetNode = pidNodeMap[pid];
            targetNode.changStatus('active');
            findMatchedNode = true;
            //console.log(targetNode.nodeInfo.ptag,pid,lockedNidMarker.getNid());
            break;
          }
        }
        if(findMatchedNode){
          //var tnPid = targetNode.nodeInfo.pid;
          //var tnBid = targetNode.nodeInfo.bid;
          var tnPtag = targetNode.nodeInfo.ptag;
          var nid = lockedNidMarker.getNid();
          parent.layer.confirm(`Put ${nid} on node ${tnPtag}?`,
            {icon: 3, title:'Put Confirm',btn: ['Yes','No']},
            //select Yes
            function(index){
              //save nid to database here:
              var pointData = {
                lid:locInfo._id,
                bid:targetNode.nodeInfo.bid,
                pid:targetNode.nodeInfo.pid,
                //ptag:tnPtag,
                nodeid:nid
              };
              $.post('/api/locations/upi',pointData,function(response,status){
                parent.layer.msg(response);
                //parentWin.location.reload();
                //doClose();
                parent.layer.close(index);
                targetNode.changStatus('normal');
                removeNewNid(nid);
                //add targetNode to map,so it will flash.
                nidNodeMap[nid] = targetNode;
                lockedNidMarker.onRemove();
                lockedNidMarker.setMap(null);
                lockedNidMarker = null;
                //targetNode = null;
              });
            },
            //select No
            function(){
              //restore matched node to it's initStatus
              targetNode.restoreInitStatus();
              //clear targetNode
              //targetNode = null;
              //keep new node.
            }
          );
        }else{
          //do nothing.
          console.log('Not found,go back');
        }
      });
      //over.
    })(newNidMarker);
    //record newNidMarker in an Array for use later.
    newNodes.push(newNidMarker);
  }
}

function doInspectTask(){
  //get data from server.
  $.post('/api/nd/'+locInfo._id+'/eint',locInfo,function(data,status){
    console.log(JSON.stringify(data));
    //show inspect res:
    if(data){
      //console.log(data.swipLog.logContent+'\n'+iso2LocaleTime(data.swipLog.createdOn));
      //console.log('data.snc='+data.snc);
      newNids.length = 0;
      if(data.snc>0){
        var onlineSwipNodes = [];
        var swipNodes = data.swipNodes;
        //console.log(JSON.stringify(swipNodes,null,2));
        for(var i in swipNodes){
          var nid = swipNodes[i].nid;
          if(nidNodeMap[nid]){
            //nidNodeMap[nid].flashNode(12);
            onlineSwipNodes.push(nid);
          }else{
            if(!newNids.includes(nid))
              newNids.push(nid);
          }
        }
        //then flash onlineNodes
        onlineSwipNodes.forEach(function(nid){
          if(nidNodeMap[nid]){
            nidNodeMap[nid].flashNode(6);
          }
        });
      }else{
        parent.layer.msg('No swip nodes find,please try again.');
      }
      //show new nodes.
      if(newNids.length>0){
        showNewNids();
        parent.layer.msg(`Find ${newNids.length} Unassigned swip nodes,<br/>please drag them into tags.`);
      }
      if(newNids.length>20){
        //show stop scan task here.how?
        $("#inspectOn").click();
        parent.layer.msg('find new nids!');
      }
    }
  },'json').fail(function(data,status){
    console.error(data);
    console.info(status);
  });
}


function swithInspect(switchOn){
  console.log('inspectOn->switchOn='+switchOn);
  if(switchOn){
    //
    taskId = setInterval(doInspectTask,$("#iDelay").val()*1000);
    console.log('Auto task started.');
  }else{
    //table.style.display='';
    if(taskId) clearInterval(taskId);
    console.log('Auto task stoped.');
  }
}

function downloadByIframe(url){
  console.log('url='+url);
  var iFrameName = 'myIframe';
  var iframe = document.getElementById(iFrameName);
  if(iframe){
    iframe.src = url;
    iframe.reload();
  }else{
    iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = url;
    iframe.id = iFrameName;
    document.body.appendChild(iframe);
  }
}


function refreshNode(pid,toStatus,nid){
  ///console.log('cool',pid,status);
  if(pid){
    var node = pidNodeMap[pid];
    if(node)
      node.changStatus(toStatus);

    if(toStatus == 'empty'){
      var lastNid = pidNodeMap[pid].nodeInfo.nid;
      delete  nidNodeMap[lastNid];//cool!
    }
    if(toStatus == 'normal'){
      node.nodeInfo.nid = nid;
      nidNodeMap[nid] = node;
      console.log('nidNodeMap updated.');
    }
  }
}

function removeNode(pid){
  ///console.log('cool',pid,status);
  if(pid){
    var node = pidNodeMap[pid];
    if(node){
      node.setMap(null);
      delete  pidNodeMap[pid];//update data model!
    }
    var tag = pidNodeTagMap[pid];
    if(tag){
      tag.setMap(null);
      delete  pidNodeTagMap[pid];//update data model!
    }
  }
}

function moveNodes(){
  for(var pid in pidNodeMap){
    var node = pidNodeMap[pid];
    if(node.nodeInfo.bid == selectedBoundaryId)
      node.setDraggable(true);
  }
  parent.msg('Now you can move any nodes in the Edge.');
}

var boundsMgrMenu = [
  [/*{
    text: "Location Brief",
    func: viewLocationBrief
  },*/{
    text: "Brief",
    func: viewBoundsInfo
  },{
    text: "Rename",
    func: updateBoundsName
  },{
    text: "MoveNodes",
    func: moveNodes
  },{
    text: "Delete",
    func: deleteBounds
  }],[{
    text: "Export",
    func: expArea
  },{
    text: "Import",
    func: impArea
  }]
];

function addBoundsMeun(tagId){
  $(tagId).smartMenu(boundsMgrMenu, {name: "boundsMgrMenu",textLimit:10});
}

function enableMove(){

}

var pointMgrMenu = [
  [{
    text: "enableMove",
    func: enableMove
  }]
];

function addPointMeun(tagId){
  $(tagId).smartMenu(pointMgrMenu, {name: "pointMgrMenu"});
  //console.log('view do nothing.');
}


function echoFreeNodes(fnList){
  fnList.forEach(function(fn){
    //console.log(JSON.stringify(fn,null,2));
    var node = putNodeOnPosition(fn);
    node.setDraggable(true);
  });
}


function expFreeNode(){
  //console.log('do location export here.');
  var url = `/locations/${locInfo._id}/efn`;
    //console.log(url);
  downloadFile(url);
}

function impLocation(){
  console.log('do location import here.');
  var url = `/locations/${locInfo._id}/ifp`;
  parent.layer.open({
      type: 2,
      title: 'Import free node;-)',
      area: ['360px', '180px'],
      resize:false,
      closeBtn: 1,
      shadeClose: true,
      content: url,
      success: function(layero, index){
        //second window,need use parent.
        var iframeWin = parent.window[layero.find('iframe')[0]['name']];
        iframeWin.parentWin = crtWin;
        iframeWin.crtWinIndex = index;
      }//*/
    });
}

