import{useState,useEffect}from 'react';
import api from '../utils/api.js';
import{BarChart,Bar,LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer,PieChart,Pie,Cell}from 'recharts';
const CHART=[{d:'Mon',calls:42,csat:78,deal:55},{d:'Tue',calls:58,csat:82,deal:62},{d:'Wed',calls:51,csat:79,deal:48},{d:'Thu',calls:67,csat:85,deal:71},{d:'Fri',calls:73,csat:83,deal:68},{d:'Sat',calls:34,csat:88,deal:74},{d:'Sun',calls:28,csat:86,deal:66}];
const COLORS=['#10b981','#f59e0b','#f97316','#ef4444'];
export default function Dashboard(){
  const[data,setData]=useState(null);
  useEffect(()=>{api.get('/dashboard/executive').then(r=>setData(r.data)).catch(()=>{});},[]);
  const k=data?.kpis||{};
  const kpis=[
    ['Total Calls',k.total_calls||0,'📞','#fff'],
    ['Avg CSAT',`${k.avg_csat||0}%`,'⭐','#34d399'],
    ['Deal Probability',`${k.avg_deal_probability||0}%`,'💰','#60a5fa'],
    ['Avg Trust Score',k.avg_trust_score||0,'🤝','#a78bfa'],
    ['Agent Score',k.avg_agent_performance||0,'🏆','#34d399'],
    ['Lead Conversion',`${k.lead_conversion_rate||0}%`,'🎯','#fbbf24'],
    ['Compliance Flags',k.open_compliance_flags||0,'🛡',k.open_compliance_flags>0?'#f87171':'#34d399'],
    ['Unresolved Obj.',k.unresolved_objections||0,'🛑',k.unresolved_objections>0?'#f97316':'#34d399'],
  ];
  const sentDist=data?Object.entries(data.sentiment_distribution||{}).map(([n,v])=>({name:n,value:v})):[];
  return(
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:18,fontWeight:600,color:'#fff'}}>Executive Dashboard</h1><p style={{fontSize:11,color:'#6b7280',marginTop:2}}>Sales Call Intelligence · 50+ KPIs · Real-time AI analysis</p></div>
        <button onClick={()=>api.get('/dashboard/executive').then(r=>setData(r.data))} className="btn-secondary" style={{fontSize:11}}>↻ Refresh</button>
      </div>

      {/* KPI grid */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:14}}>
        {kpis.map(([l,v,ic,c])=>(
          <div key={l} className="card" style={{padding:'10px 12px'}}>
            <div style={{fontSize:10,color:'#6b7280',marginBottom:2}}>{ic} {l}</div>
            <div style={{fontSize:20,fontWeight:600,color:c}}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
        <div className="card">
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>Weekly calls & CSAT</div>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={CHART} barSize={14}>
              <XAxis dataKey="d" tick={{fill:'#6b7280',fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#6b7280',fontSize:9}} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{background:'#111827',border:'1px solid #374151',fontSize:10}}/>
              <Bar dataKey="calls" fill="#059669" radius={[3,3,0,0]} name="Calls"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>Deal probability trend</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={CHART}>
              <XAxis dataKey="d" tick={{fill:'#6b7280',fontSize:9}} axisLine={false} tickLine={false}/>
              <YAxis tick={{fill:'#6b7280',fontSize:9}} axisLine={false} tickLine={false} domain={[0,100]}/>
              <Tooltip contentStyle={{background:'#111827',border:'1px solid #374151',fontSize:10}}/>
              <Line dataKey="deal" stroke="#60a5fa" strokeWidth={2} dot={{fill:'#60a5fa',r:2}} name="Deal %"/>
              <Line dataKey="csat" stroke="#10b981" strokeWidth={2} dot={{fill:'#10b981',r:2}} name="CSAT %"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>Sentiment distribution</div>
          {sentDist.length>0?(
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={sentDist} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" nameKey="name">
                  {sentDist.map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip contentStyle={{background:'#111827',border:'1px solid #374151',fontSize:10}}/>
              </PieChart>
            </ResponsiveContainer>
          ):(
            <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
                {[['Positive','#10b981'],['Neutral','#f59e0b'],['Negative','#f97316'],['Very Neg.','#ef4444']].map(([l,c])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:4,fontSize:10,color:'#9ca3af'}}>
                    <div style={{width:8,height:8,borderRadius:'50%',background:c}}/>
                    {l}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        <div className="card">
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>🚨 Compliance alerts</div>
          {(data?.compliance_alerts||[]).length===0?<div style={{fontSize:11,color:'#34d399',padding:'8px 0'}}>✓ No open issues</div>:(data?.compliance_alerts||[]).map(f=>(
            <div key={f._id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 0',borderBottom:'1px solid #1f2937'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:f.risk_level==='critical'?'#ef4444':'#f59e0b',flexShrink:0}}/>
              <div style={{flex:1,fontSize:11,color:'#d1d5db'}}>{f.description}</div>
              <span className={f.risk_level==='critical'?'badge-red':'badge-yellow'}>{f.risk_level}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{fontSize:11,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>🏆 Agent leaderboard</div>
          {(data?.agent_leaderboard||[]).length===0?<div style={{fontSize:11,color:'#6b7280',padding:'8px 0'}}>No agents yet — upload calls with agent_id</div>:(data?.agent_leaderboard||[]).map((a,i)=>(
            <div key={a._id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid #1f2937'}}>
              <span style={{fontSize:10,color:'#6b7280',width:14}}>{i+1}</span>
              <div style={{width:24,height:24,borderRadius:'50%',background:'#064e3b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:600,color:'#34d399'}}>{a.full_name?.[0]||'A'}</div>
              <div style={{flex:1,fontSize:11,color:'#e5e7eb'}}>{a.full_name}</div>
              <div style={{width:50,height:3,background:'#1f2937',borderRadius:2,overflow:'hidden'}}>
                <div style={{width:`${a.overall_score||0}%`,height:'100%',background:a.overall_score>=80?'#10b981':a.overall_score>=60?'#f59e0b':'#ef4444'}}/>
              </div>
              <span style={{fontSize:11,fontWeight:600,color:a.overall_score>=80?'#34d399':a.overall_score>=60?'#fbbf24':'#f87171',minWidth:24,textAlign:'right'}}>{a.overall_score||0}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
