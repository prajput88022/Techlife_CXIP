export default function SettingsPage(){
  return(<div style={{padding:20,maxWidth:640}}><h1 style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:16}}>Settings</h1><div className="card"><p style={{fontSize:12,color:'#9ca3af',lineHeight:'1.7',marginBottom:12}}>All settings are configured in <code style={{background:'#1f2937',padding:'2px 6px',borderRadius:4,color:'#34d399'}}>/opt/cxip/.env</code> on the server.</p><pre style={{fontSize:11,color:'#9ca3af',background:'#030712',padding:14,borderRadius:8,overflow:'auto',lineHeight:'1.8'}}>{`# Edit settings:
ssh your-server
nano /opt/cxip/.env
cxip restart

# AI Providers:
STT_PROVIDER=whisper        # whisper|deepgram|azure|google|ibm|assemblyai
LLM_PROVIDER=openai         # openai|claude|gemini|deepseek|mistral|ollama|ibm
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Industry framework:
INDUSTRY=sales              # call_center|sales|insurance|banking|telecom|healthcare|real_estate|ecommerce

# Language:
WHISPER_LANGUAGE=en         # en|hi|ar|fr|es|de|zh|bn|te|mr|ta|ur|...

# CouchDB:
COUCHDB_URL=http://127.0.0.1:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=yourpassword

# Status:
cxip status
cxip logs api
cxip logs worker`}</pre></div></div>);
}
