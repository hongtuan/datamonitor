const patternLayout = {
  type: 'pattern',
  pattern: '%d{yyyy-MM-dd hh:mm:ss,SSS} %p %c %m',
};
const config = {
  appenders: {
    console: {
      type: "console"
    },
    http: {
      type: "logLevelFilter",
      appender: "trace",
      level: "trace",
      maxLevel: "trace"
    },
    access: {
      type: "dateFile",
      filename: "./logs/access/access.log",
      pattern: ".yyyy-MM-dd",
      keepFileExt: true
    },
    system: {
      type: "dateFile",
      filename: "./logs/system/system.log",
      pattern: ".yyyy-MM-dd",
      layout: patternLayout,
      keepFileExt: true
    },
    database: {type: "dateFile",
      filename: "./logs/database/database.log",
      pattern: ".yyyy-MM-dd",
      layout: patternLayout,
      keepFileExt: true
    },
  },
  categories: {
    default: {appenders: ["console"], level: "trace"},
    access: {appenders: ["console", "access"], level: "info"},
    system: {appenders: ["console", "system"], level: "info"},
    database: {appenders: ["console", "database"], level: "info"}
  },
  replaceConsole: true
};
const log4js = require('log4js');
log4js.configure(config);
module.exports = {
  http:log4js.getLogger('http'),
  dftLogger:log4js.getLogger('default'),
  sysLogger:log4js.getLogger('system'),
  dbLogger:log4js.getLogger('database')
};
