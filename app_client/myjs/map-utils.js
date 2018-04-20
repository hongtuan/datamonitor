/**
* map-utils.js
**/
function dd2Dms(x) {
	var dd = parseFloat(x);
	var sign = '';
	if( dd<0 ) { sign='-'; dd=-dd; }
	var dv = Math.floor(dd);
	var dds = String(dd);
	var m_s = dds.substring(dds.indexOf('.'));//parseFloat(dd-dv);!!!
	var mv = Math.floor(m_s*60);
	var sv = (m_s*60 - mv)*60.0
	sv = roundnum(sv,3);//remain 3 fraction
	return [sign,dv,'\u00B0',mv,"'",sv,'"'].join('');
}

function getDmsLat(x){
	var y = dd2Dms(x);
	return y.startsWith('-')?y.substring(1).concat('S'):y.concat('N');
}

function getDmsLng(x){
	var y = dd2Dms(x);
	return y.startsWith('-')?y.substring(1).concat('W'):y.concat('E');
}

function parserDd2Dms(latLng){
	return [getDmsLat(latLng.lat()),
		getDmsLng(latLng.lng())].join(', ');
}

function dd2Ddm(x){
	var dd = x;
	var sign = '';
	if( dd<0 ) { sign='-'; dd=-dd; }
	var dv = Math.floor(dd);
	var mv = roundnum((dd - dv)*60.0,3);
	return [sign,dv,'\u00B0',mv,"'"].join('');
}

function getDdmLat(x){
	var y = dd2Ddm(x);
	return y.startsWith('-')?y.substring(1).concat('S'):y.concat('N');
}

function getDdmLng(x){
	var y = dd2Ddm(x);
	return y.startsWith('-')?y.substring(1).concat('W'):y.concat('E');
}


function dms2Dd (dms) {
	if (!dms) {
		return Number.NaN;
	}
	var neg = dms.match(/(^\s?-)|(\s?[SW]\s?$)/) != null ? -1.0 : 1.0;
	var parts = dms.match(gpsDC.dmsReg);
	if (parts == null) {
		return Number.NaN;
	}
	// parts:
	// 0 : dms
	// 1 : degree
	// 2 : minutes
	// 3 : secondes
	// 4 : fractions of seconde
	var d = (parts[1] ? parts[1] : '0.0') * 1.0;
	var m = (parts[2] ? parts[2] : '0.0') * 1.0;
	var s = (parts[3] ? parts[3] : '0.0') * 1.0;
	var r = (parts[4] ? ('0.' + parts[4]) : '0.0') * 1.0;
	//var dec = (d + (m / 60.0) + (s / 3600.0) + (r / 3600.0)) * neg;
	var dec = (d + (m+(s+r)/60.0)/60.0) * neg;
	return roundnum(dec,6);//remain 6 fraction
}

function ddm2Dd(ddm){
	if (!ddm) {
		return Number.NaN;
	}
	var neg = ddm.match(/(^\s?-)|(\s?[SW]\s?$)/) != null ? -1.0 : 1.0;
	var parts = ddm.match(gpsDC.ddmReg);
	if (parts == null) {
		return Number.NaN;
	}
	// parts:
	// 0 : ddm
	// 1 : degree
	// 2 : minutes (in Decimal)
	// 3 : Decimal Minutes fractions
	var d = (parts[1] ? parts[1] : '0.0') * 1.0;
	var m = (parts[2] ? parts[2] : '0.0') * 1.0;
	var s = (parts[3] ? ('0.'+parts[3]) : '0.0') * 1.0;
	var dec = (d + (m + s) / 60.0) * neg;
	return roundnum(dec,6);//remain 6 fraction
}

