#!/usr/bin/env bash
# Tech-Life CXIP v2.0 — One-Command Installer for Debian 12/13
set -euo pipefail
G='\033[0;32m';Y='\033[1;33m';R='\033[0;31m';C='\033[0;36m';B='\033[1m';N='\033[0m'
log()    { echo -e "${G}[✓]${N} $*"; }
warn()   { echo -e "${Y}[!]${N} $*"; }
error()  { echo -e "${R}[✗]${N} $*" >&2; exit 1; }
section(){ echo -e "\n${C}${B}══ $* ══${N}\n"; }
ask()    { printf "${C}[?]${N} $* "; }

INSTALL_DIR="/opt/cxip"
DATA_DIR="/var/lib/cxip"
LOG_DIR="/var/log/cxip"

[[ $EUID -eq 0 ]] || error "Run as root: sudo bash install.sh"
. /etc/os-release
[[ "$ID" == "debian" ]] || error "Requires Debian"
[[ "$VERSION_ID" == "12" || "$VERSION_ID" == "13" ]] || error "Requires Debian 12 or 13"
CODENAME="$VERSION_CODENAME"
log "OS: Debian $VERSION_ID ($CODENAME)"

section "Configuration"
ask "Domain or IP [localhost]:";    read -r DOMAIN;     DOMAIN="${DOMAIN:-localhost}"
ask "Admin email:";                 read -r EMAIL
ask "Admin password (min 8 chars):";read -rs PASS;      echo; [[ ${#PASS} -ge 8 ]] || error "Too short"
ask "CouchDB password:";            read -rs CPASS;     echo
ask "Industry [call_center/sales/insurance/banking/telecom/healthcare/real_estate/ecommerce] (call_center):"; read -r IND; IND="${IND:-call_center}"
ask "STT provider [whisper/deepgram/azure/google/ibm/assemblyai] (whisper):"; read -r STT; STT="${STT:-whisper}"
ask "LLM provider [openai/claude/azure_openai/gemini/deepseek/ibm/mistral/ollama] (openai):"; read -r LLM; LLM="${LLM:-openai}"
ask "Default language [en/hi/ar/fr/es/de/zh/bn...] (en):"; read -r LANG; LANG="${LANG:-en}"
STT_KEY=""; LLM_KEY=""
[[ "$STT" != "whisper" ]] && { ask "API key for $STT:"; read -rs STT_KEY; echo; }
[[ "$LLM" != "ollama" ]]  && { ask "API key for $LLM:";  read -rs LLM_KEY; echo; }
ask "Let's Encrypt SSL? [y/N]:"; read -r SSL; SSL="${SSL:-n}"
JWT=$(openssl rand -hex 64); WHS=$(openssl rand -hex 32); REDIS=$(openssl rand -hex 20)

section "System packages"
apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
  curl wget gnupg2 ca-certificates apt-transport-https software-properties-common \
  build-essential git unzip ffmpeg libsndfile1 openssl \
  nginx certbot python3-certbot-nginx redis-server ufw net-tools
log "Done"

section "Node.js 20"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
log "Node $(node --version)"

section "CouchDB"
curl -fsSL https://couchdb.apache.org/repo/keys.asc | gpg --dearmor -o /usr/share/keyrings/couchdb-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/couchdb-archive-keyring.gpg] https://apache.jfrog.io/artifactory/couchdb-deb/ ${CODENAME} main" > /etc/apt/sources.list.d/couchdb.list
echo "couchdb couchdb/mode select standalone"|debconf-set-selections
echo "couchdb couchdb/nodename string cxip@localhost"|debconf-set-selections
echo "couchdb couchdb/adminpass password ${CPASS}"|debconf-set-selections
echo "couchdb couchdb/adminpass_again password ${CPASS}"|debconf-set-selections
echo "couchdb couchdb/bindaddress string 127.0.0.1"|debconf-set-selections
apt-get update -qq && DEBIAN_FRONTEND=noninteractive apt-get install -y couchdb
systemctl enable couchdb && systemctl start couchdb && sleep 5
curl -sf -X POST "http://admin:${CPASS}@127.0.0.1:5984/_cluster_setup" -H "Content-Type: application/json" -d '{"action":"finish_cluster"}' || true
for db in cxip_calls cxip_transcripts cxip_agents cxip_customers cxip_analytics cxip_compliance cxip_reports cxip_feedback cxip_coaching cxip_providers cxip_tenants cxip_users cxip_sla cxip_webhooks cxip_webhook_logs cxip_api_keys cxip_objections cxip_deal_signals cxip_lead_scores; do
  curl -sf -X PUT "http://admin:${CPASS}@127.0.0.1:5984/${db}" || true
done
log "CouchDB + 19 databases ready"

section "Redis"
echo "requirepass ${REDIS}" >> /etc/redis/redis.conf
echo "appendonly yes" >> /etc/redis/redis.conf
systemctl enable redis-server && systemctl restart redis-server
log "Done"

section "Deploying application"
mkdir -p "$INSTALL_DIR" "$DATA_DIR/audio" "$DATA_DIR/reports" "$LOG_DIR"
cp -r /opt/cxip-src/* "$INSTALL_DIR/"

cat > "$INSTALL_DIR/.env" << ENV_EOF
NODE_ENV=production
PORT=8000
APP_NAME=Tech-Life CXIP
APP_URL=http://${DOMAIN}
JWT_SECRET=${JWT}
JWT_EXPIRES_IN=7d
WEBHOOK_SECRET=${WHS}
COUCHDB_URL=http://127.0.0.1:5984
COUCHDB_USER=admin
COUCHDB_PASSWORD=${CPASS}
COUCHDB_PREFIX=cxip_
REDIS_URL=redis://127.0.0.1:6379
REDIS_PASSWORD=${REDIS}
ADMIN_EMAIL=${EMAIL}
ADMIN_PASSWORD=${PASS}
ADMIN_FULL_NAME=Administrator
INDUSTRY=${IND}
STT_PROVIDER=${STT}
WHISPER_LANGUAGE=${LANG}
DEEPGRAM_API_KEY=${STT_KEY}
AZURE_SPEECH_KEY=${STT_KEY}
AZURE_SPEECH_REGION=eastus
GOOGLE_STT_KEY=${STT_KEY}
IBM_STT_API_KEY=${STT_KEY}
IBM_STT_URL=https://api.us-east.speech-to-text.watson.cloud.ibm.com
IBM_STT_MODEL=en-US_BroadbandModel
ASSEMBLYAI_API_KEY=${STT_KEY}
LLM_PROVIDER=${LLM}
OPENAI_API_KEY=${LLM_KEY}
OPENAI_MODEL=gpt-4o
ANTHROPIC_API_KEY=${LLM_KEY}
ANTHROPIC_MODEL=claude-sonnet-4-6
GOOGLE_GEMINI_KEY=${LLM_KEY}
GOOGLE_GEMINI_MODEL=gemini-2.5-pro
DEEPSEEK_API_KEY=${LLM_KEY}
DEEPSEEK_MODEL=deepseek-chat
DEEPSEEK_BASE_URL=https://api.deepseek.com
IBM_WATSONX_API_KEY=${LLM_KEY}
IBM_WATSONX_URL=https://us-south.ml.cloud.ibm.com
IBM_WATSONX_MODEL=ibm/granite-3-8b-instruct
MISTRAL_API_KEY=${LLM_KEY}
MISTRAL_MODEL=mistral-large-latest
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
VIRTUALLAB_API_KEY=
VIRTUALLAB_URL=
UPLOAD_DIR=${DATA_DIR}/audio
REPORTS_DIR=${DATA_DIR}/reports
MAX_UPLOAD_SIZE_MB=500
LOG_DIR=${LOG_DIR}
ENV_EOF
chmod 600 "$INSTALL_DIR/.env"
cd "$INSTALL_DIR/backend" && npm install --production
cd "$INSTALL_DIR/frontend" && npm install && VITE_API_URL=/api npm run build
mkdir -p /var/www/cxip && cp -r "$INSTALL_DIR/frontend/dist/"* /var/www/cxip/
chown -R www-data:www-data "$INSTALL_DIR" "$DATA_DIR" "$LOG_DIR" /var/www/cxip

section "Systemd services"
for svc in api worker scheduler; do
  CMD="node src/server.js"
  [[ "$svc" == "worker" ]]    && CMD="node src/workers/index.js"
  [[ "$svc" == "scheduler" ]] && CMD="node src/workers/scheduler.js"
  cat > "/etc/systemd/system/cxip-${svc}.service" << SVC
[Unit]
Description=CXIP ${svc}
After=network.target couchdb.service redis-server.service
[Service]
Type=exec
User=www-data
WorkingDirectory=${INSTALL_DIR}/backend
EnvironmentFile=${INSTALL_DIR}/.env
ExecStart=/usr/bin/node ${CMD#node }
Restart=always
RestartSec=10
StandardOutput=append:${LOG_DIR}/${svc}.log
StandardError=append:${LOG_DIR}/${svc}-error.log
LimitNOFILE=65536
[Install]
WantedBy=multi-user.target
SVC
  systemctl enable "cxip-${svc}" && systemctl start "cxip-${svc}"
  log "cxip-${svc} started"
done

section "Nginx"
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/cxip << NGX
server {
    listen 80;
    server_name ${DOMAIN};
    client_max_body_size 500M;
    proxy_read_timeout 300;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    location /         { root /var/www/cxip; try_files \$uri \$uri/ /index.html; add_header Cache-Control "no-cache"; }
    location /assets/  { root /var/www/cxip; expires 1y; }
    location /api/     { proxy_pass http://127.0.0.1:8000; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; }
    location /socket.io/ { proxy_pass http://127.0.0.1:8000; proxy_http_version 1.1; proxy_set_header Upgrade \$http_upgrade; proxy_set_header Connection "upgrade"; }
    location /webhooks/ { proxy_pass http://127.0.0.1:8000; proxy_set_header Host \$host; proxy_set_header X-Real-IP \$remote_addr; }
    location /health    { proxy_pass http://127.0.0.1:8000; }
}
NGX
ln -sf /etc/nginx/sites-available/cxip /etc/nginx/sites-enabled/cxip
nginx -t && systemctl reload nginx
[[ "$SSL" =~ ^[Yy]$ ]] && [[ "$DOMAIN" != "localhost" ]] && certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" && log "SSL installed"

section "Firewall"
ufw --force reset && ufw default deny incoming && ufw default allow outgoing
ufw allow ssh && ufw allow 80/tcp && ufw allow 443/tcp && ufw --force enable

section "CLI tool"
cat > /usr/local/bin/cxip << 'CLI'
#!/usr/bin/env bash
case "${1:-help}" in
  start)   for s in couchdb redis-server cxip-api cxip-worker cxip-scheduler nginx; do systemctl start "$s" && echo "  ✓ $s"; done ;;
  stop)    for s in cxip-api cxip-worker cxip-scheduler; do systemctl stop "$s" && echo "  ✓ stopped $s"; done ;;
  restart) bash "$0" stop; sleep 2; bash "$0" start ;;
  status)  for s in couchdb redis-server nginx cxip-api cxip-worker cxip-scheduler; do printf "%-28s %s\n" "$s" "$(systemctl is-active $s 2>/dev/null||echo inactive)"; done ;;
  logs)    tail -f "/var/log/cxip/${2:-api}.log" ;;
  update)  cd /opt/cxip; git pull origin main||true; cd backend && npm install --production; cd ../frontend && npm install && npm run build && cp -r dist/* /var/www/cxip/; bash "$0" restart; echo "Updated." ;;
  backup)  B="/var/backups/cxip-$(date +%Y%m%d-%H%M%S).tar.gz"; tar czf "$B" /var/lib/cxip /opt/cxip/.env 2>/dev/null; echo "Backup: $B" ;;
  couch)   echo "Fauxton: http://127.0.0.1:5984/_utils/"; echo "Direct:  http://admin:PASSWORD@127.0.0.1:5984" ;;
  *)       echo "Usage: cxip {start|stop|restart|status|logs [svc]|update|backup|couch}" ;;
esac
CLI
chmod +x /usr/local/bin/cxip

echo -e "\n${G}${B}✅  Tech-Life CXIP v2.0 installed!${N}"
echo "  🌐  Dashboard:      http://${DOMAIN}"
echo "  📡  API:            http://${DOMAIN}/api/v1"
echo "  🔗  Webhooks:       http://${DOMAIN}/webhooks/{integration}"
echo "  🗄️   CouchDB:        http://127.0.0.1:5984/_utils/"
echo "  📊  Health:         http://${DOMAIN}/health"
echo "  👤  Admin:          ${EMAIL}"
echo "  🤖  STT=${STT} | LLM=${LLM} | Industry=${IND} | Lang=${LANG}"
echo "  cxip status | cxip logs api | cxip restart"
