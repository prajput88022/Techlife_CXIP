import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '../middleware/auth.js';
import { Calls,Analytics } from '../../db/couch.js';
import { addAudioJob,getQueueStats } from '../../workers/queues.js';
import { dispatchEvent,EVENTS } from '../../services/webhook.service.js';
const r=Router();r.use(requireAuth);
const D=process.env.UPLOAD_DIR||'/var/lib/cxip/audio';mkdirSync(D,{recursive:true});
const upload=multer({storage:multer.diskStorage({destination:(a,b,cb)=>cb(null,D),filename:(a,f,cb)=>cb(null,`${uuid()}${path.extname(f.originalname)}`)}),limits:{fileSize:(parseInt(process.env.MAX_UPLOAD_SIZE_MB)||500)*1024*1024},fileFilter:(a,f,cb)=>cb(null,['.mp3','.wav','.m4a','.ogg','.flac','.mp4','.webm'].includes(path.extname(f.originalname).toLowerCase()))});
r.get('/',async(req,res)=>{const{status,agent_id,limit=50}=req.query;const filter={};if(status)filter.status=status;if(agent_id)filter.agent_id=agent_id;const calls=await Calls.byTenant(req.tenantId,filter,parseInt(limit));res.json({calls,total:calls.length});});
r.get('/queue-stats',async(req,res)=>res.json(await getQueueStats()));
r.get('/:id',async(req,res)=>{const c=await Calls.get(req.params.id);if(!c||c.tenant_id!==req.tenantId)return res.status(404).json({error:'Not found'});const[s,e,a,t]=await Promise.all([Analytics.forCall(c._id,'sentiment'),Analytics.forCall(c._id,'emotion'),Analytics.forCall(c._id,'audit'),Analytics.forCall(c._id,'transcript')]);res.json({call:c,sentiment:s,emotion:e,audit:a,transcript:t});});
r.post('/upload',upload.single('audio'),async(req,res)=>{
  if(!req.file)return res.status(400).json({error:'Audio file required'});
  const{agent_id,customer_id,channel='call',stt_provider,llm_provider,language,notes}=req.body;
  const call=await Calls.create({tenant_id:req.tenantId,agent_id:agent_id||null,customer_id:customer_id||null,audio_path:req.file.path,audio_filename:req.file.originalname,audio_size:req.file.size,channel,stt_provider:stt_provider||process.env.STT_PROVIDER||'whisper',llm_provider:llm_provider||process.env.LLM_PROVIDER||'openai',language:language||process.env.WHISPER_LANGUAGE||'en',notes:notes||''});
  await addAudioJob({call_id:call._id});
  await dispatchEvent(req.tenantId,EVENTS.CALL_CREATED,{call_id:call._id,channel});
  res.status(202).json({call_id:call._id,status:'pending',message:'Queued for processing'});
});
r.post('/bulk-upload',upload.array('audio',50),async(req,res)=>{
  if(!req.files?.length)return res.status(400).json({error:'No files uploaded'});
  const results=[];
  for(const f of req.files){const call=await Calls.create({tenant_id:req.tenantId,audio_path:f.path,audio_filename:f.originalname,audio_size:f.size,channel:req.body.channel||'call',stt_provider:req.body.stt_provider||process.env.STT_PROVIDER||'whisper',llm_provider:req.body.llm_provider||process.env.LLM_PROVIDER||'openai',language:req.body.language||'en'});await addAudioJob({call_id:call._id});results.push({call_id:call._id,filename:f.originalname,status:'queued'});}
  res.status(202).json({queued:results.length,results});
});
r.post('/ingest-text',async(req,res)=>{
  const{text,channel='chat',agent_id,customer_id,metadata}=req.body;
  if(!text)return res.status(400).json({error:'text is required'});
  const call=await Calls.create({tenant_id:req.tenantId,agent_id:agent_id||null,customer_id:customer_id||null,raw_text:text,channel,stt_provider:'none',llm_provider:process.env.LLM_PROVIDER||'openai',metadata:metadata||{}});
  await addAudioJob({call_id:call._id,text_only:true});
  res.status(202).json({call_id:call._id,status:'pending'});
});
export default r;
