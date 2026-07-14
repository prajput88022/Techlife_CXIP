// backend/src/ai/providers.js
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import logger from '../utils/logger.js';
import { calculateAgentScore, calculateSimpleAgentScore, getIndustryConfig } from './scoring.js';

// ── STT ──────────────────────────────────────────────────────────
class WhisperSTT {
  async transcribe(audioPath, lang='en') {
    const { createReadStream } = await import('fs');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const res = await openai.audio.transcriptions.create({ file:createReadStream(audioPath), model:'whisper-1', language:lang, response_format:'verbose_json' });
    return { text:res.text, segments:res.segments||[], language:res.language, provider:'whisper' };
  }
}
class DeepgramSTT {
  async transcribe(audioPath, lang='en') {
    const { createReadStream } = await import('fs'); const { stat } = await import('fs/promises');
    const info = await stat(audioPath);
    const res = await axios.post(`https://api.deepgram.com/v1/listen?model=${process.env.DEEPGRAM_MODEL||'nova-2'}&diarize=true&smart_format=true`, createReadStream(audioPath), { headers:{ Authorization:`Token ${process.env.DEEPGRAM_API_KEY}`, 'Content-Type':'audio/mpeg', 'Content-Length':info.size }, maxBodyLength:Infinity });
    const alt = res.data.results?.channels?.[0]?.alternatives?.[0];
    return { text:alt?.transcript||'', segments:alt?.words||[], language:lang, provider:'deepgram' };
  }
}
class AzureSTT {
  async transcribe(audioPath, lang='en-US') {
    const { readFileSync } = await import('fs');
    const res = await axios.post(`https://${process.env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=${lang}`, readFileSync(audioPath), { headers:{ 'Ocp-Apim-Subscription-Key':process.env.AZURE_SPEECH_KEY, 'Content-Type':'audio/wav' } });
    return { text:res.data.DisplayText||'', segments:[], language:lang, provider:'azure' };
  }
}
class GoogleSTT {
  async transcribe(audioPath, lang='en-US') {
    const { readFileSync } = await import('fs');
    const content = readFileSync(audioPath).toString('base64');
    const res = await axios.post(`https://speech.googleapis.com/v1/speech:recognize?key=${process.env.GOOGLE_STT_KEY}`, { config:{ languageCode:lang, enableSpeakerDiarization:true, diarizationSpeakerCount:2 }, audio:{ content } });
    return { text:res.data.results?.map(r=>r.alternatives[0].transcript).join(' ')||'', segments:[], language:lang, provider:'google' };
  }
}
class IBMSTT {
  async transcribe(audioPath, lang='en-US') {
    const { createReadStream } = await import('fs');
    const res = await axios.post(`${process.env.IBM_STT_URL}/v1/recognize?model=${process.env.IBM_STT_MODEL}`, createReadStream(audioPath), { headers:{ Authorization:`Basic ${Buffer.from(`apikey:${process.env.IBM_STT_API_KEY}`).toString('base64')}`, 'Content-Type':'audio/mp3' } });
    return { text:res.data.results?.map(r=>r.alternatives[0].transcript).join(' ')||'', segments:[], language:lang, provider:'ibm' };
  }
}
class AssemblyAISTT {
  async transcribe(audioPath, lang='en') {
    const { readFileSync } = await import('fs');
    const upload = await axios.post('https://api.assemblyai.com/v2/upload', readFileSync(audioPath), { headers:{ authorization:process.env.ASSEMBLYAI_API_KEY, 'Transfer-Encoding':'chunked' } });
    const tr = await axios.post('https://api.assemblyai.com/v2/transcript', { audio_url:upload.data.upload_url, speaker_labels:true, language_code:lang }, { headers:{ authorization:process.env.ASSEMBLYAI_API_KEY } });
    let res;
    do { await new Promise(r=>setTimeout(r,3000)); res = await axios.get(`https://api.assemblyai.com/v2/transcript/${tr.data.id}`, { headers:{ authorization:process.env.ASSEMBLYAI_API_KEY } }); } while(['queued','processing'].includes(res.data.status));
    return { text:res.data.text||'', segments:res.data.utterances||[], language:lang, provider:'assemblyai' };
  }
}
export const STT_PROVIDERS = { whisper:WhisperSTT, deepgram:DeepgramSTT, azure:AzureSTT, google:GoogleSTT, ibm:IBMSTT, assemblyai:AssemblyAISTT };
export const getSTT = name => { const C = STT_PROVIDERS[name||process.env.STT_PROVIDER||'whisper']; if(!C) throw new Error(`Unknown STT: ${name}`); return new C(); };

