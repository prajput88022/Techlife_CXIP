import { Router } from 'express';
import { Users, DB } from '../../db/couch.js';
import { hashPwd } from '../../services/auth.service.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
const r = Router();
r.use(requireAuth);

// List users for this tenant (admin/supervisor only)
r.get('/', requireRole('admin','supervisor'), async (req, res) => {
  const users = await Users.byTenant(req.tenantId);
  res.json(users.map(u => { const { hashed_password, ...safe } = u; return safe; }));
});

// Create user in same tenant
r.post('/', requireRole('admin'), async (req, res) => {
  const { email, full_name, password, role = 'agent' } = req.body;
  if (!email || !full_name || !password || password.length < 8)
    return res.status(400).json({ error: 'email, full_name, password (8+ chars) required' });
  if (await Users.byEmail(email)) return res.status(409).json({ error: 'Email already exists' });
  const user = await Users.create({ email, hashed_password: await hashPwd(password), full_name, role, tenant_id: req.tenantId });
  const { hashed_password, ...safe } = user;
  res.status(201).json(safe);
});

// Get one user
r.get('/:id', async (req, res) => {
  const u = await Users.get(req.params.id);
  if (!u || u.tenant_id !== req.tenantId) return res.status(404).json({ error: 'Not found' });
  const { hashed_password, ...safe } = u;
  res.json(safe);
});

// Update user
r.patch('/:id', requireRole('admin'), async (req, res) => {
  const u = await Users.get(req.params.id);
  if (!u || u.tenant_id !== req.tenantId) return res.status(404).json({ error: 'Not found' });
  const { password, hashed_password: _, ...rest } = req.body;
  const update = { ...rest };
  if (password && password.length >= 8) update.hashed_password = await hashPwd(password);
  const updated = await Users.update(req.params.id, update);
  const { hashed_password: __, ...safe } = updated;
  res.json(safe);
});

// Delete / deactivate
r.delete('/:id', requireRole('admin'), async (req, res) => {
  await Users.update(req.params.id, { is_active: false });
  res.json({ deactivated: true });
});

export default r;
