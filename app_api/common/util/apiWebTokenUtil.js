const jwt = require('jsonwebtoken');
//const mongoose = require('mongoose');
// const SystemLog = mongoose.model('SystemLog');
// const AdminLog = mongoose.model('AdminLog');
// const adminDao = require('../../dao/admin.dao');
const moment = require('moment');
const timeFormat = 'YYYY-MM-DD HH:mm:ss';

function showTime(_time) {
  return moment(_time).format(timeFormat);
}

exports.verifyToken = function (req, res, next) {
  const token = (req.body && req.body.access_token)
    || (req.query && req.query.access_token)
    || req.headers['x-access-token'];
  // console.log('token=', token);
  const logData = {
    account: '',
    name:'',
    logType: 'access',
    logContent: '',
    reqUrl: req.originalUrl,
    reqMethod: req.method
  };
  if (token) {
    // 解码验证 token (检验是否被更改、是否在有效期内)
    jwt.verify(token, process.env.JWT_SECRET, function (err, decodedToken) { // )
      if (err) {
        logData.logType = 'error';
        logData.logContent = `${err.name}`;
        if (err.hasOwnProperty('expiredAt')){
          logData.logContent += ' expiredAt '+showTime(err.expiredAt);
          const decoded = jwt.decode(token, {complete: true});
          if (decoded) {
            logData.account = decoded.payload.email;
            logData.name = decoded.payload.name;
          }
          // console.log(decoded.header);
          // console.log(decoded.payload);
        }
        // adminDao.recordAdminLog(logData);
        // console.log('err=', err.name);
        // setSystemLog(req, errInfo, false, "Token 解析错误");
        return res.status(401).json(logData).end();
      } else {
        // console.log(decodedToken);
        logData.account = decodedToken.email;
        logData.name = decodedToken.name;
        // logData.logContent = `serverTime:${showTime()},loginTime:${showTime(decodedToken.loginTime)}}`;
        logData.logContent = 'token verify ok';
        // adminDao.recordAdminLog(logData);
        console.log('serverTime=', moment().format('YYYY-MM-DD HH:mm:ss'));
        console.log('loginTime=',decodedToken.loginTime, moment(decodedToken.loginTime).format('YYYY-MM-DD HH:mm:ss'));
        console.log('tokenExpDate=',decodedToken.exp, moment(decodedToken.exp*1000).format('YYYY-MM-DD HH:mm:ss'));
        req.webUser = decodedToken;
        next(); //继续下一步路由
      }
    });
  } else {
    logData.logType = 'error';
    logData.logContent = 'token not found';
    // console.log('Token 获得失败!');
    return res.status(401).json({message: 'Token 获得失败'}).end();// 没有拿到token 返回错误
  }
};
