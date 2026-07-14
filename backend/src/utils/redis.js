import Redis from 'ioredis';
let _r=null;
export async function connectRedis(){
  if(_r&&_r.status==='ready')return _r;
  _r=new Redis(process.env.REDIS_URL||'redis://127.0.0.1:6379',{
    password:process.env.REDIS_PASSWORD||undefined,
    retryStrategy:t=>Math.min(t*100,3000),
    maxRetriesPerRequest:3
  });
  await new Promise((res,rej)=>{_r.once('ready',res);_r.once('error',rej);});
  return _r;
}
export const getRedis=()=>_r;
