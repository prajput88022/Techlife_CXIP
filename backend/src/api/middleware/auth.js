import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Users, APIKeys, DB } from '../../db/couch.js';
export async function requireAuth(req,res,next){
  const h=req.headers.authorization||'';
  if(h.startsWith('Bearer ')){
    try{const p=jwt.verify(h.slice(7),process.env.JWT_SECRET);const u=await Users.get(p.sub);if(!u||!u.is_active)return res.status(401).json({error:'Invalid session'});req.user=u;req.tenantId=u.tenant_id;req.authType='jwt';return next();}catch{return res.status(401).json({error:'Invalid token'});}
  }
  const k=req.headers['x-api-key']||req.query.api_key;
  if(k){
    try{
      if(!k.startsWith('cxip_'))return res.status(401).json({error:'Invalid API key format'});
      const keys=await DB.find('api_keys',{is_active:true},{limit:1000});
      let matched=null;for(const key of keys){if(await bcrypt.compare(k,key.key_hash)){matched=key;break;}}
      if(!matched)return res.status(401).json({error:'Invalid API key'});
      if(matched.expires_at&&new Date(matched.expires_at)<new Date())return res.status(401).json({error:'API key expired'});
      req.user={_id:matched.created_by,role:'api',tenant_id:matched.tenant_id,permissions:matched.permissions};
      req.tenantId=matched.tenant_id;req.authType='api_key';req.apiKeyId=matched._id;
      APIKeys.touch(matched._id).catch(()=>{});return next();
    }catch{return res.status(401).json({error:'Auth failed'});}
  }
  res.status(401).json({error:'Authentication required. Use: Authorization: Bearer <token> or X-API-Key: <key>'});
}
export const requireRole=(...roles)=>(req,res,next)=>{if(req.authType==='api_key')return next();if(!roles.includes(req.user?.role))return res.status(403).json({error:`Requires: ${roles.join(' or ')}`});next();};
