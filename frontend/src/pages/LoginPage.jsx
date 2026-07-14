import{useState}from 'react';
import{useNavigate,Link}from 'react-router-dom';
import{useAuthStore}from '../store/auth.js';
import toast from 'react-hot-toast';

export default function LoginPage(){
  const[email,setEmail]=useState('');const[pass,setPass]=useState('');
  const[loading,setLoading]=useState(false);
  const{login}=useAuthStore();const navigate=useNavigate();
  const submit=async e=>{
    e.preventDefault();setLoading(true);
    try{await login(email,pass);navigate('/dashboard');}
    catch(err){toast.error(err.response?.data?.error||'Invalid credentials');}
    finally{setLoading(false);}
  };
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#030712'}}>
      <div style={{width:380}}>
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:8}}>📊</div>
          <h1 style={{fontSize:22,fontWeight:600,color:'#fff'}}>Tech-Life CXIP v2</h1>
          <p style={{fontSize:12,color:'#6b7280',marginTop:4}}>Sales Call Intelligence Platform · 50+ KPIs</p>
        </div>
        <div className="card" style={{padding:24}}>
          <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div>
              <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Email</label>
              <input className="input" type="email" placeholder="admin@yourcompany.com" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/>
            </div>
            <div>
              <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Password</label>
              <input className="input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)} required/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{justifyContent:'center',paddingTop:10,paddingBottom:10,opacity:loading?.6:1}}>
              {loading?'Signing in…':'Sign in'}
            </button>
          </form>
          <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #1f2937',textAlign:'center'}}>
            <p style={{fontSize:11,color:'#6b7280',marginBottom:8}}>New to CXIP?</p>
            <Link to="/setup" style={{display:'block',textAlign:'center',padding:'8px 0',borderRadius:8,border:'1px solid #374151',fontSize:12,color:'#34d399',textDecoration:'none',transition:'border-color .1s'}}
              onMouseEnter={e=>e.target.style.borderColor='#34d399'} onMouseLeave={e=>e.target.style.borderColor='#374151'}>
              🚀 Create new workspace
            </Link>
          </div>
        </div>
        <div style={{marginTop:16,padding:'12px 16px',background:'#111827',borderRadius:8,border:'1px solid #1f2937'}}>
          <div style={{fontSize:11,color:'#6b7280',marginBottom:6,fontWeight:500}}>Demo credentials</div>
          <div style={{fontSize:10,color:'#9ca3af',lineHeight:1.8,fontFamily:'monospace'}}>
            Email: admin@yourcompany.com<br/>
            Password: Set during install.sh
          </div>
        </div>
      </div>
    </div>
  );
}
