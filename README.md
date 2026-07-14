# Tech-Life CXIP â€” Installation Guide
## Debian 12 / 13 Â· CouchDB Â· Node.js 20 Â· Redis Â· Nginx

## Quick Install (one command)
```bash
sudo bash install.sh
```
The installer asks for: domain, admin email/password, CouchDB password, STT provider, LLM provider, SSL option.

## What gets installed
- Node.js 20 + npm
- CouchDB 3.3 (16 databases auto-created)
- Redis (password-protected)
- Nginx (reverse proxy + optional SSL)
- 3 systemd services: cxip-api, cxip-worker, cxip-scheduler
- `/usr/local/bin/cxip` CLI tool

## After install
```bash
cxip status          # check all services
cxip logs api        # stream API logs
cxip logs worker     # stream worker logs
cxip restart         # restart everything
cxip backup          # create backup archive
cxip couch           # show CouchDB info
```

## Access
- Dashboard:    http://yourdomain.com
- API:          http://yourdomain.com/api/v1
- Webhooks in:  http://yourdomain.com/webhooks/{integration}
- CouchDB UI:   http://127.0.0.1:5984/_utils/
- Health:       http://yourdomain.com/health

## Change AI provider
```bash
nano /opt/cxip/.env
# Change STT_PROVIDER= or LLM_PROVIDER= and add API key
cxip restart
```

## STT Providers
| Provider    | Key in .env           | Notes                        |
|-------------|----------------------|------------------------------|
| whisper     | OPENAI_API_KEY       | Default, uses OpenAI API     |
| deepgram    | DEEPGRAM_API_KEY     | Best accuracy, Nova-2        |
| azure       | AZURE_SPEECH_KEY     | Enterprise, Microsoft        |
| google      | GOOGLE_STT_KEY       | Chirp model                  |
| ibm         | IBM_STT_API_KEY      | IBM Boston, BroadbandModel   |
| assemblyai  | ASSEMBLYAI_API_KEY   | Best diarization             |

## LLM Providers
| Provider      | Key in .env           | Notes                     |
|---------------|----------------------|---------------------------|
| openai        | OPENAI_API_KEY       | GPT-4o, recommended       |
| claude        | ANTHROPIC_API_KEY    | Claude Sonnet 4.6         |
| azure_openai  | AZURE_OPENAI_KEY     | Enterprise, Microsoft     |
| gemini        | GOOGLE_GEMINI_KEY    | Gemini 2.5 Pro            |
| deepseek      | DEEPSEEK_API_KEY     | Cost-effective            |
| ibm           | IBM_WATSONX_API_KEY  | IBM Boston, Granite       |
| mistral       | MISTRAL_API_KEY      | European, fast            |
| ollama        | (none needed)        | Self-hosted, free         |
| virtuallab    | VIRTUALLAB_API_KEY   | Custom endpoint           |

## API Authentication
```bash
# Login to get token
curl -X POST http://yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"yourpassword"}'

# Use token
curl http://yourdomain.com/api/v1/dashboard/executive \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or use API key (create in dashboard â†’ Webhooks & API Keys)
curl http://yourdomain.com/api/v1/calls \
  -H "X-API-Key: cxip_your_api_key"
```

## Upload a call
```bash
curl -X POST http://yourdomain.com/api/v1/calls/upload \
  -H "Authorization: Bearer TOKEN" \
  -F "audio=@recording.mp3" \
  -F "channel=call" \
  -F "agent_id=AGENT_UUID"
```

## Ingest text (chat/email/ticket)
```bash
curl -X POST http://yourdomain.com/api/v1/calls/ingest-text \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Customer: I want a refund...","channel":"chat"}'
```

## Webhook events
CXIP fires these events to your registered endpoints:
- call.created / call.completed / call.failed
- analysis.completed (full scores, sentiment, emotions, compliance)
- sentiment.high_risk
- compliance.flag_created / compliance.critical
- agent.scored / agent.coaching_ready / agent.burnout_risk
- customer.churn_risk
- report.ready / realtime.alert

## Inbound webhooks (from external systems)
- POST /webhooks/twilio/recording-complete
- POST /webhooks/zendesk/ticket
- POST /webhooks/freshdesk/ticket
- POST /webhooks/salesforce/case
- POST /webhooks/custom
- POST /webhooks/test

## CouchDB databases created
cxip_calls, cxip_transcripts, cxip_agents, cxip_customers,
cxip_analytics, cxip_compliance, cxip_reports, cxip_feedback,
cxip_coaching, cxip_providers, cxip_tenants, cxip_users,
cxip_sla, cxip_webhooks, cxip_webhook_logs, cxip_api_keys

## Recording Player features
- Click any call to open the word-sync player
- Words highlight as they are spoken (simulated in demo)
- Violation words highlighted in BOTH English and translation lines:
  - ðŸ”´ Red = PCI / card data
  - ðŸŸ¡ Yellow = Wrong policy stated
  - ðŸŸ  Orange = Rude / aggressive tone
  - ðŸŸ¢ Green = Competitor mention
- Live alert banner appears when violation segment is playing
- Language selector: Arabic, French, Spanish, German, Chinese, Turkish, Portuguese, Hindi
- Emotion timeline strip shows sentiment across the full call
- Click anywhere on waveform to scrub
