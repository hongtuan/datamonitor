var os = require('os');
var moment = require('moment');
var util = require('../../utils/util');
var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
function bytes2M(b){
  var m = +b/1024/1204;
  return m.toFixed(0);
}

module.exports.getSystemInfo = function(req, res) {
  var systemInfo = [];
  var cpusInfo = JSON.stringify(os.cpus());
  systemInfo.push({name:'hostname',value: os.hostname()});//操作系统主机名
  var serverUptime = Math.floor(os.uptime());
  //systemInfo.push({name:'uptime',value: serverUptime});//正常运行时间
  systemInfo.push({name:'uptime',value: util.getTimeDistanceDesc(serverUptime*1000)});//正常运行时间
  systemInfo.push({name:'serverTime',value: moment().format(dateTimeFormat)});//当前系统时间
  systemInfo.push({name:'serverTimeZone',value: process.env.TZ});//当前系统时间
  systemInfo.push({name:'appStartTime',value: moment(req.app.locals.startTime).format(dateTimeFormat)});//应用系统启动时间
  var appRunTime = Date.now() - req.app.locals.startTime;
  systemInfo.push({name:'appRunTime',value: util.getTimeDistanceDesc(appRunTime)});//应用系统启动时间
  systemInfo.push({name:'arch',value: os.arch()});//处理器架构
  systemInfo.push({name:'cpus',value: cpusInfo});//cpu信息
  systemInfo.push({name:'platform',value: os.platform()});//操作系统平台
  systemInfo.push({name:'type',value: os.type()});//操作系统名称
  systemInfo.push({name:'release',value: os.release()});//操作系统版本
  systemInfo.push({name:'totalmem',value: bytes2M(os.totalmem())+' M'});//系统总内存
  systemInfo.push({name:'freemem',value: bytes2M(os.freemem())+' M'});//空闲内存
  systemInfo.push({name:'loadavg',value: os.loadavg()});//系统最近5、10、15分钟的平均负载
  res.status(200).json(systemInfo);
};
