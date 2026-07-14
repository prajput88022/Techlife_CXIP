// backend/src/db/couch.js
import nano from 'nano';
import { v4 as uuid } from 'uuid';
import logger from '../utils/logger.js';

const PREFIX = process.env.COUCHDB_PREFIX || 'cxip_';
let _client = null;

const DB_NAMES = [
  'calls','transcripts','agents','customers','analytics',
  'compliance','reports','feedback','coaching','providers',
  'tenants','users','sla','webhooks','webhook_logs','api_keys',
  'objections','deal_signals','lead_scores',
];

export async function connectCouchDB() {
  _client = nano({
    url: process.env.COUCHDB_URL || 'http://127.0.0.1:5984',
    requestDefaults: { auth: { username: process.env.COUCHDB_USER||'admin', password: process.env.COUCHDB_PASSWORD||'password' } },
  });
  await _client.db.list();
  for (const name of DB_NAMES) {
    try { await _client.db.create(PREFIX + name); }
    catch(e) { if (e.statusCode !== 412) throw e; }
  }
  await _createIndexes();
  await _createDesignDocs();
  logger.info('CouchDB ready — ' + DB_NAMES.length + ' databases');
}

function _db(n) {
  if (!_client) throw new Error('CouchDB not connected');
  return _client.use(PREFIX + n);
}
const NOW = () => new Date().toISOString();

async function _createDesignDocs() {
  const designs = {
    calls: {
      by_agent:    'function(doc){if(doc.agent_id)emit(doc.agent_id,doc);}',
      by_status:   'function(doc){if(doc.status)emit(doc.status,doc);}',
      by_tenant:   'function(doc){emit([doc.tenant_id,doc.created_at],doc);}',
      by_industry: 'function(doc){if(doc.industry)emit(doc.industry,doc);}',
    },
    webhooks: {
      by_event:    'function(doc){if(doc.event)emit(doc.event,doc);}',
      active:      'function(doc){if(doc.is_active===true)emit(doc._id,doc);}',
      by_tenant:   'function(doc){emit(doc.tenant_id,doc);}',
    },
    webhook_logs: {
      by_webhook:  'function(doc){emit([doc.webhook_id,doc.created_at],doc);}',
      failed:      'function(doc){if(doc.status!=="delivered")emit(doc.created_at,doc);}',
    },
    users:   { by_email: 'function(doc){if(doc.email)emit(doc.email,doc);}' },
    api_keys:{ by_key:   'function(doc){if(doc.key_hash)emit(doc.key_hash,doc);}' },
    agents:  {
      by_tenant: 'function(doc){emit(doc.tenant_id,doc);}',
      by_score:  'function(doc){emit(doc.overall_score||0,doc);}',
    },
    objections: {
      by_call:   'function(doc){emit(doc.call_id,doc);}',
      by_type:   'function(doc){emit(doc.type,doc);}',
      unresolved:'function(doc){if(!doc.resolved)emit(doc.tenant_id,doc);}',
    },
    deal_signals: {
      by_call:   'function(doc){emit(doc.call_id,doc);}',
      by_tenant: 'function(doc){emit(doc.tenant_id,doc);}',
    },
  };
  for (const [dbName, views] of Object.entries(designs)) {
    const db = _db(dbName);
    const ddoc = { _id:'_design/main', views:Object.fromEntries(Object.entries(views).map(([k,v])=>[k,{map:v}])) };
    try {
      const ex = await db.get('_design/main').catch(()=>null);
      if (ex) ddoc._rev = ex._rev;
      await db.insert(ddoc);
    } catch(_) {}
  }
}

async function _createIndexes() {
  const idxMap = {
    calls:        [['tenant_id','status'],['agent_id'],['created_at'],['industry']],
    analytics:    [['call_id','type'],['tenant_id','type']],
    compliance:   [['tenant_id','is_resolved'],['risk_level']],
    webhooks:     [['tenant_id','is_active']],
    webhook_logs: [['webhook_id'],['status']],
    api_keys:     [['key_hash'],['tenant_id','is_active']],
    customers:    [['tenant_id'],['tenant_id','churn_probability']],
    objections:   [['call_id'],['tenant_id','type'],['resolved']],
    deal_signals: [['call_id'],['tenant_id']],
    lead_scores:  [['customer_id'],['tenant_id']],
  };
  for (const [dbName, indexes] of Object.entries(idxMap)) {
    const db = _db(dbName);
    for (const fields of indexes) {
      try { await db.createIndex({ index:{fields}, name:fields.join('-') }); } catch(_) {}
    }
  }
}

