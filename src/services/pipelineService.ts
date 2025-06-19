import { MockBackendService } from './mockBackend';

export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  duration?: string;
  startTime?: string;
  endTime?: string;
  logs: PipelineLog[];
  commands?: string[];
  artifacts?: string[];
  environment?: Record<string, string>;
}

export interface PipelineLog {
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success' | 'debug';
  message: string;
  stage?: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description: string;
  repository: string;
  branch: string;
  status: 'idle' | 'running' | 'success' | 'failed' | 'cancelled';
  trigger: 'manual' | 'webhook' | 'schedule' | 'pr';
  lastRun?: string;
  duration?: string;
  stages: PipelineStage[];
  logs: PipelineLog[];
  config: PipelineConfig;
  metrics: PipelineMetrics;
}

export interface PipelineConfig {
  buildTool: 'npm' | 'maven' | 'gradle' | 'docker' | 'make';
  testFramework: 'jest' | 'junit' | 'pytest' | 'mocha' | 'cypress';
  deployTarget: 'kubernetes' | 'docker' | 'aws' | 'azure' | 'gcp';
  environment: Record<string, string>;
  notifications: {
    slack?: string;
    email?: string[];
    webhook?: string;
  };
  security: {
    enableScanning: boolean;
    scanners: string[];
    failOnCritical: boolean;
  };
}

export interface PipelineMetrics {
  totalRuns: number;
  successRate: number;
  averageDuration: string;
  lastSuccess?: string;
  lastFailure?: string;
  deploymentFrequency: string;
  leadTime: string;
  mttr: string; // Mean Time To Recovery
}

export interface BuildArtifact {
  id: string;
  name: string;
  type: 'docker-image' | 'jar' | 'war' | 'zip' | 'tar' | 'binary';
  size: string;
  checksum: string;
  downloadUrl: string;
  createdAt: string;
}

class PipelineService {
  private pipelines: Map<string, Pipeline> = new Map();
  private runningPipelines: Set<string> = new Set();

  constructor() {
    this.initializeDefaultPipelines();
  }

