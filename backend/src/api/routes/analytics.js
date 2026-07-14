import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Analytics,Calls,Objections,DealSignals } from '../../db/couch.js';
const r=Router();r.use(requireAuth);
r.get('/sentiment',async(req,res)=>res.json(await Analytics.byTenant(req.tenantId,'sentiment',parseInt(req.query.limit)||100)));
r.get('/emotions',async(req,res)=>res.json(await Analytics.byTenant(req.tenantId,'emotion',parseInt(req.query.limit)||100)));
r.get('/audit',async(req,res)=>res.json(await Analytics.byTenant(req.tenantId,'audit',parseInt(req.query.limit)||100)));
r.get('/objections',async(req,res)=>res.json(await Objections.byTenant(req.tenantId,parseInt(req.query.limit)||500)));
r.get('/deal-signals',async(req,res)=>res.json(await DealSignals.byTenant(req.tenantId,parseInt(req.query.limit)||500)));
r.get('/summary',async(req,res)=>{
  const calls=await Calls.byTenant(req.tenantId,{},1000);
  const done=calls.filter(c=>c.status==='completed');
  const avg=(arr,k)=>arr.length?Math.round(arr.reduce((s,c)=>s+(c[k]||0),0)/arr.length):0;
  const count=(arr,k)=>arr.reduce((acc,c)=>{const v=c[k]||'unknown';acc[v]=(acc[v]||0)+1;return acc;},{});
  res.json({total_calls:calls.length,completed:done.length,avg_csat:avg(done,'csat_prediction'),avg_score:avg(done,'overall_score'),avg_deal_probability:avg(done,'deal_probability'),avg_trust_score:avg(done,'trust_score'),lead_conversion_rate:avg(done,'lead_conversion_rate'),high_churn_count:done.filter(c=>c.churn_risk==='high').length,intents:count(done,'intent'),sentiments:count(done,'sentiment'),churn_risks:count(done,'churn_risk')});
});
export default r;