function dms2Ddm(dms){
	//var parts = dms.match(/(\d{1,3})[°]?\s*(\d{0,2})[']?\s*(\d{0,2})[.]?(\d{0,})["]?(\s?[NSEW]\s?$)/);
	var parts = dms.match(gpsDC.dmsReg);
	if (parts == null) {
		return Number.NaN;
	}
	// parts:
	// 0 : degree
	// 1 : degree
	// 2 : minutes
	// 3 : secondes
	// 4 : fractions of seconde
	// 5 : NSEW
	var d = (parts[1] ? parts[1] : '0.0') * 1.0;
	var m = (parts[2] ? parts[2] : '0.0') * 1.0;
	var s = (parts[3] ? parts[3] : '0.0') * 1.0;
	var r = (parts[4] ? ('0.' + parts[4]) : '0.0') * 1.0;
	var c = parts[5] ? parts[5] : '';
	var dm = roundnum(m + (s+r)/60.0,3);//remain 3 fraction
	return [d,'\u00B0',dm,"'",c].join('');
}

function ddm2Dms(ddm){
	if (!ddm) {
		return Number.NaN;
	}
	var parts = ddm.match(gpsDC.ddmReg);
	if (parts == null) {
		return Number.NaN;
	}
	// parts:
	// 0 : ddm
	// 1 : degree
	// 2 : minutes (in Decimal)
	// 3 : Decimal Minutes fractions
	// 4 : NSEW
	var d = (parts[1] ? parts[1] : '0.0') * 1.0;
	var m = (parts[2] ? parts[2] : '0.0') * 1.0;
	var s = (parts[3] ? ('0.'+parts[3]) : '0.0') * 1.0;
	var c = parts[4] ? parts[4] : '';
	var sr = roundnum(s*60.0,3);//remain 3 fraction
	return [d,'\u00B0',m,"'",sr,'"',c].join('');
}

