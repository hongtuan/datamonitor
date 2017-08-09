
var crtRect = null,crtPolygon = null;           //,crtCircle = null;
var rectSensors = [], polygonSensors = [];      //UI data
var rectGrids = [],polygonGrids = [];           //UI data
var crtRectInfo = null,crtPolygonInfo = null;   //,crtCircleInfo = null;
var crtRectNodesPos = [],crtPolygonNodesPos = []; //,crtCircleInfo = null;
var crtRectInfoWin,crtPolygonInfoWin; //,crtCircleInfoWin;
var rowIndex = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N',
  'O','P','Q','R','S','T','U','V','W','X','Y','Z'];//'A'~'Z'
/*
function initConfig(){
  rowIndex.length = 0;
  console.log('A='+'A',parseInt('A'));
  for(var i=0,c = 'A';i<=26;i++){
    rowIndex.push(+i+c);
  }
}//*/

/**
 * 
 **/
function setupDrawingManager(){
  //init drawingManager.
  var drawingManager = new google.maps.drawing.DrawingManager({
    //drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
      drawingModes: [
        //google.maps.drawing.OverlayType.MARKER,
        google.maps.drawing.OverlayType.RECTANGLE,
        google.maps.drawing.OverlayType.POLYGON,
        //google.maps.drawing.OverlayType.CIRCLE,
        //google.maps.drawing.OverlayType.POLYLINE,
      ]
    },
    //markerOptions: {icon: 'images/beachflag.png'},
    rectangleOptions:{
      strokeWeight: 2,
      strokeColor:'#0000FF',
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      clickable: true,
      editable: true,
      draggable:true,
      zIndex: 1
    },
    polygonOptions: {
      strokeWeight: 2,
      strokeColor:'#0000FF',
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      clickable: true,
      editable: false,
      draggable:false,
      zIndex: 1
    }/*,
    circleOptions: {
      strokeWeight: 2,
      strokeColor:'#0000FF',
      fillColor: '#0000FF',
      fillOpacity: 0.35,
      clickable: true,
      editable: true,
      draggable:true,
      zIndex: 1
    }//*/
  });
  drawingManager.setMap(map);
  drawingManager.setDrawingMode(null);
  
  drawingManager.addListener('rectanglecomplete',function(rect){
    drawingManager.setDrawingMode(null);
    crtRectInfo = getRectInfo(rect);
    rect.addListener('bounds_changed', clearRect);
    rect.addListener('click', viewRect);
    crtRect=rect;
  });
  
  drawingManager.addListener('polygoncomplete',function(polygon){
    drawingManager.setDrawingMode(null);
    /*
    polygon.addListener('click',function(pme){
      alert([pme.edge,pme.path,pme.vertex].join('<br />'));
    });
    alert('look!'+gmgPoly.containsLocation(mapCenter,polygon));//*/
    crtPolygon = polygon;
  });
  /*
  drawingManager.addListener('circlecomplete',function(circle){
    drawingManager.setDrawingMode(null);
  });//*/
}

function viewRect(){
  if(crtRectInfo == null) return;
  var contentString = getRectInfoDesc('<br/>');
  //showInfoWin(contentString,crtRectInfo.rt);
  crtRectInfoWin.setContent(contentString);
  crtRectInfoWin.setPosition(crtRectInfo.rt);
  crtRectInfoWin.open(map);
}

function getRectInfo(rect){
  var bounds = rect.getBounds();
  var ne = bounds.getNorthEast();
  var sw = bounds.getSouthWest();
  var ri = {
    bt:1,
    rt:gmLatLng2Obj(ne),                //right-top(ne)
    rb:num2Obj(sw.lat(),ne.lng()),      //right-bottom
    lb:gmLatLng2Obj(sw),                //left-bottom(sw)
    lt:num2Obj(ne.lat(),sw.lng()),      //left-top
    ct:gmLatLng2Obj(bounds.getCenter()) //center of Rect
  };
  var w = gmgSph.computeDistanceBetween(obj2gmLatLng(ri.rt),obj2gmLatLng(ri.lt));
  var h = gmgSph.computeDistanceBetween(obj2gmLatLng(ri.lt),obj2gmLatLng(ri.lb));
  ri.w = parseFloat(w.toFixed(2));
  ri.h = parseFloat(h.toFixed(2));
  ri.area = parseFloat((w*h).toFixed(2));
  //var bid = String(String(bi.ct.lat()+bi.ct.lng()+bi.h+bi.w).hashCode());
  var hc = JSON.stringify(ri).hashCode();
  ri.id = hc>0?hc:-1*hc;
  return ri;
}

