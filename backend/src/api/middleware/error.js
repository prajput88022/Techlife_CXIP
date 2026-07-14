import logger from '../../utils/logger.js';
export function errorHandler(err,req,res,_next){
  const s=err.status||err.statusCode||500;
  if(s>=500)logger.error(err.message,{stack:err.stack,path:req.path});
  res.status(s).json({error:err.message||'Internal server error',...(process.env.NODE_ENV!=='production'&&{stack:err.stack})});
}
