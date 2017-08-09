//var util = require('../../utils/util');

module.exports.serverTime = function(req, res) {
  //util.sendJsonContent(res,201,Date.now(),'serverTime');
  res.status(200).json(Date.now()); //,'serverTime');
};

module.exports.serverStartTime = function(req, res) {
  //util.sendJsonContent(res,201,req.app.locals.startTime,'serverStartTime');
  res.status(200).json(new Date(req.app.locals.startTime)); //,'serverStartTime');
}