function getPolygonInfo(polygon){
  //calc polygon's area,lengths
  var paths = polygon.getPath();
  //var totalLen = 0.0,
  var tmpLen = 0.0,perimeter = 0.0;
  var len = paths.getLength();
  var vertexs = [];
  var mapNE = map.getBounds().getNorthEast();
  var boundsTagPos = paths.getAt(0);
  var dist = gmgSph.computeDistanceBetween(boundsTagPos,mapNE);
  for(var i=0,j=i+1;i<len;i++,j++){
    if(j==len) j = 0;
    var p = paths.getAt(i),np = paths.getAt(j);
    tmpLen = gmgSph.computeDistanceBetween(p,np);
    perimeter += tmpLen;
    vertexs.push(gmLatLng2Obj(p));
    var _dist = gmgSph.computeDistanceBetween(p,mapNE);
    if(_dist<dist){
      boundsTagPos = p;
      dist = _dist;
    }
  }
  
  var area = gmgSph.computeArea(paths).toFixed(2);
  var baseLine = getPolygonBaseLine(polygon);
  var detectOpt = getPolygonDetectOption(baseLine,polygon);
  //calc center point of polygon.
  var centerPoint = gmgSph.computeOffset(
    obj2gmLatLng(baseLine.middlePoint),
    detectOpt.detectMaxOffset*0.4,detectOpt.offsetHeading+baseLine.heading);
  //putSensor(centerPoint,'red');
  var hc = JSON.stringify(baseLine).hashCode();
  return {
    bt:2,
    vertexs:vertexs,
    edgeCount:len,
    perimeter:perimeter,
    area:area,
    baseLineInfo:baseLine,
    detectOpt:detectOpt,
    ct:gmLatLng2Obj(centerPoint),
    btp:gmLatLng2Obj(boundsTagPos),
    id:hc>0?hc:-1*hc
  };
}

function clearRect(){
  if(rectSensors.length >0){
    for(var i=0;i<rectSensors.length;i++){
      rectSensors[i].setMap(null);
    }
    rectSensors.length = 0;
  }
  if(rectGrids.length>0){
    for(var i=0;i<rectGrids.length;i++){
      rectGrids[i].setMap(null);
    }
    rectGrids.length = 0;
  }
}

function clearPolygon(){
  if(polygonSensors.length >0){
    for(var i=0;i<polygonSensors.length;i++){
      polygonSensors[i].setMap(null);
    }
    polygonSensors.length = 0;
  }
  if(polygonGrids.length>0){
    for(var i=0;i<polygonGrids.length;i++){
      polygonGrids[i].setMap(null);
    }
    polygonGrids.length = 0;
  }
}

function getPointsBetween(p1,p2,start,offset,ric){
  var ps = [];
  var dist = gmgSph.computeDistanceBetween(p1,p2);
  for(var i=start,ci=1;i<dist;i+=offset){
    var p = gmgSph.computeOffset(p1,i,90);
    //ps.push(p);
    ps.push({ptag:[ric,ci].join(''),p:p});
    ci++;
  }
  return ps;
}