// ── LLM ──────────────────────────────────────────────────────────
class OpenAILLM {
  async complete(system,user,max=2000) {
    const res = await new OpenAI({ apiKey:process.env.OPENAI_API_KEY }).chat.completions.create({ model:process.env.OPENAI_MODEL||'gpt-4o', messages:[{role:'system',content:system},{role:'user',content:user}], max_tokens:max });
    return res.choices[0].message.content;
  }
}
class ClaudeLLM {
  async complete(system,user,max=2000) {
    const res = await new Anthropic({ apiKey:process.env.ANTHROPIC_API_KEY }).messages.create({ model:process.env.ANTHROPIC_MODEL||'claude-sonnet-4-6', system, messages:[{role:'user',content:user}], max_tokens:max });
    return res.content[0].text;
  }
}
class AzureOpenAILLM {
  async complete(system,user,max=2000) {
    const res = await new OpenAI({ apiKey:process.env.AZURE_OPENAI_KEY, baseURL:`${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT}`, defaultQuery:{'api-version':process.env.AZURE_OPENAI_API_VERSION||'2024-05-01-preview'}, defaultHeaders:{'api-key':process.env.AZURE_OPENAI_KEY} }).chat.completions.create({ model:process.env.AZURE_OPENAI_DEPLOYMENT, messages:[{role:'system',content:system},{role:'user',content:user}], max_tokens:max });
    return res.choices[0].message.content;
  }
}
class GeminiLLM {
  async complete(system,user) {
    const model = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_KEY).getGenerativeModel({ model:process.env.GOOGLE_GEMINI_MODEL||'gemini-2.5-pro', systemInstruction:system });
    return (await model.generateContent(user)).response.text();
  }
}
class DeepSeekLLM {
  async complete(system,user,max=2000) {
    const res = await new OpenAI({ apiKey:process.env.DEEPSEEK_API_KEY, baseURL:process.env.DEEPSEEK_BASE_URL||'https://api.deepseek.com' }).chat.completions.create({ model:process.env.DEEPSEEK_MODEL||'deepseek-chat', messages:[{role:'system',content:system},{role:'user',content:user}], max_tokens:max });
    return res.choices[0].message.content;
  }
}
class IBMLLM {
  async complete(system,user,max=2000) {
    const token = (await axios.post('https://iam.cloud.ibm.com/identity/token', `grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${process.env.IBM_WATSONX_API_KEY}`, { headers:{ 'Content-Type':'application/x-www-form-urlencoded' } })).data.access_token;
    const res = await axios.post(`${process.env.IBM_WATSONX_URL}/ml/v1/text/generation?version=2023-05-29`, { model_id:process.env.IBM_WATSONX_MODEL, project_id:process.env.IBM_WATSONX_PROJECT_ID, input:`${system}\n\n${user}`, parameters:{ max_new_tokens:max } }, { headers:{ Authorization:`Bearer ${token}`, 'Content-Type':'application/json' } });
    return res.data.results[0].generated_text;
  }
}
class MistralLLM {
  async complete(system,user,max=2000) {
    const res = await axios.post('https://api.mistral.ai/v1/chat/completions', { model:process.env.MISTRAL_MODEL||'mistral-large-latest', messages:[{role:'system',content:system},{role:'user',content:user}], max_tokens:max }, { headers:{ Authorization:`Bearer ${process.env.MISTRAL_API_KEY}` } });
    return res.data.choices[0].message.content;
  }
}
class OllamaLLM {
  async complete(system,user) {
    const res = await axios.post(`${process.env.OLLAMA_URL||'http://127.0.0.1:11434'}/api/generate`, { model:process.env.OLLAMA_MODEL||'llama3.1:8b', prompt:`${system}\n\n${user}`, stream:false }, { timeout:120000 });
    return res.data.response;
  }
}
class VirtualLabLLM {
  async complete(system,user,max=2000) {
    const res = await axios.post(`${process.env.VIRTUALLAB_URL}/v1/chat/completions`, { model:process.env.VIRTUALLAB_MODEL||'custom', messages:[{role:'system',content:system},{role:'user',content:user}], max_tokens:max }, { headers:{ Authorization:`Bearer ${process.env.VIRTUALLAB_API_KEY}` } });
    return res.data.choices[0].message.content;
  }
}
export const LLM_PROVIDERS = { openai:OpenAILLM, claude:ClaudeLLM, azure_openai:AzureOpenAILLM, gemini:GeminiLLM, deepseek:DeepSeekLLM, ibm:IBMLLM, mistral:MistralLLM, ollama:OllamaLLM, virtuallab:VirtualLabLLM };
export const getLLM = name => { const C = LLM_PROVIDERS[name||process.env.LLM_PROVIDER||'openai']; if(!C) throw new Error(`Unknown LLM: ${name}`); return new C(); };