  private initializeDefaultPipelines() {
    const defaultPipelines: Pipeline[] = [
      {
        id: 'frontend-app',
        name: 'Frontend Application',
        description: 'React TypeScript application with comprehensive testing and deployment',
        repository: 'https://github.com/company/frontend-app',
        branch: 'main',
        status: 'idle',
        trigger: 'webhook',
        stages: [
          {
            id: 'checkout',
            name: 'Source Checkout',
            status: 'pending',
            logs: [],
            commands: [
              'git clone $REPO_URL',
              'git checkout $BRANCH',
              'git log --oneline -5'
            ]
          },
          {
            id: 'install',
            name: 'Install Dependencies',
            status: 'pending',
            logs: [],
            commands: [
              'npm ci',
              'npm audit --audit-level moderate',
              'npm list --depth=0'
            ]
          },
          {
            id: 'lint',
            name: 'Code Quality Check',
            status: 'pending',
            logs: [],
            commands: [
              'npm run lint',
              'npm run type-check',
              'npm run format:check'
            ]
          },
          {
            id: 'test',
            name: 'Unit & Integration Tests',
            status: 'pending',
            logs: [],
            commands: [
              'npm run test:unit',
              'npm run test:integration',
              'npm run test:coverage'
            ]
          },
          {
            id: 'build',
            name: 'Build Application',
            status: 'pending',
            logs: [],
            commands: [
              'npm run build',
              'npm run build:analyze',
              'ls -la dist/'
            ],
            artifacts: ['dist.tar.gz', 'build-report.json']
          },
          {
            id: 'security',
            name: 'Security Scanning',
            status: 'pending',
            logs: [],
            commands: [
              'npm audit --audit-level high',
              'trivy fs .',
              'snyk test'
            ]
          },
          {
            id: 'docker',
            name: 'Container Build',
            status: 'pending',
            logs: [],
            commands: [
              'docker build -t frontend-app:$BUILD_NUMBER .',
              'docker scan frontend-app:$BUILD_NUMBER',
              'docker push registry.company.com/frontend-app:$BUILD_NUMBER'
            ],
            artifacts: ['Dockerfile', 'docker-compose.yml']
          },
          {
            id: 'deploy-staging',
            name: 'Deploy to Staging',
            status: 'pending',
            logs: [],
            commands: [
              'kubectl apply -f k8s/staging/',
              'kubectl rollout status deployment/frontend-app -n staging',
              'kubectl get pods -n staging'
            ]
          },
          {
            id: 'e2e-tests',
            name: 'End-to-End Tests',
            status: 'pending',
            logs: [],
            commands: [
              'npm run test:e2e:staging',
              'npm run test:performance',
              'npm run test:accessibility'
            ]
          },
          {
            id: 'deploy-prod',
            name: 'Deploy to Production',
            status: 'pending',
            logs: [],
            commands: [
              'kubectl apply -f k8s/production/',
              'kubectl rollout status deployment/frontend-app -n production',
              'kubectl get pods -n production'
            ]
          }
        ],
        logs: [],
        config: {
          buildTool: 'npm',
          testFramework: 'jest',
          deployTarget: 'kubernetes',
          environment: {
            NODE_ENV: 'production',
            BUILD_NUMBER: '${BUILD_NUMBER}',
            REPO_URL: 'https://github.com/company/frontend-app',
            BRANCH: 'main'
          },
          notifications: {
            slack: '#deployments',
            email: ['devops@company.com']
          },
          security: {
            enableScanning: true,
            scanners: ['trivy', 'snyk', 'npm-audit'],
            failOnCritical: true
          }
        },
        metrics: {
          totalRuns: 156,
          successRate: 94.2,
          averageDuration: '8m 32s',
          lastSuccess: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          deploymentFrequency: '12 per day',
          leadTime: '2.3 hours',
          mttr: '15 minutes'
        }
      },
      {
        id: 'backend-api',
        name: 'Backend API Service',
        description: 'Node.js Express API with database migrations and comprehensive testing',
        repository: 'https://github.com/company/backend-api',
        branch: 'develop',
        status: 'idle',
        trigger: 'webhook',
        stages: [
          {
            id: 'checkout',
            name: 'Source Checkout',
            status: 'pending',
            logs: []
          },
          {
            id: 'install',
            name: 'Install Dependencies',
            status: 'pending',
            logs: [],
            commands: [
              'npm ci',
              'npm run db:migrate:test'
            ]
          },
          {
            id: 'lint',
            name: 'Code Quality',
            status: 'pending',
            logs: [],
            commands: [
              'npm run lint',
              'npm run type-check'
            ]
          },
          {
            id: 'test',
            name: 'API Tests',
            status: 'pending',
            logs: [],
            commands: [
              'npm run test:unit',
              'npm run test:integration',
              'npm run test:api'
            ]
          },
          {
            id: 'build',
            name: 'Build & Package',
            status: 'pending',
            logs: [],
            commands: [
              'npm run build',
              'npm run package'
            ]
          },
          {
            id: 'security',
            name: 'Security Scan',
            status: 'pending',
            logs: []
          },
          {
            id: 'docker',
            name: 'Container Build',
            status: 'pending',
            logs: []
          },
          {
            id: 'deploy',
            name: 'Deploy to Staging',
            status: 'pending',
            logs: []
          }
        ],
        logs: [],
        config: {
          buildTool: 'npm',
          testFramework: 'jest',
          deployTarget: 'kubernetes',
          environment: {
            NODE_ENV: 'production',
            DATABASE_URL: '${DATABASE_URL}',
            REDIS_URL: '${REDIS_URL}'
          },
          notifications: {
            slack: '#backend-alerts'
          },
          security: {
            enableScanning: true,
            scanners: ['trivy', 'snyk'],
            failOnCritical: true
          }
        },
        metrics: {
          totalRuns: 89,
          successRate: 91.0,
          averageDuration: '6m 45s',
          deploymentFrequency: '8 per day',
          leadTime: '1.8 hours',
          mttr: '22 minutes'
        }
      },
      {
        id: 'microservice-auth',
        name: 'Authentication Microservice',
        description: 'Go-based authentication service with JWT and OAuth2 support',
        repository: 'https://github.com/company/auth-service',
        branch: 'main',
        status: 'idle',
        trigger: 'manual',
        stages: [
          {
            id: 'checkout',
            name: 'Source Checkout',
            status: 'pending',
            logs: []
          },
          {
            id: 'deps',
            name: 'Download Dependencies',
            status: 'pending',
            logs: [],
            commands: [
              'go mod download',
              'go mod verify'
            ]
          },
          {
            id: 'lint',
            name: 'Code Quality',
            status: 'pending',
            logs: [],
            commands: [
              'golangci-lint run',
              'go vet ./...',
              'gofmt -l .'
            ]
          },
          {
            id: 'test',
            name: 'Go Tests',
            status: 'pending',
            logs: [],
            commands: [
              'go test -v ./...',
              'go test -race ./...',
              'go test -cover ./...'
            ]
          },
          {
            id: 'build',
            name: 'Build Binary',
            status: 'pending',
            logs: [],
            commands: [
              'CGO_ENABLED=0 GOOS=linux go build -o auth-service',
              'chmod +x auth-service'
            ]
          },
          {
            id: 'security',
            name: 'Security Scan',
            status: 'pending',
            logs: []
          },
          {
            id: 'docker',
            name: 'Container Build',
            status: 'pending',
            logs: []
          },
          {
            id: 'deploy',
            name: 'Deploy Service',
            status: 'pending',
            logs: []
          }
        ],
        logs: [],
        config: {
          buildTool: 'make',
          testFramework: 'jest',
          deployTarget: 'kubernetes',
          environment: {
            CGO_ENABLED: '0',
            GOOS: 'linux'
          },
          notifications: {
            slack: '#security-alerts'
          },
          security: {
            enableScanning: true,
            scanners: ['trivy', 'gosec'],
            failOnCritical: true
          }
        },
        metrics: {
          totalRuns: 34,
          successRate: 97.1,
          averageDuration: '4m 12s',
          deploymentFrequency: '3 per day',
          leadTime: '45 minutes',
          mttr: '8 minutes'
        }
      }
    ];

    defaultPipelines.forEach(pipeline => {
      this.pipelines.set(pipeline.id, pipeline);
    });
  }