function deploySensorsInRect(rect,drawGrid){
  var rectInfo = getRectInfo(rect);
  /*from lb
  for(var i=roofConfig.snOffset;i<rectInfo.h;i+=roofConfig.snSpan){
    var p1 = gmgSph.computeOffset(obj2gmLatLng(rectInfo.lb),i,0);
    var p2 = gmgSph.computeOffset(p1,rectInfo.w,90);
    if(drawGrid) drawGridLine([p1,p2],'red','rect');
  }//*/
  //from lt
  for(var i=roofConfig.snOffset;i<rectInfo.h;i+=roofConfig.snSpan){
    var p1 = gmgSph.computeOffset(obj2gmLatLng(rectInfo.lt),-1*i,0);
    var p2 = gmgSph.computeOffset(p1,rectInfo.w,90);
    if(drawGrid) drawGridLine([p1,p2],'red','rect');
  }
  var sensors = [];
  /*from lb
  for(var i=roofConfig.snOffset,ri = 0;i<rectInfo.h;i+=roofConfig.snSpan){
    var p1 = gmgSph.computeOffset(obj2gmLatLng(rectInfo.lb),i,0);
    var p2 = gmgSph.computeOffset(p1,rectInfo.w,90);
    var sil = getPointsBetween(p1,p2,roofConfig.weOffset,roofConfig.weSpan,rowIndex[ri]);
    ri++;
    sensors = sensors.concat(sil);
  }//*/
  //from lt
  for(var i=roofConfig.snOffset,ri = 0;i<rectInfo.h;i+=roofConfig.snSpan){
    var p1 = gmgSph.computeOffset(obj2gmLatLng(rectInfo.lt),-1*i,0);
    var p2 = gmgSph.computeOffset(p1,rectInfo.w,90);
    var sil = getPointsBetween(p1,p2,roofConfig.weOffset,roofConfig.weSpan,rowIndex[ri]);
    ri++;
    sensors = sensors.concat(sil);
  }
  //console.log(JSON.stringify(sensors));
  return sensors;
}

function doDeploy(){
  if(crtRect != null){
    clearRect();
    crtRectNodesPos = deploySensorsInRect(crtRect,true);
    for(var i=0;i<crtRectNodesPos.length;i++){
      //console.log(crtRectNodesPos[i].ptag);
      drawPositionOnMap(crtRectNodesPos[i].p,1);
    }
  }
  if(crtPolygon != null){
    clearPolygon();
    crtPolygonNodesPos = deploySensorsInPolygon(crtPolygon,true);
    for(var i=0;i<crtPolygonNodesPos.length;i++){
      //drawPositionOnMap(crtPolygonNodesPos[i],2);
      drawPositionOnMap(crtPolygonNodesPos[i].p,2);
    }
  }
}

function clearData(){
  rectSensors.length = 0;
  rectGrids.length = 0;
  crtRect = null;
  crtRectInfo = null;
  crtPolygon = null;
  crtPolygonInfo = null;
}

function getRectInfoDesc(jb){
  var isFt = 'ft'==$("input[name='du']:checked").val();
  //var whDesc = isFt?(['width:',m2ft(crtBI.w),'ft',',height:',m2ft(crtBI.h),'ft'].join('')):(['width:',crtBI.w,'m',',height:',crtBI.h,'m'].join(''));
  //var whDesc = ['width:',crtBI.w,'m',',height:',crtBI.h,'m'].join('');
  return [
    ['Rect_',crtRectInfo.id,'\'s info:'].join(''),
    ['lb:',roundnum(crtRectInfo.lb.lat,6),',',roundnum(crtRectInfo.lb.lng,6)].join(''),
    ['rt:',roundnum(crtRectInfo.rt.lat,6),',',roundnum(crtRectInfo.rt.lng,6)].join(''),
    isFt?(['width:',m2ft(crtRectInfo.w).toFixed(2),'ft',',height:',m2ft(crtRectInfo.h).toFixed(2),'ft'].join('')):(['width:',crtRectInfo.w,'m',',height:',crtRectInfo.h,'m'].join('')),
    isFt?['area:',sm2sft(crtRectInfo.area),'sft'].join(''):['area:',crtRectInfo.area,'㎡'].join(''),
    isFt?['weOffset:',m2ft(roofConfig.weOffset),'ft',',snOffset:',m2ft(roofConfig.snOffset),'ft'].join(''):['weOffset:',roofConfig.weOffset.toFixed(2),'m',',snOffset:',roofConfig.snOffset.toFixed(2),'m'].join(''),
    isFt?['weSpan:',m2ft(roofConfig.weSpan),'ft',',snSpan:',m2ft(roofConfig.snSpan),'ft'].join(''):['weSpan:',roofConfig.weSpan.toFixed(2),'m',',snSpan:',roofConfig.snSpan.toFixed(2),'m'].join(''),
    ['sensor count:',rectSensors.length,''].join(''),
  ].join(jb);
}

