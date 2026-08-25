import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initDB, isFallbackMode } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: isFallbackMode() ? 'In-Memory Fallback' : 'MySQL Connected',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Static frontend serving if built (for unified Render deployment)
const frontendDistPaths = [
  path.join(__dirname, '../../frontend/dist/employee-management-frontend/browser'),
  path.join(__dirname, '../../frontend/dist/browser'),
  path.join(__dirname, '../../frontend/dist')
];

let staticPath = null;
for (const p of frontendDistPaths) {
  if (fs.existsSync(p)) {
    staticPath = p;
    break;
  }
}

if (staticPath) {
  console.log(`📦 Serving static frontend from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      message: '🚀 Employee Management API is running.',
      endpoints: {
        health: '/api/health',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me'
        },
        employees: {
          list: 'GET /api/employees',
          getById: 'GET /api/employees/:id',
          create: 'POST /api/employees',
          update: 'PUT /api/employees/:id',
          delete: 'DELETE /api/employees/:id'
        }
      }
    });
  });
}

// Global Error Handler
app.use(errorHandler);

// Initialize DB and Start Server
async function startServer() {
  await initDB();

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 Employee Management Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

startServer();