// ── Generic CRUD ──────────────────────────────────────────────────
export const DB = {
  async create(dbName, data) {
    const doc = { _id:data._id||uuid(), ...data, created_at:NOW(), updated_at:NOW() };
    const res = await _db(dbName).insert(doc);
    return { ...doc, _rev:res.rev };
  },
  async get(dbName, id) {
    try { return await _db(dbName).get(id); }
    catch(e) { if (e.statusCode===404) return null; throw e; }
  },
  async update(dbName, id, data) {
    const doc = await DB.get(dbName, id);
    if (!doc) throw new Error(`Not found: ${dbName}/${id}`);
    const u = { ...doc, ...data, updated_at:NOW() };
    const res = await _db(dbName).insert(u);
    return { ...u, _rev:res.rev };
  },
  async delete(dbName, id) {
    const doc = await DB.get(dbName, id);
    if (!doc) return false;
    await _db(dbName).destroy(id, doc._rev);
    return true;
  },
  async find(dbName, selector, opts={}) {
    const res = await _db(dbName).find({
      selector, limit:opts.limit||100, skip:opts.skip||0,
      ...(opts.sort && { sort:opts.sort }),
      ...(opts.fields && { fields:opts.fields }),
    });
    return res.docs;
  },
  async findOne(dbName, selector) {
    const d = await DB.find(dbName, selector, { limit:1 });
    return d[0] || null;
  },
  async list(dbName, opts={}) {
    const res = await _db(dbName).list({ include_docs:true, limit:opts.limit||100, skip:opts.skip||0 });
    return res.rows.filter(r=>!r.id.startsWith('_design')).map(r=>r.doc);
  },
  async count(dbName, selector) {
    if (selector) {
      const d = await DB.find(dbName, selector, { limit:100000, fields:['_id'] });
      return d.length;
    }
    const info = await _db(dbName).info();
    return info.doc_count;
  },
};

