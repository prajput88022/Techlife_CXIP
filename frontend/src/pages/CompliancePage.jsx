import{useState,useEffect}from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
export default function CompliancePage(){
  const[flags,setFlags]=useState([]);const[loading,setLoading]=useState(true);
  const load=()=>{setLoading(true);api.get('/compliance').then(r=>setFlags(r.data||[])).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[]);
  const resolve=async id=>{await api.post(`/compliance/${id}/resolve`);toast.success('Resolved');load();};
  const RC={critical:'#f87171',high:'#f97316',medium:'#fbbf24',low:'#34d399'};
  return(
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:18,fontWeight:600,color:'#fff'}}>Compliance</h1><p style={{fontSize:11,color:'#6b7280',marginTop:2}}>PCI-DSS · GDPR · Policy violations · Ethics · Resolve after investigation</p></div>
        <button onClick={load} className="btn-secondary" style={{fontSize:11}}>↻ Refresh</button>
      </div>
      <div className="card">
        {loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:flags.length===0?<div style={{textAlign:'center',padding:24,color:'#34d399',fontSize:12}}>✓ No open compliance issues</div>:(
          flags.map(f=>(
            <div key={f._id} style={{display:'flex',alignItems:'start',gap:10,padding:'10px 0',borderBottom:'1px solid #1f2937'}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:RC[f.risk_level]||'#9ca3af',marginTop:4,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:500,color:'#e5e7eb'}}>{f.description}</div>
                <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>{f.flag_type} · Call {f.call_id?.slice(0,8)}… {f.regulation?`· ${f.regulation}`:''}</div>
                {f.action_required&&<div style={{fontSize:10,color:'#60a5fa',marginTop:2}}>Action: {f.action_required}</div>}
              </div>
              <span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:`${RC[f.risk_level]}22`,color:RC[f.risk_level],fontWeight:500,flexShrink:0}}>{f.risk_level}</span>
              <button onClick={()=>resolve(f._id)} className="btn-secondary" style={{fontSize:10,padding:'3px 8px',flexShrink:0}}>Resolve</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
