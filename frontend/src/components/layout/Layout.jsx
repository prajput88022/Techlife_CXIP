import{Outlet,NavLink,useNavigate}from 'react-router-dom';
import{useAuthStore}from '../../store/auth.js';
export default function Layout(){
  const{user,logout}=useAuthStore();const navigate=useNavigate();
  const nav=[
    ['/dashboard','📊','Dashboard'],['/calls','📞','Calls'],['/agents','👤','Agents'],
    ['/customers','👥','Customers'],['/compliance','🛡','Compliance'],
    ['/providers','🤖','AI Providers'],['/webhooks','🔗','Webhooks & API'],
    ['/reports','📄','Reports'],['/settings','⚙️','Settings'],
    ...(user?.role==='admin'?[['/admin','🏢','Admin']]:[]),
  ];
  return(
    <div style={{display:'flex',height:'100vh',overflow:'hidden'}}>
      <aside style={{width:196,background:'#111827',borderRight:'1px solid #1f2937',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'14px',borderBottom:'1px solid #1f2937'}}>
          <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>Tech-Life CXIP</div>
          <div style={{fontSize:10,color:'#6b7280',marginTop:2}}>v2.0 · {user?.tenant_id?.slice(0,8)||'workspace'}</div>
        </div>
        <nav style={{flex:1,overflowY:'auto',padding:'6px 0'}}>
          {nav.map(([to,icon,label])=>(
            <NavLink key={to} to={to} style={({isActive})=>({display:'flex',alignItems:'center',gap:8,padding:'7px 12px',fontSize:12,color:isActive?'#34d399':'#9ca3af',background:isActive?'rgba(52,211,153,.1)':'transparent',textDecoration:'none',transition:'all .1s'})}>
              <span>{icon}</span>{label}
            </NavLink>
          ))}
        </nav>
        <div style={{padding:'10px 12px',borderTop:'1px solid #1f2937'}}>
          <div style={{fontSize:11,color:'#9ca3af',marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.full_name||'User'}</div>
          <div style={{fontSize:10,color:'#6b7280',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</div>
          <div style={{fontSize:10,color:'#374151',marginBottom:6}}>Role: <span style={{color:'#34d399'}}>{user?.role}</span></div>
          <button onClick={()=>{logout();navigate('/login');}} style={{fontSize:11,color:'#6b7280',background:'none',border:'none',cursor:'pointer',padding:0}}>Sign out →</button>
        </div>
      </aside>
      <main style={{flex:1,overflowY:'auto',background:'#030712'}}><Outlet/></main>
    </div>
  );
}