//*
function cvtPositionData(sda){
  if(sda.length == 0) return [];
  var sdObjA = [];
  for(var i=0;i<sda.length;i++){
    //sdObjA.push(gmLatLng2Obj(sda[i]));
    var gmObj = gmLatLng2Obj(sda[i].p);
    sdObjA.push({ptag:sda[i].ptag,coords:[gmObj.lat,gmObj.lng].join(',')});
  }
  return sdObjA;
}//*/

function drawPositionOnMap(p,bt){
  //var c = drawCircle(p,'empty');
  var c = drawNodeByStatus(p,'empty');
  switch(bt){
    case 1://'rect':
      rectSensors.push(c);
      break;
    case 2://'polygon':
      polygonSensors.push(c);
      break;
    default:
      break;
  }
}

function drawGridLine(points,c,bt){
  var gl = new google.maps.Polyline({
    path:points,
    strokeColor:c||"#0000FF",
    strokeOpacity:0.8,
    strokeWeight:2
  });
  gl.setMap(map);
  
  switch(bt){
    case 'rect':
      rectGrids.push(gl);
      break;
    case 'polygon':
      polygonGrids.push(gl);
      break;
    default:
      break;
  }
}

function showInfoWin(cnt,posLatLng){
  var infoWin = new google.maps.InfoWindow();
  infoWin.setContent(cnt);
  infoWin.setPosition(posLatLng);
  infoWin.open(map);
}

function getPolygonBaseLine(polygon){
  var paths = polygon.getPath();
  var tmpLen = 0.0,baseLineLen = 0.0;
  var start,end;
  var lineIndex = 0;
  var lineHeading = 0;
  var len = paths.getLength();
  for(var i=0,j=i+1;i<len;i++,j++){
    if(j==len) j = 0;
    var p = paths.getAt(i),np = paths.getAt(j);
    tmpLen = gmgSph.computeDistanceBetween(p,np);
    if(baseLineLen<tmpLen){
      baseLineLen = tmpLen;
      start = p;
      end = np;
      lineIndex = i;
      lineHeading = gmgSph.computeHeading(start,end);
    }
  }
  return {
    index:lineIndex,
    start:gmLatLng2Obj(start),
    end:gmLatLng2Obj(end),
    middlePoint:gmLatLng2Obj(gmgSph.interpolate(start,end,0.5)),
    len:baseLineLen,
    heading:lineHeading
  };
}

function getPolygonDetectOption(baseLineInfo,polygon){
  //detectOpt
  var detectOpt = {
    isWeDetect:Math.abs(baseLineInfo.heading)>=45.0&&Math.abs(baseLineInfo.heading)<=135.0,
    offsetHeading:90.0,
    lineHeading:baseLineInfo.heading
  };
  //get middle point of baseline.
  //var baseLineMiddlePoint = gmgSph.interpolate(baseLineInfo.start,baseLineInfo.end,0.5);
  //get a detect point.
  var offset = detectOpt.isWeDetect?roofConfig.snOffset:roofConfig.weOffset;
  var detectPoint = gmgSph.computeOffset(
    obj2gmLatLng(baseLineInfo.middlePoint),offset,
    detectOpt.offsetHeading+baseLineInfo.heading);
  //if detect point not in polygon,change offsetHeading.
  if(!gmgPoly.containsLocation(detectPoint,polygon)){
    //update offsetHeading.
    detectOpt.offsetHeading = -90.0;
    //get new detectPoint.
    detectPoint = gmgSph.computeOffset(
      obj2gmLatLng(baseLineInfo.middlePoint),
      offset,detectOpt.offsetHeading+baseLineInfo.heading);
  }
  //return detectPoint to reuse.
  detectOpt.firstDetectPoint = gmLatLng2Obj(detectPoint);
  //calc detectMaxOffset
  var dist = 0.0;
  var paths = polygon.getPath();
  for(var i=0;i<paths.getLength();i++){
    var tmpDist = gmgSph.computeDistanceBetween(
      obj2gmLatLng(baseLineInfo.middlePoint),paths.getAt(i));
    if(tmpDist>dist)
      dist = tmpDist;
  }
  detectOpt.detectMaxOffset = dist;
  return detectOpt;
}

