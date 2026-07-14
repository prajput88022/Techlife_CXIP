import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Calls,Agents,Compliance,Coaching,Objections } from '../../db/couch.js';
const r=Router();r.use(requireAuth);
r.get('/executive',async(req,res)=>{
  const[calls,agents,flags,coaching,objections]=await Promise.all([Calls.byTenant(req.tenantId,{},1000),Agents.byTenant(req.tenantId),Compliance.openFlags(req.tenantId),Coaching.pending(req.tenantId),Objections.unresolved(req.tenantId)]);
  const done=calls.filter(c=>c.status==='completed');
  const avg=(arr,k)=>arr.length?Math.round(arr.reduce((s,c)=>s+(c[k]||0),0)/arr.length):0;
  const count=(arr,k)=>arr.reduce((acc,c)=>{const v=c[k]||'unknown';acc[v]=(acc[v]||0)+1;return acc;},{});
  res.json({
    kpis:{total_calls:calls.length,completed_calls:done.length,avg_agent_score:avg(done,'overall_score'),avg_csat:avg(done,'csat_prediction'),avg_deal_probability:avg(done,'deal_probability'),high_churn_count:done.filter(c=>c.churn_risk==='high').length,open_compliance_flags:flags.length,agents_needing_coaching:coaching.length,avg_agent_performance:avg(agents,'overall_score'),unresolved_objections:objections.length,lead_conversion_rate:avg(done,'lead_conversion_rate'),avg_trust_score:avg(done,'trust_score')},
    recent_calls:calls.slice(0,10),compliance_alerts:flags.slice(0,5),
    agent_leaderboard:agents.sort((a,b)=>(b.overall_score||0)-(a.overall_score||0)).slice(0,5),
    sentiment_distribution:count(done,'sentiment'),intent_distribution:count(done,'intent'),
  });
});
export default r;
