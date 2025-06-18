import { useEffect, useRef } from 'react';
import { wsService } from '../services/websocket';

export function useWebSocket() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      const token = localStorage.getItem('authToken');
      wsService.connect(token || undefined);
      isInitialized.current = true;
    }

    return () => {
      // Don't disconnect on component unmount, keep connection alive
      // wsService.disconnect();
    };
  }, []);

  return wsService;
}

export function usePipelineEvents() {
  const ws = useWebSocket();

  const subscribeToPipeline = (pipelineId: string) => {
    ws.subscribeToPipeline(pipelineId);
  };

  const onPipelineUpdate = (callback: (data: any) => void) => {
    ws.onPipelineUpdate(callback);
    return () => ws.off('pipeline:update', callback);
  };

  const onPipelineStarted = (callback: (data: any) => void) => {
    ws.onPipelineStarted(callback);
    return () => ws.off('pipeline:started', callback);
  };

  const onPipelineCompleted = (callback: (data: any) => void) => {
    ws.onPipelineCompleted(callback);
    return () => ws.off('pipeline:completed', callback);
  };

  return {
    subscribeToPipeline,
    onPipelineUpdate,
    onPipelineStarted,
    onPipelineCompleted,
  };
}

export function useSecurityEvents() {
  const ws = useWebSocket();

  useEffect(() => {
    ws.subscribeToSecurity();
  }, [ws]);

  const onSecurityAlert = (callback: (alert: any) => void) => {
    ws.onSecurityAlert(callback);
    return () => ws.off('security:alert', callback);
  };

  const onVulnerabilityUpdated = (callback: (vulnerability: any) => void) => {
    ws.onVulnerabilityUpdated(callback);
    return () => ws.off('vulnerability:updated', callback);
  };

  const onScanCompleted = (callback: (scan: any) => void) => {
    ws.onScanCompleted(callback);
    return () => ws.off('scan:completed', callback);
  };

  return {
    onSecurityAlert,
    onVulnerabilityUpdated,
    onScanCompleted,
  };
}

export function useMonitoringEvents() {
  const ws = useWebSocket();

  useEffect(() => {
    ws.subscribeToMonitoring();
  }, [ws]);

  const onMetricsUpdated = (callback: (metrics: any) => void) => {
    ws.onMetricsUpdated(callback);
    return () => ws.off('metrics:updated', callback);
  };

  const onAlertTriggered = (callback: (alert: any) => void) => {
    ws.onAlertTriggered(callback);
    return () => ws.off('alert:triggered', callback);
  };

  return {
    onMetricsUpdated,
    onAlertTriggered,
  };
}