const logger = require('../app_api/config/log4js.config');
const sysLogger = logger.sysLogger;
sysLogger.warn('look!');
logger.sysLogger.info('system logContent...');
logger.dbLogger.info('database  logContent...');
logger.dftLogger.error('default  logContent...');
logger.http.info('http...');
console.log('test over.');
