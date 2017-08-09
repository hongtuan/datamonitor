//var cp = require('fs-cp')
var fs = require('fs.extra');
function cpov(){
  console.log('copy over.');
}
// file to file
//cp('package.json', 'package2.json').then(cpov);
//to dir
//var res = cp('node_modules/@angular/core/bundles', 'app_client/node_modules/@angular/core/bundles').then();
//console.log(res);

fs.copy('package.json','package2.json', { replace: true }, function (err) {
  if (err) {
    // i.e. file already exists or can't write to directory 
    throw err;
  }
  console.log("Copy file over.");
});

fs.copyRecursive(
  'node_modules/@angular/core/bundles',
  'app_client/node_modules/@angular/core/bundles',
  function (err) {
    if (err) {
      // i.e. file already exists or can't write to directory 
      throw err;
    }
    console.log("Copy dir over.");
  }
);
