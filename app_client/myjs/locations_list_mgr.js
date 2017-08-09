//location_list.js
function deleteLocation(lid) {
  layer.confirm('Are you sure to delete this Location?', {
    icon: 3,
    title: 'Delete Confirm'
  }, (index) => {
    this.locationService.deleteLocation(lid).then(res => {
      //console.log('res='+JSON.stringify(res));
      if (res == '') {
        this.onLocationDeleted(lid);
        layer.msg('delete over.');
        layer.close(index);
      }
      else {
        layer.msg(res);
      }
    });
  });
}

function deployLocation(lid,locName) {
  var index = layer.open({
    type: 2,
    title: `Deploy Nodes In ${locName}`,
    maxmin: true,
    resize:true,
    closeBtn: 1,
    shadeClose: false,
    area: ['800px', '600px'],
    content: '/locations/' + lid + '/editbound',
    success: function(layero, index) {
      var iframeWin = window[layero.find('iframe')[0]['name']];
      iframeWin.crtWinIndex = index;
      iframeWin.crtWin = iframeWin;
    }
  });
  layer.full(index);
}

function monitoringLocation(lid,locName) {
  var index = layer.open({
    type: 2,
    title: `Monitoring ${locName}`,
    maxmin: true,
    closeBtn: 1,
    shadeClose: false,
    //area: ['1000px', '600px'],
    area: ['380px', '760px'],
    content: '/locations/' + lid + '/viewbound',
    success: function(layero, index) {
      var iframeWin = window[layero.find('iframe')[0]['name']];
      iframeWin.crtWinIndex = index;
      iframeWin.crtWin = iframeWin;
    }
  });
  layer.full(index);
}

function openDlg(dlgPageUrl,dataObj,dlgTitle,dlgSize,maxSize){
  layer.open({
    type: 2,
    title: dlgTitle|| 'DlgTitle',
    maxmin: maxSize || false,
    closeBtn: 1,
    shadeClose: false,
    area: dlgSize || ['800px', '600px'],
    content: dlgPageUrl,
    success: function(layero, index) {
      var iframeWin = window[layero.find('iframe')[0]['name']];
      iframeWin.crtWinIndex = index;
      if(dataObj) {
        //iframeWin.location = dataObj;
        iframeWin.setDataObj(dataObj);
      }
    }
  });
}
