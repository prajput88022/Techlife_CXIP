import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as IO } from 'socket.io';
import rateLimit from 'express-rate-limit';
import 'express-async-errors';
import { connectCouchDB } from './db/couch.js';
import { connectRedis } from './utils/redis.js';
import { bootstrapAdmin } from './services/auth.service.js';
import { setupSocketIO } from './websocket/realtime.js';
import logger from './utils/logger.js';
import { errorHandler } from './api/middleware/error.js';
import authR      from './api/routes/auth.js';
import callsR     from './api/routes/calls.js';
import agentsR    from './api/routes/agents.js';
import customersR from './api/routes/customers.js';
import analyticsR from './api/routes/analytics.js';
import complianceR from './api/routes/compliance.js';
import providersR from './api/routes/providers.js';
import reportsR   from './api/routes/reports.js';
import dashboardR from './api/routes/dashboard.js';
import webhooksR  from './api/routes/webhooks.js';
import apiKeysR   from './api/routes/api-keys.js';
import inboundR   from './api/routes/inbound.js';
import healthR    from './api/routes/health.js';
import tenantsR   from './api/routes/tenants.js';
import usersR     from './api/routes/users.js';

const app = express(), server = createServer(app);
export const io = new IO(server, { cors:{ origin:'*' }, transports:['websocket','polling'] });
setupSocketIO(io);

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin:'*', credentials:true }));
app.use(compression());
app.use(express.json({ limit:'10mb' }));
app.use(express.urlencoded({ extended:true, limit:'10mb' }));
app.use(morgan('combined', { stream:{ write:m=>logger.http(m.trim()) } }));
app.use('/api/', rateLimit({ windowMs:15*60*1000, max:1000 }));
app.use('/api/v1/auth/login', rateLimit({ windowMs:15*60*1000, max:20 }));
app.use('/api/v1/tenants/register', rateLimit({ windowMs:60*60*1000, max:10 }));

const V1 = '/api/v1';
app.use('/health',          healthR);
app.use('/webhooks',        inboundR);
app.use(`${V1}/auth`,       authR);
app.use(`${V1}/tenants`,    tenantsR);
app.use(`${V1}/users`,      usersR);
app.use(`${V1}/calls`,      callsR);
app.use(`${V1}/agents`,     agentsR);
app.use(`${V1}/customers`,  customersR);
app.use(`${V1}/analytics`,  analyticsR);
app.use(`${V1}/compliance`, complianceR);
app.use(`${V1}/providers`,  providersR);
app.use(`${V1}/reports`,    reportsR);
app.use(`${V1}/dashboard`,  dashboardR);
app.use(`${V1}/webhooks`,   webhooksR);
app.use(`${V1}/api-keys`,   apiKeysR);

app.get('/api', (req,res) => res.json({
  name:'Tech-Life CXIP', version:'2.0.0',
  endpoints:{ auth:`${V1}/auth`, tenants:`${V1}/tenants`, users:`${V1}/users`,
    calls:`${V1}/calls`, agents:`${V1}/agents`, customers:`${V1}/customers`,
    analytics:`${V1}/analytics`, compliance:`${V1}/compliance`, providers:`${V1}/providers`,
    reports:`${V1}/reports`, dashboard:`${V1}/dashboard`, webhooks:`${V1}/webhooks`,
    api_keys:`${V1}/api-keys`, inbound:'/webhooks/{integration}' }
}));
app.use(errorHandler);

async function start() {
  try {
    logger.info('Starting CXIP v2.0...');
    await connectCouchDB();
    await connectRedis();
    await bootstrapAdmin();
    const PORT = parseInt(process.env.PORT) || 8000;
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`CXIP API on port ${PORT}`);
      logger.info(`Industry: ${process.env.INDUSTRY||'call_center'} | STT: ${process.env.STT_PROVIDER||'whisper'} | LLM: ${process.env.LLM_PROVIDER||'openai'}`);
    });
  } catch(err) { logger.error('Startup failed:', err); process.exit(1); }
}
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT',  () => server.close(() => process.exit(0)));
process.on('uncaughtException',  err => logger.error('Uncaught:', err));
process.on('unhandledRejection', err => logger.error('Unhandled:', err));
start();
