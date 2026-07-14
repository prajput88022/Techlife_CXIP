import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Providers } from '../../db/couch.js';
import { STT_PROVIDERS,LLM_PROVIDERS } from '../../ai/providers.js';
const r=Router();r.use(requireAuth);
r.get('/available',(req,res)=>res.json({stt:Object.keys(STT_PROVIDERS),llm:Object.keys(LLM_PROVIDERS),sentiment:['local','azure','google'],emotion:['local','azure']}));
r.get('/',async(req,res)=>res.json(await Providers.getAll(req.tenantId)));
r.post('/configure',async(req,res)=>{const{provider_name,provider_type,model_name,is_active,is_default,endpoint_url}=req.body;if(!provider_name||!provider_type)return res.status(400).json({error:'provider_name and provider_type required'});res.json(await Providers.upsert(req.tenantId,provider_name,provider_type,{model_name:model_name||'',is_active:is_active!==false,is_default:is_default||false,endpoint_url:endpoint_url||''}));});
export default r;