/**
*GPS Data Checker
**/
var gpsDC = {
	//dmsReg : /(\d{1,3})[.,°d ]?(\d{0,2})[']?(\d{0,2})[.,]?(\d{0,})(["]|[']{2})(\s?[NSEW]\s?$)/i,
	dmsReg : /(\d{1,3})[°]?\s*(\d{0,2})[']?\s*(\d{0,2})[.]?(\d{0,})["]?(\s?[NSEW]\s?$)/i,
	//ddmReg : /(\d{1,3})[.,°d ]?\s*(\d{0,2})[.,]?(\d{0,})(['])(\s?[NSEW]\s?$)/i,
	ddmReg : /(\d{1,3})[°]?\s*(\d{0,2})[.]?(\d{0,})[']?(\s?[NSEW]\s?$)/i,
	latReg : /^[-\+]?([0-8]?\d{1}\.\d{1,8}|90\.0{1,8})$/,
	lngReg : /^[-\+]?((1[0-7]\d{1}|0?\d{1,2})\.\d{1,8}|180\.0{1,8})$/,
	//dms check
	isDms:function(input){
		return this.dmsReg.test(input);
	},
	isDdm:function(input){
		return this.ddmReg.test(input);
	},
	//Latitude check
	isLat:function(input){
		return this.latReg.test(input);
	},
	//Longitude check
	isLng:function(input){
		return this.lngReg.test(input);
	}
}

function getTimeDistanceDesc(dist){
	var mSeconds = 1000;
	var  mSecondsInMinute = mSeconds * 60;
	var  mSecondsInHour = mSecondsInMinute * 60;
	var  mSecondsInDay = mSecondsInHour * 24;// 3600*24*1000

  var d = Math.floor(dist/mSecondsInDay);
  var h = Math.floor(dist % mSecondsInDay / mSecondsInHour);
  var m = Math.floor(dist % mSecondsInHour / mSecondsInMinute);
  var s = Math.floor(dist % mSecondsInMinute / mSeconds);

  var dictArray = [
    [d,d>1?'days':'day'].join(''),
    [h,h>1?'hours':'hour'].join(''),
    [m,m>1?'minutes':'minute'].join(''),
    [s,s>1?'seconds':'second'].join('')
  ];

  if (dist >= mSecondsInDay) {
    //do nothing.
  }else if (mSecondsInHour <= dist && dist < mSecondsInDay) {
    dictArray = dictArray.slice(1);
  }else if (mSecondsInMinute <= dist && dist < mSecondsInHour) {
    dictArray = dictArray.slice(2);
  }else{
    dictArray = dictArray.slice(3);
  }
  return dictArray.join(',') ;
}

function getTimeDistanceBetween(d1,d2){
	var dict = d1.getTime() - d2.getTime();
	return getTimeDistanceDesc(dict);
}


function gmLatLng2Obj(latLng){
  //return {lat:+(latLng.lat()),lng:+(latLng.lng())};
  return {lat:latLng.lat(),lng:latLng.lng()};
}

function gmLatLng2Str(latLng){
  return [latLng.lat(),latLng.lng()].join(',');
}

function num2Obj(nLat,nLng){
  return {lat:nLat,lng:nLng};
}

function obj2gmLatLng(jsonObj){
  //console.log(jsonObj.lat,jsonObj.lng);
  //return new google.maps.LatLng(+(jsonObj.lat),+(jsonObj.lng));
  return new google.maps.LatLng(jsonObj.lat,jsonObj.lng);
}

/*
function obj2gmLatLng(lat,lng){
  return new google.maps.LatLng(lat,lng);
}//*/

function str2gmLatLng(str){
	var tmpA = str.split(',');
  return new google.maps.LatLng(tmpA[0],tmpA[1]);
}

function configMapNode(){
  /*/define pointInfo prototype to save node's info
  google.maps.Circle.prototype.pointInfo = null;

  google.maps.Circle.prototype.setPointInfo = function(_pointInfo) {
    this.pointInfo = _pointInfo;
  };

  google.maps.Circle.prototype.getPointInfo = function() {
    return this.pointInfo;
  };
  //*/

  google.maps.Circle.prototype.changStatus = function(status) {
    var circleColor = nodeStatusColorMap[status];
  	var nco = getCircleOptions(this.getCenter(),circleColor,this.getDraggable());
  	//console.log(JSON.stringify(co,null,2));
    this.setOptions(nco);
  };

  google.maps.Circle.prototype.flashNode = function(times,delay) {
  	//var co = getCircleOptions(this.getCenter(),status);
  	//console.log(JSON.stringify(co,null,2));
    //this.setOptions(co);
    var fc = 2*times;
    var taskId = setInterval(()=>{
      fc--;
      this.setMap(fc%2==0?null:map);
      if(fc<0) clearInterval(taskId);
    },delay||300);
  };

  //*define nodeInfo prototype to save node's info
  google.maps.Circle.prototype.nodeInfo = null;
  google.maps.Circle.prototype.setNodeInfo = function(ni) {
    this.nodeInfo = ni;
  };
  google.maps.Circle.prototype.getNodeInfo = function() {
    return this.nodeInfo;
  };

  google.maps.Circle.prototype.initColor = 'green';

  google.maps.Circle.prototype.setInitColor = function(_color) {
    this.initColor = _color;
  };

  google.maps.Circle.prototype.getInitColor = function() {
    return this.initColor;
  };

  google.maps.Circle.prototype.restoreInitStatus = function() {
    //return this.initColor;
    var initCo = getCircleOptions(this.getCenter(),this.initColor,this.getDraggable());
  	//console.log(JSON.stringify(co,null,2));
    this.setOptions(initCo);
  };

  google.maps.Circle.prototype.initCenter = null;

  google.maps.Circle.prototype.setInitCenter = function(_center) {
    this.initCenter = _center;
  };

  google.maps.Circle.prototype.restoreInitCenter = function() {
    //return this.initColor;
    //var co = getCircleOptions(this.getCenter(),this.initColor,this.getDraggable());
  	//console.log(JSON.stringify(co,null,2));
    //this.setOptions(co);
    this.setCenter(this.initCenter);
  };
}

function parserPositionData(str){
	var tmpA = str.split(',');
	if(tmpA.length>=4)
		return {pid:tmpA[0],pos:{lat:tmpA[1],lng:tmpA[2]},nid:tmpA[3],ptag:tmpA[4],bid:tmpA[5]};
	return null;
}

function showBoundaryDesc(info){
  parent.layer.msg(info,
    {area:['400px','90px'],time:6000,skin: 'layui-layer-molv'});
}

function showBoundaryBrief(boundary){
  var info = '';
  var bd = boundary.bd;
  var pd = boundary.nodeList;
  switch(bd.bt){
    case 1:
      //tagPos = obj2gmLatLng(bd.lt);
      info = `Boundary type:Rectangle,width:${bd.w},height:${bd.h}<br/>
        Area:${sm2sft(bd.area)}sf,posCount:${pd.length},installCount:${boundary.inc}`;//
      break;
    case 2:
      //calc the vertexs closest to map ne
      info =`Boundary type:Polygon,edgeCount:${bd.vertexs.length}<br/>
        Area:${sm2sft(bd.area)}sf,posCount:${pd.length},installCount:${boundary.inc}`;
      break;
    default:
      //do nothing.
      info = 'unKnown shape.';
  }
  parent.layer.msg(info,
    {area:['400px','90px'],time:6000,skin: 'layui-layer-molv'});
}

var selectedBoundaryId = null;
function viewLocationBrief(){
  console.log('look.');
  parent.layer.open({
    type: 2,
    title: 'CalcFee',
    fix: false,
    resize:false,
    shadeClose: true,
    maxmin: false,
    closeBtn:1,
    shadeClose: false,
    area : ['480px' , '320px'],
    content: '/locations/calcfee',
    success: function(layero, index){
      //second window,need use parent.
      var iframeWin = parent.window[layero.find('iframe')[0]['name']];
      iframeWin.parentWin = crtWin;
      iframeWin.crtWinIndex = index;
      //console.log('inputCenter success.');
    }
  });
}

function viewBoundsInfo(){
  //console.log('ViewInfo here',selectedBoundaryId,'hehe.');
  var selectedBoundary = bidBoundaryMap[selectedBoundaryId];
  if(selectedBoundary){
    //console.log('look='+JSON.stringify(selectedBoundary.bd,null,2));
    showBoundaryBrief(selectedBoundary);
  }
}

function updateBoundsName() {
  //console.log('Rename here');
  parent.layer.prompt({title: 'New Name', formType: 0,btn: ['Yes', 'No']},
    function(text, index){
      console.log('text='+text);
      var url = `/api/locations/${locInfo._id}/ubn/${selectedBoundaryId}/${text}`;
      console.log('url='+url);
      $.get(url,null,function(data,status){
        //console.log(data);
        parent.layer.close(index);
        parent.layer.msg(data);
        window.location.reload();
      });
    }
  );
}

function deleteBounds() {
  //console.log('deleteBounds here',selectedBoundaryId);
  if(selectedBoundaryId){
    //before delete need check if there are installed nodes in area,not allow to delete.
    var crtBounds = bidBoundaryMap[selectedBoundaryId];
    console.log('crtBounds.inc='+crtBounds.inc);
    if(crtBounds.inc>0){
      parent.layer.msg('There are installed nodes in this area,not allow delete.');
      return;
    }
    //delete confirm:
    parent.layer.confirm('Are you sure to delete this Area?', {
      icon: 3,title: 'Delete Confirm',btn: ['Yes','No']
    }, (index) => {
      //execute delete task
      var url = `/api/locations/${locInfo._id}/delb/${selectedBoundaryId}`;
      //*
      $.get(url,null,function(data,status){
        console.log(data);
        window.location.reload();
      });//*/
      parent.layer.close(index);
    });
  }
}

function expArea(){
  console.log('expArea here',selectedBoundaryId);
  if(selectedBoundaryId){
    var url = `/locations/${locInfo._id}/ebc/${selectedBoundaryId}`;
    //console.log(url);
    downloadFile(url);
    //load it into a hidden iframe
    /*
    $("<iframe/>").attr({
      src: url,
      style: "visibility:hidden;display:none"
    }).appendTo('body');//*/
  }
}

function impArea(){
  //console.log('impArea here',selectedBoundaryId);
  if(selectedBoundaryId){
    //var url = `/locations/${locInfo._id}/ibdp/${selectedBoundaryId}`;
    var url = `/locations/${locInfo._id}/ibc/${selectedBoundaryId}`;
    parent.layer.prompt({title: 'Import data', formType: 2,maxlength:4096,btn: ['Yes', 'No']},
      function(text, index){
        //console.log('text='+text,text.length);
        //var url = `/api/locations/${locInfo._id}/ubn/${selectedBoundaryId}/${text}`;
        //console.log('url='+url);
        var dataObj = JSON.parse(text);
        //console.log('dataObj='+dataObj);
        $.post(url,{data:text},function(data,status){
          console.log(data);
          parent.layer.close(index);
          parent.layer.msg(data);
          window.location.reload();
        });
      }
    );
  }
}

var boundsMenu = [
  [{
    text: "Brief",
    func: viewBoundsInfo
  },{
    text: "Rename",
    func: updateBoundsName
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

function showBoundaryTag(boundary){
  var bd = boundary.bd;
  //console.log('bd='+JSON.stringify(bd,null,2));
  var btp = bd.bt == 1?bd.lt:(bd.btp?bd.btp:bd.vertexs[0]);
  var tagPos = obj2gmLatLng(btp);
  /*
  switch(bd.bt){
    case 1:
      tagPos = obj2gmLatLng(bd.lt);
      break;
    case 2:
      tagPos = obj2gmLatLng(bd.btp?bd.btp:bd.vertexs[0]);
      break;
    default:
      //do nothing.
  }//*/
  var tagContent = '<div id="m'+boundary.bid+'" class="edgetag">'+boundary.bname+'</div>'
  var boundTag = new RichMarker({
      nid:boundary.bid,
      map: map,
      position: tagPos,
      draggable: false,
      flat: true,
      anchor: RichMarkerPosition.BOTTOM_LEFT,
      content: tagContent
  });

  //* use click event to fire pop-pu menu now.
  boundTag.addListener('click',function(e){
    //console.log('boundTag click');
    selectedBoundaryId = boundary.bid;
    addBoundsMeun("#m"+boundary.bid);
  });
}

/*
function boundaryDblClickTask(bid){
  console.log('boundaryDblClickTask');
  selectedBoundaryId = bid;
  console.log('boundaryDblClickTask',selectedBoundaryId);
}//*/
//list for record boundaries,then we can ctrl them.
var boundList = [];
var bidBoundaryMap = {};
var bidEdgeMap = {};
function showBoundary(boundary,bc){
	//console.log('bid='+boundary.bid);
	//console.log('bname='+boundary.bname);
	var bd = boundary.bd;
	var pd = boundary.nodeList;

  //deploy node count
	//var inc = 0;
	//put node circle first!
  for(var i in pd){
    //var positionInfo = parserPositionData(pd[i]);
    var pi = pd[i];
    //if(pi.nid && pi.nid.length>0) inc += 1;
    putNodeOnPosition(pi);
  }
  //boundary.inc = inc;
  //console.log('inc:',boundary.inc);
  bidBoundaryMap[boundary.bid] = boundary;
	var boundaryDesc = '';
  //draw boundary first:
  switch(bd.bt){
    case 1://rect
      //use bdObj's data to create Rectangle.
      var rectangle = new google.maps.Rectangle({
        bounds: new google.maps.LatLngBounds(
          obj2gmLatLng(bd.lb),obj2gmLatLng(bd.rt)),
        strokeColor:bc||'#0000FF',
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor: bc||'#0000FF',
        fillOpacity: 0.35,
        clickable: true,
        editable: false,
        draggable: false,
        zIndex: 1
      });
      rectangle.setMap(map);
      boundList.push(rectangle);
      bidEdgeMap[boundary.bid] = rectangle;
      //showBoundary tag here.
      //showBoundaryTag(boundary);
      break;
    case 2://polygon
      //use bdObj's data to create Polygon.
      var polygon = new google.maps.Polygon({
        paths: bd.vertexs,
        strokeColor:bc||'#0000FF',
        strokeOpacity:0.8,
        strokeWeight:2,
        fillColor: bc||'#0000FF',
        fillOpacity: 0.35,
        clickable: true,
        editable: false,
        draggable:false,
        zIndex: 1
      });
      polygon.setMap(map);
      boundList.push(polygon);
      bidEdgeMap[boundary.bid] = polygon;
      /*
      polygon.addListener('rightclick',function(e){
        console.log(boundaryDesc);
      	showBoundaryDesc(boundaryDesc);
      });//*/
      break;
    default:
      console.log('do nothing now.');
  }
  showBoundaryTag(boundary);
}

var pidNodeTagMap = {};
var selectedPointNid;
function showNodeTag(ntPos,ni){
  //put node flag txt
  //var tagContent = '<div class="nodetag">'+ni.ptag+'</div>';
  var tagContent = `<div id="t${ni.pid}" class="nodetag">${ni.ptag}</div>`;
  //var p = node.getCenter();
  var tagPos = gmgSph.computeOffset(ntPos,1,45);
  var nodeTag = new RichMarker({
      nid:ni.nid,
      map: map,
      position: tagPos,
      draggable: false,
      flat: true,
      anchor: RichMarkerPosition.BOTTOM_LEFT,
      content: tagContent
  });
  pidNodeTagMap[ni.pid] = nodeTag;//for tag ctrl use.
  nodeTag.addListener('click',function(e){
  	//showNodeData(ni);
  	addPointMeun("#t"+ni.pid);
  	selectedPointNid = ni.nid;
  	//console.log('tag click cool.',selectedPointNid);
  });
}

function echoLocationBounds(boundaryDataList,cb){
  if(boundaryDataList && boundaryDataList.length>0){
    for(var i in boundaryDataList){
      //showBoundary(biaObj[i].bd,biaObj[i].pd,'blue','green');
      showBoundary(boundaryDataList[i],'blue');
    }
  }
  if(cb) cb();
}

/*
var circleStatus = {
	normal:'green',
	empty:'yellow',
	nodata:'blue',
	warning:'red'
};//*/

var nodeStatusColorMap = {
  empty:"white",
  noData:"black",
  normal:"green",
  lowData:"blue",
  highData:"red",
  active:"#1eb29e",
  newcomer:"#1eb254",
  warning:"yellow",
  dataDelay:"#ce42f4",
  freeNode:"#42f492"
};

function nodeColor(c) {
  return nodeStatusColorMap[c];
  /*
  return {
  	normal:"green",
  	active:"#1eb29e",
  	newcomer:"#1eb254",
  	empty:"yellow",
  	noData:"blue",
  	warning:"red",
  	dataDelay:"#ce42f4"
  }[c];//*/
}

function getCircleOptions(center,circleColor,draggable){
	return {
    strokeColor: circleColor,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: circleColor,
    fillOpacity: .85,
    center: center,
    radius: 1.0,
    draggable:draggable||false,
    zIndex: 2
  };
}

//for deploy use
function drawCircle(center,circleColor,draggable){
	var circle = new google.maps.Circle(
	  getCircleOptions(center,circleColor,draggable));
  circle.setInitColor(circleColor);
  circle.setInitCenter(center);
  circle.setMap(map);
	return circle;
}

function drawNodeByStatus(center,nodeStatus,draggable){
  var circleColor = nodeStatusColorMap[nodeStatus];
	return drawCircle(center,circleColor,draggable);
}

/*
function loadLocationContent(cb){
	//*very important call!
  $.get('/api/locations/'+locInfo._id+'/lc',null,function(data,status){
  	//console.log(JSON.stringify(data));
  	biaObj = data;
  	//console.log(JSON.stringify(biaObj));
  	//console.log('count:'+biaObj.length);
    echoLocationBounds(data);
    if(cb) cb();
  },'json');
  //if(cb) cb();
}//*/
var pidNodeMap;
var boundaryNidTagMap;
function loadLocationData(cb){
	//*very important call!
  $.get('/api/locations/'+locInfo._id+'/ld',null,function(data,status){
  	//console.log(JSON.stringify(data,null,2));
  	var boundaryDataList = data.BDL;
  	boundaryNidTagMap = data.BNTM;
  	pidNodeMap = data.PNM;
  	var freeNodes = data.FNL;
  	//console.log(JSON.stringify(biaObj));
  	//console.log('count:'+biaObj.length);
    echoLocationBounds(boundaryDataList);
    echoFreeNodes(freeNodes);
    if(cb) cb();
  },'json');//*/
  //if(cb) cb();
}

function getNodeByPid(pid){
  return pidNodeMap[pid];
}

function updateLocCenter(cb){
  var lwi = parent.layer.load();
  //var sendData = {lid:locInfo._id,ctLatLng:locInfo.ctpos,address:locInfo.address};
  var centerInfo = {latLng:locInfo.ctpos,address:locInfo.address};
  //console.log(centerInfo);
  //update to server.
  $.post('/api/locations/'+locInfo._id+'/uc',centerInfo,function(response,status){
    parent.layer.close(lwi);
    parent.layer.msg(response);
    if(cb) cb();
  });
}

function switchBound(showBound) {
  //var showBound = $("input[name='showBound']:checked").val();
  console.log('Bound will '+(showBound?'visible':'invisible'));
  if (Array.isArray(boundList)) {
    boundList.forEach(function(bound) {
      bound.setMap(showBound ? map : null);
    });
  }
  //updateNodeTag();
}

function switchTag(showTag) {
  //var showBound = $("input[name='showBound']:checked").val();
  //console.log('Tag will '+(showTag?'visible':'invisible'));
  for(var pid in pidNodeTagMap){
    //var nodeTag = pidNodeTagMap[pid];
    var tag = $("#t"+pid);
    if(showTag) tag.show();
    else tag.hide();
  }
}


function panMapTo(ctInfo){
	console.log('ctInfo='+ctInfo);
}

function configSwitch(sname,cb){
	$.fn.bootstrapSwitch.defaults.size = 'mini';
  $.fn.bootstrapSwitch.defaults.onColor = 'success';
  //$.fn.bootstrapSwitch.defaults.offColor = 'danger';
  var bssBt = $("[name='"+sname+"']");
  //bssBt.bootstrapSwitch('state', initState, true);
  bssBt.bootstrapSwitch();
  //console.log('cool');
  bssBt.on('switchChange.bootstrapSwitch', function(event, state) {
    //console.log(this.id); // DOM element
    //console.log(event); // jQuery event
    //console.log(state); // true | false
    if(cb) {
      cb(state,this.id);
    }
  });
}

function getNodeInfoByNid(nid){
  for(var bname in boundaryNidTagMap){
    var nidTagMap = boundaryNidTagMap[bname];
    var ptag = nidTagMap[nid];
    if(ptag)
      return {
        ptag:ptag,
        nid:nid,
        bname:bname
      };
  }
  //var node = nidNodeMap[nid];
  //return node.nodeInfo;
}

function getDataItem(data,dataName){
  for(var i in data){
    var d = data[i];
    for(var pro in d){
      if(pro == dataName)
        return d[pro];
    }
  }
  return null;
}


function changeNodeTagColor(tagId,status){
  //console.log('tagId=',tagId);
  var toColor = nodeStatusColorMap[status];
  var nodeTag = $("#t"+tagId);
  //nodeTag.css('background-color', toColor);
  //if(status == 'empty')
  //nodeTag.hide();
  //console.log('toColor',toColor,nodeTag.css( "background-color"));
  nodeTag.css('background', toColor);
}

function changeNodeTagText(tagId,newText){
  var nodeTag = $("#t"+tagId);
  nodeTag.text(newText);
}


function rotateMap(rDeg){
  $("#map").css("transform-style","preserve-3d");
  $("#map").css("transform","rotateZ("+rDeg+"deg)");
  $("#map").css("pointer-events","auto");
  //$("#map").css("-webkit-transform-style","preserve-3d");
  //transform-style: preserve-3d;
  $("#map").css("z-index","10");

  //$(".nodetag").css("transform-origin","left bottom");
  //console.log('rDeg=',rDeg,$("#map").offset().top);
}

function rotateTag(rDeg){
  $(".nodetag").css("transform-style","preserve-3d");
  $(".nodetag").css("transform","rotateZ(-"+rDeg+"deg)");
  $(".nodetag").css("transform-origin","left bottom");
  //console.log('rDeg=',rDeg,$("#map").offset().top);
}

