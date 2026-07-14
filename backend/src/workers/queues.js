import Bull from 'bull';
let _q=null;
function rOpts(){
  const u=(process.env.REDIS_URL||'redis://127.0.0.1:6379').replace('redis://','');
  const p=u.split('@'); const hp=p[p.length-1].split(':');
  return{host:hp[0]||'127.0.0.1',port:parseInt(hp[1])||6379,password:process.env.REDIS_PASSWORD||undefined};
}
export function getQueue(){
  if(!_q)_q=new Bull('audio',{redis:rOpts(),defaultJobOptions:{attempts:3,backoff:{type:'exponential',delay:10000},removeOnComplete:100,removeOnFail:200}});
  return _q;
}
export async function addAudioJob(data,opts={}){return getQueue().add('process-call',data,opts);}
export async function getQueueStats(){
  const q=getQueue();
  const[w,a,c,f,d]=await Promise.all([q.getWaitingCount(),q.getActiveCount(),q.getCompletedCount(),q.getFailedCount(),q.getDelayedCount()]);
  return{waiting:w,active:a,completed:c,failed:f,delayed:d};
}
