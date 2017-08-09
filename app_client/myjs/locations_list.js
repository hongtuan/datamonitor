//location_list.js

function addLocation(){
  layer.open({
    type: 2,
    title: 'AddLocation',
    maxmin: false,
    closeBtn:1,
    shadeClose: false, //点击遮罩关闭层
    area : ['560px' , '460px'],
    //content: '/pages/sp01.html'
    content: '/locations/add'
  });
}

function modifyLocation(lid){
  console.log('lid='+lid);
  layer.open({
    type: 2,
    title: 'ModifyLocation',
    fix: false,
    shadeClose: true,
    maxmin: false,
    closeBtn:1,
    shadeClose: false, //点击遮罩关闭层
    area : ['560px' , '460px'],
    content: '/locations/edit/'+lid
  });
}

function deleteLocation(lid){
  //console.log('cid='+cid);
  layer.confirm('Are you sure to delete this Record?', {icon: 3, title:'Delete Confirm'}, function(index){
    //do something
    var lwi = layer.load();
    $.get('/locations/'+lid,null,function(data,status){
      console.log('data='+JSON.stringify(data));
      console.log('status='+status);
      layer.close(lwi);
      parent.layer.msg(data.msg);
      parent.location.reload();
    },'json').fail(function(data,status){
      console.log(data);
      console.log(status);
    });
    layer.close(index);
  });
}

function deployLocation(lid){
  layer.open({
    type: 2,
    title: 'Deploy Sensors In Location',
    maxmin: true,
    closeBtn:1,
    shadeClose: false, //点击遮罩关闭层
    area : ['800px' , '600px'],
    //content: '../boundary/editBounds?lid='+lid
    content: '/locations/'+lid+'/editbound'
  });
}

function monitoringLocation(lid){
  layer.open({
    type: 2,
    title: 'Monitoring Loacation',
    maxmin: true,
    closeBtn:1,
    shadeClose: false, //点击遮罩关闭层
    area : ['1000px' , '600px'],
    content: '/locations/'+lid+'/viewbound'
  });
}
