var alDao = require('../dao/alertlogdao.js');
module.exports.getAlertLog = function(req, res) {
  var lid = req.params.lid;
  var limitRows = req.params.lr;
  alDao.getAlertLog(lid,limitRows||100,function(err,rows){
    if (err) {
      console.log(err);
      return res.status(500).json(err).end();
    }
    res.status(200).json(rows);
  });
}
