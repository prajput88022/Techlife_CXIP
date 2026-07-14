import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Reports } from '../../db/couch.js';
const r=Router();r.use(requireAuth);
r.get('/',async(req,res)=>res.json(await Reports.byTenant(req.tenantId,req.query.type)));
r.post('/',async(req,res)=>res.status(201).json(await Reports.create({...req.body,tenant_id:req.tenantId})));
r.get('/:id',async(req,res)=>{const list=await Reports.byTenant(req.tenantId);const rpt=list.find(x=>x._id===req.params.id);rpt?res.json(rpt):res.status(404).json({error:'Not found'});});
export default r;
