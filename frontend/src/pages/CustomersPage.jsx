import{useState,useEffect}from 'react';
import api from '../utils/api.js';
export default function CustomersPage(){
  const[customers,setCustomers]=useState([]);const[highRisk,setHighRisk]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.get('/customers'),api.get('/customers/high-churn')]).then(([a,r])=>{setCustomers(a.data||[]);setHighRisk(r.data||[]);}).finally(()=>setLoading(false));},[]);
  return(
    <div style={{padding:20}}>
      <h1 style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:20}}>Customer Intelligence</h1>
      {highRisk.length>0&&<div className="card" style={{marginBottom:12,borderColor:'#450a0a'}}><div style={{fontSize:12,fontWeight:500,color:'#f87171',marginBottom:8}}>⚠️ High churn risk — {highRisk.length} customers</div>{highRisk.map(c=><div key={c._id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #1f2937'}}><div style={{flex:1,fontSize:12,color:'#e5e7eb'}}>{c.full_name||c.email||'Unknown'}</div><span style={{fontSize:12,fontWeight:600,color:'#f87171'}}>{Math.round((c.churn_probability||0)*100)}% churn</span></div>)}</div>}
      <div className="card">
        {loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:customers.length===0?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No customers yet</div>:(
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
            <thead><tr style={{color:'#6b7280',borderBottom:'1px solid #1f2937'}}>{['Customer','Email','Churn risk','Segment'].map(h=><th key={h} style={{textAlign:'left',padding:'4px 8px',fontWeight:500}}>{h}</th>)}</tr></thead>
            <tbody>{customers.map(c=><tr key={c._id} style={{borderBottom:'1px solid #1f2937'}}><td style={{padding:'7px 8px',color:'#e5e7eb',fontWeight:500}}>{c.full_name||'—'}</td><td style={{padding:'7px 8px',color:'#9ca3af'}}>{c.email||'—'}</td><td style={{padding:'7px 8px',fontWeight:600,color:c.churn_probability>0.5?'#f87171':c.churn_probability>0.3?'#fbbf24':'#34d399'}}>{Math.round((c.churn_probability||0)*100)}%</td><td style={{padding:'7px 8px',color:'#9ca3af'}}>{c.segment||'standard'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
