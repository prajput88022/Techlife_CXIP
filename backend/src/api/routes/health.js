import { Router } from 'express';
import { DB } from '../../db/couch.js';
import { getRedis } from '../../utils/redis.js';
import { getQueueStats } from '../../workers/queues.js';
const r=Router();
r.get('/',async(req,res)=>{
  const out={status:'ok',version:'2.0.0',timestamp:new Date().toISOString()};
  try{await DB.find('tenants',{},{limit:1});out.couchdb='ok';}catch{out.couchdb='error';out.status='degraded';}
  try{const rd=getRedis();if(rd)await rd.ping();out.redis='ok';}catch{out.redis='error';out.status='degraded';}
  try{out.queue=await getQueueStats();}catch{out.queue='unavailable';}
  res.status(out.status==='ok'?200:503).json(out);
});
export default r;
