import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDb } from './db.js';
import { seedDefaults } from './seed.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite database & seed default data
initDb();
seedDefaults();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger for development / diagnosis
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    if (req.path.startsWith('/api')) {
      const duration = Date.now() - start;
      console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'The MudBrew Reservation & Studio API',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

// In production or when dist/ exists, serve static Vite client build
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Client SPA routing fallback
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global 404 for unmatched API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found.' });
  }
  next();
});

// Start Express server only if run directly
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
  app.listen(PORT, () => {
    console.log(`☕ The MudBrew Server is running on port ${PORT}`);
    console.log(`   - Public API:  http://localhost:${PORT}/api`);
    console.log(`   - Admin API:   http://localhost:${PORT}/api/admin`);
    console.log(`   - Health:      http://localhost:${PORT}/api/health`);
  });
}

export default app;
