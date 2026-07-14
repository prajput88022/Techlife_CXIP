import{useState,useEffect}from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
const EVENTS=['call.created','call.completed','call.failed','analysis.completed','sentiment.high_risk','compliance.flag_created','compliance.critical','agent.scored','agent.coaching_ready','agent.burnout_risk','customer.churn_risk','deal.lost','deal.won','objection.unresolved','appointment.booked','lead.converted','lead.lost','report.ready','realtime.alert'];
export default function WebhooksPage(){
  const[tab,setTab]=useState('wh');
  const[hooks,setHooks]=useState([]);const[keys,setKeys]=useState([]);
  const[showForm,setShowForm]=useState(false);const[showKeyForm,setShowKeyForm]=useState(false);
  const[url,setUrl]=useState('');const[wname,setWname]=useState('');const[sel,setSel]=useState([]);
  const[keyName,setKeyName]=useState('');const[newKey,setNewKey]=useState(null);
  useEffect(()=>{api.get('/webhooks').then(r=>setHooks(r.data||[])).catch(()=>{});api.get('/api-keys').then(r=>setKeys(r.data||[])).catch(()=>{});},[]);
  const createHook=async()=>{if(!url||!sel.length)return toast.error('URL and events required');try{const r=await api.post('/webhooks',{url,name:wname,events:sel});setHooks(h=>[...h,r.data]);setShowForm(false);setUrl('');setWname('');setSel([]);toast.success('Webhook created');}catch(e){toast.error(e.response?.data?.error||'Failed');}};
  const deleteHook=async id=>{await api.delete(`/webhooks/${id}`);setHooks(h=>h.filter(x=>x._id!==id));toast.success('Deleted');};
  const testHook=async id=>{await api.post(`/webhooks/${id}/test`);toast.success('Test sent');};
  const createKey=async()=>{if(!keyName)return toast.error('Name required');const r=await api.post('/api-keys',{name:keyName,permissions:['*']});setNewKey(r.data);setShowKeyForm(false);setKeyName('');};
  const revokeKey=async id=>{await api.delete(`/api-keys/${id}`);setKeys(k=>k.filter(x=>x._id!==id));toast.success('Revoked');};
  const toggle=e=>setSel(p=>p.includes(e)?p.filter(x=>x!==e):[...p,e]);
  return(
    <div style={{padding:20}}>
      <h1 style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:16}}>Webhooks & API Keys</h1>
      <div style={{display:'flex',gap:4,background:'#111827',borderRadius:8,padding:3,marginBottom:16,width:'fit-content',border:'1px solid #1f2937'}}>
        {[['wh','Outbound Webhooks'],['ak','API Keys']].map(([id,label])=><button key={id} onClick={()=>setTab(id)} style={{padding:'5px 14px',borderRadius:6,border:'none',fontSize:11,fontWeight:500,cursor:'pointer',background:tab===id?'#1f2937':'transparent',color:tab===id?'#fff':'#6b7280'}}>{label}</button>)}
      </div>
      {tab==='wh'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <p style={{fontSize:11,color:'#6b7280'}}>CXIP POSTs to your URLs · HMAC-SHA256 signed · 19 event types · auto-retry</p>
            <button onClick={()=>setShowForm(!showForm)} className="btn-primary" style={{fontSize:11}}>+ New webhook</button>
          </div>
          {showForm&&<div className="card" style={{marginBottom:12,borderColor:'#064e3b'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Endpoint URL *</label><input className="input" placeholder="https://yourapp.com/webhooks/cxip" value={url} onChange={e=>setUrl(e.target.value)}/></div>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Name</label><input className="input" placeholder="My integration" value={wname} onChange={e=>setWname(e.target.value)}/></div>
            </div>
            <div style={{marginBottom:10}}><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:6}}>Events * <button onClick={()=>setSel(EVENTS)} style={{marginLeft:8,fontSize:10,padding:'1px 8px',borderRadius:4,border:'1px solid #1d4ed8',background:'rgba(29,78,216,.2)',color:'#60a5fa',cursor:'pointer'}}>All</button></label>
            <div style={{display:'flex',flexWrap:'wrap',gap:4}}>{EVENTS.map(e=><button key={e} onClick={()=>toggle(e)} style={{fontSize:10,padding:'2px 8px',borderRadius:6,border:`1px solid ${sel.includes(e)?'#059669':'#374151'}`,background:sel.includes(e)?'rgba(5,150,105,.2)':'transparent',color:sel.includes(e)?'#34d399':'#6b7280',cursor:'pointer'}}>{e}</button>)}</div></div>
            <div style={{display:'flex',gap:8}}><button onClick={createHook} className="btn-primary" style={{fontSize:11}}>Create</button><button onClick={()=>setShowForm(false)} className="btn-secondary" style={{fontSize:11}}>Cancel</button></div>
          </div>}
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {hooks.length===0?<div className="card" style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No webhooks yet</div>:hooks.map(h=>(
              <div key={h._id} className="card">
                <div style={{display:'flex',alignItems:'start',gap:10}}>
                  <div style={{flex:1}}><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}><span style={{fontSize:11,fontWeight:500,color:'#e5e7eb'}}>{h.name||h.url}</span><span style={{fontSize:10,padding:'1px 6px',borderRadius:6,background:h.is_active?'rgba(5,150,105,.2)':'#1f2937',color:h.is_active?'#34d399':'#6b7280'}}>{h.is_active?'active':'disabled'}</span></div><div style={{fontFamily:'monospace',fontSize:10,color:'#6b7280',marginBottom:5}}>{h.url}</div><div style={{display:'flex',flexWrap:'wrap',gap:4}}>{(h.events||[]).slice(0,6).map(e=><span key={e} style={{fontSize:9,padding:'1px 5px',borderRadius:4,background:'#1f2937',color:'#9ca3af'}}>{e}</span>)}{(h.events||[]).length>6&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:4,background:'#1f2937',color:'#9ca3af'}}>+{h.events.length-6}</span>}</div></div>
                  <div style={{display:'flex',gap:6,flexShrink:0}}><button onClick={()=>testHook(h._id)} className="btn-secondary" style={{fontSize:10,padding:'3px 8px'}}>Test</button><button onClick={()=>deleteHook(h._id)} className="btn-danger" style={{fontSize:10,padding:'3px 8px'}}>Delete</button></div>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{marginTop:14,borderColor:'#1d3461'}}>
            <div style={{fontSize:11,fontWeight:500,color:'#60a5fa',marginBottom:6}}>Signature verification</div>
            <pre style={{fontSize:10,color:'#9ca3af',background:'#030712',padding:10,borderRadius:8,overflow:'auto'}}>{`const crypto = require('crypto');
const sig = req.headers['x-cxip-signature'];
const expected = 'sha256=' + crypto
  .createHmac('sha256', YOUR_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');
const valid = crypto.timingSafeEqual(
  Buffer.from(sig), Buffer.from(expected)
);`}</pre>
          </div>
        </div>
      )}
      {tab==='ak'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <p style={{fontSize:11,color:'#6b7280'}}>Use <code style={{color:'#34d399'}}>X-API-Key: cxip_...</code> or <code style={{color:'#34d399'}}>Authorization: Bearer cxip_...</code></p>
            <button onClick={()=>setShowKeyForm(!showKeyForm)} className="btn-primary" style={{fontSize:11}}>+ New API key</button>
          </div>
          {newKey&&<div className="card" style={{marginBottom:12,borderColor:'#064e3b'}}><div style={{fontSize:11,fontWeight:500,color:'#34d399',marginBottom:6}}>🔑 Save this key — never shown again!</div><div style={{display:'flex',gap:8,alignItems:'center'}}><code style={{flex:1,background:'#030712',padding:'8px 10px',borderRadius:6,fontSize:11,color:'#34d399',wordBreak:'break-all'}}>{newKey.key}</code><button onClick={()=>{navigator.clipboard.writeText(newKey.key);toast.success('Copied!');}} className="btn-secondary" style={{fontSize:11,flexShrink:0}}>Copy</button></div><button onClick={()=>setNewKey(null)} style={{fontSize:10,color:'#6b7280',background:'none',border:'none',cursor:'pointer',marginTop:6}}>Dismiss</button></div>}
          {showKeyForm&&<div className="card" style={{marginBottom:12,borderColor:'#064e3b'}}><div style={{display:'flex',gap:10,alignItems:'flex-end'}}><div style={{flex:1}}><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Key name</label><input className="input" placeholder="Production integration" value={keyName} onChange={e=>setKeyName(e.target.value)}/></div><button onClick={createKey} className="btn-primary" style={{fontSize:11}}>Create</button><button onClick={()=>setShowKeyForm(false)} className="btn-secondary" style={{fontSize:11}}>Cancel</button></div></div>}
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {keys.length===0?<div className="card" style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No API keys yet</div>:keys.map(k=>(
              <div key={k._id} className="card" style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:16}}>🔑</span>
                <div style={{flex:1}}><div style={{fontSize:12,color:'#e5e7eb'}}>{k.name}</div><div style={{fontFamily:'monospace',fontSize:10,color:'#6b7280'}}>{k.key_prefix}</div></div>
                <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:k.is_active?'rgba(5,150,105,.2)':'#1f2937',color:k.is_active?'#34d399':'#6b7280'}}>{k.is_active?'active':'revoked'}</span>
                {k.is_active&&<button onClick={()=>revokeKey(k._id)} className="btn-danger" style={{fontSize:10,padding:'3px 8px'}}>Revoke</button>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
