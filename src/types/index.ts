export interface Pipeline {
  id: string;
  name: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  lastRun: string;
  duration: string;
  repository: string;
  branch: string;
}

export interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  package: string;
  version: string;
  fixedVersion?: string;
  scanner: 'trivy' | 'owasp' | 'bandit';
}

export interface MetricData {
  timestamp: string;
  value: number;
}

export interface MonitoringMetric {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  data: MetricData[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface KubernetesNode {
  id: string;
  name: string;
  status: 'ready' | 'not-ready' | 'deploying' | 'terminating' | 'error';
  role: 'control-plane' | 'worker';
  version: string;
  os: string;
  architecture: string;
  capacity: {
    cpu: string;
    memory: string;
    storage: string;
    pods: number;
  };
  allocatable: {
    cpu: string;
    memory: string;
    storage: string;
    pods: number;
  };
  usage: {
    cpu: number;
    memory: number;
    storage: number;
    pods: number;
  };
  conditions: Array<{
    type: string;
    status: 'True' | 'False' | 'Unknown';
    reason: string;
    message: string;
    lastTransition: string;
  }>;
  labels: Record<string, string>;
  annotations: Record<string, string>;
  createdAt: string;
  lastHeartbeat: string;
  nodeInfo: {
    machineID: string;
    systemUUID: string;
    bootID: string;
    kernelVersion: string;
    osImage: string;
    containerRuntimeVersion: string;
    kubeletVersion: string;
    kubeProxyVersion: string;
  };
  addresses: Array<{
    type: 'InternalIP' | 'ExternalIP' | 'Hostname';
    address: string;
  }>;
  taints: Array<{
    key: string;
    value?: string;
    effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
  }>;
  pods: Array<{
    name: string;
    namespace: string;
    status: string;
    restarts: number;
    age: string;
  }>;
}

export interface NodeDeploymentConfig {
  nodeType: 'control-plane' | 'worker';
  instanceType: 'small' | 'medium' | 'large' | 'xlarge';
  count: number;
  zone: string;
  labels: Record<string, string>;
  taints: Array<{
    key: string;
    value?: string;
    effect: 'NoSchedule' | 'PreferNoSchedule' | 'NoExecute';
  }>;
  autoScaling: {
    enabled: boolean;
    minNodes: number;
    maxNodes: number;
    targetCPU: number;
    targetMemory: number;
  };
}