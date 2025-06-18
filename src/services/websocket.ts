import { io, Socket } from 'socket.io-client';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(token?: string) {
    const wsUrl = import.meta.env.VITE_WS_URL || 'https://localhost:3001';
    
    this.socket = io(wsUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      withCredentials: false,
      secure: true,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      
      // Authenticate if token is provided
      if (token) {
        this.socket?.emit('authenticate', token);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    this.socket.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    // System events
    this.socket.on('system:heartbeat', (data) => {
      console.log('System heartbeat:', data);
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

  // Pipeline events
  subscribeToPipeline(pipelineId: string) {
    this.socket?.emit('pipeline:subscribe', pipelineId);
  }

  onPipelineUpdate(callback: (data: any) => void) {
    this.socket?.on('pipeline:update', callback);
  }

  onPipelineStarted(callback: (data: any) => void) {
    this.socket?.on('pipeline:started', callback);
  }

  onPipelineCompleted(callback: (data: any) => void) {
    this.socket?.on('pipeline:completed', callback);
  }

  onPipelineFailed(callback: (data: any) => void) {
    this.socket?.on('pipeline:failed', callback);
  }

  // Security events
  subscribeToSecurity() {
    this.socket?.emit('security:subscribe');
  }

  onSecurityAlert(callback: (alert: any) => void) {
    this.socket?.on('security:alert', callback);
  }

  onVulnerabilityUpdated(callback: (vulnerability: any) => void) {
    this.socket?.on('vulnerability:updated', callback);
  }

  onScanStarted(callback: (scan: any) => void) {
    this.socket?.on('scan:started', callback);
  }

  onScanCompleted(callback: (scan: any) => void) {
    this.socket?.on('scan:completed', callback);
  }

  // Monitoring events
  subscribeToMonitoring(metricType?: string) {
    this.socket?.emit('monitoring:subscribe', metricType || 'all');
  }

  onMetricsUpdated(callback: (metrics: any) => void) {
    this.socket?.on('metrics:updated', callback);
  }

  onAlertTriggered(callback: (alert: any) => void) {
    this.socket?.on('alert:triggered', callback);
  }

  onAlertResolved(callback: (alert: any) => void) {
    this.socket?.on('alert:resolved', callback);
  }

  // Generic event handlers
  on(event: string, callback: (data: any) => void) {
    this.socket?.on(event, callback);
  }

  off(event: string, callback?: (data: any) => void) {
    this.socket?.off(event, callback);
  }

  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const wsService = new WebSocketService();
export default wsService;