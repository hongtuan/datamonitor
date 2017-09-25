var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var moment = require('moment');
process.env.TZ = 'Asia/Shanghai';

function rmFile(_file){
  if(fs.existsSync(_file) && fs.statSync(_file).isFile()){
    fs.unlinkSync(_file);
    console.log(_file,'delete over.');
  }
}

function doUpdateTask(updateFileName){
  console.log('update file to remote host...');
  var cp = require('child_process');
  var usPath = path.join(__dirname,'../dmpkg/ruc.cmd');
  var usWorkPath = path.join(__dirname,'../dmpkg/');
  cp.execFile(usPath,[usWorkPath,updateFileName],
    function(err,stdout,stderr){
      if(err) console.log(err);
      if(stdout) console.log('stdout',stdout);
      if(stderr) console.log('stderr',stderr);
      console.log(`file ${updateFileName} update to remote host over.`);
    }
  );
}

//构建打包文件名
var pkgFileName = `pkg_${moment().format('YYYYMMDDHHmm')}.zip`;
//打包文件全路径
var pkgFile = path.join(__dirname,`../dmpkg/${pkgFileName}`);
//删除已存在的文件
rmFile(pkgFile);
console.log('Prepare to do zip task...');
console.log('zip task begin.');

function createSrcPkg(cb){
  var archive = archiver('zip', {
    comment:'src package.',
    forceLocalTime:true, //forceLocalTime
    forceUTC: false,
    zlib: { level: 9 }   // Sets the compression level.
  });

  //append version info
  archive.append(
    `build time:${moment().format('YYYY-MM-DD HH:mm:ss')}`,
    { name: 'version.txt' });
  //添加特定的文件和目录
  archive.file('.env',{name:'.env'});
  archive.file('expserver.js',{name:'expserver.js'});
  archive.file('package4server.json',{name:'package.json'});

  archive.file('utils/util.js',{name:'utils/util.js'});
  archive.file('utils/mailsender.js',{name:'utils/mailsender.js'});
  archive.file('utils/datasyntask.js',{name:'utils/datasyntask.js'});
  archive.file('utils/data.monitor.task.js',{name:'utils/data.monitor.task.js'});

  archive.directory('client/');
  archive.directory('app_client/');
  archive.directory('app_api/');
  archive.directory('app_server/');
  archive.finalize();

  archive.on('error', function(err){
    throw err;
  });

  var output = fs.createWriteStream(pkgFile);
  archive.pipe(output);

  // listen for all archive data to be written
  output.on('close', function() {
    console.log('file',pkgFileName,'create over.',Math.ceil(archive.pointer()/1024) + ' K');
    if(cb) cb();
  });
}

createSrcPkg(() => {
  doUpdateTask(pkgFileName);
  //console.log(pkgFileName);
});

