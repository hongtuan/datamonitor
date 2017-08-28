var fs = require('fs');
var path = require('path');

function mkdirsSync(dirname) {
  //console.log(dirname);
  if(fs.existsSync(dirname)) {
    return true;
  } else {
    if(mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}

function loadFileContent(pathname) {
  console.log('loadFile:',pathname);
  if(fs.existsSync(pathname)){
    var bin = fs.readFileSync(pathname);
    //do with utf8+
    if (bin[0] === 0xEF && bin[1] === 0xBB && bin[2] === 0xBF) {
      bin = bin.slice(3);
    }
    return bin.toString('utf-8');
  }else{
    console.log(pathname+' not exists.');
    return null;
  }
}

function replaceInfoInFile(filePath,oldContent,newContent){
  var fc = loadFileContent(filePath);
  fc = fc.replace(oldContent,newContent+'\n      '+oldContent);
  fs.writeFileSync(filePath,fc);
}

function appendInfoToPageRouting(pathStr,moduleInfo){
  var filePath = path.join(__dirname,'../../src/app/pages/pages.routing.ts');
  var oldContent = '//___newItemAppendHere___';
  var newContent = `\{ path: '${pathStr}', loadChildren: '${moduleInfo}' \},`;
  replaceInfoInFile(filePath,oldContent,newContent);
}

function appendInfoToPageMenu(pathStr,menuTitle){
  var filePath = path.join(__dirname,'../../src/app/pages/pages.menu.ts');
  var oldContent = '//___newItemAppendHere___';
  var menuInfo = `\{
        path: '${pathStr}',  // path for our page
        data: \{ // custom meinu declaration
          menu: \{
            title: '${menuTitle}', // menu title
            resID:'R30003',
            icon: 'ion-edit', // menu icon
            pathMatch: 'prefix', // use it if item children not displayed in menu
            hidden:false,
            selected: false,
            expanded: false,
            order: 0
          \}
        \}
      \},`;
  replaceInfoInFile(filePath,oldContent,menuInfo);
}

module.exports.mkdirsSync = function(dirname){
  mkdirsSync(dirname);
}

module.exports.loadFileContent = function(pathname){
  return loadFileContent(pathname);
}

module.exports.replaceInfoInFile = function(filePath,oldContent,newContent){
  replaceInfoInFile(filePath,oldContent,newContent);
}

module.exports.appendInfoToPageRouting = function(pathStr,moduleInfo){
  appendInfoToPageRouting(pathStr,moduleInfo);
}

module.exports.appendInfoToPageMenu = function(pathStr,menuTitle){
  appendInfoToPageMenu(pathStr,menuTitle);
}

/* test code here:
//var routingInfo = '{ path: \'newPath15\', loadChildren: \'./newmodule/newmodule.module#NewModule\' },';
//appendInfoToPageRouting('path55','./newmodule/newmodule.module#NewXXModule');

//console.log(menuInfo);
//appendInfoToPageMenu('path55','myTitle55');

console.log('run over.');//*/

