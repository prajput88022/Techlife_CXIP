export default function ProvidersPage(){
  const STT=[['whisper','Faster Whisper','Local · Free · OpenAI API'],['deepgram','Deepgram','Cloud · Nova-2 · Best accuracy'],['azure','Azure Speech','Enterprise · Microsoft'],['google','Google STT','Cloud · Chirp model'],['ibm','IBM Watson STT','IBM Boston · 22 languages'],['assemblyai','AssemblyAI','Best diarization']];
  const LLM=[['openai','OpenAI ChatGPT','GPT-4o · Best quality'],['claude','Anthropic Claude','Claude Sonnet 4.6'],['azure_openai','Azure OpenAI','Enterprise · Microsoft'],['gemini','Google Gemini','2.5 Pro'],['deepseek','DeepSeek','Cost-effective'],['ibm','IBM watsonx.ai','IBM Boston · Granite'],['mistral','Mistral AI','European · Fast'],['ollama','Ollama (Local)','Self-hosted · Free'],['virtuallab','Virtual Lab AI','Custom endpoint']];
  const INDS=[['call_center','Call Center / Support','comm 25% · resolution 30% · cx 20% · compliance 25%'],['sales','Sales / Lead Conversion','lead 30% · agent behavior 35% · satisfaction 20% · deal intel 15%'],['insurance','Insurance','sales 30% · regulatory 35% · cx 20% · efficiency 15%'],['banking','Banking & Finance','cross-sell 25% · compliance 40% · cx 20% · efficiency 15%'],['telecom','Telecom / Mobile','sales 30% · technical 30% · cx 25% · compliance 15%'],['healthcare','Healthcare','patient care 35% · HIPAA 35% · efficiency 20% · satisfaction 10%'],['real_estate','Real Estate','sales 35% · client mgmt 30% · cx 25% · compliance 10%'],['ecommerce','E-Commerce','sales 30% · cx 35% · efficiency 25% · compliance 10%']];
  return(
    <div style={{padding:20}}>
      <h1 style={{fontSize:18,fontWeight:600,color:'#fff',marginBottom:6}}>AI Providers & Industry Frameworks</h1>
      <p style={{fontSize:11,color:'#6b7280',marginBottom:20}}>Set provider in <code style={{background:'#1f2937',padding:'1px 5px',borderRadius:4,color:'#34d399'}}>/opt/cxip/.env</code> → <code style={{background:'#1f2937',padding:'1px 5px',borderRadius:4,color:'#34d399'}}>cxip restart</code></p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:14}}>
        <div className="card"><div style={{fontSize:12,fontWeight:500,color:'#e5e7eb',marginBottom:8}}>Speech-to-Text (STT)</div><div style={{display:'flex',flexDirection:'column',gap:6}}>{STT.map(([k,n,d])=><div key={k} style={{display:'flex',gap:8,padding:'6px 8px',background:'#030712',borderRadius:6}}><code style={{fontSize:10,color:'#34d399',minWidth:80}}>{k}</code><div><div style={{fontSize:11,color:'#e5e7eb'}}>{n}</div><div style={{fontSize:10,color:'#6b7280'}}>{d}</div></div></div>)}</div></div>
        <div className="card"><div style={{fontSize:12,fontWeight:500,color:'#e5e7eb',marginBottom:8}}>Language Models (LLM)</div><div style={{display:'flex',flexDirection:'column',gap:6}}>{LLM.map(([k,n,d])=><div key={k} style={{display:'flex',gap:8,padding:'6px 8px',background:'#030712',borderRadius:6}}><code style={{fontSize:10,color:'#34d399',minWidth:90}}>{k}</code><div><div style={{fontSize:11,color:'#e5e7eb'}}>{n}</div><div style={{fontSize:10,color:'#6b7280'}}>{d}</div></div></div>)}</div></div>
      </div>
      <div className="card"><div style={{fontSize:12,fontWeight:500,color:'#e5e7eb',marginBottom:8}}>Industry Scoring Frameworks — set <code style={{color:'#34d399'}}>INDUSTRY=</code> in .env</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:6}}>
          {INDS.map(([k,n,w])=><div key={k} style={{padding:'8px 10px',background:'#030712',borderRadius:6}}><div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}><code style={{fontSize:10,color:'#34d399'}}>{k}</code><span style={{fontSize:11,color:'#e5e7eb'}}>{n}</span></div><div style={{fontSize:10,color:'#6b7280'}}>{w}</div></div>)}
        </div>
      </div>
    </div>
  );
}
