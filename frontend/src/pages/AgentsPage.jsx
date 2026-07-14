import{useState,useEffect}from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
export default function AgentsPage(){
  const[agents,setAgents]=useState([]);const[loading,setLoading]=useState(true);const[industries,setIndustries]=useState([]);
  const load=()=>{setLoading(true);Promise.all([api.get('/agents'),api.get('/agents/industries')]).then(([a,i])=>{setAgents(a.data.agents||[]);setIndustries(i.data||[]);}).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));};
  useEffect(()=>{load();},[]);
  return(
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:18,fontWeight:600,color:'#fff'}}>Agents</h1><p style={{fontSize:11,color:'#6b7280',marginTop:2}}>Scored with industry-specific KPI framework</p></div>
        <button onClick={load} className="btn-secondary" style={{fontSize:11}}>↻ Refresh</button>
      </div>
      {industries.length>0&&(
        <div className="card" style={{marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:8}}>Available industry frameworks ({industries.length})</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {industries.map(ind=><span key={ind.key} className="badge-blue" style={{fontSize:10}}>{ind.name}</span>)}
          </div>
        </div>
      )}
      <div className="card">
        {loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:agents.length===0?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No agents yet</div>:(
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr style={{color:'#6b7280',borderBottom:'1px solid #1f2937'}}>
              {['#','Agent','Dept','Industry','Score','Burnout','Calls','Last call'].map(h=><th key={h} style={{textAlign:'left',padding:'4px 8px',fontWeight:500}}>{h}</th>)}
            </tr></thead>
            <tbody>{agents.sort((a,b)=>(b.overall_score||0)-(a.overall_score||0)).map((a,i)=>(
              <tr key={a._id} style={{borderBottom:'1px solid #1f2937'}}>
                <td style={{padding:'7px 8px',color:'#6b7280'}}>{i+1}</td>
                <td style={{padding:'7px 8px'}}><div style={{display:'flex',alignItems:'center',gap:8}}><div style={{width:26,height:26,borderRadius:'50%',background:'#064e3b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#34d399'}}>{a.full_name?.[0]||'A'}</div><div><div style={{fontSize:12,color:'#e5e7eb'}}>{a.full_name}</div><div style={{fontSize:10,color:'#6b7280'}}>{a.email}</div></div></div></td>
                <td style={{padding:'7px 8px',color:'#9ca3af'}}>{a.department||'—'}</td>
                <td style={{padding:'7px 8px'}}><span className="badge-blue" style={{fontSize:9}}>{a.industry||'call_center'}</span></td>
                <td style={{padding:'7px 8px',fontWeight:600,color:a.overall_score>=80?'#34d399':a.overall_score>=60?'#fbbf24':'#f87171'}}>{a.overall_score||0}</td>
                <td style={{padding:'7px 8px'}}><span style={{fontSize:10,padding:'2px 7px',borderRadius:8,background:a.burnout_risk==='high'?'#450a0a':a.burnout_risk==='medium'?'#451a03':'#052e16',color:a.burnout_risk==='high'?'#f87171':a.burnout_risk==='medium'?'#fbbf24':'#34d399'}}>{a.burnout_risk||'low'}</span></td>
                <td style={{padding:'7px 8px',color:'#9ca3af'}}>{a.total_calls_processed||0}</td>
                <td style={{padding:'7px 8px',color:'#6b7280'}}>{a.last_call_at?new Date(a.last_call_at).toLocaleDateString():'—'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
