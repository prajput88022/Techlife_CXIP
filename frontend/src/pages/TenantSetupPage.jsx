import{useState}from 'react';
import{useNavigate,Link}from 'react-router-dom';
import{useAuthStore}from '../store/auth.js';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const INDUSTRIES=[
  ['call_center','📞 Call Center / Customer Support','Communication, resolution, CX, compliance'],
  ['sales','💰 Sales / Lead Conversion','Lead conversion, agent behavior, deal intelligence'],
  ['insurance','🛡 Insurance','Sales, FCA regulatory, CX, efficiency'],
  ['banking','🏦 Banking & Financial Services','Cross-sell, AML/KYC/PCI compliance, CX'],
  ['telecom','📡 Telecom / Mobile Services','Sales/retention, technical, CX, Ofcom compliance'],
  ['healthcare','🏥 Healthcare / Medical','Patient care, HIPAA, efficiency, satisfaction'],
  ['real_estate','🏠 Real Estate / Property','Sales, client management, CX, compliance'],
  ['ecommerce','🛍 E-Commerce / Retail','Sales/upsell, CX, efficiency, consumer rights'],
];

const LANGS=[
  ['en','English'],['hi','Hindi - हिन्दी'],['ar','Arabic - العربية'],
  ['bn','Bengali - বাংলা'],['te','Telugu - తెలుగు'],['mr','Marathi - मराठी'],
  ['ta','Tamil - தமிழ்'],['ur','Urdu - اردو'],['gu','Gujarati - ગુજરાતી'],
  ['kn','Kannada - ಕನ್ನಡ'],['ml','Malayalam - മലയാളം'],['pa','Punjabi - ਪੰਜਾਬੀ'],
  ['fr','French'],['es','Spanish'],['de','German'],['zh','Chinese'],
  ['tr','Turkish'],['pt','Portuguese'],['ru','Russian'],['ja','Japanese'],['ko','Korean'],
];

const STTS=[['whisper','Whisper (default)'],['deepgram','Deepgram'],['azure','Azure'],['google','Google'],['assemblyai','AssemblyAI'],['ibm','IBM Watson']];
const LLMS=[['openai','OpenAI GPT-4o'],['claude','Anthropic Claude'],['gemini','Google Gemini'],['deepseek','DeepSeek'],['mistral','Mistral'],['ollama','Ollama (local)'],['ibm','IBM watsonx'],['azure_openai','Azure OpenAI']];

