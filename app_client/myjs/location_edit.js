//location_eidt.js

$(function () {
  $.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    return o;
  }
});

var formCheckOk = false;

function checkForm(e){
  e.preventDefault();
  formCheckOk = $(this).valid();
  return formCheckOk;
}

function saveLocation(){
  var formData = $("#cef").serializeObject();
  console.log('formData='+JSON.stringify(formData));
  $("#cef").submit();// to trrigger form validation.
  //then do ajax summit.
  if(formCheckOk){
    //do ajax submit.
    console.log('do ajax submit here.');
    var lwi = parent.layer.load();
    //console.log('look:'+$("#cef").serialize()); can't use this methos.
    //$.post(($.isEmptyObject(locData)?'../location/':'../')+'saveLocation',$("#cef").serializeObject(),function(data,status){
    $.post('/locations/save',$("#cef").serializeObject(),function(data,status){
      console.log('data='+JSON.stringify(data));
      console.log('status='+status);
      parent.layer.close(lwi);
      parent.location.reload();
      //console.log('window.name='+window.name)
      //get parent frame index,for close.
      var index = parent.layer.getFrameIndex(window.name);
      //console.log('index='+index);
      //give a msg first.
      parent.layer.msg(data.msg);
      //then close frame.
      parent.layer.close(index);
      console.log('saveLocation over.');
    },'json');
  }else{
    console.log('check failed.');
  }
}

function closeFrameWin(){
  parent.layer.close(parent.layer.getFrameIndex(window.name));
}
