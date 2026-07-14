# Tech-Life CXIP v2.0 — Complete Management Guide
Sales Call Intelligence Platform · 50+ KPIs · CouchDB · Multi-Industry · Multi-Language

═══════════════════════════════════════════════════════════════
 PART 1 — INSTALL
═══════════════════════════════════════════════════════════════

    sudo bash install.sh

You'll be asked for: domain, admin email/password, CouchDB password,
industry, STT provider, LLM provider, default language, SSL option.

This creates 19 CouchDB databases, 3 systemd services (api/worker/
scheduler), Nginx reverse proxy, and the `cxip` CLI tool.


═══════════════════════════════════════════════════════════════
 PART 2 — DAILY MANAGEMENT
═══════════════════════════════════════════════════════════════

    cxip status            # check all 6 services
    cxip start              # start everything
    cxip stop               # stop app services (DB/redis stay up)
    cxip restart            # restart everything
    cxip logs api           # live API logs
    cxip logs worker        # live worker logs (call processing)
    cxip logs scheduler     # live scheduled job logs
    cxip backup             # tar.gz backup → /var/backups/
    cxip update              # git pull + rebuild + restart
    cxip couch               # CouchDB connection info

Change any setting:
    nano /opt/cxip/.env
    cxip restart


═══════════════════════════════════════════════════════════════
 PART 3 — INDUSTRY SCORING FRAMEWORKS
═══════════════════════════════════════════════════════════════

Set in .env:  INDUSTRY=sales   (or any below)

┌─────────────┬──────────────────────────────────────────────────┐
│ call_center │ Communication 25% · Resolution 30% · CX 20% ·     │
│             │ Compliance 25%                                    │
├─────────────┼──────────────────────────────────────────────────┤
│ sales       │ Lead Conversion 30% · Agent Behavior 35% ·        │
│             │ Customer Satisfaction 20% · Deal Intelligence 15% │
├─────────────┼──────────────────────────────────────────────────┤
│ insurance   │ Sales Skills 30% · Regulatory Compliance 35% ·    │
│             │ CX 20% · Efficiency 15%                           │
├─────────────┼──────────────────────────────────────────────────┤
│ banking     │ Cross-sell 25% · Compliance (AML/KYC/PCI) 40% ·   │
│             │ CX 20% · Efficiency 15%                           │
├─────────────┼──────────────────────────────────────────────────┤
│ telecom     │ Sales/Retention 30% · Technical 30% · CX 25% ·    │
│             │ Compliance 15%                                    │
├─────────────┼──────────────────────────────────────────────────┤
│ healthcare  │ Patient Care 35% · HIPAA 35% · Efficiency 20% ·   │
│             │ Satisfaction 10%                                  │
├─────────────┼──────────────────────────────────────────────────┤
│ real_estate │ Sales 35% · Client Management 30% · CX 25% ·      │
│             │ Compliance 10%                                    │
├─────────────┼──────────────────────────────────────────────────┤
│ ecommerce   │ Sales/Upsell 30% · CX 35% · Efficiency 25% ·      │
│             │ Compliance 10%                                    │
└─────────────┴──────────────────────────────────────────────────┘

Full KPI definitions: GET /api/v1/agents/industries


═══════════════════════════════════════════════════════════════
 PART 4 — SALES INDUSTRY KPIs (full list)
═══════════════════════════════════════════════════════════════

── Lead Conversion KPIs ──
  lead_conversion_rate    (Converted Leads ÷ Total Leads) × 100
  contact_rate            % leads successfully reached
  first_call_conversion   leads converted on first interaction
  follow_up_success       % converted after follow-up
  appointment_booking_rate % agreeing to meeting/demo/consultation
  avg_response_time       time taken to respond to new lead

── Agent Behavior KPIs ──
  needs_discovery         quality of pain-point/budget/timeline questions
  product_knowledge       accuracy explaining features/benefits/value
  objection_handling      success rate addressing price/competition/trust
  call_quality            communication skill, professionalism, focus
  customer_engagement     active listening, empathy, personalization
  closing_attempt_rate    % calls where agent asks for next step
  urgency_creation        creating appropriate time pressure
  social_proof_usage      using testimonials/case studies
  rapport_first_minute    quality of opening rapport
  open_ended_questions    ratio of open vs closed questions
  benefit_vs_feature_ratio talking benefits not just features
  next_step_clarity       how clearly next step was defined

── Customer Satisfaction KPIs ──
  csat                    post-interaction rating
  nps_prediction          likelihood to recommend
  trust_score             credibility built during call
  buying_signal_index     aggregate positive purchase signals

── Deal Intelligence KPIs ──
  deal_probability        AI-predicted close probability
  competitor_handling     quality of competitive positioning
  price_objection_handling specific price-objection technique
  decision_maker_identified whether DM was confirmed
  budget_qualified        whether budget was established
  timeline_established    whether purchase timeline was set

