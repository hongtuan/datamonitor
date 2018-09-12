const controller = require('../../controllers/file.loader');
module.exports.routeConfig = {
  '/fl/':[
    {'':{get: controller.loadFile}},
  ]
};

//router.get('/fl', fileLoader.loadFile);
