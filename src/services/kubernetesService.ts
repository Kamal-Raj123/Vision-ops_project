import { KubernetesNode, NodeDeploymentConfig } from '../types';

export interface NodeMetrics {
  cpu: {
    usage: number;
    requests: number;
    limits: number;
  };
  memory: {
    usage: number;
    requests: number;
    limits: number;
  };
  storage: {
    usage: number;
    available: number;
  };
  network: {
    rxBytes: number;
    txBytes: number;
  };
}

export interface ClusterInfo {
  version: string;
  nodes: {
    total: number;
    ready: number;
    notReady: number;
  };
  pods: {
    total: number;
    running: number;
    pending: number;
    failed: number;
  };
  namespaces: number;
  services: number;
  deployments: number;
}

class KubernetesService {
  private nodes: Map<string, KubernetesNode> = new Map();
  private deploymentQueue: Map<string, NodeDeploymentConfig> = new Map();

  constructor() {
    this.initializeDefaultNodes();
  }

  private initializeDefaultNodes() {
    const defaultNodes: KubernetesNode[] = [
      {
        id: 'master-1',
        name: 'k8s-master-1',
        status: 'ready',
        role: 'control-plane',
        version: 'v1.28.2',
        os: 'Ubuntu 22.04.3 LTS',
        architecture: 'amd64',
        capacity: {
          cpu: '4',
          memory: '16Gi',
          storage: '100Gi',
          pods: 110
        },
        allocatable: {
          cpu: '3800m',
          memory: '14.5Gi',
          storage: '95Gi',
          pods: 110
        },
        usage: {
          cpu: 23,
          memory: 67,
          storage: 45,
          pods: 12
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status',
            lastTransition: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'MemoryPressure',
            status: 'False',
            reason: 'KubeletHasSufficientMemory',
            message: 'kubelet has sufficient memory available',
            lastTransition: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            type: 'DiskPressure',
            status: 'False',
            reason: 'KubeletHasNoDiskPressure',
            message: 'kubelet has no disk pressure',
            lastTransition: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          }
        ],
        labels: {
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname': 'k8s-master-1',
          'kubernetes.io/os': 'linux',
          'node-role.kubernetes.io/control-plane': '',
          'node.kubernetes.io/instance-type': 'medium'
        },
        annotations: {
          'node.alpha.kubernetes.io/ttl': '0',
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true'
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastHeartbeat: new Date(Date.now() - 30 * 1000).toISOString(),
        nodeInfo: {
          machineID: '8a9b2c3d4e5f6789',
          systemUUID: '12345678-1234-1234-1234-123456789abc',
          bootID: 'abcd1234-5678-90ef-ghij-klmnopqrstuv',
          kernelVersion: '5.15.0-78-generic',
          osImage: 'Ubuntu 22.04.3 LTS',
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.2',
          kubeProxyVersion: 'v1.28.2'
        },
        addresses: [
          { type: 'InternalIP', address: '10.0.1.10' },
          { type: 'Hostname', address: 'k8s-master-1' }
        ],
        taints: [
          {
            key: 'node-role.kubernetes.io/control-plane',
            effect: 'NoSchedule'
          }
        ],
        pods: [
          { name: 'etcd-k8s-master-1', namespace: 'kube-system', status: 'Running', restarts: 0, age: '30d' },
          { name: 'kube-apiserver-k8s-master-1', namespace: 'kube-system', status: 'Running', restarts: 0, age: '30d' },
          { name: 'kube-controller-manager-k8s-master-1', namespace: 'kube-system', status: 'Running', restarts: 0, age: '30d' },
          { name: 'kube-scheduler-k8s-master-1', namespace: 'kube-system', status: 'Running', restarts: 0, age: '30d' }
        ]
      },
      {
        id: 'worker-1',
        name: 'k8s-worker-1',
        status: 'ready',
        role: 'worker',
        version: 'v1.28.2',
        os: 'Ubuntu 22.04.3 LTS',
        architecture: 'amd64',
        capacity: {
          cpu: '8',
          memory: '32Gi',
          storage: '200Gi',
          pods: 110
        },
        allocatable: {
          cpu: '7800m',
          memory: '30.5Gi',
          storage: '190Gi',
          pods: 110
        },
        usage: {
          cpu: 45,
          memory: 72,
          storage: 38,
          pods: 24
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status',
            lastTransition: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        labels: {
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname': 'k8s-worker-1',
          'kubernetes.io/os': 'linux',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/instance-type': 'large'
        },
        annotations: {
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true'
        },
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        lastHeartbeat: new Date(Date.now() - 15 * 1000).toISOString(),
        nodeInfo: {
          machineID: '9b8a7c6d5e4f3210',
          systemUUID: '87654321-4321-4321-4321-210987654321',
          bootID: 'dcba4321-8765-09fe-jihg-vutsrqponmlk',
          kernelVersion: '5.15.0-78-generic',
          osImage: 'Ubuntu 22.04.3 LTS',
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.2',
          kubeProxyVersion: 'v1.28.2'
        },
        addresses: [
          { type: 'InternalIP', address: '10.0.1.20' },
          { type: 'ExternalIP', address: '203.0.113.20' },
          { type: 'Hostname', address: 'k8s-worker-1' }
        ],
        taints: [],
        pods: [
          { name: 'coredns-5d78c9869d-abc12', namespace: 'kube-system', status: 'Running', restarts: 0, age: '25d' },
          { name: 'kube-proxy-xyz89', namespace: 'kube-system', status: 'Running', restarts: 0, age: '25d' },
          { name: 'frontend-app-7d9c8b6a5f-def34', namespace: 'production', status: 'Running', restarts: 2, age: '5d' },
          { name: 'backend-api-6c8d9e7f2a-ghi56', namespace: 'production', status: 'Running', restarts: 0, age: '3d' }
        ]
      },
      {
        id: 'worker-2',
        name: 'k8s-worker-2',
        status: 'ready',
        role: 'worker',
        version: 'v1.28.2',
        os: 'Ubuntu 22.04.3 LTS',
        architecture: 'amd64',
        capacity: {
          cpu: '8',
          memory: '32Gi',
          storage: '200Gi',
          pods: 110
        },
        allocatable: {
          cpu: '7800m',
          memory: '30.5Gi',
          storage: '190Gi',
          pods: 110
        },
        usage: {
          cpu: 89,
          memory: 94,
          storage: 67,
          pods: 45
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status',
            lastTransition: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            type: 'MemoryPressure',
            status: 'True',
            reason: 'KubeletHasInsufficientMemory',
            message: 'kubelet has insufficient memory available',
            lastTransition: new Date(Date.now() - 10 * 60 * 1000).toISOString()
          }
        ],
        labels: {
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname': 'k8s-worker-2',
          'kubernetes.io/os': 'linux',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/instance-type': 'large',
          'workload': 'high-memory'
        },
        annotations: {
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true'
        },
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        lastHeartbeat: new Date(Date.now() - 45 * 1000).toISOString(),
        nodeInfo: {
          machineID: '7c6b5a4d3e2f1098',
          systemUUID: '56789012-5678-5678-5678-567890123456',
          bootID: 'fedc9876-5432-10ba-9876-543210fedcba',
          kernelVersion: '5.15.0-78-generic',
          osImage: 'Ubuntu 22.04.3 LTS',
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.2',
          kubeProxyVersion: 'v1.28.2'
        },
        addresses: [
          { type: 'InternalIP', address: '10.0.1.21' },
          { type: 'ExternalIP', address: '203.0.113.21' },
          { type: 'Hostname', address: 'k8s-worker-2' }
        ],
        taints: [],
        pods: [
          { name: 'monitoring-prometheus-0', namespace: 'monitoring', status: 'Running', restarts: 1, age: '15d' },
          { name: 'logging-elasticsearch-0', namespace: 'logging', status: 'Running', restarts: 0, age: '12d' },
          { name: 'database-postgres-0', namespace: 'production', status: 'Running', restarts: 0, age: '8d' }
        ]
      },
      {
        id: 'worker-3',
        name: 'k8s-worker-3',
        status: 'ready',
        role: 'worker',
        version: 'v1.28.2',
        os: 'Ubuntu 22.04.3 LTS',
        architecture: 'amd64',
        capacity: {
          cpu: '4',
          memory: '16Gi',
          storage: '100Gi',
          pods: 110
        },
        allocatable: {
          cpu: '3800m',
          memory: '14.5Gi',
          storage: '95Gi',
          pods: 110
        },
        usage: {
          cpu: 34,
          memory: 58,
          storage: 42,
          pods: 18
        },
        conditions: [
          {
            type: 'Ready',
            status: 'True',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status',
            lastTransition: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ],
        labels: {
          'kubernetes.io/arch': 'amd64',
          'kubernetes.io/hostname': 'k8s-worker-3',
          'kubernetes.io/os': 'linux',
          'node-role.kubernetes.io/worker': '',
          'node.kubernetes.io/instance-type': 'medium'
        },
        annotations: {
          'volumes.kubernetes.io/controller-managed-attach-detach': 'true'
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastHeartbeat: new Date(Date.now() - 20 * 1000).toISOString(),
        nodeInfo: {
          machineID: '5d4c3b2a1e0f9876',
          systemUUID: '34567890-3456-3456-3456-345678901234',
          bootID: 'ba98fedc-3210-76ba-5432-10fedcba9876',
          kernelVersion: '5.15.0-78-generic',
          osImage: 'Ubuntu 22.04.3 LTS',
          containerRuntimeVersion: 'containerd://1.7.2',
          kubeletVersion: 'v1.28.2',
          kubeProxyVersion: 'v1.28.2'
        },
        addresses: [
          { type: 'InternalIP', address: '10.0.1.22' },
          { type: 'Hostname', address: 'k8s-worker-3' }
        ],
        taints: [],
        pods: [
          { name: 'ingress-nginx-controller-abc123', namespace: 'ingress-nginx', status: 'Running', restarts: 0, age: '10d' },
          { name: 'cert-manager-webhook-def456', namespace: 'cert-manager', status: 'Running', restarts: 0, age: '8d' }
        ]
      }
    ];

    defaultNodes.forEach(node => {
      this.nodes.set(node.id, node);
    });
  }

  async getAllNodes(): Promise<KubernetesNode[]> {
    await this.delay(300);
    return Array.from(this.nodes.values());
  }

  async getNode(id: string): Promise<KubernetesNode | null> {
    await this.delay(200);
    return this.nodes.get(id) || null;
  }

  async getNodeMetrics(id: string): Promise<NodeMetrics | null> {
    await this.delay(500);
    const node = this.nodes.get(id);
    if (!node) return null;

    return {
      cpu: {
        usage: node.usage.cpu,
        requests: Math.floor(node.usage.cpu * 0.7),
        limits: Math.floor(node.usage.cpu * 1.2)
      },
      memory: {
        usage: node.usage.memory,
        requests: Math.floor(node.usage.memory * 0.8),
        limits: Math.floor(node.usage.memory * 1.1)
      },
      storage: {
        usage: node.usage.storage,
        available: 100 - node.usage.storage
      },
      network: {
        rxBytes: Math.floor(Math.random() * 1000000000),
        txBytes: Math.floor(Math.random() * 1000000000)
      }
    };
  }

  async deployNode(config: NodeDeploymentConfig): Promise<{ success: boolean; message: string; nodeId?: string }> {
    await this.delay(2000);

    const nodeId = `${config.nodeType}-${Date.now()}`;
    const nodeName = `k8s-${config.nodeType}-${nodeId.slice(-4)}`;

    // Simulate deployment process
    const deploymentSuccess = Math.random() > 0.1; // 90% success rate

    if (!deploymentSuccess) {
      return {
        success: false,
        message: 'Node deployment failed: Insufficient cluster resources'
      };
    }

    const newNode: KubernetesNode = {
      id: nodeId,
      name: nodeName,
      status: 'deploying',
      role: config.nodeType,
      version: 'v1.28.2',
      os: 'Ubuntu 22.04.3 LTS',
      architecture: 'amd64',
      capacity: this.getInstanceCapacity(config.instanceType),
      allocatable: this.getInstanceAllocatable(config.instanceType),
      usage: {
        cpu: 0,
        memory: 0,
        storage: 0,
        pods: 0
      },
      conditions: [
        {
          type: 'Ready',
          status: 'Unknown',
          reason: 'NodeStatusUnknown',
          message: 'Node is being deployed',
          lastTransition: new Date().toISOString()
        }
      ],
      labels: {
        'kubernetes.io/arch': 'amd64',
        'kubernetes.io/hostname': nodeName,
        'kubernetes.io/os': 'linux',
        [`node-role.kubernetes.io/${config.nodeType}`]: '',
        'node.kubernetes.io/instance-type': config.instanceType,
        ...config.labels
      },
      annotations: {
        'volumes.kubernetes.io/controller-managed-attach-detach': 'true',
        'node.alpha.kubernetes.io/ttl': '0'
      },
      createdAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
      nodeInfo: {
        machineID: this.generateId(),
        systemUUID: this.generateUUID(),
        bootID: this.generateUUID(),
        kernelVersion: '5.15.0-78-generic',
        osImage: 'Ubuntu 22.04.3 LTS',
        containerRuntimeVersion: 'containerd://1.7.2',
        kubeletVersion: 'v1.28.2',
        kubeProxyVersion: 'v1.28.2'
      },
      addresses: [
        { type: 'InternalIP', address: this.generateIP() },
        { type: 'Hostname', address: nodeName }
      ],
      taints: config.taints,
      pods: []
    };

    this.nodes.set(nodeId, newNode);

    // Simulate node becoming ready after deployment
    setTimeout(() => {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.status = 'ready';
        node.conditions = [
          {
            type: 'Ready',
            status: 'True',
            reason: 'KubeletReady',
            message: 'kubelet is posting ready status',
            lastTransition: new Date().toISOString()
          }
        ];
        node.usage = {
          cpu: Math.floor(Math.random() * 20) + 5,
          memory: Math.floor(Math.random() * 30) + 10,
          storage: Math.floor(Math.random() * 20) + 5,
          pods: Math.floor(Math.random() * 10)
        };
      }
    }, 30000); // 30 seconds

    return {
      success: true,
      message: `Node ${nodeName} deployment initiated successfully`,
      nodeId
    };
  }

  async deleteNode(id: string): Promise<{ success: boolean; message: string }> {
    await this.delay(1000);
    
    const node = this.nodes.get(id);
    if (!node) {
      return {
        success: false,
        message: 'Node not found'
      };
    }

    if (node.role === 'control-plane') {
      const controlPlaneNodes = Array.from(this.nodes.values()).filter(n => n.role === 'control-plane');
      if (controlPlaneNodes.length <= 1) {
        return {
          success: false,
          message: 'Cannot delete the last control-plane node'
        };
      }
    }

    // Set node to terminating status
    node.status = 'terminating';
    
    // Simulate node deletion process
    setTimeout(() => {
      this.nodes.delete(id);
    }, 10000); // 10 seconds

    return {
      success: true,
      message: `Node ${node.name} is being terminated`
    };
  }

  async drainNode(id: string): Promise<{ success: boolean; message: string }> {
    await this.delay(2000);
    
    const node = this.nodes.get(id);
    if (!node) {
      return {
        success: false,
        message: 'Node not found'
      };
    }

    // Add drain taint
    node.taints.push({
      key: 'node.kubernetes.io/unschedulable',
      effect: 'NoSchedule'
    });

    // Simulate pod eviction
    node.pods = [];
    node.usage.pods = 0;

    return {
      success: true,
      message: `Node ${node.name} has been drained successfully`
    };
  }

  async cordonNode(id: string): Promise<{ success: boolean; message: string }> {
    await this.delay(500);
    
    const node = this.nodes.get(id);
    if (!node) {
      return {
        success: false,
        message: 'Node not found'
      };
    }

    // Add unschedulable taint
    const existingTaint = node.taints.find(t => t.key === 'node.kubernetes.io/unschedulable');
    if (!existingTaint) {
      node.taints.push({
        key: 'node.kubernetes.io/unschedulable',
        effect: 'NoSchedule'
      });
    }

    return {
      success: true,
      message: `Node ${node.name} has been cordoned`
    };
  }

  async uncordonNode(id: string): Promise<{ success: boolean; message: string }> {
    await this.delay(500);
    
    const node = this.nodes.get(id);
    if (!node) {
      return {
        success: false,
        message: 'Node not found'
      };
    }

    // Remove unschedulable taint
    node.taints = node.taints.filter(t => t.key !== 'node.kubernetes.io/unschedulable');

    return {
      success: true,
      message: `Node ${node.name} has been uncordoned`
    };
  }

  async updateNodeLabels(id: string, labels: Record<string, string>): Promise<{ success: boolean; message: string }> {
    await this.delay(300);
    
    const node = this.nodes.get(id);
    if (!node) {
      return {
        success: false,
        message: 'Node not found'
      };
    }

    node.labels = { ...node.labels, ...labels };

    return {
      success: true,
      message: `Node ${node.name} labels updated successfully`
    };
  }

  async getClusterInfo(): Promise<ClusterInfo> {
    await this.delay(400);
    
    const nodes = Array.from(this.nodes.values());
    const totalPods = nodes.reduce((sum, node) => sum + node.usage.pods, 0);
    
    return {
      version: 'v1.28.2',
      nodes: {
        total: nodes.length,
        ready: nodes.filter(n => n.status === 'ready').length,
        notReady: nodes.filter(n => n.status !== 'ready').length
      },
      pods: {
        total: totalPods,
        running: Math.floor(totalPods * 0.9),
        pending: Math.floor(totalPods * 0.05),
        failed: Math.floor(totalPods * 0.05)
      },
      namespaces: 8,
      services: 25,
      deployments: 18
    };
  }

  private getInstanceCapacity(instanceType: string) {
    const capacities = {
      small: { cpu: '2', memory: '8Gi', storage: '50Gi', pods: 110 },
      medium: { cpu: '4', memory: '16Gi', storage: '100Gi', pods: 110 },
      large: { cpu: '8', memory: '32Gi', storage: '200Gi', pods: 110 },
      xlarge: { cpu: '16', memory: '64Gi', storage: '400Gi', pods: 110 }
    };
    return capacities[instanceType] || capacities.medium;
  }

  private getInstanceAllocatable(instanceType: string) {
    const capacity = this.getInstanceCapacity(instanceType);
    return {
      cpu: `${parseInt(capacity.cpu) * 950}m`, // 95% of capacity
      memory: `${parseFloat(capacity.memory) * 0.9}Gi`, // 90% of capacity
      storage: `${parseInt(capacity.storage) * 0.95}Gi`, // 95% of capacity
      pods: capacity.pods
    };
  }

  private generateId(): string {
    return Array.from({ length: 16 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private generateIP(): string {
    return `10.0.1.${Math.floor(Math.random() * 200) + 50}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const kubernetesService = new KubernetesService();