This gives sales managers a clear answer to: "Why was the deal lost,
what should the agent have done differently, and what should happen
next to maximize the chance of closing?"
→ See root_cause_analysis + ai_coaching + next_best_actions in the
  JSON response from every processed call.


═══════════════════════════════════════════════════════════════
 PART 5 — API REFERENCE
═══════════════════════════════════════════════════════════════

Base URL: http://yourdomain.com/api/v1

── Auth ──
  POST /auth/login              { email, password } → { token, user }
  POST /auth/setup              create additional admin
  GET  /auth/me                 current user
  POST /auth/change-password

── Calls ──
  GET  /calls?status=&agent_id=&limit=
  GET  /calls/:id                full analysis (call+sentiment+emotion+audit)
  GET  /calls/queue-stats
  POST /calls/upload             multipart: audio, channel, agent_id,
                                  customer_id, stt_provider, llm_provider,
                                  language, notes
  POST /calls/bulk-upload        multipart: audio[] (up to 50 files)
  POST /calls/ingest-text        { text, channel, agent_id, customer_id }

── Agents ──
  GET  /agents
  GET  /agents/leaderboard?limit=
  GET  /agents/industries        list all 8 industry KPI frameworks
  GET  /agents/:id                agent + recent_calls + coaching
  POST /agents                    { full_name, email, department }
  PATCH /agents/:id

── Customers ──
  GET  /customers
  GET  /customers/high-churn?threshold=0.5
  POST /customers
  PATCH /customers/:id

── Analytics ──
  GET  /analytics/sentiment
  GET  /analytics/emotions
  GET  /analytics/audit
  GET  /analytics/objections      every objection detected, tenant-wide
  GET  /analytics/deal-signals    every buying signal detected
  GET  /analytics/summary         aggregated KPIs

── Compliance ──
  GET  /compliance                open flags
  GET  /compliance/critical
  POST /compliance/:id/resolve

── Dashboard ──
  GET  /dashboard/executive       full KPI dashboard payload

── Providers ──
  GET  /providers/available       list of all STT/LLM provider keys
  GET  /providers
  POST /providers/configure

── Reports ──
  GET  /reports?type=
  POST /reports
  GET  /reports/:id

── Webhooks (outbound) ──
  GET    /webhooks
  POST   /webhooks                { url, events[], name, secret }
  GET    /webhooks/:id
  PATCH  /webhooks/:id
  DELETE /webhooks/:id
  POST   /webhooks/:id/test
  GET    /webhooks/:id/logs
  POST   /webhooks/:id/regenerate-secret
  GET    /webhooks/events         list all 19 event types

── API Keys ──
  GET    /api-keys
  POST   /api-keys                { name, expires_in_days, permissions }
  DELETE /api-keys/:id

── Inbound (from external systems) ──
  POST /webhooks/twilio/recording-complete
  POST /webhooks/zendesk/ticket
  POST /webhooks/freshdesk/ticket
  POST /webhooks/salesforce/case
  POST /webhooks/custom
  POST /webhooks/test


═══════════════════════════════════════════════════════════════
 PART 6 — AUTHENTICATION
═══════════════════════════════════════════════════════════════

Two methods, either works on every protected endpoint:

  Authorization: Bearer <jwt_token>      (from /auth/login)
  X-API-Key: cxip_<random64hex>          (from /api-keys, dashboard → Webhooks & API Keys)

Example:
  TOKEN=$(curl -s -X POST http://yourdomain.com/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@you.com","password":"yourpass"}' | jq -r .token)

  curl http://yourdomain.com/api/v1/dashboard/executive \
    -H "Authorization: Bearer $TOKEN"

Or with API key (better for server-to-server / CRM integrations):
  curl http://yourdomain.com/api/v1/calls \
    -H "X-API-Key: cxip_abc123..."


═══════════════════════════════════════════════════════════════
 PART 7 — WEBHOOKS — FULL GUIDE
═══════════════════════════════════════════════════════════════

── What webhooks do ──
CXIP fires an HTTP POST to your registered URL the moment something
happens — no polling required.

── Create a webhook ──
  curl -X POST http://yourdomain.com/api/v1/webhooks \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "url": "https://yourcrm.com/webhooks/cxip",
      "name": "CRM Integration",
      "events": ["call.completed", "deal.lost", "compliance.critical"]
    }'

  Response includes "secret" — save it, only shown once partially.