  async getAllPipelines(): Promise<Pipeline[]> {
    return Array.from(this.pipelines.values());
  }

  async getPipeline(id: string): Promise<Pipeline | null> {
    return this.pipelines.get(id) || null;
  }

  async createPipeline(config: Partial<Pipeline>): Promise<Pipeline> {
    const pipeline: Pipeline = {
      id: Date.now().toString(),
      name: config.name || 'New Pipeline',
      description: config.description || '',
      repository: config.repository || '',
      branch: config.branch || 'main',
      status: 'idle',
      trigger: config.trigger || 'manual',
      stages: config.stages || [],
      logs: [],
      config: config.config || {
        buildTool: 'npm',
        testFramework: 'jest',
        deployTarget: 'kubernetes',
        environment: {},
        notifications: {},
        security: {
          enableScanning: true,
          scanners: ['trivy'],
          failOnCritical: false
        }
      },
      metrics: {
        totalRuns: 0,
        successRate: 0,
        averageDuration: '0s',
        deploymentFrequency: '0 per day',
        leadTime: '0 minutes',
        mttr: '0 minutes'
      }
    };

    this.pipelines.set(pipeline.id, pipeline);
    return pipeline;
  }

  async runPipeline(id: string, options?: { 
    branch?: string; 
    environment?: Record<string, string>;
    skipStages?: string[];
  }): Promise<{ success: boolean; message: string; runId: string }> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (this.runningPipelines.has(id)) {
      throw new Error('Pipeline is already running');
    }

    const runId = `${id}-${Date.now()}`;
    this.runningPipelines.add(id);

    // Reset pipeline state
    pipeline.status = 'running';
    pipeline.lastRun = new Date().toISOString();
    pipeline.logs = [];
    
