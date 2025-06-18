import React, { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface RealTimeUpdatesProps {
  onPipelineUpdate?: (data: any) => void;
  onMetricsUpdate?: (data: any) => void;
  onScanComplete?: (data: any) => void;
}

let socket: Socket | null = null;

export default function RealTimeUpdates({ 
  onPipelineUpdate, 
  onMetricsUpdate, 
  onScanComplete 
}: RealTimeUpdatesProps) {
  useEffect(() => {
    // Initialize socket connection
    if (!socket) {
      socket = io('http://localhost:3001');
    }

    // Set up event listeners
    if (onPipelineUpdate) {
      socket.on('pipelineUpdate', onPipelineUpdate);
    }
    
    if (onMetricsUpdate) {
      socket.on('metricsUpdate', onMetricsUpdate);
    }
    
    if (onScanComplete) {
      socket.on('scanComplete', onScanComplete);
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.off('pipelineUpdate');
        socket.off('metricsUpdate');
        socket.off('scanComplete');
      }
    };
  }, [onPipelineUpdate, onMetricsUpdate, onScanComplete]);

  return null; // This component doesn't render anything
}

export const useRealTimeUpdates = () => {
  useEffect(() => {
    if (!socket) {
      socket = io('http://localhost:3001');
    }

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, []);

  const emit = (event: string, data: any) => {
    if (socket) {
      socket.emit(event, data);
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event: string) => {
    if (socket) {
      socket.off(event);
    }
  };

  return { emit, on, off };
};