── All 19 event types ──
  call.created             new call uploaded/received
  call.completed           AI processing finished
  call.failed              processing error
  analysis.completed       full KPI/sentiment/emotion/compliance payload
  sentiment.high_risk      very negative sentiment detected
  compliance.flag_created  any compliance violation
  compliance.critical      critical violation (PCI, mis-selling, HIPAA)
  agent.scored             agent score updated after a call
  agent.coaching_ready     new AI coaching recommendation generated
  agent.burnout_risk       agent burnout signal detected
  customer.churn_risk      high churn probability customer
  deal.lost                deal_probability dropped below 30%
  deal.won                 deal_probability rose above 70%
  objection.unresolved     an objection was raised and NOT resolved
  appointment.booked       agent successfully booked a meeting/demo
  lead.converted           lead conversion detected
  lead.lost                lead marked lost
  report.ready             scheduled report generated
  realtime.alert           live call alert

── Payload format ──
  {
    "event": "call.completed",
    "data": { ...event specific... },
    "timestamp": "2026-06-23T10:15:00.000Z",
    "attempt": 1
  }

── Signature verification (required for production) ──
Every request includes header:
  X-CXIP-Signature: sha256=<hmac>
  X-CXIP-Event: call.completed
  X-CXIP-Attempt: 1

Node.js verification:
  const crypto = require('crypto');
  const sig = req.headers['x-cxip-signature'];
  const expected = 'sha256=' + crypto
    .createHmac('sha256', YOUR_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  const valid = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));

Python verification:
  import hmac, hashlib
  expected = 'sha256=' + hmac.new(SECRET.encode(), body, hashlib.sha256).hexdigest()
  valid = hmac.compare_digest(sig, expected)

── Retry behavior ──
  Attempt 1: immediate
  Attempt 2: after 5 seconds  (if attempt 1 fails)
  Attempt 3: after 30 seconds (if attempt 2 fails)
  Final:     after 120 seconds wait, then give up and log failure
  Auto-disabled after 10 consecutive failures (re-enable manually)

── Test your webhook ──
  curl -X POST http://yourdomain.com/api/v1/webhooks/{id}/test \
    -H "Authorization: Bearer $TOKEN"

── View delivery logs ──
  curl http://yourdomain.com/api/v1/webhooks/{id}/logs \
    -H "Authorization: Bearer $TOKEN"

── Inbound webhooks (CXIP receives FROM your systems) ──
Use these to feed calls into CXIP automatically:

  Twilio (call recording done) →
    https://yourdomain.com/webhooks/twilio/recording-complete
    Set this as the "Recording Status Callback" in Twilio console.

  Zendesk (new ticket) →
    https://yourdomain.com/webhooks/zendesk/ticket
    Admin → Extensions → Webhooks, trigger on "Ticket Created"

  Freshdesk →
    https://yourdomain.com/webhooks/freshdesk/ticket

  Salesforce (Outbound Message) →
    https://yourdomain.com/webhooks/salesforce/case


═══════════════════════════════════════════════════════════════
 PART 8 — LANGUAGES SUPPORTED
═══════════════════════════════════════════════════════════════

Set per-call via `language` field on upload, or set default with
WHISPER_LANGUAGE in .env. Full list in backend/src/config/languages.js.

── Indian languages (17) ──
  hi Hindi · bn Bengali · te Telugu · mr Marathi · ta Tamil ·
  ur Urdu · gu Gujarati · kn Kannada · ml Malayalam · pa Punjabi ·
  or Odia · as Assamese · mai Maithili · sat Santali · ks Kashmiri ·
  ne Nepali · si Sinhala

── Middle East (5) ──
  ar Arabic · fa Persian · tr Turkish · he Hebrew · ku Kurdish

── East/Southeast Asian (12) ──
  zh Chinese · zh-TW Traditional Chinese · ja Japanese · ko Korean ·
  vi Vietnamese · th Thai · id Indonesian · ms Malay · tl Filipino ·
  my Burmese · km Khmer · lo Lao

── European (24) ──
  en English · en-GB · fr French · de German · es Spanish ·
  pt Portuguese · it Italian · ru Russian · pl Polish · nl Dutch ·
  sv Swedish · no Norwegian · da Danish · fi Finnish · cs Czech ·
  sk Slovak · ro Romanian · hu Hungarian · uk Ukrainian · el Greek ·
  bg Bulgarian · hr Croatian · sr Serbian · ca Catalan

── African (9) ──
  sw Swahili · am Amharic · yo Yoruba · ig Igbo · ha Hausa ·
  af Afrikaans · zu Zulu · xh Xhosa · so Somali

── Americas (3) ──
  es-MX · pt-BR · ht Haitian Creole

Total: 70+ languages with native names and STT locale codes.
Translation in the recording player UI supports the 8 most common:
Arabic, French, Spanish, German, Chinese, Turkish, Portuguese, Hindi
(extend in frontend by adding to the LANGS array in PlayerPage).


═══════════════════════════════════════════════════════════════
 PART 9 — JSON SCHEMA (full call analysis output)
═══════════════════════════════════════════════════════════════

