import { logger } from '../utils/logger.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle authentication
    socket.on('authenticate', (token) => {
      // Verify JWT token and associate with socket
      // In production, implement proper JWT verification
      socket.authenticated = true;
      socket.emit('authenticated', { status: 'success' });
      logger.info(`Socket authenticated: ${socket.id}`);
    });

    // Join specific rooms for targeted updates
    socket.on('join', (room) => {
      if (socket.authenticated) {
        socket.join(room);
        logger.info(`Socket ${socket.id} joined room: ${room}`);
      }
    });

    socket.on('leave', (room) => {
      socket.leave(room);
      logger.info(`Socket ${socket.id} left room: ${room}`);
    });

    // Handle pipeline events
    socket.on('pipeline:subscribe', (pipelineId) => {
      if (socket.authenticated) {
        socket.join(`pipeline:${pipelineId}`);
        logger.info(`Socket ${socket.id} subscribed to pipeline: ${pipelineId}`);
      }
    });

    // Handle monitoring events
    socket.on('monitoring:subscribe', (metricType) => {
      if (socket.authenticated) {
        socket.join(`monitoring:${metricType}`);
        logger.info(`Socket ${socket.id} subscribed to monitoring: ${metricType}`);
      }
    });

    // Handle security events
    socket.on('security:subscribe', () => {
      if (socket.authenticated) {
        socket.join('security:alerts');
        logger.info(`Socket ${socket.id} subscribed to security alerts`);
      }
    });

    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Broadcast system-wide notifications
  setInterval(() => {
    io.emit('system:heartbeat', {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      activeConnections: io.engine.clientsCount
    });
  }, 30000); // Every 30 seconds

  logger.info('Socket.IO handlers configured');
}

// Helper functions to emit specific events
export function emitPipelineUpdate(io, pipelineId, data) {
  io.to(`pipeline:${pipelineId}`).emit('pipeline:update', data);
}

export function emitSecurityAlert(io, alert) {
  io.to('security:alerts').emit('security:alert', alert);
}

export function emitMonitoringUpdate(io, metricType, data) {
  io.to(`monitoring:${metricType}`).emit('monitoring:update', data);
}