// ── Full call analysis with industry-aware scoring ────────────────
export async function analyzeCall(transcriptText, llmName=null, industry='call_center') {
  const llm = getLLM(llmName);
  const industryConfig = getIndustryConfig(industry);
  const kpiList = Object.values(industryConfig.kpi_groups).flatMap(g=>g.kpis).join(', ');

  const system = `You are an expert call quality analyst for a ${industryConfig.name} call center.
Analyze the transcript and return ONLY valid JSON, no markdown, no explanation.
The JSON must contain these exact fields:

{
  "kpi_scores": { ${kpiList.split(', ').map(k=>`"${k}": 0`).join(', ')} },
  "group_scores": { ${Object.keys(industryConfig.kpi_groups).map(g=>`"${g}": 0`).join(', ')} },
  "overall_score": 0,
  "sentiment": "positive|neutral|negative|very_negative",
  "sentiment_score": -1.0,
  "customer_sentiment": "positive|neutral|negative|very_negative",
  "sentiment_trajectory": "improving|stable|declining|positive_to_negative",
  "dominant_emotion": "anger|frustration|satisfaction|confusion|urgency|neutral",
  "emotions": {"anger":0,"frustration":0,"satisfaction":0,"confusion":0,"urgency":0},
  "agent_emotions": {"confidence":0,"empathy_shown":0,"patience_shown":0,"defensiveness":0,"aggression":0},
  "intent": "complaint|refund|upgrade|cancellation|technical|purchase|inquiry|general",
  "resolution_achieved": false,
  "csat_prediction": 0,
  "nps_prediction": 0,
  "trust_score": 0,
  "churn_risk": "low|medium|high",
  "deal_probability": 0,
  "lead_conversion_rate": 0,
  "contact_rate": 100,
  "first_call_conversion": false,
  "appointment_booked": false,
  "objections": [{"type":"price|trust|competitor|timing|authority|technical|process","quote":"","agent_response":"","resolved":false,"impact":"low|medium|high|critical","recommended_response":""}],
  "buying_signals": [{"signal":"","strength":"weak_positive|strong_positive|neutral|negative","time_hint":""}],
  "compliance_issues": [{"type":"pci_dss|policy_error|ethics|gdpr|disclosure|mis_selling","risk_level":"low|medium|high|critical","description":"","regulation":"","action_required":"","time_hint":""}],
  "root_cause": {"primary":"","secondary":[],"agent_failures":[],"product_issues":[],"verdict":""},
  "ai_coaching": {"priority":"low|medium|high|urgent","summary":"","development_areas":[{"area":"","score":0,"recommendation":""}],"strengths":[],"mandatory_actions":[]},
  "next_best_actions": [{"priority":1,"owner":"","action":"","due":"","revenue_impact":0,"description":""}],
  "product_feedback": [{"category":"","description":"","is_complaint":false,"is_feature_request":false}],
  "summary": "",
  "keywords": [],
  "competitor_mentions": [],
  "talk_ratio_agent": 50,
  "talk_ratio_customer": 50,
  "interruption_count": 0,
  "silence_ratio": 0.05,
  "word_level_timeline": []
}

Score all numeric fields 0-100. Be accurate and specific. Base everything on actual transcript content.`;

  try {
    const raw = await llm.complete(system, `Industry: ${industry}\n\nTranscript:\n${transcriptText.slice(0, 6000)}`);
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    // Recalculate overall using industry formula
    const { overall } = calculateAgentScore(parsed.kpi_scores || {}, industry);
    parsed.overall_score = overall;
    return parsed;
  } catch(err) {
    logger.warn('analyzeCall LLM failed', { error:err.message });
    return getDefaultAnalysis(industry);
  }
}

function getDefaultAnalysis(industry) {
  const config = getIndustryConfig(industry);
  const kpi_scores = {};
  Object.values(config.kpi_groups).flatMap(g=>g.kpis).forEach(k=>{ kpi_scores[k]=70; });
  const group_scores = {};
  Object.keys(config.kpi_groups).forEach(g=>{ group_scores[g]=70; });
  return {
    kpi_scores, group_scores, overall_score:70,
    sentiment:'neutral', sentiment_score:0, customer_sentiment:'neutral',
    sentiment_trajectory:'stable', dominant_emotion:'neutral',
    emotions:{anger:.1,frustration:.1,satisfaction:.5,confusion:.1,urgency:.1},
    agent_emotions:{confidence:.6,empathy_shown:.5,patience_shown:.6,defensiveness:.2,aggression:.1},
    intent:'general', resolution_achieved:false, csat_prediction:70, nps_prediction:0,
    trust_score:65, churn_risk:'low', deal_probability:50, lead_conversion_rate:0,
    contact_rate:100, first_call_conversion:false, appointment_booked:false,
    objections:[], buying_signals:[], compliance_issues:[],
    root_cause:{ primary:'Manual review required', secondary:[], agent_failures:[], product_issues:[], verdict:'Processing fallback' },
    ai_coaching:{ priority:'low', summary:'Manual review required', development_areas:[], strengths:[], mandatory_actions:[] },
    next_best_actions:[], product_feedback:[], summary:'Manual review required.',
    keywords:[], competitor_mentions:[], talk_ratio_agent:50, talk_ratio_customer:50,
    interruption_count:0, silence_ratio:0.05, word_level_timeline:[],
  };
}

export { calculateAgentScore, calculateSimpleAgentScore };
