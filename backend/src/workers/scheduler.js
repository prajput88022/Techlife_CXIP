import 'dotenv/config';
import cron from 'node-cron';
import { connectCouchDB } from '../db/couch.js';
import { connectRedis } from '../utils/redis.js';
import logger from '../utils/logger.js';
async function start(){
  await connectCouchDB(); await connectRedis();
  logger.info('Scheduler v2.0 started');
  cron.schedule('0 7 * * *',()=>logger.info('Scheduler: daily report'));
  cron.schedule('0 * * * *',()=>logger.info('Scheduler: hourly churn check'));
  cron.schedule('*/5 * * * *',()=>logger.debug('Scheduler: heartbeat'));
}
start().catch(err=>{logger.error('Scheduler failed',err);process.exit(1);});
