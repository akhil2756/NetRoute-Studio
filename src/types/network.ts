export type DeviceType = 'pc' | 'router' | 'switch' | 'server';

export type DeviceStatus = 'online' | 'offline';

export interface NetworkDevice {
  id: string;
  type: DeviceType;
  label: string;
  status: DeviceStatus;
  position: { x: number; y: number };
  ip?: string;
}

export interface NetworkLink {
  id: string;
  source: string;
  target: string;
  cost: number;
  bandwidth: number;
  delay: number;
  enabled: boolean;
}

export interface NetworkTopology {
  devices: NetworkDevice[];
  links: NetworkLink[];
}

export interface RoutingEntry {
  destination: string;
  destinationLabel: string;
  nextHop: string;
  nextHopLabel: string;
  metric: number;
  status: 'active' | 'unreachable';
}

export interface RoutingTable {
  routerId: string;
  routerLabel: string;
  entries: RoutingEntry[];
}

export interface RouteResult {
  path: string[];
  totalCost: number;
  reachable: boolean;
  algorithm: 'dijkstra' | 'distance-vector';
}

export type AlgorithmType = 'dijkstra' | 'distance-vector';

export type SimulationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed';

export interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'route-calculated' | 'packet-sent' | 'packet-forwarded' | 'packet-delivered' | 'packet-dropped' | 'link-failed' | 'router-failed' | 'reroute' | 'unreachable' | 'info';
  message: string;
  deviceId?: string;
  linkId?: string;
}

export interface SimulationMetrics {
  packetsSent: number;
  packetsDelivered: number;
  packetsDropped: number;
  deliveryRate: number;
  avgLatency: number;
  avgHopCount: number;
  totalSimulations: number;
}

export interface SimulationState {
  status: SimulationStatus;
  sourceId: string | null;
  destinationId: string | null;
  algorithm: AlgorithmType;
  currentRoute: RouteResult | null;
  activePacketNodeIndex: number;
  events: SimulationEvent[];
  metrics: SimulationMetrics;
}

export interface SavedTopology {
  id: string;
  name: string;
  savedAt: number;
  topology: NetworkTopology;
}
