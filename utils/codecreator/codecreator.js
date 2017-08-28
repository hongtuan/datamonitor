var fs = require('fs');
var path = require('path');
var moment = require('moment');
var fu = require('./file_util');
//argv cool!
var argv = require('yargs')
  .usage('Usage: $0 -t [string] -p [string] -n [string] -m [string] -d [string]')
  .default({ t : 'form'})
  .default({ p : 'formx'})
  .default({ d : 'no'})
  .option('t', {
    alias: 'template',
    describe: 'choose a template',
    choices: ['form', 'list']
  })
  .option('p', {
    alias: 'path',
    describe: 'create to path',
    //choices: ['formx', 'listx']
  })
  .option('n', {
    alias: 'name',
    describe: 'component name',
    //choices: ['formx', 'listx']
  })
  .option('m', {
    alias: 'model',
    describe: 'model name',
    //choices: ['formx', 'listx']
  })  .option('d', {
    alias: 'deploy',
    describe: 'deploy component',
    choices: ['yes', 'no']
  })
  .demand(['t','p','n','m','d'])
  .argv;

//console.log(argv);

var tpltConfig = {
  html:{
    tpltFile:'./tplt/app/pages/___tpltName___/___tpltName___.component.html',
	newFile:'___componentFileNamePre___.component.html'
  },
  component:{
	tpltFile:'./tplt/app/pages/___tpltName___/___tpltName___.component.ts',
	newFile:'___componentFileNamePre___.component.ts'
  },
  module:{
	tpltFile:'./tplt/app/pages/___tpltName___/___tpltName___.module.ts',
	newFile:'___componentFileNamePre___.module.ts'
  },
  routing:{
	tpltFile:'./tplt/app/pages/___tpltName___/___tpltName___.routing.ts',
	newFile:'___componentFileNamePre___.routing.ts'
  },
  dlgHtml:{
	tpltFile:'./tplt/app/pages/___tpltName___/components/___tpltName___.dialog.form.html',
	newFile:'components/___componentFileNamePre___.dialog.form.html'
  },
  dlgComp:{
	tpltFile:'./tplt/app/pages/___tpltName___/components/___tpltName___.dialog.form.ts',
	newFile:'components/___componentFileNamePre___.dialog.form.ts'
  },
  service:{
	tpltFile:'./tplt/app/services/___tpltName___.service.ts',
	newFile:'___componentFileNamePre___.service.ts'
  }
};

var componentPath = './tmp/app/pages/___componentFileNamePre___/';
var servicePath = './tmp/app/services/';

var componentDeployPath = '../../src/app/pages/';
var serviceDeployPath = '../../src/app/services/';

var tpltName = argv.t;
var createPath = argv.p;
var componentName =  argv.n;
var modelName = argv.m;
var componentFileNamePre = componentName.toLowerCase();

fu.mkdirsSync(servicePath);
componentPath = componentPath.replace('___componentFileNamePre___',componentFileNamePre)
fu.mkdirsSync(componentPath);
//console.log('dlgPath=',dlgPath);
var dlgTpltPath = tpltConfig.dlgHtml.tpltFile;
dlgTpltPath = dlgTpltPath.replace(/___tpltName___/g,tpltName);
dlgTpltPath = dlgTpltPath.substring(0,dlgTpltPath.lastIndexOf('/'));
console.log('dlgTpltPath:',dlgTpltPath);
if(fs.existsSync(dlgTpltPath)){
  var dlgPath = componentPath+'components';
  fu.mkdirsSync(dlgPath);
  console.log('dlgPath created.');
}

for(tf in tpltConfig){
  var fn = tpltConfig[tf].tpltFile.replace(/___tpltName___/g,tpltName);
  if(fs.existsSync(fn)){
    console.log('create',tf,'from',fn,'...');
    var fc = fu.loadFileContent(fn);
    fc = fc.replace(/___ComponentName___/g,componentName);
    fc = fc.replace(/___componentFileNamePre___/g,componentFileNamePre);
    //if(tf == 'dlgComp'){
      fc = fc.replace(/___ModelName___/g,modelName);
      fc = fc.replace(/___modelFileNamePre___/g,modelName.toLowerCase());
    //}
    var newFileName = (tf=='service'?servicePath:componentPath)+tpltConfig[tf].newFile;
    newFileName = newFileName.replace('___componentFileNamePre___',componentFileNamePre)
    var file = path.join(__dirname,newFileName);
    fs.writeFileSync(file,fc);
    console.log('file',newFileName,'create over.');
  }
}
if(argv.d == 'yes'){
  var tmpComponentPath = path.join(__dirname,componentPath);
  var componentDeployTo = path.join(__dirname,componentDeployPath+componentFileNamePre);
  console.log(tmpComponentPath);
  console.log(componentDeployTo);
  fs.renameSync(tmpComponentPath,componentDeployTo);
  var tmpServicePath = path.join(__dirname,servicePath+componentFileNamePre+'.service.ts');
  var servicesDeployTo = path.join(__dirname,serviceDeployPath+componentFileNamePre+'.service.ts');
  console.log(tmpServicePath);
  console.log(servicesDeployTo);
  fs.renameSync(tmpServicePath,servicesDeployTo);
  console.log('deploy over.');
  console.log('update page menu,routing file...');

  fu.appendInfoToPageRouting(componentFileNamePre,
    `./${componentFileNamePre}/${componentFileNamePre}.module#${componentName}Module`);
  fu.appendInfoToPageMenu(componentFileNamePre,componentName);
}
//console.log('componentDeployTo',componentDeployTo);
//console.log('servicesDeployTo',servicesDeployTo);
console.log('code create over.');
