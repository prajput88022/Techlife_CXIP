import winston from 'winston';
import 'winston-daily-rotate-file';
const D = process.env.LOG_DIR || '/var/log/cxip';
const logger = winston.createLogger({
  level: process.env.NODE_ENV==='production'?'info':'debug',
  format: winston.format.combine(
    winston.format.timestamp(), winston.format.errors({stack:true}),
    process.env.NODE_ENV==='production'?winston.format.json():winston.format.combine(winston.format.colorize(),winston.format.simple())
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({dirname:D,filename:'cxip-%DATE%.log',datePattern:'YYYY-MM-DD',maxFiles:'30d',maxSize:'50m'}),
    new winston.transports.DailyRotateFile({dirname:D,filename:'cxip-error-%DATE%.log',level:'error',datePattern:'YYYY-MM-DD',maxFiles:'30d'}),
  ],
});
export default logger;
