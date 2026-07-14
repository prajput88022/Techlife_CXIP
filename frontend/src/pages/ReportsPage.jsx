import{useState,useEffect}from 'react';
import api from '../utils/api.js';
export default function ReportsPage(){
  const[reports,setReports]=useState([]);const[loading,setLoading]=useState(true);
  useEffect(()=>{api.get('/reports').then(r=>setReports(r.data||[])).finally(()=>setLoading(false));},[]);
  return(<div style={{padding:20}}><h1 style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:20}}>Reports</h1><div className="card">{loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:reports.length===0?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>📄 No reports yet</div>:reports.map(r=><div key={r._id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #1f2937'}}><span style={{fontSize:20}}>📄</span><div style={{flex:1}}><div style={{fontSize:12,color:'#e5e7eb'}}>{r.title||r.report_type}</div><div style={{fontSize:10,color:'#6b7280',marginTop:2}}>{new Date(r.created_at).toLocaleString()}</div></div><span style={{fontSize:10,padding:'2px 8px',borderRadius:8,background:r.status==='ready'?'rgba(5,150,105,.2)':'rgba(245,158,11,.2)',color:r.status==='ready'?'#34d399':'#fbbf24'}}>{r.status}</span></div>)}</div></div>);
}
