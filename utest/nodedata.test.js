require('../app_api/models/db');
const testObj = require('../app_api/controllers/nodedata.js');

// 58890bd8b746703db8e4615d http://xsentry.co/api/v1/sentry/C47F51016BAC/snapshots?top=30 600
// const lid = '584889abe7bc981b0ad150d4'; // Chicago
const lid = '58890bd8b746703db8e4615d'; // bad!
// const dataUrl = 'http://xsentry.co/api/v1/sentry/005043c9a337b136/snapshots?top=10';
const dataUrl = 'http://xsentry.co/api/v1/sentry/C47F51016BAC/snapshots?top=30';

testObj.executeSyncTask(lid,dataUrl,function () {
  console.log('test over');
  // process.exit(0);
});