function getDetectLine(detectPoint,baseLineInfo,polygon){
  //step value
  var offset = 0.03;//,tolerance = 0.001;
  //get upper point
  var pus = gmgSph.computeOffset(detectPoint,baseLineInfo.len,baseLineInfo.heading);
  var pu = null;
  for(var i=offset;i<2*baseLineInfo.len;i+=offset){
    var tp = gmgSph.computeOffset(pus,i,baseLineInfo.heading+180.0);
    if(gmgPoly.containsLocation(tp,polygon)){
      pu = tp;
      break;
    }
  }
  //get down point.
  var pds = gmgSph.computeOffset(detectPoint,baseLineInfo.len,baseLineInfo.heading+180.0);
  var pd = null;
  for(var i=offset;i<2*baseLineInfo.len;i+=offset){
    var tp = gmgSph.computeOffset(pds,i,baseLineInfo.heading);
    if(gmgPoly.containsLocation(tp,polygon)){
    //if(gmgPoly.isLocationOnEdge(tp,polygon,tolerance)){
      pd = tp;
      break;
    }
  }
  if(pu == null || pd == null) return null;
  /*/show point to test
  putSensor(detectPoint,'#FF0000');
  putSensor(pu);
  putSensor(pd);//*/
  return {start:pd,end:pu,len:gmgSph.computeDistanceBetween(pd,pu)};
  //return {start:pu,end:pd,len:gmgSph.computeDistanceBetween(pu,pd)};
}

function drawGridInPolygon(lineInfo){
  drawGridLine([lineInfo.start,lineInfo.end],'red','polygon');
}

function putSensorInLine(lineInfo,polygonInfo,polygon,ric){
  //detectOpt,baseLineInfo
  var sensorPositions = [];
  var offset = polygonInfo.detectOpt.isWeDetect?roofConfig.weOffset:roofConfig.snOffset;
  var span = polygonInfo.detectOpt.isWeDetect?roofConfig.weSpan:roofConfig.snSpan;
  var heading = polygonInfo.baseLineInfo.heading;
  console.log('heading='+heading);
  for(var i=offset,ci=1;i<lineInfo.len;i+=span){
    var p = gmgSph.computeOffset(heading<0?lineInfo.end:lineInfo.start,
      (heading<0?-1:1)*i,polygonInfo.baseLineInfo.heading);
    if(gmgPoly.containsLocation(p,polygon)){
      //sensorPositions.push(p);
      sensorPositions.push({ptag:[ric,ci].join(''),p:p});
      ci++;
    }
  }
  /*
  if(heading<0){//Cool!
  //if(!polygonInfo.detectOpt.isWeDetect){
    //new:left down->right,upper
    console.log('left->right');
    for(var i=offset,ci=1;i<lineInfo.len;i+=span){
      var p = gmgSph.computeOffset(lineInfo.end,-1*i,polygonInfo.baseLineInfo.heading);
      if(gmgPoly.containsLocation(p,polygon)){
        //sensorPositions.push(p);
        sensorPositions.push({ptag:[ric,ci].join(''),p:p});
        ci++;
      }
    }
  }else{
    //old:right,upper->left down
    console.log('right->left');
    for(var i=offset,ci=1;i<lineInfo.len;i+=span){
      var p = gmgSph.computeOffset(lineInfo.start,i,polygonInfo.baseLineInfo.heading);
      if(gmgPoly.containsLocation(p,polygon)){
        //sensorPositions.push(p);
        sensorPositions.push({ptag:[ric,ci].join(''),p:p});
        ci++;
      }
    }
  }//*/
  return sensorPositions;
}

