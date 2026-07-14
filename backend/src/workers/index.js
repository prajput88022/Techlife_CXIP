import 'dotenv/config';
import { connectCouchDB,Calls,Agents,Customers,Analytics,Compliance,Coaching,Objections,DealSignals } from '../db/couch.js';
import { connectRedis } from '../utils/redis.js';
import { getSTT,analyzeCall } from '../ai/providers.js';
import { calculateAgentScore } from '../ai/scoring.js';
import { dispatchEvent,EVENTS } from '../services/webhook.service.js';
import { getQueue } from './queues.js';
import logger from '../utils/logger.js';

async function start(){
  await connectCouchDB(); await connectRedis();
  const q=getQueue();
  q.process('process-call',2,processCall);
  q.on('completed',job=>logger.info(`Job ${job.id} done`));
  q.on('failed',(job,err)=>logger.error(`Job ${job.id} failed: ${err.message}`));
  logger.info('Worker v2.0 running...');
}

async function processCall(job){
  const{call_id,audio_url,text_only}=job.data;
  let call=await Calls.get(call_id);
  if(!call){logger.warn(`Call not found: ${call_id}`);return;}
  await Calls.updateStatus(call_id,'processing');

  try{
    // ── STT ──────────────────────────────────────────────────
    let transcriptText=call.raw_text||'';
    if(!text_only&&!transcriptText){
      let audioPath=call.audio_path;
      if(audio_url&&!audioPath){audioPath=await downloadAudio(audio_url,call_id);await Calls.update(call_id,{audio_path:audioPath});}
      job.progress(15);
      const stt=getSTT(call.stt_provider);
      const sttRes=await stt.transcribe(audioPath,call.language||'en');
      transcriptText=sttRes.text;
      await Analytics.save(call_id,'transcript',{tenant_id:call.tenant_id,text:sttRes.text,segments:sttRes.segments,language:sttRes.language,word_count:sttRes.text.split(' ').length});
    }
    job.progress(35);

    // Get tenant industry
    const { Tenants } = await import('../db/couch.js');
    const tenant=await Tenants.get(call.tenant_id);
    const industry=tenant?.industry||process.env.INDUSTRY||'call_center';

    // ── AI Analysis ───────────────────────────────────────────
    const analysis=await analyzeCall(transcriptText,call.llm_provider,industry);
    job.progress(65);

    // ── Save analytics ─────────────────────────────────────────
    await Analytics.save(call_id,'sentiment',{tenant_id:call.tenant_id,overall_sentiment:analysis.sentiment,sentiment_score:analysis.sentiment_score,customer_sentiment:analysis.customer_sentiment,sentiment_trajectory:analysis.sentiment_trajectory,csat_prediction:analysis.csat_prediction,nps_prediction:analysis.nps_prediction,trust_score:analysis.trust_score});
    await Analytics.save(call_id,'emotion',{tenant_id:call.tenant_id,dominant_emotion:analysis.dominant_emotion,emotions:analysis.emotions,agent_emotions:analysis.agent_emotions});
    await Analytics.save(call_id,'audit',{tenant_id:call.tenant_id,kpi_scores:analysis.kpi_scores,group_scores:analysis.group_scores,overall_score:analysis.overall_score,intent:analysis.intent,resolution_achieved:analysis.resolution_achieved,summary:analysis.summary,action_items:analysis.next_best_actions?.map(a=>a.action)||[],ai_coaching:analysis.ai_coaching,keywords:analysis.keywords,competitor_mentions:analysis.competitor_mentions,word_level_timeline:analysis.word_level_timeline||[],transcript_text:transcriptText,root_cause:analysis.root_cause,next_best_actions:analysis.next_best_actions,talk_ratio_agent:analysis.talk_ratio_agent,talk_ratio_customer:analysis.talk_ratio_customer,interruption_count:analysis.interruption_count,silence_ratio:analysis.silence_ratio});

    // ── Save objections ───────────────────────────────────────
    for(const obj of analysis.objections||[]){
      await Objections.create({tenant_id:call.tenant_id,call_id,agent_id:call.agent_id,type:obj.type,quote:obj.quote,agent_response:obj.agent_response,resolved:obj.resolved,impact:obj.impact,recommended_response:obj.recommended_response});
      if(!obj.resolved)await dispatchEvent(call.tenant_id,EVENTS.OBJECTION_UNRESOLVED,{call_id,objection:obj});
    }

    // ── Save deal signals ──────────────────────────────────────
    for(const sig of analysis.buying_signals||[]){
      await DealSignals.create({tenant_id:call.tenant_id,call_id,signal:sig.signal,strength:sig.strength,time_hint:sig.time_hint});
    }

    // ── Compliance flags ──────────────────────────────────────
    for(const issue of analysis.compliance_issues||[]){
      await Compliance.createFlag({tenant_id:call.tenant_id,call_id,agent_id:call.agent_id,risk_level:issue.risk_level,flag_type:issue.type,description:issue.description,regulation:issue.regulation||'',action_required:issue.action_required||''});
      const evt=issue.risk_level==='critical'?EVENTS.COMPLIANCE_CRITICAL:EVENTS.COMPLIANCE_FLAG;
      await dispatchEvent(call.tenant_id,evt,{call_id,issue});
    }

    // ── Agent scoring ──────────────────────────────────────────
    if(call.agent_id){
      const agent=await Agents.get(call.agent_id);
      if(agent){
        const total=(agent.total_calls_processed||0)+1;
        const newScore=Math.round(((agent.overall_score||0)*(total-1)+analysis.overall_score)/total);
        const burnout=newScore<60||analysis.emotions?.frustration>0.7?'high':newScore<75?'medium':'low';
        await Agents.update(call.agent_id,{overall_score:newScore,total_calls_processed:total,last_call_at:new Date().toISOString(),burnout_risk:burnout,industry});
        const coaching=await Coaching.create({tenant_id:call.tenant_id,agent_id:call.agent_id,generated_by_call_id:call_id,overall_score:analysis.overall_score,kpi_scores:analysis.kpi_scores,group_scores:analysis.group_scores,ai_coaching:analysis.ai_coaching,priority:analysis.ai_coaching?.priority||'medium',industry});
        await dispatchEvent(call.tenant_id,EVENTS.AGENT_SCORED,{agent_id:call.agent_id,score:analysis.overall_score,call_id});
        await dispatchEvent(call.tenant_id,EVENTS.AGENT_COACHING,{agent_id:call.agent_id,coaching_id:coaching._id});
        if(burnout==='high')await dispatchEvent(call.tenant_id,EVENTS.AGENT_BURNOUT,{agent_id:call.agent_id,score:newScore});
      }
    }

    // ── Customer churn / lead ──────────────────────────────────
    if(call.customer_id){
      if(analysis.churn_risk==='high'){
        await Customers.update(call.customer_id,{churn_probability:0.8,churn_reasons:analysis.product_feedback?.filter(f=>f.is_complaint).map(f=>f.description)||[]});
        await dispatchEvent(call.tenant_id,EVENTS.CHURN_RISK,{customer_id:call.customer_id,churn_risk:analysis.churn_risk,reasons:analysis.root_cause?.secondary||[]});
      }
      if(analysis.deal_probability>70)await dispatchEvent(call.tenant_id,EVENTS.DEAL_WON,{call_id,customer_id:call.customer_id,deal_probability:analysis.deal_probability});
      else if(analysis.deal_probability<30)await dispatchEvent(call.tenant_id,EVENTS.DEAL_LOST,{call_id,customer_id:call.customer_id,deal_probability:analysis.deal_probability,root_cause:analysis.root_cause?.primary});
      if(analysis.appointment_booked)await dispatchEvent(call.tenant_id,EVENTS.APPOINTMENT_BOOKED,{call_id,customer_id:call.customer_id});
    }

    if(analysis.sentiment==='very_negative'||analysis.emotions?.anger>0.7)
      await dispatchEvent(call.tenant_id,EVENTS.SENTIMENT_HIGH_RISK,{call_id,sentiment:analysis.sentiment,emotion:analysis.dominant_emotion});

    // ── Mark complete ──────────────────────────────────────────
    await Calls.updateStatus(call_id,'completed',{completed_at:new Date().toISOString(),overall_score:analysis.overall_score,csat_prediction:analysis.csat_prediction,churn_risk:analysis.churn_risk,deal_probability:analysis.deal_probability,trust_score:analysis.trust_score,lead_conversion_rate:analysis.lead_conversion_rate,intent:analysis.intent,sentiment:analysis.sentiment,compliance_count:(analysis.compliance_issues||[]).length,objections_count:(analysis.objections||[]).length,appointment_booked:analysis.appointment_booked||false});
    job.progress(100);
    await dispatchEvent(call.tenant_id,EVENTS.CALL_COMPLETED,{call_id,agent_id:call.agent_id,overall_score:analysis.overall_score,csat_prediction:analysis.csat_prediction,deal_probability:analysis.deal_probability,sentiment:analysis.sentiment,intent:analysis.intent,resolution_achieved:analysis.resolution_achieved});
    await dispatchEvent(call.tenant_id,EVENTS.ANALYSIS_DONE,{call_id,analysis});
    logger.info(`Call ${call_id} done. Score:${analysis.overall_score} CSAT:${analysis.csat_prediction} Deal:${analysis.deal_probability}%`);

  }catch(err){
    logger.error(`Pipeline error: ${err.message}`,{call_id});
    await Calls.updateStatus(call_id,'failed',{error:err.message});
    await dispatchEvent(call?.tenant_id,EVENTS.CALL_FAILED,{call_id,error:err.message});
    throw err;
  }
}

async function downloadAudio(url,callId){
  const{createWriteStream,mkdirSync}=await import('fs');
  const path=await import('path');
  const dir=process.env.UPLOAD_DIR||'/var/lib/cxip/audio';
  mkdirSync(dir,{recursive:true});
  const filePath=path.join(dir,`${callId}.mp3`);
  const resp=await(await import('axios')).default({method:'get',url,responseType:'stream'});
  await new Promise((resolve,reject)=>{const ws=createWriteStream(filePath);resp.data.pipe(ws);ws.on('finish',resolve);ws.on('error',reject);});
  return filePath;
}

start().catch(err=>{logger.error('Worker startup failed',err);process.exit(1);});