// ── Domain helpers ────────────────────────────────────────────────
export const Calls = {
  create:       d => DB.create('calls', { type:'call', status:'pending', ...d }),
  get:          id => DB.get('calls', id),
  update:       (id,d) => DB.update('calls', id, d),
  updateStatus: (id,status,extra={}) => DB.update('calls', id, { status, ...extra }),
  byAgent:      (agentId,limit=50) => DB.find('calls', { agent_id:agentId }, { limit }),
  byTenant:     (tid,filter={},limit=100) => DB.find('calls', { tenant_id:tid, ...filter }, { limit, sort:[{created_at:'desc'}] }),
};
export const Agents = {
  create:      d => DB.create('agents', { type:'agent', overall_score:0, burnout_risk:'low', ...d }),
  get:         id => DB.get('agents', id),
  update:      (id,d) => DB.update('agents', id, d),
  byTenant:    tid => DB.find('agents', { tenant_id:tid }),
  leaderboard: async (tid,limit=20) => {
    const a = await Agents.byTenant(tid);
    return a.sort((a,b)=>(b.overall_score||0)-(a.overall_score||0)).slice(0,limit);
  },
};
export const Customers = {
  create:        d => DB.create('customers', { type:'customer', churn_probability:0, ...d }),
  get:           id => DB.get('customers', id),
  update:        (id,d) => DB.update('customers', id, d),
  byTenant:      tid => DB.find('customers', { tenant_id:tid }),
  highChurnRisk: async (tid,threshold=0.5) => {
    const all = await Customers.byTenant(tid);
    return all.filter(c=>(c.churn_probability||0)>=threshold);
  },
};
export const Analytics = {
  save:    (callId,type,data) => DB.create('analytics', { ...data, call_id:callId, type }),
  forCall: (callId,type) => DB.findOne('analytics', { call_id:callId, type }),
  byTenant:(tid,type,limit=500) => DB.find('analytics', { tenant_id:tid, type }, { limit }),
};
export const Compliance = {
  createFlag: d => DB.create('compliance', { type:'flag', is_resolved:false, ...d }),
  openFlags:  tid => DB.find('compliance', { tenant_id:tid, is_resolved:false }),
  critical:   tid => DB.find('compliance', { tenant_id:tid, risk_level:'critical', is_resolved:false }),
  resolve:    (id,userId) => DB.update('compliance', id, { is_resolved:true, resolved_by:userId, resolved_at:NOW() }),
};
export const Users = {
  create:  d => DB.create('users', { type:'user', is_active:true, ...d }),
  get:     id => DB.get('users', id),
  byEmail: email => DB.findOne('users', { email }),
  update:  (id,d) => DB.update('users', id, d),
  byTenant:tid => DB.find('users', { tenant_id:tid }),
};
export const Tenants = {
  create: d => DB.create('tenants', { type:'tenant', is_active:true, settings:{}, industry:'call_center', ...d }),
  get:    id => DB.get('tenants', id),
  bySlug: slug => DB.findOne('tenants', { slug }),
  update: (id,d) => DB.update('tenants', id, d),
};
export const Reports = {
  create:  d => DB.create('reports', { type:'report', status:'pending', ...d }),
  byTenant:(tid,reportType) => {
    const sel = { tenant_id:tid };
    if (reportType) sel.report_type = reportType;
    return DB.find('reports', sel, { sort:[{created_at:'desc'}] });
  },
  update: (id,d) => DB.update('reports', id, d),
};
export const Coaching = {
  create:  d => DB.create('coaching', { type:'coaching', is_acknowledged:false, ...d }),
  byAgent: agentId => DB.find('coaching', { agent_id:agentId }, { sort:[{created_at:'desc'}] }),
  pending: tid => DB.find('coaching', { tenant_id:tid, is_acknowledged:false }),
};
export const Providers = {
  getAll:    tid => DB.find('providers', { tenant_id:tid }),
  getActive: (tid,providerType) => DB.findOne('providers', { tenant_id:tid, provider_type:providerType, is_active:true, is_default:true }),
  upsert:    async (tid,name,type,data) => {
    const ex = await DB.findOne('providers', { tenant_id:tid, provider_name:name, provider_type:type });
    if (ex) return DB.update('providers', ex._id, data);
    return DB.create('providers', { ...data, tenant_id:tid, provider_name:name, provider_type:type });
  },
};
export const Webhooks = {
  create:   d => DB.create('webhooks', { type:'webhook', is_active:true, consecutive_failures:0, ...d }),
  get:      id => DB.get('webhooks', id),
  update:   (id,d) => DB.update('webhooks', id, d),
  delete:   id => DB.delete('webhooks', id),
  byTenant: tid => DB.find('webhooks', { tenant_id:tid }),
};
export const WebhookLogs = {
  create:    d => DB.create('webhook_logs', { type:'webhook_log', ...d }),
  byWebhook: (wid,limit=50) => DB.find('webhook_logs', { webhook_id:wid }, { limit, sort:[{created_at:'desc'}] }),
  failed:    () => DB.find('webhook_logs', { status:{$ne:'delivered'} }),
};
export const APIKeys = {
  create:  d => DB.create('api_keys', { type:'api_key', is_active:true, ...d }),
  byHash:  hash => DB.findOne('api_keys', { key_hash:hash }),
  byTenant:tid => DB.find('api_keys', { tenant_id:tid }),
  revoke:  id => DB.update('api_keys', id, { is_active:false, revoked_at:NOW() }),
  touch:   id => DB.update('api_keys', id, { last_used_at:NOW() }),
};
export const Objections = {
  create:    d => DB.create('objections', { type:'objection', resolved:false, ...d }),
  byCall:    callId => DB.find('objections', { call_id:callId }),
  byTenant:  (tid,limit=500) => DB.find('objections', { tenant_id:tid }, { limit }),
  unresolved:tid => DB.find('objections', { tenant_id:tid, resolved:false }),
};
export const DealSignals = {
  create:   d => DB.create('deal_signals', { type:'deal_signal', ...d }),
  byCall:   callId => DB.find('deal_signals', { call_id:callId }),
  byTenant: (tid,limit=500) => DB.find('deal_signals', { tenant_id:tid }, { limit }),
};