    // Reset all stages
    pipeline.stages.forEach(stage => {
      stage.status = options?.skipStages?.includes(stage.id) ? 'skipped' : 'pending';
      stage.logs = [];
      stage.startTime = undefined;
      stage.endTime = undefined;
      stage.duration = undefined;
    });

    // Add initial log
    this.addPipelineLog(pipeline, 'info', `🚀 Pipeline execution started - Run ID: ${runId}`);
    this.addPipelineLog(pipeline, 'info', `📋 Repository: ${pipeline.repository}`);
    this.addPipelineLog(pipeline, 'info', `🌿 Branch: ${options?.branch || pipeline.branch}`);

    // Start pipeline execution
    this.executePipeline(pipeline, runId, options);

    return {
      success: true,
      message: 'Pipeline started successfully',
      runId
    };
  }

  private async executePipeline(
    pipeline: Pipeline, 
    runId: string, 
    options?: { 
      branch?: string; 
      environment?: Record<string, string>;
      skipStages?: string[];
    }
  ) {
    const startTime = Date.now();
    let allStagesSuccessful = true;

    try {
      for (const stage of pipeline.stages) {
        if (options?.skipStages?.includes(stage.id)) {
          this.addPipelineLog(pipeline, 'info', `⏭️ Skipping stage: ${stage.name}`);
          continue;
        }

        const stageSuccess = await this.executeStage(pipeline, stage, options);
        if (!stageSuccess) {
          allStagesSuccessful = false;
          break;
        }
      }

      // Update pipeline status
      pipeline.status = allStagesSuccessful ? 'success' : 'failed';
      const duration = this.formatDuration(Date.now() - startTime);
      pipeline.duration = duration;

      // Update metrics
      pipeline.metrics.totalRuns++;
      if (allStagesSuccessful) {
        pipeline.metrics.lastSuccess = new Date().toISOString();
        // Recalculate success rate
        const successCount = Math.floor(pipeline.metrics.totalRuns * (pipeline.metrics.successRate / 100));
        pipeline.metrics.successRate = ((successCount + 1) / pipeline.metrics.totalRuns) * 100;
      } else {
        pipeline.metrics.lastFailure = new Date().toISOString();
        const successCount = Math.floor(pipeline.metrics.totalRuns * (pipeline.metrics.successRate / 100));
        pipeline.metrics.successRate = (successCount / pipeline.metrics.totalRuns) * 100;
      }

      // Final log
      this.addPipelineLog(
        pipeline, 
        allStagesSuccessful ? 'success' : 'error',
        `${allStagesSuccessful ? '✅' : '❌'} Pipeline ${allStagesSuccessful ? 'completed successfully' : 'failed'} in ${duration}`
      );

      // Send notifications
      await this.sendNotifications(pipeline, allStagesSuccessful, duration);

    } catch (error) {
      pipeline.status = 'failed';
      this.addPipelineLog(pipeline, 'error', `💥 Pipeline execution failed: ${error.message}`);
    } finally {
      this.runningPipelines.delete(pipeline.id);
    }
  }

  private async executeStage(
    pipeline: Pipeline, 
    stage: PipelineStage, 
    options?: { environment?: Record<string, string> }
  ): Promise<boolean> {
    const stageStartTime = Date.now();
    stage.status = 'running';
    stage.startTime = new Date().toISOString();

    this.addPipelineLog(pipeline, 'info', `🔄 Starting stage: ${stage.name}`);
    this.addStageLog(stage, 'info', `Stage ${stage.name} started`);

    try {
      // Simulate stage execution with realistic timing and outputs
      const stageResult = await this.simulateStageExecution(pipeline, stage, options);
      
      const stageDuration = Date.now() - stageStartTime;
      stage.duration = this.formatDuration(stageDuration);
      stage.endTime = new Date().toISOString();

      if (stageResult.success) {
        stage.status = 'success';
        this.addPipelineLog(pipeline, 'success', `✅ Stage completed: ${stage.name} (${stage.duration})`);
        this.addStageLog(stage, 'success', `Stage completed successfully in ${stage.duration}`);
        
        // Add stage-specific success logs
        stageResult.logs?.forEach(log => {
          this.addStageLog(stage, log.level, log.message);
        });

        return true;
      } else {
        stage.status = 'failed';
        this.addPipelineLog(pipeline, 'error', `❌ Stage failed: ${stage.name} - ${stageResult.error}`);
        this.addStageLog(stage, 'error', `Stage failed: ${stageResult.error}`);
        return false;
      }
    } catch (error) {
      stage.status = 'failed';
      stage.duration = this.formatDuration(Date.now() - stageStartTime);
      stage.endTime = new Date().toISOString();
      
      this.addPipelineLog(pipeline, 'error', `💥 Stage error: ${stage.name} - ${error.message}`);
      this.addStageLog(stage, 'error', `Unexpected error: ${error.message}`);
      return false;
    }
  }

  private async simulateStageExecution(
    pipeline: Pipeline, 
    stage: PipelineStage,
    options?: { environment?: Record<string, string> }
  ): Promise<{ success: boolean; error?: string; logs?: Array<{ level: string; message: string }> }> {
    
    // Simulate realistic execution time based on stage type
    const executionTime = this.getStageExecutionTime(stage.name);
    
    // Add realistic progress logs during execution
    const progressInterval = setInterval(() => {
      if (stage.status === 'running') {
        this.addRandomProgressLog(stage);
      }
    }, Math.random() * 2000 + 1000);

    await new Promise(resolve => setTimeout(resolve, executionTime));
    clearInterval(progressInterval);

    // Simulate different success rates based on stage type
    const successRate = this.getStageSuccessRate(stage.name);
    const isSuccess = Math.random() < successRate;

    if (!isSuccess) {
      return {
        success: false,
        error: this.getStageError(stage.name)
      };
    }

    // Generate stage-specific success logs and artifacts
    return {
      success: true,
      logs: this.getStageSuccessLogs(stage.name)
    };
  }

  private getStageExecutionTime(stageName: string): number {
    const timings = {
      'Source Checkout': 5000 + Math.random() * 3000,
      'Install Dependencies': 8000 + Math.random() * 12000,
      'Code Quality Check': 3000 + Math.random() * 5000,
      'Code Quality': 3000 + Math.random() * 5000,
      'Unit & Integration Tests': 15000 + Math.random() * 20000,
      'API Tests': 10000 + Math.random() * 15000,
      'Go Tests': 8000 + Math.random() * 10000,
      'Build Application': 12000 + Math.random() * 18000,
      'Build & Package': 10000 + Math.random() * 15000,
      'Build Binary': 6000 + Math.random() * 8000,
      'Security Scanning': 20000 + Math.random() * 25000,
      'Security Scan': 15000 + Math.random() * 20000,
      'Container Build': 25000 + Math.random() * 30000,
      'Deploy to Staging': 8000 + Math.random() * 12000,
      'Deploy Service': 8000 + Math.random() * 12000,
      'End-to-End Tests': 30000 + Math.random() * 40000,
      'Deploy to Production': 10000 + Math.random() * 15000
    };

    return timings[stageName] || 5000 + Math.random() * 10000;
  }

  private getStageSuccessRate(stageName: string): number {
    const rates = {
      'Source Checkout': 0.98,
      'Install Dependencies': 0.95,
      'Code Quality Check': 0.92,
      'Code Quality': 0.92,
      'Unit & Integration Tests': 0.88,
      'API Tests': 0.90,
      'Go Tests': 0.93,
      'Build Application': 0.94,
      'Build & Package': 0.94,
      'Build Binary': 0.96,
      'Security Scanning': 0.85,
      'Security Scan': 0.85,
      'Container Build': 0.91,
      'Deploy to Staging': 0.93,
      'Deploy Service': 0.93,
      'End-to-End Tests': 0.82,
      'Deploy to Production': 0.95
    };

    return rates[stageName] || 0.90;
  }

  private getStageError(stageName: string): string {
    const errors = {
      'Source Checkout': 'Git authentication failed',
      'Install Dependencies': 'Package dependency conflict detected',
      'Code Quality Check': 'ESLint errors found in src/components/Dashboard.tsx',
      'Code Quality': 'Code quality gate failed - coverage below 80%',
      'Unit & Integration Tests': 'Test suite failed: 3 tests failing',
      'API Tests': 'API endpoint /api/users returned 500 error',
      'Go Tests': 'Race condition detected in auth package',
      'Build Application': 'TypeScript compilation errors',
      'Build & Package': 'Build artifacts missing required files',
      'Build Binary': 'Go build failed: undefined reference',
      'Security Scanning': 'Critical vulnerability found: CVE-2023-1234',
      'Security Scan': 'High severity vulnerabilities detected',
      'Container Build': 'Docker build failed: base image not found',
      'Deploy to Staging': 'Kubernetes deployment timeout',
      'Deploy Service': 'Service health check failed',
      'End-to-End Tests': 'E2E test timeout: login flow',
      'Deploy to Production': 'Production deployment blocked by approval gate'
    };

    return errors[stageName] || 'Unknown error occurred';
  }

  private getStageSuccessLogs(stageName: string): Array<{ level: string; message: string }> {
    const logs = {
      'Source Checkout': [
        { level: 'info', message: 'Cloned repository successfully' },
        { level: 'info', message: 'Checked out branch: main' },
        { level: 'info', message: 'Latest commit: abc123f - Fix authentication bug' }
      ],
      'Install Dependencies': [
        { level: 'info', message: 'Installing 247 packages...' },
        { level: 'info', message: 'No vulnerabilities found in dependencies' },
        { level: 'success', message: 'All dependencies installed successfully' }
      ],
      'Build Application': [
        { level: 'info', message: 'TypeScript compilation completed' },
        { level: 'info', message: 'Bundle size: 2.3MB (gzipped: 687KB)' },
        { level: 'success', message: 'Build artifacts generated in dist/' }
      ],
      'Security Scanning': [
        { level: 'info', message: 'Scanning for vulnerabilities...' },
        { level: 'info', message: 'Found 0 critical, 2 medium vulnerabilities' },
        { level: 'success', message: 'Security scan passed - no critical issues' }
      ],
      'Container Build': [
        { level: 'info', message: 'Building Docker image...' },
        { level: 'info', message: 'Image size: 145MB' },
        { level: 'success', message: 'Image pushed to registry.company.com/app:v1.2.3' }
      ],
      'Deploy to Staging': [
        { level: 'info', message: 'Applying Kubernetes manifests...' },
        { level: 'info', message: 'Rolling update in progress...' },
        { level: 'success', message: 'Deployment successful - 3/3 pods ready' }
      ]
    };

    return logs[stageName] || [
      { level: 'success', message: 'Stage completed successfully' }
    ];
  }

  private addRandomProgressLog(stage: PipelineStage) {
    const progressLogs = [
      'Processing...',
      'Downloading dependencies...',
      'Running tests...',
      'Compiling source code...',
      'Generating artifacts...',
      'Validating configuration...',
      'Checking code quality...',
      'Scanning for vulnerabilities...',
      'Building container image...',
      'Uploading artifacts...',
      'Deploying to environment...',
      'Verifying deployment...'
    ];

    const randomLog = progressLogs[Math.floor(Math.random() * progressLogs.length)];
    this.addStageLog(stage, 'info', randomLog);
  }

  private addPipelineLog(pipeline: Pipeline, level: PipelineLog['level'], message: string) {
    pipeline.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message
    });
  }

  private addStageLog(stage: PipelineStage, level: PipelineLog['level'], message: string) {
    stage.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      stage: stage.name
    });
  }

  private formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }

  private async sendNotifications(pipeline: Pipeline, success: boolean, duration: string) {
    const { notifications } = pipeline.config;
    
    if (notifications.slack) {
      this.addPipelineLog(
        pipeline, 
        'info', 
        `📢 Slack notification sent to ${notifications.slack}`
      );
    }

    if (notifications.email?.length) {
      this.addPipelineLog(
        pipeline, 
        'info', 
        `📧 Email notification sent to ${notifications.email.join(', ')}`
      );
    }

    if (notifications.webhook) {
      this.addPipelineLog(
        pipeline, 
        'info', 
        `🔗 Webhook notification sent to ${notifications.webhook}`
      );
    }
  }

  async stopPipeline(id: string): Promise<{ success: boolean; message: string }> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (!this.runningPipelines.has(id)) {
      throw new Error('Pipeline is not running');
    }

    pipeline.status = 'cancelled';
    this.runningPipelines.delete(id);
    
    // Stop current running stage
    const runningStage = pipeline.stages.find(s => s.status === 'running');
    if (runningStage) {
      runningStage.status = 'failed';
      runningStage.endTime = new Date().toISOString();
      this.addStageLog(runningStage, 'warning', 'Stage cancelled by user');
    }

    this.addPipelineLog(pipeline, 'warning', '🛑 Pipeline execution cancelled by user');

    return {
      success: true,
      message: 'Pipeline stopped successfully'
    };
  }

  async getPipelineLogs(id: string, stageId?: string): Promise<PipelineLog[]> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (stageId) {
      const stage = pipeline.stages.find(s => s.id === stageId);
      return stage?.logs || [];
    }

    return pipeline.logs;
  }

  async getPipelineArtifacts(id: string): Promise<BuildArtifact[]> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    // Generate mock artifacts based on pipeline stages
    const artifacts: BuildArtifact[] = [];
    
    pipeline.stages.forEach(stage => {
      if (stage.artifacts && stage.status === 'success') {
        stage.artifacts.forEach(artifactName => {
          artifacts.push({
            id: `${stage.id}-${artifactName}`,
            name: artifactName,
            type: this.getArtifactType(artifactName),
            size: this.generateFileSize(),
            checksum: this.generateChecksum(),
            downloadUrl: `/api/pipelines/${id}/artifacts/${stage.id}/${artifactName}`,
            createdAt: stage.endTime || new Date().toISOString()
          });
        });
      }
    });

    return artifacts;
  }

  private getArtifactType(filename: string): BuildArtifact['type'] {
    if (filename.includes('docker') || filename.includes('Dockerfile')) return 'docker-image';
    if (filename.endsWith('.jar')) return 'jar';
    if (filename.endsWith('.war')) return 'war';
    if (filename.endsWith('.zip')) return 'zip';
    if (filename.endsWith('.tar.gz') || filename.endsWith('.tar')) return 'tar';
    return 'binary';
  }

  private generateFileSize(): string {
    const sizes = ['1.2MB', '5.7MB', '12.3MB', '45.6MB', '123.4MB', '2.1GB'];
    return sizes[Math.floor(Math.random() * sizes.length)];
  }

  private generateChecksum(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  async updatePipelineConfig(id: string, config: Partial<PipelineConfig>): Promise<Pipeline> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    pipeline.config = { ...pipeline.config, ...config };
    return pipeline;
  }

  async deletePipeline(id: string): Promise<{ success: boolean; message: string }> {
    const pipeline = this.pipelines.get(id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }

    if (this.runningPipelines.has(id)) {
      throw new Error('Cannot delete running pipeline');
    }

    this.pipelines.delete(id);
    
    return {
      success: true,
      message: 'Pipeline deleted successfully'
    };
  }

  async getPipelineMetrics(): Promise<{
    totalPipelines: number;
    runningPipelines: number;
    successRate: number;
    averageDuration: string;
    deploymentsToday: number;
  }> {
    const pipelines = Array.from(this.pipelines.values());
    
    const totalRuns = pipelines.reduce((sum, p) => sum + p.metrics.totalRuns, 0);
    const totalSuccessful = pipelines.reduce((sum, p) => 
      sum + Math.floor(p.metrics.totalRuns * (p.metrics.successRate / 100)), 0
    );

    return {
      totalPipelines: pipelines.length,
      runningPipelines: this.runningPipelines.size,
      successRate: totalRuns > 0 ? (totalSuccessful / totalRuns) * 100 : 0,
      averageDuration: '6m 45s',
      deploymentsToday: Math.floor(Math.random() * 25) + 15
    };
  }
}

export const pipelineService = new PipelineService();