export default function TenantSetupPage(){
  const[step,setStep]=useState(1);
  const[org,setOrg]=useState('');
  const[slug,setSlug]=useState('');
  const[industry,setIndustry]=useState('');
  const[lang,setLang]=useState('en');
  const[stt,setStt]=useState('whisper');
  const[llm,setLlm]=useState('openai');
  const[email,setEmail]=useState('');
  const[pass,setPass]=useState('');
  const[name,setName]=useState('');
  const[loading,setLoading]=useState(false);
  const{login}=useAuthStore();const navigate=useNavigate();

  const makeSlug=v=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const submit=async()=>{
    setLoading(true);
    try{
      // Create tenant + admin user
      await api.post('/tenants/register',{
        org_name:org, slug, industry, default_language:lang,
        stt_provider:stt, llm_provider:llm,
        admin_email:email, admin_password:pass, admin_name:name,
      });
      await login(email,pass);
      toast.success(`Welcome to ${org}!`);
      navigate('/dashboard');
    }catch(e){toast.error(e.response?.data?.error||'Setup failed');}
    finally{setLoading(false);}
  };

  const steps=[
    {n:1,label:'Organization'},
    {n:2,label:'Industry'},
    {n:3,label:'AI Config'},
    {n:4,label:'Admin account'},
  ];

  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#030712',padding:20}}>
      <div style={{width:'100%',maxWidth:560}}>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:32}}>
          <div style={{fontSize:36,marginBottom:8}}>📊</div>
          <h1 style={{fontSize:22,fontWeight:600,color:'#fff'}}>Tech-Life CXIP v2</h1>
          <p style={{fontSize:12,color:'#6b7280',marginTop:4}}>Set up your call intelligence workspace</p>
        </div>

        {/* Step indicators */}
        <div style={{display:'flex',gap:8,marginBottom:24,justifyContent:'center'}}>
          {steps.map(s=>(
            <div key={s.n} style={{display:'flex',alignItems:'center',gap:6}}>
              <div style={{width:26,height:26,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600,background:step>=s.n?'#059669':'#1f2937',color:step>=s.n?'#fff':'#6b7280',flexShrink:0}}>{step>s.n?'✓':s.n}</div>
              <span style={{fontSize:11,color:step===s.n?'#34d399':'#6b7280',fontWeight:step===s.n?500:400}}>{s.label}</span>
              {s.n<4&&<div style={{width:20,height:1,background:'#374151'}}/>}
            </div>
          ))}
        </div>

        <div className="card" style={{padding:24}}>
          {/* Step 1 — Org */}
          {step===1&&(
            <div>
              <h2 style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>Your organization</h2>
              <p style={{fontSize:11,color:'#6b7280',marginBottom:18}}>This creates your workspace. You can add more teams and users later.</p>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Organization name *</label>
                <input className="input" placeholder="Acme Call Center" value={org} onChange={e=>{setOrg(e.target.value);setSlug(makeSlug(e.target.value));}}/>
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Workspace slug (URL identifier)</label>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{fontSize:11,color:'#6b7280',flexShrink:0}}>cxip.company/</span>
                  <input className="input" placeholder="acme-call-center" value={slug} onChange={e=>setSlug(makeSlug(e.target.value))}/>
                </div>
                {slug&&<div style={{fontSize:10,color:'#34d399',marginTop:4}}>✓ workspace ID: {slug}</div>}
              </div>
              <button onClick={()=>org&&slug?setStep(2):toast.error('Fill all fields')} className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'10px 0'}}>Continue →</button>
            </div>
          )}

          {/* Step 2 — Industry */}
          {step===2&&(
            <div>
              <h2 style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>Select your industry</h2>
              <p style={{fontSize:11,color:'#6b7280',marginBottom:14}}>This determines which KPI framework is used to score your agents. You can change this later.</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:18}}>
                {INDUSTRIES.map(([k,label,desc])=>(
                  <div key={k} onClick={()=>setIndustry(k)} style={{padding:'10px 12px',borderRadius:8,border:`1px solid ${industry===k?'#059669':'#374151'}`,background:industry===k?'rgba(5,150,105,.1)':'transparent',cursor:'pointer',transition:'all .1s'}}>
                    <div style={{fontSize:12,fontWeight:500,color:industry===k?'#34d399':'#e5e7eb',marginBottom:3}}>{label}</div>
                    <div style={{fontSize:10,color:'#6b7280'}}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(1)} className="btn-secondary" style={{flex:1,justifyContent:'center'}}>← Back</button>
                <button onClick={()=>industry?setStep(3):toast.error('Select an industry')} className="btn-primary" style={{flex:2,justifyContent:'center',padding:'10px 0'}}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 3 — AI config */}
          {step===3&&(
            <div>
              <h2 style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>AI configuration</h2>
              <p style={{fontSize:11,color:'#6b7280',marginBottom:14}}>Choose your speech-to-text, LLM, and default transcription language. You can change these anytime in Settings.</p>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Default transcription language</label>
                <select className="input" value={lang} onChange={e=>setLang(e.target.value)}>
                  {LANGS.map(([c,n])=><option key={c} value={c}>{n}</option>)}
                </select>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Speech-to-Text (STT) provider</label>
                <select className="input" value={stt} onChange={e=>setStt(e.target.value)}>
                  {STTS.map(([c,n])=><option key={c} value={c}>{n}</option>)}
                </select>
                {stt==='whisper'&&<div style={{fontSize:10,color:'#34d399',marginTop:4}}>✓ Whisper works out of the box — no extra key needed if using OpenAI</div>}
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Language Model (LLM) provider</label>
                <select className="input" value={llm} onChange={e=>setLlm(e.target.value)}>
                  {LLMS.map(([c,n])=><option key={c} value={c}>{n}</option>)}
                </select>
                <div style={{fontSize:10,color:'#6b7280',marginTop:4}}>API keys are configured in /opt/cxip/.env after installation</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(2)} className="btn-secondary" style={{flex:1,justifyContent:'center'}}>← Back</button>
                <button onClick={()=>setStep(4)} className="btn-primary" style={{flex:2,justifyContent:'center',padding:'10px 0'}}>Continue →</button>
              </div>
            </div>
          )}

          {/* Step 4 — Admin */}
          {step===4&&(
            <div>
              <h2 style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:4}}>Create admin account</h2>
              <p style={{fontSize:11,color:'#6b7280',marginBottom:14}}>This will be the superadmin for <strong style={{color:'#34d399'}}>{org}</strong>. More users can be added from Settings.</p>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Full name *</label>
                <input className="input" placeholder="Your name" value={name} onChange={e=>setName(e.target.value)}/>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Email *</label>
                <input className="input" type="email" placeholder="admin@yourcompany.com" value={email} onChange={e=>setEmail(e.target.value)}/>
              </div>
              <div style={{marginBottom:18}}>
                <label style={{fontSize:11,color:'#9ca3af',display:'block',marginBottom:5}}>Password (min 8 chars) *</label>
                <input className="input" type="password" placeholder="••••••••" value={pass} onChange={e=>setPass(e.target.value)}/>
              </div>
              {/* Summary */}
              <div style={{background:'#030712',borderRadius:8,padding:'10px 12px',marginBottom:16,fontSize:11,color:'#9ca3af',lineHeight:1.8}}>
                <div>🏢 <strong style={{color:'#e5e7eb'}}>{org}</strong> ({slug})</div>
                <div>🏭 Industry: <strong style={{color:'#34d399'}}>{industry}</strong></div>
                <div>🎙 STT: <strong style={{color:'#34d399'}}>{stt}</strong> · 🤖 LLM: <strong style={{color:'#34d399'}}>{llm}</strong> · 🌐 Lang: <strong style={{color:'#34d399'}}>{lang}</strong></div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setStep(3)} className="btn-secondary" style={{flex:1,justifyContent:'center'}}>← Back</button>
                <button onClick={()=>{if(!name||!email||pass.length<8)return toast.error('Fill all fields (password min 8 chars)');submit();}} disabled={loading} className="btn-primary" style={{flex:2,justifyContent:'center',padding:'10px 0',opacity:loading?.6:1}}>
                  {loading?'Creating workspace…':'🚀 Create workspace'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:16,fontSize:11,color:'#6b7280'}}>
          Already have a workspace? <Link to="/login" style={{color:'#34d399',textDecoration:'none'}}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}
