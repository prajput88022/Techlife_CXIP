import crypto from 'crypto';
import axios from 'axios';
import { Webhooks, WebhookLogs } from '../db/couch.js';
import logger from '../utils/logger.js';

export const EVENTS={
  CALL_CREATED:'call.created',CALL_COMPLETED:'call.completed',CALL_FAILED:'call.failed',
  ANALYSIS_DONE:'analysis.completed',SENTIMENT_HIGH_RISK:'sentiment.high_risk',
  COMPLIANCE_FLAG:'compliance.flag_created',COMPLIANCE_CRITICAL:'compliance.critical',
  AGENT_SCORED:'agent.scored',AGENT_COACHING:'agent.coaching_ready',AGENT_BURNOUT:'agent.burnout_risk',
  CHURN_RISK:'customer.churn_risk',DEAL_LOST:'deal.lost',DEAL_WON:'deal.won',
  OBJECTION_UNRESOLVED:'objection.unresolved',REPORT_READY:'report.ready',LIVE_ALERT:'realtime.alert',
  LEAD_CONVERTED:'lead.converted',LEAD_LOST:'lead.lost',APPOINTMENT_BOOKED:'appointment.booked',
};

const sign=(b,s)=>'sha256='+crypto.createHmac('sha256',s).update(typeof b==='string'?b:JSON.stringify(b)).digest('hex');

async function deliver(wh,event,payload,attempt=1){
  const body=JSON.stringify({event,data:payload,timestamp:new Date().toISOString(),attempt});
  const sig=wh.secret?sign(body,wh.secret):null;
  const headers={'Content-Type':'application/json','User-Agent':'CXIP/2.0','X-CXIP-Event':event,'X-CXIP-Attempt':String(attempt),...(sig&&{'X-CXIP-Signature':sig}),...(wh.custom_headers||{})};
  const t0=Date.now();
  try{
    const r=await axios.post(wh.url,body,{headers,timeout:10000,validateStatus:null});
    const ok=r.status>=200&&r.status<300;
    await WebhookLogs.create({webhook_id:wh._id,tenant_id:wh.tenant_id,event,url:wh.url,status:ok?'delivered':'failed',http_status:r.status,duration_ms:Date.now()-t0,attempt});
    if(ok){await Webhooks.update(wh._id,{last_triggered_at:new Date().toISOString(),last_http_status:r.status,consecutive_failures:0});return{success:true};}
    throw new Error(`HTTP ${r.status}`);
  }catch(err){
    await WebhookLogs.create({webhook_id:wh._id,tenant_id:wh.tenant_id,event,url:wh.url,status:'failed',error:err.message,duration_ms:Date.now()-t0,attempt});
    const f=(wh.consecutive_failures||0)+1;
    await Webhooks.update(wh._id,{consecutive_failures:f,last_error:err.message,...(f>=10&&{is_active:false})});
    if(attempt<3){await new Promise(r=>setTimeout(r,[5000,30000,120000][attempt-1]||60000));return deliver(wh,event,payload,attempt+1);}
    return{success:false,error:err.message};
  }
}

export async function dispatchEvent(tenantId,event,payload){
  try{
    const all=await Webhooks.byTenant(tenantId);
    const m=all.filter(w=>w.is_active&&(w.events?.includes(event)||w.events?.includes('*')));
    if(!m.length)return;
    Promise.allSettled(m.map(w=>deliver(w,event,payload)));
  }catch(err){logger.error('dispatch error',{error:err.message,event});}
}
export const verifySignature=(payload,sig,secret)=>{
  try{return crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(sign(payload,secret)));}catch{return false;}
};
