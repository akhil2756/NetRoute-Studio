import type { NetworkTopology, SimulationMetrics } from '../types/network';

export function computeMetrics(
  packetsSent: number,
  packetsDelivered: number,
  packetsDropped: number,
  hopCounts: number[],
  latencies: number[]
): SimulationMetrics {
  const deliveryRate = packetsSent > 0 ? (packetsDelivered / packetsSent) * 100 : 0;
  const avgHopCount = hopCounts.length > 0
    ? hopCounts.reduce((a, b) => a + b, 0) / hopCounts.length
    : 0;
  const avgLatency = latencies.length > 0
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;

  return {
    packetsSent,
    packetsDelivered,
    packetsDropped,
    deliveryRate,
    avgLatency,
    avgHopCount,
    totalSimulations: packetsSent,
  };
}

export function estimateLatency(topology: NetworkTopology, path: string[]): number {
  let totalDelay = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const src = path[i];
    const tgt = path[i + 1];
    const link = topology.links.find(
      l =>
        l.enabled &&
        ((l.source === src && l.target === tgt) || (l.source === tgt && l.target === src))
    );
    if (link) {
      totalDelay += link.delay;
    }
  }
  return totalDelay;
}

export function findBottleneckLink(topology: NetworkTopology, path: string[]): string | null {
  let minBandwidth = Infinity;
  let bottleneckId: string | null = null;

  for (let i = 0; i < path.length - 1; i++) {
    const src = path[i];
    const tgt = path[i + 1];
    const link = topology.links.find(
      l =>
        l.enabled &&
        ((l.source === src && l.target === tgt) || (l.source === tgt && l.target === src))
    );
    if (link && link.bandwidth < minBandwidth) {
      minBandwidth = link.bandwidth;
      bottleneckId = link.id;
    }
  }

  return bottleneckId;
}
