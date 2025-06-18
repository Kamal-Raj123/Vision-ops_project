# SecureOps DevSecOps Platform

A comprehensive GUI-based DevSecOps platform for Kubernetes with real-time monitoring, security scanning, CI/CD pipeline management, and AI-powered assistance.

## 🚀 Features

### Core Functionality
- **Dashboard**: Real-time overview of pipelines, security status, and system health
- **CI/CD Pipeline Builder**: Visual pipeline creation and management with Git/GitHub integration
- **Security Scanner**: Container and code-level security scanning (Trivy, OWASP ZAP, Bandit)
- **Real-time Monitoring**: Performance metrics with Prometheus-style data visualization
- **AI Assistant**: Intelligent log analysis, security recommendations, and natural language querying
- **Settings Management**: User management, integrations, and system configuration

### Technical Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Real-time**: Socket.IO for live updates
- **Icons**: Lucide React
- **Authentication**: JWT-based auth system
- **Database**: SQLite with in-memory storage (easily configurable for production)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Full Application**
   ```bash
   npm run dev:full
   ```
   This starts both the backend server (port 3001) and frontend dev server (port 5173)

3. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

### Alternative: Start Services Separately

**Backend Server:**
```bash
npm run server
```

**Frontend Development Server:**
```bash
npm run dev
```

## 🔐 Authentication

The platform includes a complete authentication system with demo accounts:

### Demo Credentials
- **Admin**: techey.kamal@gmail.com / admin123
- **DevOps**: karthick@example.com / dev123  
- **Security**: praveen@example.com / sec123

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### Dashboard
- `GET /api/dashboard` - Dashboard overview data

### Pipelines
- `GET /api/pipelines` - List all pipelines
- `POST /api/pipelines` - Create new pipeline
- `POST /api/pipelines/:id/run` - Execute pipeline

### Security
- `GET /api/vulnerabilities` - List vulnerabilities with filtering
- `POST /api/security/scan` - Initiate security scan

### Monitoring
- `GET /api/metrics` - System metrics with time range filtering

### AI Assistant
- `POST /api/ai/chat` - Send message to AI assistant

### System
- `GET /api/system/status` - System health and status

## 🔄 Real-time Features

The platform includes WebSocket-based real-time updates for:
- Pipeline execution status
- Security scan completion
- System metrics updates
- Live notifications

## 🏗️ Architecture

### Frontend Structure
```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard
│   ├── PipelineBuilder.tsx
│   ├── SecurityScanner.tsx
│   ├── Monitoring.tsx
│   ├── AIAssistant.tsx
│   ├── Settings.tsx
│   ├── LoginForm.tsx
│   └── Sidebar.tsx
├── hooks/              # Custom React hooks
│   └── useApi.ts       # API integration hooks
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

### Backend Structure
```
server/
└── index.js           # Express server with all routes
```

## 🔧 Configuration

### Environment Variables
The backend supports the following environment variables:
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - JWT signing secret (change in production)

### Database
Currently uses SQLite in-memory database for demo purposes. For production:
1. Change to persistent SQLite file or PostgreSQL
2. Update connection string in `server/index.js`
3. Add proper migration system

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
```

### Production Considerations
1. **Database**: Switch from in-memory SQLite to persistent database
2. **Authentication**: Use secure JWT secrets and implement refresh tokens
3. **HTTPS**: Enable SSL/TLS encryption
4. **Environment**: Set proper environment variables
5. **Monitoring**: Add proper logging and monitoring
6. **Security**: Implement rate limiting and input validation

### Docker Deployment
Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "server"]
```

## 🔌 Integrations

The platform is designed to integrate with:
- **Git Providers**: GitHub, GitLab, Bitbucket
- **CI/CD**: Jenkins, GitHub Actions, GitLab CI
- **Container Registries**: Docker Hub, AWS ECR, Google GCR
- **Kubernetes**: Any Kubernetes cluster
- **Monitoring**: Prometheus, Grafana
- **Security Tools**: Trivy, OWASP ZAP, Bandit
- **Communication**: Slack, Microsoft Teams

## 🤖 AI Assistant Features

The AI assistant provides:
- **Security Analysis**: Vulnerability assessment and remediation suggestions
- **Performance Optimization**: System bottleneck identification and solutions
- **Log Analysis**: Error pattern detection and root cause analysis
- **Pipeline Optimization**: CI/CD improvement recommendations
- **Natural Language Queries**: Ask questions about your infrastructure

## 📈 Monitoring & Metrics

Real-time monitoring includes:
- **System Metrics**: CPU, Memory, Disk, Network usage
- **Application Metrics**: Response times, throughput, error rates
- **Kubernetes Metrics**: Node status, pod health, resource utilization
- **Custom Dashboards**: Configurable metric visualization

## 🛡️ Security Features

Comprehensive security scanning:
- **Container Scanning**: Trivy for container vulnerabilities
- **Web Application Testing**: OWASP ZAP for web security
- **Code Analysis**: Bandit for Python security issues
- **Dependency Scanning**: Automated vulnerability detection
- **Compliance Reporting**: Security posture tracking

## 🔄 CI/CD Pipeline Features

Advanced pipeline management:
- **Visual Pipeline Builder**: Drag-and-drop pipeline creation
- **Multi-stage Pipelines**: Build, test, security scan, deploy
- **Parallel Execution**: Optimize build times
- **Conditional Logic**: Smart pipeline routing
- **Integration Support**: Connect with existing tools

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API endpoints and examples

## 🎯 Roadmap

Future enhancements:
- [ ] Kubernetes operator for automated deployments
- [ ] Advanced AI features with OpenAI integration
- [ ] Multi-cloud support (AWS, GCP, Azure)
- [ ] Advanced RBAC and audit logging
- [ ] Plugin system for custom integrations
- [ ] Mobile application
- [ ] Advanced analytics and reporting