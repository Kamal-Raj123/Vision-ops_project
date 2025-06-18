import express from 'express';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger.js';
import { io } from '../index.js';

const router = express.Router();

// Mock pipeline data
let pipelines = [
  {
    id: '1',
    name: 'Frontend Deploy',
    status: 'success',
    lastRun: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    duration: '3m 24s',
    repository: 'secureops/frontend',
    branch: 'main',
    stages: [
      { name: 'Build', status: 'success', duration: '1m 12s' },
      { name: 'Test', status: 'success', duration: '45s' },
      { name: 'Security Scan', status: 'success', duration: '1m 27s' },
      { name: 'Deploy', status: 'success', duration: '32s' }
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Starting build process...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Installing dependencies...' },
      { timestamp: new Date().toISOString(), level: 'success', message: 'Build completed successfully' }
    ]
  },
  {
    id: '2',
    name: 'Backend API',
    status: 'running',
    lastRun: new Date().toISOString(),
    duration: '1m 45s',
    repository: 'secureops/api',
    branch: 'develop',
    stages: [
      { name: 'Build', status: 'success', duration: '1m 5s' },
      { name: 'Test', status: 'running', duration: '40s' },
      { name: 'Security Scan', status: 'pending', duration: null },
      { name: 'Deploy', status: 'pending', duration: null }
    ],
    logs: [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Running unit tests...' },
      { timestamp: new Date().toISOString(), level: 'info', message: 'Test coverage: 87%' }
    ]
  }
];

// Get all pipelines
router.get('/', (req, res) => {
  try {
    res.json({
      pipelines,
      total: pipelines.length,
      running: pipelines.filter(p => p.status === 'running').length,
      success: pipelines.filter(p => p.status === 'success').length,
      failed: pipelines.filter(p => p.status === 'failed').length
    });
  } catch (error) {
    logger.error('Error fetching pipelines:', error);
    res.status(500).json({ error: 'Failed to fetch pipelines' });
  }
});

// Get pipeline by ID
router.get('/:id', (req, res) => {
  try {
    const pipeline = pipelines.find(p => p.id === req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }
    res.json(pipeline);
  } catch (error) {
    logger.error('Error fetching pipeline:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline' });
  }
});

// Create new pipeline
router.post('/', [
  body('name').isLength({ min: 1 }).trim(),
  body('repository').isLength({ min: 1 }).trim(),
  body('branch').isLength({ min: 1 }).trim()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { name, repository, branch } = req.body;
    
    const newPipeline = {
      id: Date.now().toString(),
      name,
      repository,
      branch,
      status: 'pending',
      lastRun: new Date().toISOString(),
      duration: null,
      stages: [
        { name: 'Build', status: 'pending', duration: null },
        { name: 'Test', status: 'pending', duration: null },
        { name: 'Security Scan', status: 'pending', duration: null },
        { name: 'Deploy', status: 'pending', duration: null }
      ],
      logs: []
    };

    pipelines.push(newPipeline);
    
    // Emit real-time update
    io.emit('pipeline:created', newPipeline);
    
    logger.info(`Pipeline created: ${name} by user ${req.user.email}`);
    
    res.status(201).json(newPipeline);
  } catch (error) {
    logger.error('Error creating pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

// Run pipeline
router.post('/:id/run', (req, res) => {
  try {
    const pipeline = pipelines.find(p => p.id === req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    // Update pipeline status
    pipeline.status = 'running';
    pipeline.lastRun = new Date().toISOString();
    pipeline.logs = [
      { timestamp: new Date().toISOString(), level: 'info', message: 'Pipeline execution started...' }
    ];

    // Simulate pipeline execution
    simulatePipelineExecution(pipeline);

    // Emit real-time update
    io.emit('pipeline:started', pipeline);

    logger.info(`Pipeline started: ${pipeline.name} by user ${req.user.email}`);

    res.json({ message: 'Pipeline started successfully', pipeline });
  } catch (error) {
    logger.error('Error running pipeline:', error);
    res.status(500).json({ error: 'Failed to run pipeline' });
  }
});

// Stop pipeline
router.post('/:id/stop', (req, res) => {
  try {
    const pipeline = pipelines.find(p => p.id === req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    if (pipeline.status !== 'running') {
      return res.status(400).json({ error: 'Pipeline is not running' });
    }

    pipeline.status = 'stopped';
    pipeline.logs.push({
      timestamp: new Date().toISOString(),
      level: 'warning',
      message: 'Pipeline execution stopped by user'
    });

    // Emit real-time update
    io.emit('pipeline:stopped', pipeline);

    logger.info(`Pipeline stopped: ${pipeline.name} by user ${req.user.email}`);

    res.json({ message: 'Pipeline stopped successfully', pipeline });
  } catch (error) {
    logger.error('Error stopping pipeline:', error);
    res.status(500).json({ error: 'Failed to stop pipeline' });
  }
});

// Get pipeline logs
router.get('/:id/logs', (req, res) => {
  try {
    const pipeline = pipelines.find(p => p.id === req.params.id);
    if (!pipeline) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    res.json({
      logs: pipeline.logs,
      pipeline: {
        id: pipeline.id,
        name: pipeline.name,
        status: pipeline.status
      }
    });
  } catch (error) {
    logger.error('Error fetching pipeline logs:', error);
    res.status(500).json({ error: 'Failed to fetch pipeline logs' });
  }
});

// Simulate pipeline execution
function simulatePipelineExecution(pipeline) {
  const stages = ['Build', 'Test', 'Security Scan', 'Deploy'];
  let currentStage = 0;

  const executeStage = () => {
    if (currentStage >= stages.length) {
      // Pipeline completed
      pipeline.status = Math.random() > 0.2 ? 'success' : 'failed';
      pipeline.duration = `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`;
      
      pipeline.logs.push({
        timestamp: new Date().toISOString(),
        level: pipeline.status === 'success' ? 'success' : 'error',
        message: `Pipeline ${pipeline.status === 'success' ? 'completed successfully' : 'failed'}`
      });

      io.emit('pipeline:completed', pipeline);
      return;
    }

    const stageName = stages[currentStage];
    const stageIndex = pipeline.stages.findIndex(s => s.name === stageName);
    
    // Start stage
    pipeline.stages[stageIndex].status = 'running';
    pipeline.logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: `Starting ${stageName} stage...`
    });

    io.emit('pipeline:stage_started', { pipeline, stage: stageName });

    // Complete stage after random delay
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      pipeline.stages[stageIndex].status = success ? 'success' : 'failed';
      pipeline.stages[stageIndex].duration = `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`;
      
      pipeline.logs.push({
        timestamp: new Date().toISOString(),
        level: success ? 'success' : 'error',
        message: `${stageName} stage ${success ? 'completed' : 'failed'}`
      });

      io.emit('pipeline:stage_completed', { pipeline, stage: stageName, success });

      if (success) {
        currentStage++;
        setTimeout(executeStage, 1000);
      } else {
        // Pipeline failed
        pipeline.status = 'failed';
        pipeline.duration = `${Math.floor(Math.random() * 3) + 1}m ${Math.floor(Math.random() * 60)}s`;
        io.emit('pipeline:failed', pipeline);
      }
    }, Math.random() * 10000 + 5000); // 5-15 seconds per stage
  };

  setTimeout(executeStage, 1000);
}

export default router;