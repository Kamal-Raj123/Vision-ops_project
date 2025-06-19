# VisionOps DevSecOps Platform

<div align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-20.x-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-4.18.2-black?style=for-the-badge&logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/Socket.io-4.7.4-white?style=for-the-badge&logo=socket.io" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
</div>

<div align="center">
  <h3>🚀 A comprehensive DevSecOps platform for modern development teams</h3>
  <p>Streamline your CI/CD pipelines, enhance security scanning, and monitor your infrastructure with real-time insights and AI-powered recommendations.</p>
</div>

---

## ✨ Features

### 🔄 **CI/CD Pipeline Management**
- Visual pipeline builder and monitoring
- Real-time pipeline execution tracking
- Integration with GitHub, Jenkins, and Docker Registry
- Automated deployment workflows
- Pipeline analytics and optimization recommendations

### 🛡️ **Security Scanning & Vulnerability Management**
- Multi-scanner support (Trivy, OWASP ZAP, Bandit)
- Comprehensive vulnerability assessment
- Risk prioritization and remediation tracking
- Security compliance reporting
- Real-time security alerts and notifications

### 📊 **Infrastructure Monitoring**
- Real-time system metrics (CPU, Memory, Disk, Network)
- Kubernetes cluster monitoring
- Application performance tracking
- Custom alerting and notification system
- Historical data analysis and trending

### 🤖 **AI-Powered Assistant**
- Intelligent log analysis and pattern detection
- Security vulnerability assessment and recommendations
- Performance optimization suggestions
- Natural language query interface
- Automated incident response guidance

### ⚙️ **Enterprise Features**
- Role-based access control (RBAC)
- Multi-team collaboration
- Integration management
- Audit logging and compliance
- Customizable dashboards

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Integrations  │
│   (React/TS)    │◄──►│   (Node.js)     │◄──►│   (External)    │
│                 │    │                 │    │                 │
│ • Dashboard     │    │ • REST API      │    │ • GitHub        │
│ • Pipelines     │    │ • WebSocket     │    │ • Jenkins       │
│ • Security      │    │ • Auth/RBAC     │    │ • Docker        │
│ • Monitoring    │    │ • Real-time     │    │ • Kubernetes    │
│ • AI Assistant  │    │ • Logging       │    │ • Prometheus    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
          │                     │                      │
          │                     ▼                      │
          │            ┌─────────────────┐             │
          └───────────►│   Supabase      │◄────────────┘
                       │   Database      │
                       │                 │
                       │ • Auth          │
                       │ • Storage       │
                       │ • Real-time     │
                       └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Git** for version control
- **Supabase** account for database and authentication

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/visionops-devsecops-platform.git
   cd visionops-devsecops-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Connect to Supabase**
   - Click the "Connect to Supabase" button in the top right corner
   - Follow the prompts to set up your Supabase project
   - The necessary tables and schema will be created automatically

5. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start individually
   npm run dev      # Frontend only
   npm run server   # Backend only
   ```

6. **Access the application**
   - Frontend: `https://localhost:5173`
   - Backend API: `http://localhost:3001`
   - Health Check: `http://localhost:3001/health`

### Demo Credentials

```
Admin User:
Email: techey.kamal@gmail.com
Password: password

DevOps User:
Email: karthick@example.com
Password: password
```

---

## 📁 Project Structure

