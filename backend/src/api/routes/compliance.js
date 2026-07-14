import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Compliance } from '../../db/couch.js';
const r=Router();r.use(requireAuth);
r.get('/',async(req,res)=>res.json(await Compliance.openFlags(req.tenantId)));
r.get('/critical',async(req,res)=>res.json(await Compliance.critical(req.tenantId)));
r.post('/:id/resolve',async(req,res)=>res.json(await Compliance.resolve(req.params.id,req.user._id)));
export default r;