function deploySensorsInPolygon(polygon,drawGrid){
  var polygonInfo = getPolygonInfo(polygon);
  crtPolygonInfo = polygonInfo;
  //detectOpt,baseLineInfo
  var sensorPositions = [];
  var offset = polygonInfo.detectOpt.isWeDetect?roofConfig.snOffset:roofConfig.weOffset;
  var span = polygonInfo.detectOpt.isWeDetect?roofConfig.snSpan:roofConfig.weSpan;
  
  for(var i=offset,ri = 0;i<polygonInfo.detectOpt.detectMaxOffset;i+=span){
    var detectPoint = gmgSph.computeOffset(
      obj2gmLatLng(polygonInfo.baseLineInfo.middlePoint),i,
      polygonInfo.detectOpt.offsetHeading+polygonInfo.baseLineInfo.heading);
    var detectLine = getDetectLine(detectPoint,polygonInfo.baseLineInfo,polygon);
    if(detectLine == null) {
      //$("#saveLog").val(['lineInfo is null.',$("#saveLog").val()].join('\n'));
      //putSensor(detectPoint);
      continue;
    }
    if(drawGrid){
      drawGridLine([detectLine.start,detectLine.end],'red','polygon');
    }
    var lineSensorPositions = putSensorInLine(detectLine,polygonInfo,polygon,rowIndex[ri]);
    ri++;
    if(lineSensorPositions.length == 0) continue;
    sensorPositions = sensorPositions.concat(lineSensorPositions);
  }
  return sensorPositions;
}

function doDelete(){
  if(crtRect!=null){
    crtRect.setMap(null);
    clearRect();
    crtRect = null;
  }
  if(crtPolygon!=null){
    crtPolygon.setMap(null);
    clearPolygon();
    crtPolygon = null;
  }
}

var freeNodes = [];
function addNode(){
  console.log('addNode here.');
  //create free node around map center.
  //mapCenter
  var fnc = freeNodes.length+1;
  var nodePos = gmgSph.computeOffset(mapCenter,3*fnc,90);
  var fn = drawNodeByStatus(nodePos,'freeNode',true);
  freeNodes.push(fn);
}

function saveFreeNodes(){
  var posList = [];
  freeNodes.forEach(function(fn){
    posList.push(gmLatLng2Str(fn.getCenter()));
  });
  //var fnData = posList.join(' ');
  //console.log('fnData=',fnData);
  $.post(`/api/locations/${locInfo._id}/sfn`,{fnData:posList},function(data,status){
    parent.msg(data);
    window.location.reload();
  });
}

function isPointInputOk(pointData){
  //console.log(pointData.ptag,pointData.nodeid,pointData.pid);
  //console.log(JSON.stringify(pointData,null,2));
  var crtPid = pointData.pid;
  var newPtag = pointData.ptag;
  var newNid = pointData.nodeid;
  //console.log(crtPid,newPtag,newNid);
  var invalidInfo = [];
  
  for(var pid in pidNodeMap){
    //console.log(crtPid,pid);
    if(crtPid == pid) continue;
    var node = pidNodeMap[pid];
    //console.log(JSON.stringify(node.nodeInfo));
    //jump over self.
    //check ptag no duplicate
    if(newPtag == node.nodeInfo.ptag && pointData.bid == node.nodeInfo.bid){
      invalidInfo.push(`Tag[${newPtag}] has exist.`);
      break;
    }
    //check nodeid no duplicate
    if(newNid == node.nodeInfo.nid){
      invalidInfo.push(`Mac[${newNid}] has assinged at ${node.nodeInfo.ptag}.`);
      break;
    }
  }
  return invalidInfo.length>0?invalidInfo.join('\n'):'';
}