```
visionops-devsecops-platform/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── Dashboard.tsx         # Main dashboard
│   │   ├── PipelineBuilder.tsx   # CI/CD pipeline management
│   │   ├── SecurityScanner.tsx   # Security scanning interface
│   │   ├── Monitoring.tsx        # Infrastructure monitoring
│   │   ├── AIAssistant.tsx       # AI-powered assistant
│   │   └── Settings.tsx          # Platform configuration
│   ├── services/                 # API and WebSocket services
│   ├── store/                    # State management (Zustand)
│   ├── hooks/                    # Custom React hooks
│   ├── types/                    # TypeScript type definitions
│   └── utils/                    # Utility functions
├── server/                       # Backend source code
│   ├── routes/                   # API route handlers
│   ├── middleware/               # Express middleware
│   ├── services/                 # Business logic services
│   └── utils/                    # Backend utilities
├── supabase/                     # Supabase configuration
│   └── migrations/               # Database migrations
├── .github/                      # GitHub workflows
└── docs/                         # Documentation
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` |
| `CLIENT_URL` | Frontend URL | `https://localhost:5173` |
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |
| `VITE_WS_URL` | WebSocket URL | `http://localhost:3001` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-jwt-key` |
| `LOG_LEVEL` | Logging level | `info` |
| `SUPABASE_URL` | Supabase project URL | From Supabase setup |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | From Supabase setup |

### Database Schema

The platform uses Supabase for data storage with the following main tables:

- **profiles**: User profiles and permissions
- **teams**: Team management and settings
- **team_members**: Team membership and roles
- **security_scanners**: Security scanning tools configuration
- **security_scans**: Security scan execution records
- **vulnerabilities**: Detected security vulnerabilities
- **pipelines**: CI/CD pipeline definitions
- **pipeline_runs**: Pipeline execution history
- **infrastructure_nodes**: Infrastructure components (K8s, VMs, etc.)
- **monitoring_metrics**: System and application metrics
- **monitoring_alerts**: Alert definitions and rules
- **integrations**: External service integrations

### Integration Setup

#### GitHub Integration
1. Create a GitHub App or Personal Access Token
2. Configure webhook URL: `{your-domain}/api/webhooks/github`
3. Set required permissions for repository access

#### Jenkins Integration
1. Install Jenkins API plugins
2. Create API token for authentication
3. Configure webhook notifications

#### Docker Registry
1. Set up registry credentials
2. Configure image scanning policies
3. Enable vulnerability scanning

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start frontend development server
npm run server       # Start backend server
npm run dev:full     # Start both frontend and backend

# Building
npm run build        # Build frontend for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for styling

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🔒 Security

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Session management and timeout
- Two-factor authentication support

### Security Features
- Input validation and sanitization
- CORS protection
- Rate limiting
- Security headers (Helmet.js)
- Audit logging

### Vulnerability Management
- Automated dependency scanning
- Container image security scanning
- Code security analysis
- Compliance reporting

---

## 📊 Monitoring & Observability

### Metrics Collection
- System metrics (CPU, Memory, Disk, Network)
- Application performance metrics
- Custom business metrics
- Real-time alerting

### Logging
- Structured logging with Winston
- Log aggregation and analysis
- Error tracking and reporting
- Audit trail maintenance

### Health Checks
- Application health endpoints
- Dependency health monitoring
- Automated failover capabilities

---

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   export NODE_ENV=production
   export JWT_SECRET=your-production-secret
   # Set other production variables
   ```

3. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: visionops-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: visionops-platform
  template:
    metadata:
      labels:
        app: visionops-platform
    spec:
      containers:
      - name: visionops
        image: visionops/platform:latest
        ports:
        - containerPort: 3001
        env:
        - name: NODE_ENV
          value: "production"
```

---

## 📚 API Documentation

### Authentication Endpoints

```http
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Pipeline Management

```http
GET    /api/pipelines
POST   /api/pipelines
GET    /api/pipelines/:id
POST   /api/pipelines/:id/run
POST   /api/pipelines/:id/stop
GET    /api/pipelines/:id/logs
```

### Security Scanning

```http
GET    /api/security/vulnerabilities
GET    /api/security/vulnerabilities/:id
PATCH  /api/security/vulnerabilities/:id
POST   /api/security/scan
GET    /api/security/scans
GET    /api/security/metrics
```

### Monitoring

```http
GET    /api/monitoring/metrics
GET    /api/monitoring/alerts
PATCH  /api/monitoring/alerts/:id/acknowledge
GET    /api/monitoring/health
```

---

## 🤝 Support & Community

### Getting Help

- 📖 **Documentation**: Check our [Wiki](https://github.com/yourusername/visionops-devsecops-platform/wiki)
- 🐛 **Bug Reports**: [Create an issue](https://github.com/yourusername/visionops-devsecops-platform/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/yourusername/visionops-devsecops-platform/discussions)
- 📧 **Email**: support@visionops.dev

### Roadmap

- [ ] Advanced AI/ML capabilities
- [ ] Multi-cloud support
- [ ] Enhanced compliance frameworks
- [ ] Mobile application
- [ ] Advanced analytics and reporting

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **React Team** for the amazing frontend framework
- **Node.js Community** for the robust backend platform
- **Tailwind CSS** for the utility-first CSS framework
- **Socket.io** for real-time communication
- **Supabase** for the powerful database and authentication platform
- **All Contributors** who have helped shape this project

---

<div align="center">
  <p>Made with ❤️ by the VisionOps Team</p>
  <p>
    <a href="https://github.com/yourusername/visionops-devsecops-platform">⭐ Star us on GitHub</a> •
    <a href="https://github.com/yourusername/visionops-devsecops-platform/issues">🐛 Report Bug</a> •
    <a href="https://github.com/yourusername/visionops-devsecops-platform/discussions">💬 Request Feature</a>
  </p>
</div>