Every completed call produces this structure (stored in CouchDB
`cxip_analytics`, dispatched via `analysis.completed` webhook):

{
  "kpi_scores": { /* all KPIs for the active industry, 0-100 */ },
  "group_scores": { /* weighted group averages */ },
  "overall_score": 48,
  "sentiment": "very_negative",
  "sentiment_score": -0.72,
  "customer_sentiment": "very_negative",
  "sentiment_trajectory": "positive_to_very_negative",
  "dominant_emotion": "anger",
  "emotions": { "anger":0.78, "frustration":0.65, ... },
  "agent_emotions": { "confidence":0.55, "empathy_shown":0.18, ... },
  "intent": "complaint",
  "resolution_achieved": false,
  "csat_prediction": 18,
  "nps_prediction": -45,
  "trust_score": 42,
  "churn_risk": "high",
  "deal_probability": 18,
  "lead_conversion_rate": 0,
  "contact_rate": 100,
  "first_call_conversion": false,
  "appointment_booked": false,
  "objections": [ { "type":"price","quote":"...","resolved":false,"impact":"high","recommended_response":"..." } ],
  "buying_signals": [ { "signal":"...","strength":"weak_positive" } ],
  "compliance_issues": [ { "type":"pci_dss","risk_level":"critical","description":"...","regulation":"...","action_required":"..." } ],
  "root_cause": { "primary":"...","secondary":[...],"agent_failures":[...],"product_issues":[...],"verdict":"..." },
  "ai_coaching": { "priority":"urgent","summary":"...","development_areas":[...],"strengths":[...],"mandatory_actions":[...] },
  "next_best_actions": [ { "priority":1,"owner":"...","action":"...","due":"...","revenue_impact":0 } ],
  "product_feedback": [ ... ],
  "summary": "...",
  "keywords": [...],
  "competitor_mentions": [...],
  "talk_ratio_agent": 72,
  "talk_ratio_customer": 28,
  "interruption_count": 6,
  "silence_ratio": 0.18,
  "word_level_timeline": [ { "word":"...","start":0,"end":0.8,"speaker":"agent","violation":null } ]
}


═══════════════════════════════════════════════════════════════
 PART 10 — BEST PRACTICES (built into AI coaching engine)
═══════════════════════════════════════════════════════════════

The AI coaching output is specifically trained to check for and
recommend these proven techniques:

  • Build rapport within the first minute        → rapport_first_minute KPI
  • Ask open-ended questions                      → open_ended_questions KPI
  • Focus on benefits, not just features           → benefit_vs_feature_ratio KPI
  • Handle objections confidently                  → objection_handling KPI
  • Create urgency when appropriate                → urgency_creation KPI
  • Clearly ask for the next step                  → closing_attempt_rate, next_step_clarity
  • Follow up consistently                         → follow_up_success KPI

When an agent's call scores low on any of these, the `ai_coaching`
field automatically generates a specific, actionable recommendation
tied to the exact moment in the transcript where it happened.


═══════════════════════════════════════════════════════════════
 PART 11 — COUCHDB DATABASES (19 total)
═══════════════════════════════════════════════════════════════

  cxip_calls          call records, status, all summary scores
  cxip_transcripts     raw transcript text + word-level segments
  cxip_agents          agent profiles, scores, burnout risk
  cxip_customers       customer records, churn probability
  cxip_analytics       sentiment / emotion / audit results per call
  cxip_compliance      all compliance flags
  cxip_reports         generated reports
  cxip_feedback        product/service feedback extracted from calls
  cxip_coaching        AI coaching recommendations per agent
  cxip_providers       AI provider configuration per tenant
  cxip_tenants         organizations (multi-tenant support)
  cxip_users           user accounts
  cxip_sla             SLA metrics
  cxip_webhooks        registered outbound webhook endpoints
  cxip_webhook_logs    full delivery history (success/fail/retry)
  cxip_api_keys        API key records (hashed)
  cxip_objections      every objection detected, with resolution status
  cxip_deal_signals    every buying signal detected
  cxip_lead_scores     lead scoring history

Fauxton UI: http://127.0.0.1:5984/_utils/


═══════════════════════════════════════════════════════════════
 PART 12 — TROUBLESHOOTING
═══════════════════════════════════════════════════════════════

  cxip status                          # see what's down
  cxip logs api                        # API errors
  cxip logs worker                     # call processing errors
  curl http://localhost:8000/health    # detailed health check
  curl http://admin:PASS@127.0.0.1:5984/   # CouchDB direct test
  redis-cli -a YOUR_REDIS_PASS ping    # Redis test
  sudo nginx -t                        # Nginx config test
  sudo journalctl -u cxip-api -n 100   # systemd journal

Calls stuck in "processing" → check `cxip logs worker` for STT/LLM
API errors (usually invalid or missing API key).
