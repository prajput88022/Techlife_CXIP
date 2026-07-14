import{useState,useEffect}from 'react';
import api from '../utils/api.js';
import{useAuthStore}from '../store/auth.js';
import toast from 'react-hot-toast';

const INDUSTRY_LABELS={call_center:'📞 Call Center',sales:'💰 Sales',insurance:'🛡 Insurance',banking:'🏦 Banking',telecom:'📡 Telecom',healthcare:'🏥 Healthcare',real_estate:'🏠 Real Estate',ecommerce:'🛍 E-Commerce'};

export default function TenantsAdminPage(){
  const[tenants,setTenants]=useState([]);const[users,setUsers]=useState([]);
  const[loading,setLoading]=useState(true);
  const[activeTab,setActiveTab]=useState('tenants');
  const[showUserForm,setShowUserForm]=useState(false);
  const[newEmail,setNewEmail]=useState('');const[newName,setNewName]=useState('');
  const[newPass,setNewPass]=useState('');const[newRole,setNewRole]=useState('agent');
  const{user}=useAuthStore();

  useEffect(()=>{
    Promise.all([
      api.get('/tenants').then(r=>setTenants(r.data||[])).catch(()=>{}),
      api.get('/users').then(r=>setUsers(r.data||[])).catch(()=>{}),
    ]).finally(()=>setLoading(false));
  },[]);

  const createUser=async()=>{
    if(!newEmail||!newName||newPass.length<8)return toast.error('All fields required, password min 8 chars');
    try{
      await api.post('/users',{email:newEmail,full_name:newName,password:newPass,role:newRole});
      toast.success('User created');setShowUserForm(false);setNewEmail('');setNewName('');setNewPass('');
      api.get('/users').then(r=>setUsers(r.data||[]));
    }catch(e){toast.error(e.response?.data?.error||'Failed');}
  };

  const toggleUser=async(u)=>{
    await api.patch(`/users/${u._id}`,{is_active:!u.is_active});
    toast.success(u.is_active?'User deactivated':'User activated');
    api.get('/users').then(r=>setUsers(r.data||[]));
  };

  const ROLE_COLOR={admin:'badge-red',supervisor:'badge-blue',agent:'badge-gray',api:'badge-yellow'};

  return(
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:18,fontWeight:600,color:'#fff'}}>Admin — Tenants & Users</h1>
          <p style={{fontSize:11,color:'#6b7280',marginTop:2}}>Manage organizations and user accounts · Role: {user?.role}</p></div>
      </div>

      <div style={{display:'flex',gap:4,background:'#111827',borderRadius:8,padding:3,marginBottom:16,width:'fit-content',border:'1px solid #1f2937'}}>
        {[['tenants','🏢 Tenants'],['users','👤 Users']].map(([id,label])=>(
          <button key={id} onClick={()=>setActiveTab(id)} style={{padding:'5px 16px',borderRadius:6,border:'none',fontSize:11,fontWeight:500,cursor:'pointer',background:activeTab===id?'#1f2937':'transparent',color:activeTab===id?'#fff':'#6b7280'}}>
            {label}
          </button>
        ))}
      </div>

      {activeTab==='tenants'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {loading?<div style={{color:'#6b7280',fontSize:12}}>Loading…</div>:tenants.length===0?<div style={{color:'#6b7280',fontSize:12}}>No tenants</div>:tenants.map(t=>(
              <div key={t._id} className="card">
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                  <div style={{width:36,height:36,borderRadius:8,background:'#064e3b',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16}}>🏢</div>
                  <div><div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{t.name}</div><div style={{fontSize:10,color:'#6b7280',fontFamily:'monospace'}}>/{t.slug}</div></div>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                  <span className="badge-blue" style={{fontSize:10}}>{INDUSTRY_LABELS[t.industry]||t.industry}</span>
                  <span className={t.is_active?'badge-green':'badge-gray'} style={{fontSize:10}}>{t.is_active?'active':'inactive'}</span>
                </div>
                <div style={{fontSize:10,color:'#6b7280',lineHeight:1.8}}>
                  <div>STT: <span style={{color:'#9ca3af'}}>{t.stt_provider||'whisper'}</span></div>
                  <div>LLM: <span style={{color:'#9ca3af'}}>{t.llm_provider||'openai'}</span></div>
                  <div>Lang: <span style={{color:'#9ca3af'}}>{t.default_language||'en'}</span></div>
                  <div>Created: <span style={{color:'#9ca3af'}}>{new Date(t.created_at).toLocaleDateString()}</span></div>
                </div>
              </div>
            ))}
          </div>
          <div className="card" style={{marginTop:12,borderColor:'#1d3461'}}>
            <div style={{fontSize:11,fontWeight:500,color:'#60a5fa',marginBottom:6}}>Add new tenant</div>
            <p style={{fontSize:11,color:'#6b7280',marginBottom:8}}>To create a new organization workspace, use the public registration page:</p>
            <code style={{fontSize:11,color:'#34d399',background:'#030712',padding:'6px 10px',borderRadius:6,display:'block'}}>
              {window.location.origin}/setup
            </code>
          </div>
        </div>
      )}

      {activeTab==='users'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
            <p style={{fontSize:11,color:'#6b7280'}}>Manage access — roles: admin · supervisor · agent</p>
            <button onClick={()=>setShowUserForm(!showUserForm)} className="btn-primary" style={{fontSize:11}}>+ New user</button>
          </div>
          {showUserForm&&<div className="card" style={{marginBottom:12,borderColor:'#064e3b'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Full name</label><input className="input" placeholder="Jane Smith" value={newName} onChange={e=>setNewName(e.target.value)}/></div>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Email</label><input className="input" type="email" placeholder="jane@company.com" value={newEmail} onChange={e=>setNewEmail(e.target.value)}/></div>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Password</label><input className="input" type="password" placeholder="min 8 chars" value={newPass} onChange={e=>setNewPass(e.target.value)}/></div>
              <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Role</label>
                <select className="input" value={newRole} onChange={e=>setNewRole(e.target.value)}>
                  <option value="admin">Admin</option><option value="supervisor">Supervisor</option><option value="agent">Agent</option>
                </select>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}><button onClick={createUser} className="btn-primary" style={{fontSize:11}}>Create user</button><button onClick={()=>setShowUserForm(false)} className="btn-secondary" style={{fontSize:11}}>Cancel</button></div>
          </div>}
          <div className="card">
            {loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:users.length===0?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No users yet</div>:(
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
                <thead><tr style={{color:'#6b7280',borderBottom:'1px solid #1f2937'}}>{['Name','Email','Role','Status','Last login','Actions'].map(h=><th key={h} style={{textAlign:'left',padding:'4px 8px',fontWeight:500}}>{h}</th>)}</tr></thead>
                <tbody>{users.map(u=>(
                  <tr key={u._id} style={{borderBottom:'1px solid #1f2937'}}>
                    <td style={{padding:'7px 8px',color:'#e5e7eb',fontWeight:500}}>{u.full_name}</td>
                    <td style={{padding:'7px 8px',color:'#9ca3af'}}>{u.email}</td>
                    <td style={{padding:'7px 8px'}}><span className={ROLE_COLOR[u.role]||'badge-gray'}>{u.role}</span></td>
                    <td style={{padding:'7px 8px'}}><span className={u.is_active?'badge-green':'badge-gray'}>{u.is_active?'active':'inactive'}</span></td>
                    <td style={{padding:'7px 8px',color:'#6b7280'}}>{u.last_login?new Date(u.last_login).toLocaleDateString():'Never'}</td>
                    <td style={{padding:'7px 8px'}}>
                      <button onClick={()=>toggleUser(u)} className={u.is_active?'btn-danger':'btn-secondary'} style={{fontSize:10,padding:'2px 8px'}}>
                        {u.is_active?'Deactivate':'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
