var fs = require('fs');
var path = require('path');
var archiver = require('archiver');
var moment = require('moment');

var archive = archiver('zip');
var archive = archiver('zip', {
  comment:'comment test.',
  forceLocalTime:true, //forceLocalTime
  forceUTC: false,
  zlib: { level: 9 }   // Sets the compression level.
});

process.env.TZ = 'Asia/Shanghai';

archive.on('error', function(err){
  throw err;
});

var pkgFileName = `pkg_${moment().format('YYYYMMDDHHmm')}.zip`;
var fileObj = path.join(__dirname,pkgFileName);
fs.exists(fileObj, function(exists) {
  if(exists) {
    //Show in green
    console.log('File exists. Deleting now ...');
    fs.unlink(fileObj, function(err) {
      if (err) {
        return console.error(err);
      }
      console.log("File ["+fileObj+"] deleted successfully!");
    });
  } else {
    //Show in red
    console.log('File not found, so just create one.');
  }
});

console.log('Prepare to do zip task...');
//delay 2 seconds,then do zip task.
setTimeout(function() {
  console.log('zip task begin.');
  var output = fs.createWriteStream(pkgFileName);
  archive.pipe(output);
  // listen for all archive data to be written
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    console.log('pkg over.',pkgFileName);
    console.log('sft',pkgFileName);
  });

  //append version info 
  archive.append(
    `build time:${moment().format('YYYY-MM-DD HH:mm:ss')}`,
    { name: 'version.txt' });

  archive.file('.env',{name:'.env'});
  archive.file('expserver.js',{name:'expserver.js'});  
  archive.file('package4server.json',{name:'package.json'});
  
  archive.file('utils/util.js',{name:'utils/util.js'});
  archive.file('utils/mailsender.js',{name:'utils/mailsender.js'});
  archive.file('utils/datasyntask.js',{name:'utils/datasyntask.js'});

  archive.directory('client/');
  archive.directory('app_client/');
  archive.directory('app_api/');  
  archive.directory('app_server/');  
  archive.finalize();
  //callback(null);
}, 2000);

