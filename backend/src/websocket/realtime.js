export function setupSocketIO(io){
  io.on('connection',s=>{s.on('join:tenant',tid=>s.join(`t:${tid}`));});
}
export function broadcast(io,tid,event,data){
  io.to(`t:${tid}`).emit(event,{event,data,ts:new Date().toISOString()});
}
