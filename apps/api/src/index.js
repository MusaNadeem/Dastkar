// Express entry point. Wires middleware, mounts resource routes, exposes /health.
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler.js';
import { requireSupabase } from './middleware/requireSupabase.js';
import { SUPABASE_CONFIGURED } from './db/client.js';
import { isDevAuth } from './lib/devMode.js';

import authRoutes from './routes/auth.js';
import shopRoutes from './routes/shops.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import customOrderRoutes from './routes/customOrders.js';
import ipReportRoutes from './routes/ipReports.js';
import adminRoutes from './routes/admin.js';
import devRoutes from './routes/dev.js';

const app = express();

app.use(cors());
app.use(express.json());

// Health check works even without Supabase configured.
// TEMP DIAGNOSTIC: reports which env var KEYS are present (booleans only, never values)
// so a deploy-platform env-injection issue can be diagnosed without exposing secrets.
// Remove the `env` block once deployment env vars are confirmed working.
app.get('/health', (_req, res) =>
  res.json({
    status: 'ok',
    supabaseConfigured: SUPABASE_CONFIGURED,
    devAuth: isDevAuth(),
    env: {
      SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
      SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
      SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY),
      SUPABASE_JWKS_URL: Boolean(process.env.SUPABASE_JWKS_URL),
      SUPABASE_ANON_KEY_legacy: Boolean(process.env.SUPABASE_ANON_KEY),
      SUPABASE_SERVICE_ROLE_KEY_legacy: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      NODE_ENV: process.env.NODE_ENV || null,
      PORT: process.env.PORT || null,
      totalEnvKeyCount: Object.keys(process.env).length,
    },
  })
);

// Everything below needs a database.
app.use(requireSupabase);

app.use('/api/users', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/custom-orders', customOrderRoutes);
app.use('/api/ip-reports', ipReportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', devRoutes);

// Central error handler — must be last.
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
  console.log(`  Supabase configured: ${SUPABASE_CONFIGURED}`);
  console.log(`  Dev-auth enabled: ${isDevAuth()}`);
});

export default app;
