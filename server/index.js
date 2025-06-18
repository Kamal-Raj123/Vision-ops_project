import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import cron from 'node-cron';
import Docker from 'dockerode';
import { Client } from 'kubernetes-client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database(':memory:');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'developer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Pipelines table
  db.run(`CREATE TABLE pipelines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    repository TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    status TEXT DEFAULT 'pending',
    config TEXT,
    last_run DATETIME,
    duration INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Vulnerabilities table
  db.run(`CREATE TABLE vulnerabilities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    package TEXT,
    version TEXT,
    fixed_version TEXT,
    scanner TEXT,
    status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // System metrics table
  db.run(`CREATE TABLE metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample data
  const sampleUsers = [
    ['Kamalraj', 'techey.kamal@gmail.com', bcrypt.hashSync('admin123', 10), 'admin'],
    ['Karthick', 'karthick@example.com', bcrypt.hashSync('dev123', 10), 'devops'],
    ['Kalai', 'kalai@example.com', bcrypt.hashSync('dev123', 10), 'developer'],
    ['Praveen', 'praveen@example.com', bcrypt.hashSync('sec123', 10), 'security']
  ];

  const userStmt = db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)");
  sampleUsers.forEach(user => userStmt.run(user));
  userStmt.finalize();

  // Sample pipelines
  const samplePipelines = [
    ['Frontend Deploy', 'secureops/frontend', 'main', 'success', '{"stages": ["build", "test", "deploy"]}', new Date().toISOString(), 204],
    ['Backend API', 'secureops/api', 'develop', 'running', '{"stages": ["build", "test", "security-scan", "deploy"]}', new Date().toISOString(), 105],
    ['Database Migration', 'secureops/db', 'main', 'failed', '{"stages": ["validate", "migrate"]}', new Date(Date.now() - 3600000).toISOString(), 45],
    ['Security Scan', 'secureops/security', 'main', 'pending', '{"stages": ["trivy", "owasp", "bandit"]}', null, null]
  ];

  const pipelineStmt = db.prepare("INSERT INTO pipelines (name, repository, branch, status, config, last_run, duration) VALUES (?, ?, ?, ?, ?, ?, ?)");
  samplePipelines.forEach(pipeline => pipelineStmt.run(pipeline));
  pipelineStmt.finalize();

  // Sample vulnerabilities
  const sampleVulns = [
    ['critical', 'SQL Injection vulnerability in user authentication', 'Improper input validation allows SQL injection attacks', 'express-validator', '6.10.0', '6.14.2', 'owasp', 'open'],
    ['high', 'Outdated cryptographic library', 'Using deprecated cryptographic functions', 'crypto-js', '3.1.2', '4.1.1', 'trivy', 'open'],
    ['medium', 'Hardcoded credentials in source code', 'API keys found in configuration files', 'config.py', 'N/A', null, 'bandit', 'open'],
    ['low', 'Missing security headers', 'HTTP security headers not configured', 'nginx.conf', 'N/A', null, 'owasp', 'open']
  ];

  const vulnStmt = db.prepare("INSERT INTO vulnerabilities (severity, title, description, package, version, fixed_version, scanner, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  sampleVulns.forEach(vuln => vulnStmt.run(vuln));
  vulnStmt.finalize();
});

// Docker and Kubernetes clients
const docker = new Docker();
let k8sClient;

try {
  k8sClient = new Client({ version: '1.13' });
} catch (error) {
  console.log('Kubernetes client not available:', error.message);
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    if (bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const queries = {
    pipelines: "SELECT COUNT(*) as total, SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful FROM pipelines",
    vulnerabilities: "SELECT severity, COUNT(*) as count FROM vulnerabilities WHERE status = 'open' GROUP BY severity",
    recentPipelines: "SELECT * FROM pipelines ORDER BY last_run DESC LIMIT 5",
    recentVulns: "SELECT * FROM vulnerabilities ORDER BY created_at DESC LIMIT 4"
  };

  const results = {};
  let completed = 0;
  const total = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    db.all(query, (err, rows) => {
      if (!err) results[key] = rows;
      completed++;
      if (completed === total) {
        res.json(results);
      }
    });
  });
});

// Pipelines
app.get('/api/pipelines', authenticateToken, (req, res) => {
  db.all("SELECT * FROM pipelines ORDER BY created_at DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/pipelines', authenticateToken, (req, res) => {
  const { name, repository, branch, config } = req.body;
  
  db.run(
    "INSERT INTO pipelines (name, repository, branch, config) VALUES (?, ?, ?, ?)",
    [name, repository, branch || 'main', JSON.stringify(config)],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ id: this.lastID, message: 'Pipeline created successfully' });
    }
  );
});

app.post('/api/pipelines/:id/run', authenticateToken, (req, res) => {
  const pipelineId = req.params.id;
  
  // Simulate pipeline execution
  db.run(
    "UPDATE pipelines SET status = 'running', last_run = ? WHERE id = ?",
    [new Date().toISOString(), pipelineId],
    (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      
      // Simulate pipeline completion after 30 seconds
      setTimeout(() => {
        const status = Math.random() > 0.2 ? 'success' : 'failed';
        const duration = Math.floor(Math.random() * 300) + 60; // 1-5 minutes
        
        db.run(
          "UPDATE pipelines SET status = ?, duration = ? WHERE id = ?",
          [status, duration, pipelineId],
          () => {
            io.emit('pipelineUpdate', { id: pipelineId, status, duration });
          }
        );
      }, 30000);
      
      res.json({ message: 'Pipeline started successfully' });
    }
  );
});

// Security scanning
app.get('/api/vulnerabilities', authenticateToken, (req, res) => {
  const { severity, scanner } = req.query;
  let query = "SELECT * FROM vulnerabilities WHERE 1=1";
  const params = [];
  
  if (severity && severity !== 'all') {
    query += " AND severity = ?";
    params.push(severity);
  }
  
  if (scanner && scanner !== 'all') {
    query += " AND scanner = ?";
    params.push(scanner);
  }
  
  query += " ORDER BY created_at DESC";
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

app.post('/api/security/scan', authenticateToken, (req, res) => {
  const { type, target } = req.body;
  
  // Simulate security scan
  const scanId = Date.now().toString();
  
  // Mock scan results after 10 seconds
  setTimeout(() => {
    const mockVulns = [
      {
        severity: 'high',
        title: `${type} vulnerability detected in ${target}`,
        description: 'Automated scan detected potential security issue',
        package: target,
        version: '1.0.0',
        scanner: type,
        status: 'open'
      }
    ];
    
    mockVulns.forEach(vuln => {
      db.run(
        "INSERT INTO vulnerabilities (severity, title, description, package, version, scanner, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [vuln.severity, vuln.title, vuln.description, vuln.package, vuln.version, vuln.scanner, vuln.status]
      );
    });
    
    io.emit('scanComplete', { scanId, vulnerabilities: mockVulns });
  }, 10000);
  
  res.json({ scanId, message: 'Security scan initiated' });
});

// Monitoring metrics
app.get('/api/metrics', authenticateToken, (req, res) => {
  const timeRange = req.query.range || '1h';
  const now = new Date();
  let startTime;
  
  switch (timeRange) {
    case '5m':
      startTime = new Date(now.getTime() - 5 * 60 * 1000);
      break;
    case '1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case '6h':
      startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
      break;
    case '24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
  }
  
  // Generate mock metrics data
  const metrics = [
    { id: '1', name: 'CPU Usage', value: '67', unit: '%', status: 'warning' },
    { id: '2', name: 'Memory Usage', value: '45', unit: '%', status: 'healthy' },
    { id: '3', name: 'Network I/O', value: '12.3', unit: 'MB/s', status: 'healthy' },
    { id: '4', name: 'Disk Usage', value: '89', unit: '%', status: 'critical' }
  ];
  
  // Add time series data
  metrics.forEach(metric => {
    metric.data = Array.from({ length: 20 }, (_, i) => ({
      timestamp: new Date(startTime.getTime() + (i * (now.getTime() - startTime.getTime()) / 19)).toISOString(),
      value: Math.random() * 100
    }));
  });
  
  res.json(metrics);
});

// AI Assistant
app.post('/api/ai/chat', authenticateToken, (req, res) => {
  const { message } = req.body;
  
  // Simple AI response logic (in production, integrate with OpenAI/Claude)
  let response = "I understand you'd like help with DevSecOps. I can assist with security analysis, performance monitoring, log analysis, and pipeline optimization.";
  
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('security') || lowerMessage.includes('vulnerability')) {
    response = `Based on your recent security scan results, I've identified several key areas for improvement:

**Critical Issues (2):**
- SQL Injection vulnerability in user authentication - Fix by updating express-validator to v6.14.2
- Outdated cryptographic library - Upgrade crypto-js to v4.1.1

**Recommendations:**
1. Implement input validation middleware across all API endpoints
2. Set up automated dependency scanning in your CI pipeline
3. Enable CSP headers for additional protection

Would you like me to generate specific code examples for any of these fixes?`;
  } else if (lowerMessage.includes('performance') || lowerMessage.includes('monitoring')) {
    response = `I've analyzed your system metrics and identified several optimization opportunities:

**Current Status:**
- CPU usage averaging 67% (elevated)
- Memory usage at 45% (healthy)
- Disk usage at 89% (critical - needs attention)

**Recommendations:**
1. **Immediate:** Address disk space usage - clean up logs and temporary files
2. **Short-term:** Optimize CPU-intensive processes
3. **Long-term:** Implement auto-scaling for peak loads

Would you like detailed implementation steps for any of these optimizations?`;
  }
  
  setTimeout(() => {
    res.json({ response });
  }, 1500); // Simulate AI processing time
});

// System status
app.get('/api/system/status', authenticateToken, (req, res) => {
  const status = {
    platform: {
      version: '1.0.0',
      uptime: process.uptime(),
      status: 'healthy'
    },
    services: {
      database: 'healthy',
      docker: 'healthy',
      kubernetes: k8sClient ? 'healthy' : 'unavailable'
    },
    resources: {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100)
    }
  };
  
  res.json(status);
});

// WebSocket connections
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Scheduled tasks
cron.schedule('*/5 * * * *', () => {
  // Generate random metrics every 5 minutes
  const metrics = [
    { name: 'cpu_usage', value: Math.random() * 100, unit: '%' },
    { name: 'memory_usage', value: Math.random() * 100, unit: '%' },
    { name: 'disk_usage', value: 80 + Math.random() * 20, unit: '%' },
    { name: 'network_io', value: Math.random() * 50, unit: 'MB/s' }
  ];
  
  metrics.forEach(metric => {
    db.run(
      "INSERT INTO metrics (metric_name, value, unit) VALUES (?, ?, ?)",
      [metric.name, metric.value, metric.unit]
    );
  });
  
  // Emit real-time updates
  io.emit('metricsUpdate', metrics);
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 SecureOps DevSecOps Platform running on port ${PORT}`);
  console.log(`📊 Dashboard: http://localhost:5173`);
  console.log(`🔧 API: http://localhost:${PORT}/api`);
});