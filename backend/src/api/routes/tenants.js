import { Router } from 'express';
import { Tenants, Users, DB } from '../../db/couch.js';
import { hashPwd, signToken } from '../../services/auth.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const r = Router();

// ── Public: register new tenant ──────────────────────────────────
r.post('/register', async (req, res) => {
  const { org_name, slug, industry, default_language, stt_provider, llm_provider, admin_email, admin_password, admin_name } = req.body;
  if (!org_name || !slug || !industry || !admin_email || !admin_password || !admin_name)
    return res.status(400).json({ error: 'All fields required' });
  if (admin_password.length < 8) return res.status(400).json({ error: 'Password must be 8+ chars' });
  if (!/^[a-z0-9-]+$/.test(slug)) return res.status(400).json({ error: 'Slug: lowercase letters, numbers and hyphens only' });
  if (await Tenants.bySlug(slug)) return res.status(409).json({ error: 'Workspace slug already taken' });
  if (await Users.byEmail(admin_email)) return res.status(409).json({ error: 'Email already registered' });

  const tenant = await Tenants.create({
    name: org_name, slug, industry,
    default_language: default_language || 'en',
    stt_provider: stt_provider || 'whisper',
    llm_provider: llm_provider || 'openai',
    settings: {},
  });
  const user = await Users.create({
    email: admin_email,
    hashed_password: await hashPwd(admin_password),
    full_name: admin_name,
    role: 'admin',
    tenant_id: tenant._id,
  });
  const token = signToken({ sub: user._id, role: user.role, tenant_id: tenant._id });
  res.status(201).json({ tenant: { id:tenant._id, name:tenant.name, slug:tenant.slug }, token, user: { id:user._id, email:user.email, role:user.role } });
});

// ── Admin: list all tenants ──────────────────────────────────────
r.get('/', requireAuth, requireRole('admin'), async (req, res) => {
  const all = await DB.list('tenants', { limit: 500 });
  res.json(all.filter(t => t.type === 'tenant'));
});

// ── Admin: get single tenant ─────────────────────────────────────
r.get('/:id', requireAuth, async (req, res) => {
  const t = await Tenants.get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

// ── Admin: update tenant ─────────────────────────────────────────
r.patch('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  res.json(await Tenants.update(req.params.id, req.body));
});

export default r;
