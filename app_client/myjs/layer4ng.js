function msg(str){
  layer.msg(str);
}
function load(){
  return layer.load();
}
function close(wi){
  layer.close(wi);
}

function tips(info,idstr){
  layer.tips(info,idstr);
}

function confirm(info,title,cb){
  layer.confirm(info, 
    {icon: 3, title:title||'Confirm'},function(index) {
      if(cb) cb(index);
  });
}
