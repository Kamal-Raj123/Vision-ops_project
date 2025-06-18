// Mock WebSocket service for StackBlitz environment
class MockWebSocketService {
  private connected = false;
  private eventListeners: { [key: string]: Function[] } = {};

  connect(token?: string) {
    console.log('Mock WebSocket: Connecting...');
    this.connected = true;
    
    // Simulate connection success
    setTimeout(() => {
      console.log('Mock WebSocket: Connected');
      this.emit('connect');
      
      if (token) {
        this.emit('authenticated', { status: 'success' });
      }
      
      // Simulate periodic heartbeat
      setInterval(() => {
        this.emit('system:heartbeat', {
          timestamp: new Date().toISOString(),
          status: 'healthy',
          activeConnections: 1
        });
      }, 30000);
    }, 100);

    return this;
  }

  disconnect() {
    console.log('Mock WebSocket: Disconnecting...');
    this.connected = false;
    this.emit('disconnect', 'client disconnect');
  }

  // Event emitter methods
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.eventListeners[event]) return;
    
    if (callback) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    } else {
      delete this.eventListeners[event];
    }
  }

  emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Pipeline events
  subscribeToPipeline(pipelineId: string) {
    console.log(`Mock WebSocket: Subscribed to pipeline ${pipelineId}`);
  }

  onPipelineUpdate(callback: (data: any) => void) {
    this.on('pipeline:update', callback);
  }

  onPipelineStarted(callback: (data: any) => void) {
    this.on('pipeline:started', callback);
  }

  onPipelineCompleted(callback: (data: any) => void) {
    this.on('pipeline:completed', callback);
  }

  onPipelineFailed(callback: (data: any) => void) {
    this.on('pipeline:failed', callback);
  }

  // Security events
  subscribeToSecurity() {
    console.log('Mock WebSocket: Subscribed to security events');
  }

  onSecurityAlert(callback: (alert: any) => void) {
    this.on('security:alert', callback);
  }

  onVulnerabilityUpdated(callback: (vulnerability: any) => void) {
    this.on('vulnerability:updated', callback);
  }

  onScanStarted(callback: (scan: any) => void) {
    this.on('scan:started', callback);
  }

  onScanCompleted(callback: (scan: any) => void) {
    this.on('scan:completed', callback);
  }

  // Monitoring events
  subscribeToMonitoring(metricType?: string) {
    console.log(`Mock WebSocket: Subscribed to monitoring ${metricType || 'all'}`);
    
    // Simulate periodic metric updates
    setInterval(() => {
      this.emit('metrics:updated', {
        system: {
          cpu: { value: 60 + Math.random() * 20, status: 'healthy' },
          memory: { value: 40 + Math.random() * 20, status: 'healthy' },
          disk: { value: 80 + Math.random() * 15, status: 'warning' },
          network: { value: 10 + Math.random() * 5, status: 'healthy' }
        },
        timestamp: new Date().toISOString()
      });
    }, 30000);
  }

  onMetricsUpdated(callback: (metrics: any) => void) {
    this.on('metrics:updated', callback);
  }

  onAlertTriggered(callback: (alert: any) => void) {
    this.on('alert:triggered', callback);
  }

  onAlertResolved(callback: (alert: any) => void) {
    this.on('alert:resolved', callback);
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Check if we're in StackBlitz environment
const isStackBlitz = window.location.hostname.includes('stackblitz') || 
                    window.location.hostname.includes('webcontainer');

// Use mock WebSocket in StackBlitz, real WebSocket otherwise
export const wsService = isStackBlitz ? new MockWebSocketService() : (() => {
  const { io } = require('socket.io-client');
  
  class WebSocketService {
    private socket: any = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;
    private reconnectDelay = 1000;

    connect(token?: string) {
      this.socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        withCredentials: false,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        if (token) {
          this.socket?.emit('authenticate', token);
        }
      });

      this.socket.on('disconnect', (reason: string) => {
        console.log('WebSocket disconnected:', reason);
        
        if (reason === 'io server disconnect') {
          this.handleReconnect();
        }
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('WebSocket connection error:', error);
        this.handleReconnect();
      });

      return this.socket;
    }

    private handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
          this.socket?.connect();
        }, this.reconnectDelay * this.reconnectAttempts);
      } else {
        console.error('Max reconnection attempts reached');
      }
    }

    disconnect() {
      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
    }

    // All other methods would be implemented here...
    subscribeToPipeline(pipelineId: string) {
      this.socket?.emit('pipeline:subscribe', pipelineId);
    }

    onPipelineUpdate(callback: (data: any) => void) {
      this.socket?.on('pipeline:update', callback);
    }

    // ... other methods
    
    isConnected(): boolean {
      return this.socket?.connected || false;
    }
  }

  return new WebSocketService();
})();

export default wsService;