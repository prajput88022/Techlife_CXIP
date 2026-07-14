import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Users, Tenants } from '../db/couch.js';
import logger from '../utils/logger.js';
export const hashPwd=p=>bcrypt.hash(p,12);
export const checkPwd=(p,h)=>bcrypt.compare(p,h);
export const signToken=payload=>jwt.sign(payload,process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'7d'});
export const verifyToken=token=>jwt.verify(token,process.env.JWT_SECRET);
export async function bootstrapAdmin(){
  const email=process.env.ADMIN_EMAIL; if(!email)return;
  if(await Users.byEmail(email))return;
  let t=await Tenants.bySlug('default');
  if(!t)t=await Tenants.create({name:'Default Organization',slug:'default',industry:process.env.INDUSTRY||'call_center'});
  await Users.create({email,hashed_password:await hashPwd(process.env.ADMIN_PASSWORD||'changeme'),full_name:process.env.ADMIN_FULL_NAME||'Administrator',role:'admin',tenant_id:t._id});
  logger.info(`Admin created: ${email}`);
}
