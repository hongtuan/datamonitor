!function(){
  var layerHelper = {};
  layerHelper.confirm = function(info,title,cb){
    layer.confirm(info,
      {icon: 3, title:title||'Confirm',btn: ['Yes','No']},function(index) {
        if(cb) cb();
        layer.close(index);
    });
  };

  layerHelper.openDlg = function(dlgPageUrl,dataObj,dlgTitle,dlgSize,maxSize){
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

  layerHelper.deployLocation = function(lid,locName) {
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

  layerHelper.monitoringLocation = function(lid,locName) {
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

  layerHelper.downloadFile = function(fileContentUrl){
    $("<iframe/>").attr({
      src: fileContentUrl,
      style: "visibility:hidden;display:none"
    }).appendTo('body');
  }

  this.layerHelper = layerHelper;
 }();
