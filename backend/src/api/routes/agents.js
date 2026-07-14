import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { Agents, Calls, Coaching } from '../../db/couch.js';
import { INDUSTRIES } from '../../ai/scoring.js';

const r = Router();

r.use(requireAuth);

// Get all agents
r.get('/', async (req, res) => {
  const agents = await Agents.byTenant(req.tenantId);

  res.json({
    agents,
    total: agents.length
  });
});

// Leaderboard
r.get('/leaderboard', async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;

  const leaderboard = await Agents.leaderboard(req.tenantId, limit);

  res.json(leaderboard);
});

// Industries
r.get('/industries', (req, res) => {
  const industries = Object.entries(INDUSTRIES).map(([key, industry]) => ({
    key,
    name: industry.name,
    kpi_groups: Object.entries(industry.kpi_groups).map(([groupKey, group]) => ({
      key: groupKey,
      label: group.label,
      weight: group.weight,
      kpis: group.kpis
    }))
  }));

  res.json(industries);
});

// Agent details
r.get('/:id', async (req, res) => {
  const agent = await Agents.get(req.params.id);

  if (!agent || agent.tenant_id !== req.tenantId) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  const [calls, coaching] = await Promise.all([
    Calls.byAgent(agent._id, 10),
    Coaching.byAgent(agent._id)
  ]);

  res.json({
    agent,
    recent_calls: calls,
    coaching
  });
});

// Create agent
r.post('/', async (req, res) => {
  const {
    full_name,
    email,
    employee_id,
    department
  } = req.body;

  if (!full_name) {
    return res.status(400).json({
      error: 'full_name required'
    });
  }

  const agent = await Agents.create({
    tenant_id: req.tenantId,
    full_name,
    email: email || '',
    employee_id: employee_id || '',
    department: department || ''
  });

  res.status(201).json(agent);
});

// Update agent
r.patch('/:id', async (req, res) => {
  const agent = await Agents.get(req.params.id);

  if (!agent || agent.tenant_id !== req.tenantId) {
    return res.status(404).json({
      error: 'Not found'
    });
  }

  const updated = await Agents.update(req.params.id, req.body);

  res.json(updated);
});

export default r;
