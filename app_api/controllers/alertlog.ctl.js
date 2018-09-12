const alDao = require('../dao/alertlogdao.js');
module.exports.getAlertLog = function(req, res) {
  const lid = req.params.lid;
  const limitRows = req.params.lr;
  alDao.getAlertLog(lid,limitRows||100,function(err,rows){
    if (err) {
      console.log(err);
      return res.status(500).json(err).end();
    }
    /*/console.log('in CTL:',rows[0].atimes);
    rows.forEach(function(alertLog){
      console.log(alertLog.dataType,alertLog.atimes,alertLog.alertInfos.length);
    });//*/
    res.status(200).json(rows);
  });
};

