import{useState,useEffect,useCallback}from 'react';
import{useDropzone}from 'react-dropzone';
import api from '../utils/api.js';
import toast from 'react-hot-toast';
const SC={pending:'#fbbf24',processing:'#60a5fa',completed:'#34d399',failed:'#f87171'};
export default function CallsPage(){
  const[calls,setCalls]=useState([]);const[loading,setLoading]=useState(true);
  const[uploading,setUploading]=useState(false);const[channel,setChannel]=useState('call');
  const[stt,setStt]=useState('');const[llm,setLlm]=useState('');const[lang,setLang]=useState('en');
  const load=()=>{setLoading(true);api.get('/calls?limit=100').then(r=>setCalls(r.data.calls||[])).catch(()=>toast.error('Failed')).finally(()=>setLoading(false));};
  useEffect(()=>{load();const t=setInterval(load,15000);return()=>clearInterval(t);},[]);
  const onDrop=useCallback(async files=>{
    if(!files.length)return;setUploading(true);
    const fd=new FormData();files.forEach(f=>fd.append('audio',f));
    fd.append('channel',channel);if(stt)fd.append('stt_provider',stt);if(llm)fd.append('llm_provider',llm);if(lang)fd.append('language',lang);
    try{await api.post(files.length>1?'/calls/bulk-upload':'/calls/upload',fd,{headers:{'Content-Type':'multipart/form-data'}});toast.success(`${files.length} file(s) queued`);load();}
    catch(e){toast.error(e.response?.data?.error||'Upload failed');}finally{setUploading(false);}
  },[channel,stt,llm,lang]);
  const{getRootProps,getInputProps,isDragActive}=useDropzone({onDrop,accept:{'audio/*':['.mp3','.wav','.m4a','.ogg','.flac']},multiple:true});
  const LANGS=[['en','English'],['hi','Hindi'],['ar','Arabic'],['fr','French'],['es','Spanish'],['de','German'],['zh','Chinese'],['bn','Bengali'],['te','Telugu'],['mr','Marathi'],['ta','Tamil'],['ur','Urdu'],['gu','Gujarati'],['kn','Kannada'],['ml','Malayalam'],['pa','Punjabi'],['tr','Turkish'],['pt','Portuguese'],['ru','Russian'],['ja','Japanese'],['ko','Korean'],['id','Indonesian']];
  return(
    <div style={{padding:20}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
        <div><h1 style={{fontSize:18,fontWeight:600,color:'#fff'}}>Calls</h1><p style={{fontSize:11,color:'#6b7280',marginTop:2}}>Upload audio · AI processes with 50+ KPIs · Multi-language STT</p></div>
        <button onClick={load} className="btn-secondary" style={{fontSize:11}}>↻ Refresh</button>
      </div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',gap:10,marginBottom:12,flexWrap:'wrap'}}>
          {[['Channel',channel,setChannel,['call','chat','email','whatsapp','ticket']],['STT',stt,setStt,['','whisper','deepgram','azure','google','ibm','assemblyai']],['LLM',llm,setLlm,['','openai','claude','azure_openai','gemini','deepseek','ibm','mistral','ollama']]].map(([label,val,setter,opts])=>(
            <div key={label}><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>{label}</label>
            <select value={val} onChange={e=>setter(e.target.value)} className="input" style={{padding:'4px 8px',width:'auto',fontSize:11}}>
              {opts.map(o=><option key={o} value={o}>{o||'Default'}</option>)}
            </select></div>
          ))}
          <div><label style={{fontSize:10,color:'#9ca3af',display:'block',marginBottom:4}}>Language</label>
          <select value={lang} onChange={e=>setLang(e.target.value)} className="input" style={{padding:'4px 8px',width:'auto',fontSize:11}}>
            {LANGS.map(([c,n])=><option key={c} value={c}>{n}</option>)}
          </select></div>
        </div>
        <div {...getRootProps()} style={{border:'2px dashed',borderColor:isDragActive?'#10b981':'#374151',borderRadius:10,padding:28,textAlign:'center',cursor:'pointer',transition:'border-color .15s',background:isDragActive?'rgba(16,185,129,.05)':'transparent'}}>
          <input {...getInputProps()}/>
          <div style={{fontSize:24,marginBottom:8}}>🎙️</div>
          <div style={{fontSize:13,color:'#d1d5db',fontWeight:500}}>{uploading?'Uploading…':isDragActive?'Drop here':'Drop audio files or click to browse'}</div>
          <div style={{fontSize:11,color:'#6b7280',marginTop:4}}>MP3 WAV M4A OGG FLAC · up to 500 MB · multiple files OK · 22 languages</div>
        </div>
      </div>
      <div className="card">
        <div style={{fontSize:12,fontWeight:500,color:'#e5e7eb',marginBottom:10}}>All calls ({calls.length})</div>
        {loading?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>Loading…</div>:calls.length===0?<div style={{textAlign:'center',padding:24,color:'#6b7280',fontSize:12}}>No calls yet — upload audio above</div>:(
          <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:11,minWidth:900}}>
            <thead><tr style={{color:'#6b7280',borderBottom:'1px solid #1f2937'}}>
              {['ID','File','Ch','Status','Score','CSAT','Deal%','Trust','Sentiment','Intent','Flags','Date'].map(h=><th key={h} style={{textAlign:'left',padding:'4px 6px',fontWeight:500,whiteSpace:'nowrap'}}>{h}</th>)}
            </tr></thead>
            <tbody>{calls.map(c=>(
              <tr key={c._id} style={{borderBottom:'1px solid #1f2937',cursor:'default'}}>
                <td style={{padding:'6px',fontFamily:'monospace',color:'#60a5fa',fontSize:10}}>{c._id?.slice(0,8)}…</td>
                <td style={{padding:'6px',color:'#e5e7eb',maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.audio_filename||c.subject||'text'}</td>
                <td style={{padding:'6px'}}><span className="badge-gray">{c.channel}</span></td>
                <td style={{padding:'6px',color:SC[c.status]||'#9ca3af',fontWeight:500}}>{c.status}</td>
                <td style={{padding:'6px',fontWeight:600,color:c.overall_score>=80?'#34d399':c.overall_score>=60?'#fbbf24':'#f87171'}}>{c.overall_score??'—'}</td>
                <td style={{padding:'6px',color:'#60a5fa'}}>{c.csat_prediction!=null?`${c.csat_prediction}%`:'—'}</td>
                <td style={{padding:'6px',color:'#a78bfa'}}>{c.deal_probability!=null?`${c.deal_probability}%`:'—'}</td>
                <td style={{padding:'6px',color:'#fbbf24'}}>{c.trust_score??'—'}</td>
                <td style={{padding:'6px'}}>{c.sentiment?<span className={c.sentiment.includes('negative')?'badge-red':c.sentiment==='positive'?'badge-green':'badge-gray'}>{c.sentiment}</span>:'—'}</td>
                <td style={{padding:'6px',color:'#9ca3af'}}>{c.intent||'—'}</td>
                <td style={{padding:'6px'}}>{c.compliance_count>0?<span className="badge-red">{c.compliance_count}</span>:'—'}</td>
                <td style={{padding:'6px',color:'#6b7280'}}>{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}</tbody>
          </table>
          </div>
        )}
      </div>
    </div>
  );
}
